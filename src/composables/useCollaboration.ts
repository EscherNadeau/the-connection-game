import { ref, type Ref } from 'vue'
// @ts-ignore
import { useGameStateStore } from '@store/gameState.store.ts'
// @ts-ignore
import { log } from '@/services/ui/log.ts'
// @ts-ignore
import { normalizeMediaType } from '@/utils/constants.ts'
// @ts-ignore
import config from '@/config/env'
import type { GameItem, Connection, GameOptions, GameMode, GameBoard, MoveData } from '@/types/game'

interface CollabHandlers {
  onState: (payload: { items?: GameItem[], connections?: Connection[], gameOptions?: GameOptions }) => void
  onAction: (msg: { payload?: any }) => void
}

export function useCollaboration() {
  const collab: Ref<any> = ref(null)
  const roomCode: Ref<string | null> = ref(null)
  const moveThrottleMs: Ref<number> = ref(60)
  const lastMoveSentTs: Ref<number> = ref(0)
  const moveFlushTimer: Ref<number | null> = ref(null)

  const gs = useGameStateStore()

  /**
   * Initialize collaboration connection
   */
  function initCollab(
    gameBoard: GameBoard, 
    gameOptions: Ref<GameOptions>, 
    onInitializePvPGame: (gameData: any) => void,
    onShowPvPResults: (results: any[]) => void, 
    onBroadcastGameStart: () => void
  ): void {
    if (!roomCode.value) return
    
    const handlers: CollabHandlers = {
      onState: (payload) => {
        if (!gameBoard) return
        gameBoard.gameItems = payload.items || []
        gameBoard.connections = payload.connections || []
        
        // Sync game options for custom mode multiplayer
        if (payload.gameOptions) {
          gameOptions.value = { ...gameOptions.value, ...payload.gameOptions }
        }
        
        gameBoard.$forceUpdate()
      },
      onAction: (msg) => {
        const a = msg.payload || {}
        if (a.kind === 'add') {
          // dedupe by tmdb id + normalized type
          const tmdbId = a.item?.tmdbData?.id || a.item?.tmdbId
          const type = (a.item?.type || a.item?.tmdbData?.media_type || '').toLowerCase()
          const exists = (gameBoard.gameItems || []).some((i) => {
            const exId = i?.tmdbData?.id || i?.tmdbId
            const exType = (i?.type || i?.tmdbData?.media_type || '').toLowerCase()
            return String(exId) === String(tmdbId) && exType === type
          })
          if (!exists) gameBoard.addItem(a.item)
        } else if (a.kind === 'connect') {
          // dedupe by unordered pair keys
          const key = (it: any) => `${(it?.tmdbData?.id || it?.tmdbId) || it?.id}-${(it?.type || it?.tmdbData?.media_type || '').toLowerCase()}`
          const fromK = key(a.from)
          const toK = key(a.to)
          const pair = [fromK, toK].sort().join('|')
          const exists = (gameBoard.connections || []).some((c) => {
            const aK = [key(gameBoard.gameItems.find(i=>i.id===c.from) || {}), key(gameBoard.gameItems.find(i=>i.id===c.to) || {})].sort().join('|')
            return aK === pair
          })
          if (!exists) gameBoard.createConnection(a.from, a.to)
        } else if (a.kind === 'move') {
          const it = gameBoard.gameItems.find((i) => i.id === a.id)
          if (it) {
            it.x = a.x
            it.y = a.y
            gameBoard.$forceUpdate()
          }
        } else if (a.kind === 'start_game') {
          // Handle start game request from mobile
          onBroadcastGameStart()
        } else if (a.kind === 'game_started') {
          // Handle game started event
          if (a.isPvP && a.gameData) {
            // Initialize PvP game with shared board data
            onInitializePvPGame(a.gameData)
          }
        } else if (a.kind === 'pvp_results') {
          // Handle PvP results
          onShowPvPResults(a.results)
        }
      },
    }
    
    gs.setCollabHandlers(handlers)
    gs.setRoomCode(roomCode.value)
    gs.connectCollab(config.wsUrl)
    
    log('info', '🔗 Collaboration initialized with room:', roomCode.value)
  }

  /**
   * Broadcast current game state
   */
  function broadcastState(
    gameBoard: GameBoard, 
    gameOptions: GameOptions, 
    shouldSkipCollabForPvP: (options: GameOptions) => boolean
  ): void {
    if (shouldSkipCollabForPvP(gameOptions)) {
      if (!gameBoard) return
      gs.updateGameItems(gameBoard.gameItems)
      gs.updateConnections(gameBoard.connections)
      gs.broadcastState()
    }
  }

  /**
   * Broadcast game start event
   */
  function broadcastGameStart(
    gameBoard: GameBoard, 
    gameOptions: GameOptions, 
    gameMode: GameMode | null,
    shouldSkipCollabForPvP: (options: GameOptions) => boolean
  ): void {
    if (shouldSkipCollabForPvP(gameOptions)) {
      const payload = { 
        kind: 'start_game',
        gameOptions: gameOptions,
        mode: gameMode?.id,
        items: gameBoard?.gameItems || [],
        connections: gameBoard?.connections || []
      }
      gs.sendCollab('action', payload)
      log('info', '🎮 Game start broadcasted')
    }
  }

  /**
   * Handle item movement with throttling
   */
  function onItemMoved(move: MoveData): void {
    if (!gs.collabConnected) return
    
    const now = performance.now ? performance.now() : Date.now()
    if (now - lastMoveSentTs.value >= moveThrottleMs.value) {
      gs.sendCollab('action', { kind: 'move', ...move })
      lastMoveSentTs.value = now
    } else {
      // schedule a trailing send
      if (moveFlushTimer.value) {
        clearTimeout(moveFlushTimer.value)
      }
      moveFlushTimer.value = setTimeout(() => {
        gs.sendCollab('action', { kind: 'move', ...move })
        lastMoveSentTs.value = performance.now ? performance.now() : Date.now()
      }, moveThrottleMs.value)
    }
  }

  /**
   * Broadcast item addition
   */
  function broadcastItemAdd(
    item: GameItem, 
    gameOptions: GameOptions, 
    shouldSkipCollabForPvP: (options: GameOptions) => boolean
  ): void {
    try {
      if (shouldSkipCollabForPvP(gameOptions)) {
        gs.sendCollab('action', { kind: 'add', item })
      }
    } catch (error) {
      log('error', 'Failed to broadcast item add:', error)
    }
  }

  /**
   * Broadcast connection creation
   */
  function broadcastConnection(from: GameItem, to: GameItem): void {
    try {
      if (gs.collabConnected) {
        gs.sendCollab('action', { kind: 'connect', from, to })
        log('info', '🔗 Connection broadcasted')
      }
    } catch (error) {
      log('error', 'Failed to broadcast connection:', error)
    }
  }

  /**
   * Send end game action
   */
  function sendEndGame(): void {
    try {
      if (gs.collabConnected) {
        gs.sendCollab('action', { kind: 'end_game' })
        log('info', '🏁 End game action sent')
      }
    } catch (error) {
      log('error', 'Failed to send end game:', error)
    }
  }

  /**
   * Disconnect from collaboration
   */
  function disconnectCollab(): void {
    try {
      gs.disconnectCollab()
      log('info', '🔌 Collaboration disconnected')
    } catch (error) {
      log('error', 'Failed to disconnect collaboration:', error)
    }
  }

  /**
   * Set room code from hash or game options
   */
  function setRoomCodeFromOptions(gameOptions: GameOptions): void {
    try {
      gs.setRoomCodeFromHash()
      roomCode.value = gs.roomCode || gameOptions?.roomCode || null
      log('info', '🏠 Room code set:', roomCode.value)
    } catch (error) {
      log('error', 'Failed to set room code:', error)
    }
  }

  /**
   * Cleanup collaboration resources
   */
  function cleanup(): void {
    if (moveFlushTimer.value) {
      clearTimeout(moveFlushTimer.value)
      moveFlushTimer.value = null
    }
    disconnectCollab()
  }

  return {
    // Reactive state
    collab,
    roomCode,
    moveThrottleMs,
    lastMoveSentTs,
    moveFlushTimer,
    
    // Methods
    initCollabComposable: initCollab,
    broadcastStateComposable: broadcastState,
    broadcastGameStartComposable: broadcastGameStart,
    handleItemMoved: onItemMoved,
    broadcastItemAdd,
    broadcastConnection,
    sendEndGame,
    disconnectCollab,
    setRoomCodeFromOptions,
    cleanup
  }
}
