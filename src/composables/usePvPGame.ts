// @ts-ignore
import { useGameStateStore } from '@store/gameState.store.ts'
// @ts-ignore
import { log } from '@/services/ui/log.ts'
// @ts-ignore
import config from '@/config/env'
import type { PvPPlayer, GameOptions, GoalData } from '@/types/game'

export function usePvPGame() {
  const gs = useGameStateStore()

  /**
   * Check if the current game is in PvP mode
   */
  function isPvPMode(gameOptions: GameOptions | null): boolean {
    return !!(gameOptions && gameOptions.playType === 'pvp')
  }

  /**
   * Initialize PvP game with shared board data
   */
  function initializePvPGame(
    gameBoard: any, 
    gameData: { items?: any[], connections?: any[], gameOptions?: GameOptions }, 
    gameOptions: GameOptions
  ): GameOptions | undefined {
    if (!gameBoard) return undefined
    
    // Set the shared board data
    gameBoard.gameItems = gameData.items || []
    gameBoard.connections = gameData.connections || []
    
    // Update game options
    const updatedOptions: GameOptions = { ...gameOptions, ...gameData.gameOptions }
    
    // Force update the game board
    gameBoard.$forceUpdate()
    
    log('info', '🎮 PvP game initialized with shared board data')
    
    return updatedOptions
  }

  /**
   * Show PvP results modal
   */
  function showPvPResults(
    results: PvPPlayer[], 
    gameOptions: GameOptions, 
    roomCode?: string
  ): {
    visible: boolean
    type: 'win' | 'lose' | 'pvp_results'
    title: string
    subtitle: string
    stats: any
  } {
    log('info', '🏆 PvP Results:', results)
    
    // Sort results by score (highest first) or time (lowest first)
    const sortedResults = results.sort((a, b) => {
      if (gameOptions.playType === 'pvp') {
        // For PvP, prioritize score, then time
        if (b.score !== a.score) return b.score - a.score
        return a.time - b.time
      }
      return a.time - b.time
    })
    
    // Find current player's result
    const currentPlayerId = gs.collabClientId
    log('info', '🏆 PvP Results Debug:', { currentPlayerId, results: results.map(r => ({ id: r.id || r.playerId, score: r.score })) })
    
    // If no client ID, try to get it from the room code or use a fallback
    let playerId = currentPlayerId
    if (!playerId && roomCode) {
      // Try to extract player ID from room or use room code as fallback
      playerId = roomCode
      log('info', '🏆 PvP: Using room code as player ID fallback:', playerId)
    }
    
    const currentPlayerResult = results.find(r => r.id === playerId || r.playerId === playerId)
    
    if (currentPlayerResult) {
      // Determine if current player won (is first in sorted results)
      const isWinner = (sortedResults[0]?.id === playerId) || (sortedResults[0]?.playerId === playerId)
      log('info', '🏆 PvP Player Result:', { isWinner, currentPlayerResult })
      
      // Return individual win/lose modal data
      return {
        visible: true,
        type: isWinner ? 'win' : 'lose',
        title: isWinner ? 'You Win!' : 'You Lose!',
        subtitle: isWinner ? '🏆 Victory!' : '😔 Better luck next time!',
        stats: {
          score: currentPlayerResult.score,
          time: currentPlayerResult.time,
          pathLength: 0, // Will be updated when we have proper GoalData typing
          connections: 0 // Will be updated when we have proper GoalData typing
        }
      }
    } else {
      log('info', '🏆 PvP Player not found, showing fallback results')
      // Fallback to shared results if player not found
      return {
        visible: true,
        type: 'pvp_results',
        title: 'PvP Results',
        subtitle: 'Competition Complete!',
        stats: {
          results: sortedResults,
          playerCount: results.length
        }
      }
    }
  }

  /**
   * Send PvP completion data to server
   */
  function sendPvPCompletion(goalData: GoalData, gameOptions: GameOptions, roomCode?: string): void {
    // For PvP mode, we need to establish a temporary connection to send completion
    if (isPvPMode(gameOptions)) {
      // Reconnect briefly to send completion data
      const roomCodeToUse = gameOptions?.roomCode || roomCode
      if (roomCodeToUse) {
        log('info', '🏆 PvP: Reconnecting to send completion data')
        gs.connectCollab(config.wsUrl)
        
        // Wait a moment for connection, then send data
        setTimeout(() => {
          if (gs.collabConnected) {
            const completionData = {
              kind: 'pvp_complete',
              score: goalData?.stats?.score || 0,
              time: goalData?.stats?.time || 0,
              pathLength: goalData?.pathLength || 0,
              connections: goalData?.stats?.connections || 0
            }
            gs.sendCollab('action', completionData)
            log('info', '🏆 PvP completion sent:', completionData)
          } else {
            log('error', '🏆 PvP: Failed to reconnect for completion')
          }
        }, 1000)
      }
    } else if (gs.collabConnected) {
      const completionData = {
        kind: 'pvp_complete',
        score: goalData?.stats?.score || 0,
        time: goalData?.stats?.time || 0,
        pathLength: goalData?.pathLength || 0,
        connections: goalData?.stats?.connections || 0
      }
      gs.sendCollab('action', completionData)
      log('info', '🏆 PvP completion sent:', completionData)
    }
  }

  /**
   * Handle PvP-specific collaboration messages
   */
  function handlePvPCollabMessage(
    msg: { type: string, payload?: any }, 
    gameOptions: GameOptions, 
    onShowPvPResults: (results: PvPPlayer[]) => void
  ): boolean {
    // Skip ALL collaborative messages in PvP mode except results
    if (isPvPMode(gameOptions)) {
      // Only allow PvP results
      if (msg.type === 'action' && msg.payload?.kind === 'pvp_results') {
        onShowPvPResults(msg.payload.results)
      }
      return true // Indicates message was handled
    }
    return false // Indicates message was not handled
  }

  /**
   * Check if collaboration should be skipped for PvP mode
   */
  function shouldSkipCollabForPvP(gameOptions: GameOptions): boolean {
    return gs.collabConnected && !isPvPMode(gameOptions)
  }

  /**
   * Handle PvP goal completion
   */
  function handlePvPGoalCompletion(goalData: GoalData, gameOptions: GameOptions, roomCode?: string): boolean {
    if (goalData && goalData.mode && goalData.mode !== 'anti' && goalData.mode !== 'zen') {
      // Check if this is a PvP game
      if (isPvPMode(gameOptions)) {
        // Send PvP completion data to server
        sendPvPCompletion(goalData, gameOptions, roomCode)
        return true // Indicates PvP completion was handled
      }
    }
    return false // Indicates PvP completion was not handled
  }

  return {
    isPvPMode,
    initializePvPGameComposable: initializePvPGame,
    showPvPResultsComposable: showPvPResults,
    sendPvPCompletionComposable: sendPvPCompletion,
    handlePvPCollabMessage,
    shouldSkipCollabForPvP,
    handlePvPGoalCompletion
  }
}
