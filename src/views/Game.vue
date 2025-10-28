<template>
  <div class="game-screen" :class="{ 
    'tutorial-step-22': showTutorial && tutorialStep === 22,
    'tutorial-step-25': showTutorial && tutorialStep === 25,
    'tutorial-step-26': showTutorial && tutorialStep === 26,
    'tutorial-step-26.5': showTutorial && tutorialStep === 26.5,
    'tutorial-step-26.6': showTutorial && tutorialStep === 26.6,
    'tutorial-step-27': showTutorial && tutorialStep === 27
  }">
    <!-- Tutorial Overlay -->
    <TutorialOverlay
      :show-tutorial="showTutorial"
      :tutorial-step="tutorialStep"
      :result-modal-visible="resultModal.visible"
      @tutorial-next="$emit('tutorial-next')"
      @open-win-modal="openWinModal"
      @return-to-start="returnToStart"
    />

    <GameHeader
      :background-title="currentBackgroundTitle"
      :viewport="viewportData"
      :game-mode="gameMode.id"
      :show-stats="true"
      :goal-queue="gameOptions.goalQueue || []"
      :current-goal-index="gameOptions.currentGoalIndex || 0"
      :game-type="gameOptions.gameType || gameMode.id"
      @back="goBack"
      @change-background="changeBackground"
      @reset-zoom="resetZoom"
      @reset-pan="resetPan"
    />

    <BoardShell :board-style="boardStyle">
      <GameBoard
        ref="gameBoard"
        :startingItems="getStartingItems()"
        :gameMode="gameMode"
        :highlight-path-ids="highlightPathIds"
        :goal-queue="gameOptions.goalQueue || []"
        :current-goal-index="gameOptions.currentGoalIndex || 0"
        :game-type="gameOptions.gameType || gameMode.id"
        :is-pvp-mode="isPvPMode(gameOptions)"
        :class="{ 'tutorial-glow': showTutorial && (tutorialStep === 23 || tutorialStep === 24) }"
        @connection-created="onConnectionCreated"
        @check-goals="onCheckGoals"
        @goal-completed="onGoalCompleted"
        @goal-advanced="onGoalAdvanced"
        @viewport-changed="updateViewportData"
        @item-moved="onItemMoved"
        @hint-requested="onHintRequested"
        @game-started="onGameStarted"
        @show-error="onShowError"
      />
      
      
      <!-- Bottom bar shown only after leaving modal. Toggles between Hide Path/New Game and Show Path/New Game. -->
      <div v-if="bottomBarVisible && !resultModal.visible" class="win-controls">
        <template v-if="highlightPathIds.length > 0">
          <button class="wl-button wl-primary" @click="hidePathFromBar">Hide Path</button>
          <button class="wl-button" @click="goBack">New Game</button>
        </template>
        <template v-else>
          <button class="wl-button wl-primary" @click="reShowPath">Show Path</button>
          <button class="wl-button" @click="goBack">New Game</button>
        </template>
      </div>
      <WinLoseModal
        :visible="resultModal.visible"
        :type="resultModal.type"
        :title="resultModal.title"
        :subtitle="resultModal.subtitle"
        :stats="resultModal.stats"
        :game-mode="gameMode"
        @new-game="goBack"
        @freeplay="enterZenFreePlay"
        @show-path="onShowPath"
        @next-episode="onNextEpisode"
        @finish-show="onFinishShow"
      />
      <NotifyBanner />
      <UnifiedPopup 
        :game-mode="gameMode"
        @new-game="goBack"
        @freeplay="enterZenFreePlay"
        @show-path="onShowPath"
        @next-episode="onNextEpisode"
        @finish-show="onFinishShow"
      />
    </BoardShell>

    <GameSearchPanel
      ref="gameSearchPanel"
      :game-mode="gameMode"
      :game-options="gameOptions"
      :show-tutorial="showTutorial"
      :tutorial-step="tutorialStep"
      @item-added="onItemAdded"
      @connection-created="onConnectionCreated"
      @show-error="onShowError"
      @hint-requested="onHintRequested"
    />

  </div>
</template>

<script>
import GameBoard from '../components/GameBoard.vue'
import NotifyBanner from '../components/UI/NotifyBanner.vue'
import WinLoseModal from '../components/UI/WinLoseModal.vue'
import UnifiedPopup from '../components/UI/UnifiedPopup.vue'
import TutorialOverlay from '../components/TutorialOverlay.vue'
import GameSearchPanel from '../components/GameSearchPanel.vue'
import GameHeader from '../components/UI/GameHeader.vue'
import BoardShell from '../components/BoardShell.vue'
import { useGameStateStore } from '@store/gameState.store.ts'
import { storeToRefs } from 'pinia'
import { log } from '../services/ui/log.ts'
import PopupService from '../services/ui/PopupService.ts'
import ItemService from '../services/ItemService.ts'
import { validate } from '../utils/validation.ts'
import { normalizeMediaType } from '../utils/constants.ts'
import { usePvPGame } from '../composables/usePvPGame.ts'
import { useBackgrounds } from '../composables/useBackgrounds.ts'
import { useCollaboration } from '../composables/useCollaboration.ts'
import { useGoalManagement } from '../composables/useGoalManagement.ts'

export default {
  name: 'GameView',
  components: { GameBoard, NotifyBanner, WinLoseModal, UnifiedPopup, TutorialOverlay, GameSearchPanel, GameHeader, BoardShell },
  props: {
    gameMode: { type: Object, required: true },
    gameOptions: { type: Object, default: () => ({}) },
    showTutorial: { type: Boolean, default: false },
    tutorialStep: { type: Number, default: 0 },
  },
  emits: ['tutorial-next', 'back-to-mode-selection', 'tutorial-start', 'back-to-start', 'tutorial-completed'],
  setup() {
    const gs = useGameStateStore()
    const { timerEnabled, timerRemaining } = storeToRefs(gs)
    const pvpGame = usePvPGame()
    const backgrounds = useBackgrounds()
    const collaboration = useCollaboration()
    const goalManagement = useGoalManagement()
    return { timerEnabled, timerRemaining, ...pvpGame, ...backgrounds, ...collaboration, ...goalManagement }
  },
  data() {
    return {
      viewportData: { x: 0, y: 0, scale: 1 },
      resultModal: { visible: false, type: 'lose', title: '', subtitle: '', stats: null },
      timerExpired: false,
    }
  },
  computed: {
    viewportInfo() {
      if (this.$refs.gameBoard) return this.$refs.gameBoard.getViewportInfo()
      return { x: 0, y: 0, scale: 1 }
    },
  },
  methods: {
    startTutorial() {
      this.$emit('tutorial-start')
    },
    onItemMoved(move) {
      // Use composable to handle item movement
      this.handleItemMoved(move)
    },
    goBack() {
      console.log('↩ Back button clicked - ending game and navigating to mode selection')
      
      // End the current game properly
      this.endGame()
      
      // Preserve play type (solo/multi) in both hash and sessionStorage
      try {
        // First check sessionStorage (most reliable)
        const storedPlayType = sessionStorage.getItem('playType')
        if (storedPlayType) {
            window.location.hash = `play=${storedPlayType}`
        } else {
          // Fallback to checking URL hash
          const currentHash = window.location.hash || ''
          const playTypeMatch = currentHash.match(/play=(solo|multi|pvp)/)
          if (playTypeMatch) {
            // Keep the play type but remove room code
            const newHash = `play=${playTypeMatch[1]}`
            window.location.hash = newHash
            // Also store in sessionStorage as backup
            sessionStorage.setItem('playType', playTypeMatch[1])
          } else {
            // No play type found, clear hash completely
          window.location.hash = ''
        }
        }
      } catch (error) {
        window.location.hash = ''
      }
      
      // Navigate back to mode selection
      this.$emit('back-to-mode-selection')
    },
    endGame() {
      
      // Send end game action to server
      this.sendEndGame()
      
      // Stop physics
      try {
        const physicsService = require('../services/game/physicsService.ts').default
        physicsService.stop()
      } catch (_) {}
      
      // Stop timer
      try {
        const gs = useGameStateStore()
        gs.stopTimer()
      } catch (_) {}
      
      // Disconnect from collaboration
      this.disconnectCollab()
      
      // Reset game state
      try {
        const gs = useGameStateStore()
        gs.reset()
      } catch (_) {}
      
      // Clean up mode manager
      try {
        const gameModeManager = require('../services/game/GameModeManager.ts').default
        gameModeManager.cleanup()
      } catch (_) {}
      
    },
    initTimer() {
      const type =
        this.gameOptions?.modeSettings?.timerType ||
        this.gameMode?.modeSettings?.timerType ||
        'none'
      const gs = useGameStateStore()
      let enabled = type !== 'none'
      let seconds = 0
      if (enabled) {
        const parsed = parseInt(type, 10)
        seconds = Number.isFinite(parsed) ? parsed : 0
      }
      if (!enabled && this.gameMode?.commonSettings?.timer?.enabled) {
        enabled = true
        seconds = this.gameMode?.timeLimit || this.gameMode?.commonSettings?.timer?.defaultTime || 0
      }
      gs.configureTimer(seconds)
      gs.setTimerExpiredCallback(() => this.onTimerExpired())
      if (gs.timerEnabled) gs.startTimer()
    },
    onTimerExpired() {
      this.resultModal = {
        visible: true,
        type: 'lose',
        title: "Time's Up",
        subtitle: 'You ran out of time.',
        stats: null,
      }
    },
    initCollab() {
      // Use composable to initialize collaboration
      this.initCollabComposable(
        this.$refs.gameBoard,
        this.gameOptions,
        this.initializePvPGame,
        this.showPvPResults,
        this.broadcastGameStart
      )
    },
    broadcastState() {
      // Use composable to broadcast state
      this.broadcastStateComposable(this.$refs.gameBoard, this.gameOptions, this.shouldSkipCollabForPvP)
    },
    broadcastGameStart() {
      // Use composable to broadcast game start
      this.broadcastGameStartComposable(this.$refs.gameBoard, this.gameOptions, this.gameMode, this.shouldSkipCollabForPvP)
    },
    onGameStarted() {
      // Broadcast game start event when GameBoard starts
      this.broadcastGameStart()
    },
    onShowError(message) {
      // Use popup service to show error message
      PopupService.showCustom('error', 'Error', message, '❌', 3000)
    },
    onItemAdded(data) {
      const { item, tmdbId, itemType, hintSourceItem } = data
      const gb = this.$refs.gameBoard
      
      if (!gb) return
      
      // If the selected result already exists on board, connect from hint source to it
      if (tmdbId && itemType && hintSourceItem) {
        const existing = (gb.gameItems || []).find((i) => {
          const exId = i?.tmdbData?.id || i?.tmdbId
          const exType = normalizeMediaType(i?.type || i?.tmdbData?.media_type)
          return String(exId) === String(tmdbId) && exType === itemType
        })
        if (existing) {
          Promise.resolve()
            .then(() => gb.isValidConnection(hintSourceItem, existing))
            .then((ok) => {
              if (ok) gb.createConnection(hintSourceItem, existing)
            })
            .catch(() => {})
          return
        }
      }
      
      // Add the new item
      gb.addItem(item)
      
      // Broadcast add to peers
      this.broadcastItemAdd(item, this.gameOptions, this.shouldSkipCollabForPvP)
      
      // If we have a hint source and we just added the selected item, try to connect them
      if (hintSourceItem) {
        // Find the newly added item by tmdb id and type
        const newlyAdded = (gb.gameItems || []).find((i) => {
          const exId = i?.tmdbData?.id || i?.tmdbId
          const exType = normalizeMediaType(i?.type || i?.tmdbData?.media_type)
          return String(exId) === String(tmdbId) && exType === itemType
        })
        if (newlyAdded) {
          Promise.resolve()
            .then(() => gb.isValidConnection(hintSourceItem, newlyAdded))
            .then((ok) => {
              if (ok) gb.createConnection(hintSourceItem, newlyAdded)
            })
            .catch(() => {})
        }
      }
    },
    initializePvPGame(gameData) {
      // Use composable to initialize PvP game
      const updatedOptions = this.initializePvPGameComposable(this.$refs.gameBoard, gameData, this.gameOptions)
      if (updatedOptions) {
        this.gameOptions = updatedOptions
      }
    },
    showPvPResults(results) {
      // Use composable to show PvP results
      this.resultModal = this.showPvPResultsComposable(results, this.gameOptions, this.roomCode)
    },
    sendPvPCompletion(goalData) {
      // Use composable to send PvP completion
      this.sendPvPCompletionComposable(goalData, this.gameOptions, this.roomCode)
    },
    onCollabMessage(msg) {
      // Use composable to handle PvP messages
      if (this.handlePvPCollabMessage(msg, this.gameOptions, this.showPvPResults)) {
        return
      }
      
      const gb = this.$refs.gameBoard
      if (!gb) return
      if (msg.type === 'state') {
        gb.gameItems = msg.payload.items || []
        gb.connections = msg.payload.connections || []
        
        // Sync game options for custom mode multiplayer
        if (msg.payload.gameOptions) {
          this.gameOptions = { ...this.gameOptions, ...msg.payload.gameOptions }
        }
        
        gb.$forceUpdate()
      } else if (msg.type === 'action') {
        const a = msg.payload || {}
        if (a.kind === 'add') {
          // DEBUG: Log what PC received
          console.log('💻 PC RECEIVED ITEM:', {
            itemTitle: a.item?.title,
            addedBy: a.item?.addedBy,
            accentColor: a.item?.accentColor,
            fullItem: a.item
          })
          
          // dedupe by tmdb id + normalized type
          const tmdbId = a.item?.tmdbData?.id || a.item?.tmdbId
          const type = (a.item?.type || a.item?.tmdbData?.media_type || '').toLowerCase()
          const exists = (gb.gameItems || []).some((i) => {
            const exId = i?.tmdbData?.id || i?.tmdbId
            const exType = (i?.type || i?.tmdbData?.media_type || '').toLowerCase()
            return String(exId) === String(tmdbId) && exType === type
          })
          if (!exists) {
            gb.addItem(a.item)
            console.log('✅ PC ADDED ITEM TO BOARD')
          } else {
            console.log('⚠️ PC SKIPPED - ITEM ALREADY EXISTS')
          }
        } else if (a.kind === 'connect') {
          // dedupe by unordered pair keys
          const key = (it) => `${(it?.tmdbData?.id || it?.tmdbId) || it?.id}-${(it?.type || it?.tmdbData?.media_type || '').toLowerCase()}`
          const fromK = key(a.from)
          const toK = key(a.to)
          const pair = [fromK, toK].sort().join('|')
          const exists = (gb.connections || []).some((c) => {
            const aK = [key(gb.gameItems.find(i=>i.id===c.from) || {}), key(gb.gameItems.find(i=>i.id===c.to) || {})].sort().join('|')
            return aK === pair
          })
          if (!exists) gb.createConnection(a.from, a.to)
        } else if (a.kind === 'move') {
          const it = gb.gameItems.find((i) => i.id === a.id)
          if (it) {
            it.x = a.x
            it.y = a.y
            gb.$forceUpdate()
          }
        }
      }
    },
    formatTime(total) {
      const m = Math.floor(total / 60)
      const s = total % 60
      return `${m}:${s.toString().padStart(2, '0')}`
    },
    enterZenFreePlay() {
      this.resultModal.visible = false
      try {
        const zenMode = { id: 'zen', name: 'Zen Mode', title: 'Zen Mode' }
        this.$emit('mode-changed', zenMode)
        if (this.gameMode && this.gameMode.id !== 'zen') {
          this.gameMode.id = 'zen'
        }
        const gb = this.$refs.gameBoard
        if (gb && typeof gb.checkGoalCompletion === 'function') {
          gb.checkGoalCompletion()
        }
        const pair = this.resultModal?.losingPair
        if (gb && pair && typeof gb.createConnection === 'function') {
          const from = gb.gameItems.find((i) => i.id === pair.fromId)
          const to = gb.gameItems.find((i) => i.id === pair.toId)
          if (from && to) {
            gb.createConnection(from, to)
          }
        }
        // Show bottom bar and clear highlight when entering Free Play from modal
        this.bottomBarVisible = true
        this.highlightPathIds = []
      } catch (_) {}
    },
    async onHintRequested(item) {
      // Delegate to GameSearchPanel component
      this.$refs.gameSearchPanel?.onHintRequested(item)
    },
    resetZoom() {
      if (this.$refs.gameBoard) {
        this.$refs.gameBoard.resetZoom()
        this.viewportData.scale = 1
      }
    },
    resetPan() {
      if (this.$refs.gameBoard) {
        this.$refs.gameBoard.resetPan()
        this.viewportData.x = 0
        this.viewportData.y = 0
      }
    },
    updateViewportData(viewport) {
      this.viewportData = { x: viewport.x, y: viewport.y, scale: viewport.scale }
    },
    getStartingItems() {
      // Use composable to get starting items
      return this.getStartingItemsComposable(this.gameMode, this.gameOptions)
    },
    onConnectionCreated(data) {
      log('info', '🔗 Connection created:', data)
      console.log('🔗 Full data object:', data)
      console.log('🔗 Data keys:', Object.keys(data))
      const gs = useGameStateStore()
      
      // The emit sends { connection, from, to }
      const connection = data.connection || data
      const from = data.from || connection.fromItem
      const to = data.to || connection.toItem
      
      console.log('🔗 Connection items found:', { from, to, connection })
      
      if (from && to) {
        // Show popup for successful connection
        console.log('🔗 Calling PopupService.showConnectionSuccess')
        PopupService.showConnectionSuccess(from, to)
        
        // Broadcast to phone via collaboration
        this.broadcastConnection(from, to)
      } else {
        console.warn('🔗 Connection items not found!', { fromId: connection?.from, toId: connection?.to, connection, data })
      }
    },
    async onCheckGoals(connections) {
      console.log('🎯 onCheckGoals called with', connections.length, 'connections')
      // Use composable to handle goal checking
      const gb = this.$refs.gameBoard
      const gameItems = gb?.gameItems?.value || gb?.gameItems || []
      console.log('🎯 Checking goals with', gameItems.length, 'items and', connections.length, 'connections')
      const result = await this.handleCheckGoals(connections, this.gameOptions, gameItems)
      if (result) {
        console.log('🎉 Win condition detected, emitting goal-completed')
        this.$emit('goal-completed', result)
      }
    },
    onGoalCompleted(goalData) {
      // Use composable to handle goal completion
      this.handleGoalCompleted(goalData, this.gameOptions, this.roomCode, this.handlePvPGoalCompletion, this.resultModal)
    },
    onGoalAdvanced(goalData) {
      // Use composable to handle goal advancement
      this.handleGoalAdvanced(goalData, this.gameOptions, this.$refs.gameBoard, this.addNewStartingItems, this.showGoalAdvancementNotification)
    },
    addNewStartingItems(nextGoal) {
      // Use composable to add new starting items
      this.handleAddNewStartingItems(nextGoal, this.$refs.gameBoard, this.gameOptions)
    },
    onShowPath() {
      // Use composable to show path
      this.handleShowPath(this.resultModal)
    },
    // Bottom bar: Hide Path clears highlight and flips to Show Path + New Game
    hidePathFromBar() {
      // Use composable to hide path
      this.handleHidePathFromBar()
    },
    // Bottom bar: re-apply saved path and flip back to Zen + New Game
    reShowPath() {
      // Use composable to re-show path
      this.handleReShowPath()
    },
    showWinModalAgain() {
      this.resultModal.visible = true
    },
    onNextEpisode() {
      // Advance to next episode in the show
      if (this.gameMode && this.gameMode.showData) {
        const currentIndex = this.gameMode.showData.currentEpisodeIndex || 0
        const nextIndex = currentIndex + 1
        const episodes = this.gameMode.showData.episodes || []
        
        if (nextIndex < episodes.length) {
          const nextEpisode = episodes[nextIndex]
          console.log('🎬 Advancing to next episode:', nextIndex + 1, nextEpisode)
          
          // Validate next episode before loading
          const validationResult = validate.episode(nextEpisode)
          if (!validationResult.valid) {
            console.error('Next episode validation failed:', validationResult.errors)
            notify.error(`Cannot load next episode: ${validationResult.errors.join(', ')}`)
            return
          }
          
          if (validationResult.warnings.length > 0) {
            console.warn('Next episode validation warnings:', validationResult.warnings)
          }
          
          // Update the current episode index
          this.gameMode.showData.currentEpisodeIndex = nextIndex
          
          // Convert next episode goals to starting items
          const startingItems = ItemService.goalsToStartingItems(nextEpisode.goals, nextEpisode.modeType)
          
          // Update game mode with next episode data
          this.gameMode.id = nextEpisode.modeType
          this.gameMode.name = nextEpisode.name
          this.gameMode.icon = nextEpisode.icon
          this.gameMode.description = nextEpisode.description
          this.gameMode.goals = nextEpisode.goals
          this.gameMode.settings = nextEpisode.settings
          this.gameMode.modeType = nextEpisode.modeType
          
          // Update game options
          this.gameOptions.startingItems = startingItems
          
          // Reset game state for new episode
          this.resetGameForNewEpisode()
          
          // Emit mode change to parent
          this.$emit('mode-changed', this.gameMode)
        }
      }
    },
    onFinishShow() {
      // Finish the show and go back to mode selection
      console.log('🎬 Show finished!')
      this.$emit('finish-show')
    },
    resetGameForNewEpisode() {
      // Reset game state for the new episode
      this.resultModal.visible = false
      this.bottomBarVisible = false
      this.highlightPathIds = []
      this.savedWinPathIds = []
      
      // Clear all connections from the previous episode
      if (this.$refs.gameBoard) {
        // Clear connections array
        this.$refs.gameBoard.connections = []
        
        // Clear game items
        this.$refs.gameBoard.gameItems = []
        
        // Update connection service
        if (this.$refs.gameBoard.connectionService) {
          this.$refs.gameBoard.connectionService.updateGameState([], [])
        }
        
        // Update game state store
        if (this.$refs.gameBoard.gs && typeof this.$refs.gameBoard.gs.updateConnections === 'function') {
          this.$refs.gameBoard.gs.updateConnections([])
        }
        if (this.$refs.gameBoard.gs && typeof this.$refs.gameBoard.gs.updateGameItems === 'function') {
          this.$refs.gameBoard.gs.updateGameItems([])
        }
      }
      
      // Clear search
      this.searchQuery = ''
      this.searchResults = []
    },
    openWinModal() {
      // Open win modal and advance to win screen tutorial
      this.resultModal = {
        visible: true,
        type: 'win',
        title: 'Tutorial Complete!',
        subtitle: 'You\'ve learned the basics of The Connection Game!',
        stats: { tutorialCompleted: true }
      }
      // Emit event to parent to advance tutorial step
      this.$emit('tutorial-next')
    },
    endTutorial() {
      // End tutorial completely - emit to parent instead of mutating props
      this.$emit('tutorial-next')
    },
    returnToStart() {
      // Emit event to parent to go back to start screen and mark tutorial as completed
      this.$emit('back-to-start')
      this.$emit('tutorial-completed')
    },
  },
  async mounted() {
    console.log('🎯 Game mounted - Goal queue:', this.gameOptions?.goalQueue)
    console.log('🎯 Game mode:', this.gameMode?.id)
    console.log('🎯 Current goal index:', this.gameOptions?.currentGoalIndex)
    
    // Initialize backgrounds
    await this.initializeBackgrounds()
    
    this.initTimer()
    
    // Store game options in game state store for multiplayer sharing
    try {
      const gs = useGameStateStore()
      gs.updateGameOptions(this.gameOptions)
    } catch (_) {}
    
    try {
      this.setRoomCodeFromOptions(this.gameOptions)
      if (this.roomCode && !this.isPvPMode()) {
        gs.setRoomCode(this.roomCode)
        this.initCollab()
      }
    } catch (_) {}
    
  },
  beforeUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
    const gs = useGameStateStore()
    gs.stopTimer()
    // Cleanup backgrounds and collaboration
    this.cleanup()
  },
}
</script>

<style scoped>
.game-screen {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #003844, #3f4b41);
  color: white;
  position: relative;
}

.game-screen::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 182px;
  opacity: 0.12;
  pointer-events: none;
  z-index: 9999;
}
/* Background button removed */
.back-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  backdrop-filter: blur(15px);
}
.timer-chip {
  position: absolute;
  top: calc(4rem + 3.2rem + 0.5rem);
  right: 1rem;
  z-index: 10;
  padding: 0.5rem 0.8rem;
  background: var(--glass-bg);
  color: white;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  backdrop-filter: blur(var(--glass-blur));
  font-weight: 600;
}
.viewport-controls {
  position: absolute;
  top: 4rem;
  right: 1rem;
  z-index: 10;
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  color: white;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  backdrop-filter: blur(var(--glass-blur));
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 1rem;
  gap: 1rem;
}
.viewport-controls:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
.control-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}
.control-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
.control-separator {
  opacity: 0.5;
  font-weight: 300;
}
.control-label {
  font-weight: 500;
  opacity: 0.8;
  font-size: 0.9rem;
}
.control-value {
  font-weight: 600;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}
.game-board {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--glass-bg);
  backdrop-filter: blur(calc(var(--glass-blur) - 5px));
  min-height: 0;
  position: relative;
  border: none;
}
.glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  pointer-events: none;
  z-index: 0;
  border: none;
}
.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: 0;
  background: var(--glass-bg);
  color: white;
  font-size: 0.9rem;
  backdrop-filter: blur(calc(var(--glass-blur) - 5px));
  box-sizing: border-box;
  display: block;
  border-top: 1px solid var(--glass-border);
  flex-shrink: 0;
}
.search-input:focus {
  outline: none;
  border-color: var(--glass-border);
  background: var(--glass-bg);
}
.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}
.search-container {
  position: relative;
  width: 100%;
}
.search-results {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-bottom: none;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  pointer-events: auto;
}
.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}
.close-results {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-results:hover {
  color: white;
}
.search-results-list {
  max-height: 240px;
  overflow-y: auto;
  will-change: scroll-position;
  transform: translateZ(0);
  -webkit-overflow-scrolling: touch;
}
.search-result-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background-color 0.1s ease;
  will-change: background-color;
  contain: layout style;
  min-height: 40px;
}
.search-result-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
.search-result-item:last-child {
  border-bottom: none;
}
.result-image {
  width: 50px;
  height: 75px;
  margin-right: 0.75rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  contain: layout style paint;
  transform: translateZ(0);
}
.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.result-icon {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.6);
}
.result-info {
  flex: 1;
  min-width: 0;
}
.result-title {
  font-weight: 600;
  color: white;
  margin-bottom: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
  line-height: 1.2;
}
.result-type {
  font-size: 0.7rem;
  color: #4caf50;
  margin-bottom: 0.1rem;
  line-height: 1.1;
}
.result-year {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.1;
}
.win-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 2500;
}
.wl-button {
  padding: 8px 14px;
  border-radius: 8px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}
.wl-button.wl-primary {
  border-color: #4caf50;
}
.wl-overlay-enter {
  animation: slideDown 280ms ease both;
}
@keyframes slideDown {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(20px); opacity: 0.0; }
}

/* Tutorial glow effects */
.tutorial-glow {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3) !important;
  border: 2px solid rgba(78, 205, 196, 0.8) !important;
  position: relative !important;
  z-index: 10 !important;
}

/* Tutorial glow overlay for specific elements */
.tutorial-glow-overlay {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none !important;
  z-index: 5001 !important;
}

/* Tutorial glow for specific elements during tutorial steps - using deep selectors */
.tutorial-step-22 :deep(.game-item) {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3) !important;
  border: 2px solid rgba(78, 205, 196, 0.8) !important;
}

/* Target the control items in viewport controls, not the container */
.tutorial-step-25 :deep(.viewport-controls .control-item) {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3) !important;
  border: 2px solid rgba(78, 205, 196, 0.8) !important;
}

.tutorial-step-26 :deep(.hint-btn),
.tutorial-step-26\.5 :deep(.hint-btn) {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3) !important;
  border: 2px solid rgba(78, 205, 196, 0.8) !important;
}

/* Target the inner stat chips, not the container */
.tutorial-step-27 :deep(.center-stats .stat-chip),
.tutorial-step-27 :deep(.center-stats .split-stat-chip),
.tutorial-step-27 :deep(.center-stats .connection-chip) {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3) !important;
  border: 2px solid rgba(78, 205, 196, 0.8) !important;
}
</style>

<style>
/* Global tutorial glow effects that work across component boundaries */
.tutorial-step-22 .game-item {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3) !important;
  border: 2px solid rgba(78, 205, 196, 0.8) !important;
}

/* Target the control items in viewport controls, not the container */
.tutorial-step-25 .viewport-controls .control-item {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3) !important;
  border: 2px solid rgba(78, 205, 196, 0.8) !important;
}

.tutorial-step-26 .hint-btn,
.tutorial-step-26\.5 .hint-btn {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3) !important;
  border: 2px solid rgba(78, 205, 196, 0.8) !important;
}

/* Target the inner stat chips, not the container */
.tutorial-step-27 .center-stats .stat-chip,
.tutorial-step-27 .center-stats .split-stat-chip,
.tutorial-step-27 .center-stats .connection-chip {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3) !important;
  border: 2px solid rgba(78, 205, 196, 0.8) !important;
}
</style>
