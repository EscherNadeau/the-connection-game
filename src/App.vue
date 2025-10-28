<template>
  <div id="app">
    <div class="app-bg" :style="{ backgroundImage: bgUrl ? `url(${bgUrl})` : 'none' }">
      <div class="app-bg-image"></div>
    </div>
    <template v-if="currentView === 'start'">
      <Home 
        :show-tutorial="showTutorial"
        :tutorial-step="tutorialStep"
        :tutorial-just-completed="tutorialJustCompleted"
        @start-game="handleStartFromHome" 
        @how-to-play="showHowToPlay = true"
        @tutorial-start="startTutorial"
        @tutorial-next="nextTutorialStep"
        @tutorial-step="setTutorialStep"
        @tutorial-completion-shown="tutorialJustCompleted = false"
      />
    </template>
    <template v-else-if="currentView === 'join-room'">
      <JoinRoom @back="goToStart" @join="joinByCode" />
    </template>
    <template v-else-if="currentView === 'mode-selection'">
      <ModeSelection 
        :show-tutorial="showTutorial" 
        :tutorial-step="tutorialStep"
        @back-to-start="goToStart" 
        @mode-selected="selectGameMode"
        @tutorial-next="nextTutorialStep"
      />
    </template>
    <template v-else-if="currentView === 'settings'">
      <SettingsScreen 
        :mode="gameMode" 
        :show-tutorial="showTutorial"
        :tutorial-step="tutorialStep"
        @start-game="startGameFromSettings" 
        @go-back="goBackToModeSelection"
        @tutorial-next="nextTutorialStep"
        @tutorial-jump-to-step="jumpToTutorialStep"
      />
    </template>
    <template v-else-if="currentView === 'waiting-room'">
      <WaitingRoom 
        :game-mode="gameMode" 
        :game-options="gameOptions"
        :show-tutorial="showTutorial"
        :tutorial-step="tutorialStep"
        @back="goBackToModeSelection" 
        @start-game="startGameFromWaitingRoom"
        @tutorial-next="nextTutorialStep"
      />
    </template>

    <template v-else-if="currentView === 'phone-waiting-room'">
      <PhoneWaitingRoom 
        :game-mode="gameMode" 
        :game-options="gameOptions" 
        @game-started="switchToGame" 
      />
    </template>
    <template v-else-if="currentView === 'game'">
      <Game 
        :gameMode="gameMode" 
        :gameOptions="gameOptions" 
        :showTutorial="showTutorial"
        :tutorialStep="tutorialStep"
        @back-to-start="goToStart"
        @back-to-mode-selection="goToModeSelection"
        @tutorial-next="nextTutorialStep"
        @tutorial-start="startTutorial"
        @tutorial-completed="markTutorialCompleted"
        @finish-show="onFinishShow"
      />
    </template>
    <template v-else-if="currentView === 'controller'">
      <ControllerView 
        :game-mode="gameMode" 
        :game-options="gameOptions" 
        @game-started="switchToGame" 
      />
    </template>
    <template v-else-if="currentView === 'custom-mode'">
      <CustomModeFlow 
        @back="goToStart" 
        @start-game="handleCustomGameStart" 
        :open-browser-on-load="openBrowserOnLoad" 
        @browser-opened="openBrowserOnLoad = false"
        :show-tutorial="showTutorial"
        :tutorial-step="tutorialStep"
        @tutorial-next="nextTutorialStep"
      />
    </template>
    
    <!-- How to Play Overlay -->
    <HowToPlayOverlay 
      :is-visible="showHowToPlay" 
      @close="showHowToPlay = false"
      @start-tutorial="startTutorialFromHowToPlay"
    />
    
  </div>
</template>

<script>
import Home from './views/Home.vue'
// import CreateJoin from './views/CreateJoin.vue'
import JoinRoom from './views/JoinRoom.vue'
import WaitingRoom from './views/WaitingRoom.vue'
import ModeSelection from './views/ModeSelection.vue'
import SettingsScreen from './components/SettingsScreen.vue'
import PhoneWaitingRoom from './components/PhoneWaitingRoom.vue'
import ControllerView from './components/ControllerView.vue'
import Game from './views/Game.vue'
import HowToPlayOverlay from './components/HowToPlayOverlay.vue'
import CustomModeFlow from './components/CustomModeFlow.vue'
import { multiplayerService } from './services/MultiplayerService.ts'
import { log } from './services/ui/log.ts'
import { useBackgroundStore } from '@store/background.store.ts'
import { useGameStateStore } from '@store/gameState.store.ts'
import { validate } from './utils/validation.ts'
import config from './config/env'

export default {
  name: 'App',
  components: {
    Home,
    JoinRoom,
    WaitingRoom,
    ModeSelection,
    SettingsScreen,
    PhoneWaitingRoom,
    ControllerView,
    Game,
    HowToPlayOverlay,
    CustomModeFlow,
  },
  data() {
    return {
      currentView: 'start',
      gameMode: null,
      gameOptions: {},
      bgReady: false,
      suppressAutoJoin: false,
      showHowToPlay: false,
      showTutorial: false,
      tutorialStep: 0,
      tutorialJustCompleted: false,
      openBrowserOnLoad: false,
    }
  },
  mounted() {
    console.log('🚀 App.vue mounted, currentView:', this.currentView, 'hash:', window.location.hash)
    
    // Check for show import from URL
    this.checkForShowImport()
    
    // Auto-join game if URL has a room code
    const tryJoinFromHash = async () => {
      console.log('🔍 tryJoinFromHash called, currentView:', this.currentView, 'suppressAutoJoin:', this.suppressAutoJoin)
      if (this.suppressAutoJoin || this.currentView === 'waiting-room' || this.currentView === 'phone-waiting-room') {
        console.log('🔍 tryJoinFromHash skipped due to guard clause')
        return
      }
      const hash = window.location.hash || ''
      const m = hash.match(/room=([A-Za-z0-9_-]+)/)
      if (m) {
        const code = m[1]
        // Mark that we're joining a room (for phone detection later)
        sessionStorage.setItem('isJoiningRoom', 'true')
        console.log('🔍 Phone: Room code from URL hash:', code)
        console.log('🔍 Phone: Full URL hash:', hash)
        // Provide minimal mode/options so GameScreen can mount and Collab can join
        const sm = hash.match(/s=([^&]+)/)
        let decoded = null
        if (sm && sm[1]) {
          try { decoded = JSON.parse(decodeURIComponent(escape(atob(sm[1])))) } catch (_) { decoded = null }
        } else {
          // Try snapshot server with short code
          try {
            const url = `${config.snapshotUrl}/${encodeURIComponent(code)}`
            console.log('🔍 Phone: Fetching room data from:', url)
            console.log('🔍 Phone: Room code being fetched:', code)
            const resp = await fetch(url, { cache: 'no-store' })
            console.log('🔍 Phone: Snapshot server response:', resp.ok, resp.status)
            if (resp.ok) {
              decoded = await resp.json()
              console.log('🔍 Phone: Decoded room data:', decoded)
            } else {
              console.log('🔍 Phone: Snapshot server failed with status:', resp.status)
            }
          } catch (e) {
            console.log('🔍 Phone: Snapshot server error:', e)
          }
        }
        let playType = 'multi' // Default fallback
        
        if (decoded && decoded.modeId) {
          // Get playType from decoded data (snapshot server)
          playType = decoded.playType || 'multi'
          console.log('🔍 Phone: Using snapshot data, playType:', playType)
          this.gameMode = {
            id: decoded.modeId,
            name: decoded.modeTitle || 'Shared Game',
            title: decoded.modeTitle || 'Shared Game',
            modeSettings: decoded.modeSettings || { timerType: 'none' },
          }
          this.gameOptions = { roomCode: code, startingItems: decoded.startingItems || [], playType: playType }
        } else {
          // Fallback to URL hash for playType
          const playTypeMatch = hash.match(/play=(solo|multi|pvp|couch-multiplayer|couch-pvp)/)
          playType = playTypeMatch ? playTypeMatch[1] : 'multi'
          console.log('🔍 Phone: Using fallback, playType:', playType, 'decoded:', decoded)
          // Don't overwrite gameMode if it was already set from snapshot data
          this.gameOptions = { ...(this.gameOptions || {}), roomCode: code, playType: playType }
        }
        const modeId = this.gameMode?.id || 'zen'
        
        // Initialize multiplayer and get appropriate view
        const multiplayerConfig = multiplayerService.initializeMultiplayer(modeId, playType, this.gameOptions)
        
        console.log('🔍 Phone: MultiplayerConfig result:', multiplayerConfig)
        console.log('🔍 Phone: isMobile:', multiplayerService.isMobile)
        console.log('🔍 Phone: playType:', playType)
        console.log('🔍 Phone: Suggested view:', multiplayerConfig.view)
        
        // Override view for couch modes - if someone scans QR to join couch mode, they're on a phone
        let targetView = multiplayerConfig.view
        if ((playType === 'couch-multiplayer' || playType === 'couch-pvp') && targetView === 'waiting-room') {
          console.log('🔍 Phone: Couch mode detected, forcing phone-waiting-room')
          targetView = 'phone-waiting-room'
        }
        
        console.log('🔍 Phone: Setting currentView to:', targetView)
        
        // Ensure gameMode is set BEFORE changing view for proper prop binding
        if (targetView === 'controller' && !this.gameMode) {
          this.gameMode = { id: modeId, name: decoded?.modeTitle || 'Unknown Mode', title: decoded?.modeTitle || 'Unknown Mode' }
        }
        
        this.currentView = targetView
      }
    }
    tryJoinFromHash()
    window.addEventListener('hashchange', tryJoinFromHash)
    window.addEventListener('app:navigate', (e) => {
      const to = (e && e.detail && e.detail.to) || ''
      if (to === 'controller') this.currentView = 'controller'
    })
    try {
      const bs = useBackgroundStore()
      bs.init().then(() => {
        this.bgReady = bs.ready
      })
    } catch (_) {}
  },
  methods: {
    checkForShowImport() {
      const hash = window.location.hash || ''
      
      // Check for ID-based import (new method)
      const idMatch = hash.match(/#import-show-id:(.+)/)
      if (idMatch) {
        const showId = idMatch[1]
        try {
          const showData = sessionStorage.getItem(`shared_show_${showId}`)
          if (showData) {
            const parsedShow = JSON.parse(showData)
            this.importShow(parsedShow)
            // Clean up the temporary data
            sessionStorage.removeItem(`shared_show_${showId}`)
          } else {
            alert('Shared show not found or has expired')
          }
        } catch (error) {
          console.error('Error loading shared show:', error)
          alert('Invalid shared show data')
        }
        return
      }
      
      // Check for data-based import (fallback method)
      const importMatch = hash.match(/#import-show:(.+)/)
      if (importMatch) {
        try {
          const showData = JSON.parse(decodeURIComponent(importMatch[1]))
          this.importShow(showData)
        } catch (error) {
          console.error('Error parsing show data from URL:', error)
          alert('Invalid show data in URL')
        }
      }
    },

    importShow(showData) {
      // Validate the show data
      const validationResult = validate.show(showData)
      if (!validationResult.valid) {
        console.error('Invalid show data in URL:', validationResult.errors)
        alert(`Invalid show data: ${validationResult.errors.join(', ')}`)
        return
      }
      
      // Navigate to custom mode and open browser
      this.currentView = 'custom-mode'
      this.openBrowserOnLoad = true
      
      // Store the show data to be imported
      this.$nextTick(() => {
        this.$refs.customModePanel?.importShowFromUrl(showData)
      })
      
      // Clear the hash to clean up the URL
      window.history.replaceState(null, null, window.location.pathname)
    },

    startGame(gameData) {
      log('info', 'App.vue received start-game event', gameData)
      // Navigate to mode selection instead of directly to game
      this.currentView = 'create-or-join'
      log('info', 'Navigated to mode-selection view')
    },
    handleStartFromHome(payload) {
      try {
        const action = (payload && payload.action) || ''
        if (action === 'join') {
          // Go directly to waiting room with the room code
          const code = payload.code || ''
          if (code) {
            window.location.hash = `room=${encodeURIComponent(code.toUpperCase())}`
          }
          return
        }
        // Handle show actions
        if (action === 'create-playlist') {
          this.currentView = 'custom-mode'
          return
        }
        if (action === 'browse-shows') {
          this.currentView = 'custom-mode'
          this.openBrowserOnLoad = true
          return
        }
        // Handle play mode selection from StartScreen menu
        if (action === 'create' && payload.mode) {
          const mode = payload.mode
          try { 
            window.location.hash = `play=${mode}`
            sessionStorage.setItem('playType', mode)
          } catch (_) {}
          this.currentView = 'mode-selection'
          return
        }
        // default to create flow -> go directly to mode selection
        this.currentView = 'mode-selection'
      } catch (_) {
        this.currentView = 'mode-selection'
      }
    },
    // goToModeSelection kept if needed elsewhere
    goToModeSelection() {
      this.currentView = 'mode-selection'
    },
    onFinishShow() {
      // Show finished, go back to mode selection
      console.log('🎬 Show completed!')
      this.goToModeSelection()
    },
    goToJoinRoom() {
      this.currentView = 'join-room'
    },
    selectGameMode(mode) {
      log('info', 'App.vue received mode-selected event', mode)
      this.gameMode = mode
      this.gameOptions = {}
      
      // Use MultiplayerService to determine routing
      const playTypeMatch = window.location.hash.match(/play=(solo|multi|pvp|couch-multiplayer|couch-pvp)/)
      const playType = playTypeMatch ? playTypeMatch[1] : 'solo'
      
      // Special handling for Zen mode - skip settings screen
      if (mode.id === 'zen') {
        this.gameOptions.playType = playType
        
        // For solo Zen mode, go directly to game
        if (playType === 'solo') {
          log('info', 'Zen mode solo - going directly to game')
          this.currentView = 'game'
          return
        }
        
        // For multiplayer/PvP Zen mode, go to waiting room
        if (playType === 'couch-multiplayer' || playType === 'couch-pvp') {
          log('info', 'Zen mode couch - going to waiting room')
          this.generateRoomCodeForCouch(mode, playType)
          this.currentView = 'waiting-room'
          return
        }
        
        // For PC multiplayer Zen mode, generate room code and go to waiting room
        if (playType === 'multi' || playType === 'pvp') {
          log('info', 'Zen mode PC multiplayer - going to waiting room')
          this.generateRoomCodeForPCMultiplayer(mode, playType).then(() => {
            this.currentView = 'waiting-room'
          })
          return
        }
        
        // For PC multiplayer, use MultiplayerService routing
        const multiplayerConfig = multiplayerService.initializeMultiplayer(mode.id, playType, this.gameOptions)
        this.currentView = multiplayerConfig.view
        return
      }
      
      // Check if mode supports the selected play type
      if (multiplayerService.supportsPlayType(mode.id, playType)) {
        // Set the play type in game options
        this.gameOptions.playType = playType
        
        // For couch play modes, go to settings first to configure the game
        if (playType === 'couch-multiplayer' || playType === 'couch-pvp') {
          this.currentView = 'settings'
        } else if (playType === 'multi' || playType === 'pvp') {
          // For PC multiplayer, generate room code THEN navigate
          this.generateRoomCodeForPCMultiplayer(mode, playType).then(() => {
            const multiplayerConfig = multiplayerService.initializeMultiplayer(mode.id, playType, this.gameOptions)
            this.currentView = multiplayerConfig.view
          })
        } else {
          // For solo and other modes, use MultiplayerService routing
          const multiplayerConfig = multiplayerService.initializeMultiplayer(mode.id, playType, this.gameOptions)
          this.currentView = multiplayerConfig.view
        }
      } else {
        // Fallback to settings if play type not supported
        this.currentView = 'settings'
      }
      
    },
    generateRoomCodeForCouch(mode, playType) {
      try {
        // Generate a simple room code
        const code = Math.random().toString(36).slice(2, 6).toUpperCase()
        
        // Create share payload
        const sharePayload = {
          modeId: mode.id,
          modeTitle: mode.title || mode.name || 'Mode',
          modeSettings: {},
          startingItems: [],
          playType: playType
        }
        
        // Try to store on snapshot server for short code
        fetch(`http://${location.hostname}:3011/api/snapshots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: sharePayload }),
        }).then(resp => {
          if (resp.ok) {
            return resp.json()
          }
          throw new Error('Server error')
        }).then(json => {
          if (json && json.code) {
            window.location.hash = `room=${json.code}`
            sessionStorage.setItem('lastRoomCode', json.code)
            console.log('🔍 Generated room code:', json.code)
          } else {
            // Fallback to local code
            const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))))
            window.location.hash = `room=${code}&s=${encoded}`
            sessionStorage.setItem('lastRoomCode', code)
            console.log('🔍 Generated fallback room code:', code)
          }
        }).catch(e => {
          // Fallback to local code
          const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))))
          window.location.hash = `room=${code}&s=${encoded}`
          sessionStorage.setItem('lastRoomCode', code)
          console.log('🔍 Generated fallback room code (error):', code)
        })
      } catch (e) {
        console.error('Error generating room code:', e)
      }
    },
    async generateRoomCodeForPCMultiplayer(mode, playType) {
      try {
        // Generate a simple room code
        const code = Math.random().toString(36).slice(2, 6).toUpperCase()
        
        // Create share payload
        const sharePayload = {
          modeId: mode.id,
          modeTitle: mode.title || mode.name || 'Mode',
          modeSettings: {},
          startingItems: [],
          playType: playType
        }
        
        // Try to store on snapshot server for short code
        try {
          const resp = await fetch(`http://${location.hostname}:3011/api/snapshots`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: sharePayload }),
          })
          
          if (resp.ok) {
            const json = await resp.json()
            if (json && json.code) {
              window.location.hash = `room=${json.code}`
              sessionStorage.setItem('lastRoomCode', json.code)
              console.log('🔍 PC Multiplayer: Generated room code:', json.code)
              return
            }
          }
        } catch (e) {
          console.warn('🔍 PC Multiplayer: Snapshot server error, using fallback', e)
        }
        
        // Fallback to local code
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))))
        window.location.hash = `room=${code}&s=${encoded}`
        sessionStorage.setItem('lastRoomCode', code)
        console.log('🔍 PC Multiplayer: Generated fallback room code:', code)
      } catch (e) {
        console.error('🔍 PC Multiplayer: Error generating room code:', e)
      }
    },

    goToStart() {
      this.currentView = 'start'
      this.gameMode = null
      this.gameOptions = {}
      
      // Reset tutorial state when going back to start
      this.showTutorial = false
      this.tutorialStep = 0
      
      // If we're returning from a completed tutorial, the StartScreen component
      // will automatically show the completion popup via its watcher
    },

    markTutorialCompleted() {
      this.tutorialJustCompleted = true
    },

    startGameFromSettings(modeWithSettings) {
      log('info', 'App.vue received start-game from settings', modeWithSettings)
      this.gameMode = modeWithSettings
      this.gameOptions = modeWithSettings.gameOptions || {}
      
      // Advance tutorial if we're in step 19.6 (waiting room final step)
      if (this.showTutorial && this.tutorialStep === 19.6) {
        this.tutorialStep = 20
      }
      
      const playType = this.gameOptions.playType || 'solo'
      
      // Use MultiplayerService to determine the next view
      const multiplayerConfig = multiplayerService.initializeMultiplayer(modeWithSettings.id, playType, this.gameOptions)
      
      // Override view for couch modes on phone
      // Check if we're joining (phone) or hosting (PC)
      // Phone sets 'isJoiningRoom' flag when scanning QR, PC doesn't
      let targetView = multiplayerConfig.view
      const isJoiningRoom = sessionStorage.getItem('isJoiningRoom') === 'true'
      console.log('🔍 Settings: playType:', playType, 'targetView:', targetView, 'isJoiningRoom:', isJoiningRoom)
      
      if ((playType === 'couch-multiplayer' || playType === 'couch-pvp') && targetView === 'waiting-room' && isJoiningRoom) {
        console.log('🔍 Settings: Couch mode + joining room, forcing phone-waiting-room (joining phone)')
        targetView = 'phone-waiting-room'
        // Clear the flag after using it
        sessionStorage.removeItem('isJoiningRoom')
      } else if ((playType === 'couch-multiplayer' || playType === 'couch-pvp') && targetView === 'waiting-room') {
        console.log('🔍 Settings: Couch mode + hosting room, keeping waiting-room (hosting PC)')
      }
      
      // Route based on play type
      if (playType === 'solo') {
        this.suppressAutoJoin = false
        this.currentView = 'game'
      } else {
        this.suppressAutoJoin = true
        this.currentView = targetView
      }
    },
    startGameFromWaitingRoom() {
      log('info', 'App.vue received start-game from waiting room')
      this.suppressAutoJoin = false
      
      // Advance tutorial if we're in step 19.6 (waiting room final step)
      if (this.showTutorial && this.tutorialStep === 19.6) {
        this.tutorialStep = 20
      }
      
      // Navigate to game view
      this.currentView = 'game'
    },
    handleCustomGameStart(customGameData) {
      log('info', 'App.vue received start-game from custom mode', customGameData)
      
      // Validate custom game data before starting
      if (customGameData.showData && customGameData.showData.episodes) {
        const validationErrors = []
        customGameData.showData.episodes.forEach((episode, index) => {
          const result = validate.episode(episode)
          if (!result.valid) {
            validationErrors.push(`Episode ${index + 1}: ${result.errors.join(', ')}`)
          }
        })
        
        if (validationErrors.length > 0) {
          console.error('Custom show validation failed:', validationErrors)
          alert(`Cannot start show with invalid episodes:\n${validationErrors.join('\n')}`)
          return
        }
      }
      
      // Set up the custom game mode with episode data
      this.gameMode = {
        id: customGameData.id,
        name: customGameData.name,
        icon: customGameData.icon,
        description: customGameData.description,
        // Pass through the episode's specific configuration
        goals: customGameData.goals,
        settings: customGameData.settings,
        modeType: customGameData.modeType,
        // Store show progression data
        showData: customGameData.showData
      }
      this.gameOptions = customGameData.gameOptions || { playType: 'solo' }
      
      // For custom shows, go directly to game (solo mode)
      this.suppressAutoJoin = false
      this.currentView = 'game'
    },
    enterGameFromWaiting() {
      this.suppressAutoJoin = false
      
      // Advance tutorial if we're in step 19.6 (waiting room final step)
      if (this.showTutorial && this.tutorialStep === 19.6) {
        this.tutorialStep = 20
      }
      
      // Use proper routing based on play type
      const playTypeMatch = window.location.hash.match(/play=(solo|multi|pvp|couch-multiplayer|couch-pvp)/)
      const playType = playTypeMatch ? playTypeMatch[1] : 'solo'
      
      if (playType === 'couch-multiplayer' || playType === 'couch-pvp') {
        // For couch play, mobile goes to controller, desktop goes to game
        this.currentView = multiplayerService.isMobile ? 'controller' : 'game'
      } else {
        // For other play types, everyone goes to game
        this.currentView = 'game'
      }
    },

    goBackToModeSelection() {
      log('info', 'App.vue received go-back event from settings')
      this.currentView = 'mode-selection'
      this.gameMode = null
      this.gameOptions = {}
    },
    joinByCode(code) {
      // Set hash and let mounted handler switch to game/join mode
      try {
        const cleaned = String(code || '').trim()
        if (!cleaned) return
        window.location.hash = `room=${encodeURIComponent(cleaned)}`
      } catch (_) {}
    },
    switchToGame() {
      // Switch from controller to game view when game starts
      this.currentView = 'game'
    },
    
    // Tutorial methods
    startTutorial() {
      this.showTutorial = true
      this.tutorialStep = 0
    },
    
    jumpToTutorialStep(step) {
      this.tutorialStep = step
      if (step === 20) {
        this.currentView = 'game'
      }
    },
    
    
    nextTutorialStep() {
      if (this.tutorialStep === 0) {
        // Move from welcome to "But what is The Connection Game?"
        this.tutorialStep = 1
      } else if (this.tutorialStep === 5) {
        // Move from "Choose Your Own Adventure" to "You picked Play Game!" or "You picked Shows!"
        // This will be handled by the specific click handlers in StartScreen
        // Don't auto-advance here - wait for user to click Play Game or Shows
        return // Don't advance automatically
      } else if (this.tutorialStep === 5.1) {
        // Move from "You picked Play Game!" directly to "Mode Selection"
        this.tutorialStep = 7
      } else if (this.tutorialStep === 5.2) {
        // Move from "You picked Shows!" to "Show Creator Welcome" (in custom mode)
        this.tutorialStep = 5.4
      } else if (this.tutorialStep === 5.4) {
        // Move from "Show Creator Welcome" to "What are Custom Shows?"
        this.tutorialStep = 5.5
      } else if (this.tutorialStep === 5.5) {
        // Move from "What are Custom Shows?" to "Interface Overview"
        this.tutorialStep = 5.6
      } else if (this.tutorialStep === 5.6) {
        // Move from "Interface Overview" to "Create Episode" button highlight
        this.tutorialStep = 5.7
      } else if (this.tutorialStep === 5.7) {
        // Move from "Create Episode" button highlight to "Episode Screen Welcome"
        this.tutorialStep = 5.8
      } else if (this.tutorialStep === 5.8) {
        // Move from "Episode Screen Welcome" to "Episode Information"
        this.tutorialStep = 5.9
      } else if (this.tutorialStep === 5.9) {
        // Move from "Episode Information" to "Mode Selection"
        this.tutorialStep = 5.10
      } else if (this.tutorialStep === 5.10) {
        // Move from "Mode Selection" to "Goals Section"
        this.tutorialStep = 5.11
      } else if (this.tutorialStep === 5.11) {
        // Move from "Goals Section" to "Settings Section"
        this.tutorialStep = 5.12
      } else if (this.tutorialStep === 5.12) {
        // Move from "Settings Section" to "Episode Created" (triggered by save button)
        this.tutorialStep = 5.13
      } else if (this.tutorialStep === 5.13) {
        // Move from "Episode Created" to "Episode Added" (triggered by drag and drop)
        this.tutorialStep = 5.14
      } else if (this.tutorialStep === 5.14) {
        // Move from "Episode Added" to "Show Panel"
        this.tutorialStep = 5.15
      } else if (this.tutorialStep === 5.15) {
        // Move from "Show Panel" to "Browser"
        this.tutorialStep = 5.16
      } else if (this.tutorialStep === 5.16) {
        // Move from "Browser Overview" to "Import/Export"
        this.tutorialStep = 5.17
      } else if (this.tutorialStep === 5.17) {
        // Move from "Import/Export" to "Show Management"
        this.tutorialStep = 5.18
      } else if (this.tutorialStep === 5.18) {
        // Move from "Show Management" to "Tutorial Complete"
        this.tutorialStep = 5.19
      } else if (this.tutorialStep === 5.19) {
        // Move from "Tutorial Complete" to next tutorial step
        this.tutorialStep = 6
      } else if (this.tutorialStep === 6) {
        // Move from "Press Couch" to "Press PvP" (Couch sub-menu)
        this.tutorialStep = 6.1
      } else if (this.tutorialStep === 6.1) {
        // Move from "Press PvP" to "Mode Selection"
        this.tutorialStep = 7
      } else if (this.tutorialStep === 7) {
        // Move to Goal Mode explanation
        this.tutorialStep = 7.1
      } else if (this.tutorialStep === 7.1) {
        // Move to Knowledge Mode explanation
        this.tutorialStep = 7.2
      } else if (this.tutorialStep === 7.2) {
        // Move to Hybrid Mode explanation
        this.tutorialStep = 7.3
      } else if (this.tutorialStep === 7.3) {
        // Move to Anti Mode explanation
        this.tutorialStep = 7.4
      } else if (this.tutorialStep === 7.4) {
        // Move to Zen Mode explanation
        this.tutorialStep = 7.5
      } else if (this.tutorialStep === 7.5) {
        // Move to "click Goal Mode" instruction
        this.tutorialStep = 7.6
      } else if (this.tutorialStep === 7.6) {
        // Move to settings page - set game mode first
        this.gameMode = { id: 'goal', name: 'Goal Mode' }
        this.tutorialStep = 8
        this.currentView = 'settings'
      } else if (this.tutorialStep === 8) {
        // Move to goal items explanation
        this.tutorialStep = 9
      } else if (this.tutorialStep === 9) {
        // Move to random dropdowns explanation
        this.tutorialStep = 10
      } else if (this.tutorialStep === 10) {
        // Move to dice icon explanation
        this.tutorialStep = 11
      } else if (this.tutorialStep === 11) {
        // Move to advanced settings explanation - open advanced settings first
        this.tutorialStep = 12
      } else if (this.tutorialStep === 12) {
        // Move to path mode explanation
        this.tutorialStep = 13
          // Move to timer explanation
          this.tutorialStep = 14
        } else if (this.tutorialStep === 14) {
          // Move to cast filter explanation
          this.tutorialStep = 15
        } else if (this.tutorialStep === 15) {
          // Move to hints explanation
          this.tutorialStep = 16
        } else if (this.tutorialStep === 16) {
          // Move to reset settings explanation
          this.tutorialStep = 17
        } else if (this.tutorialStep === 17) {
          // Move to start game instruction
          this.tutorialStep = 18
        } else if (this.tutorialStep === 18) {
          // Move to waiting room
          this.tutorialStep = 19
          this.currentView = 'waiting-room'
      } else if (this.tutorialStep === 19) {
        // Move to waiting room step 19.1
        this.tutorialStep = 19.1
      } else if (this.tutorialStep === 19.1) {
        // Move to waiting room step 19.2
        this.tutorialStep = 19.2
      } else if (this.tutorialStep === 19.2) {
        // Move to waiting room step 19.3
        this.tutorialStep = 19.3
      } else if (this.tutorialStep === 19.3) {
        // Move to waiting room step 19.4
        this.tutorialStep = 19.4
      } else if (this.tutorialStep === 19.4) {
        // Move to waiting room step 19.5
        this.tutorialStep = 19.5
      } else if (this.tutorialStep === 19.5) {
        // Move to waiting room step 19.55
        this.tutorialStep = 19.55
      } else if (this.tutorialStep === 19.55) {
        // Move to waiting room step 19.6
        this.tutorialStep = 19.6
      } else if (this.tutorialStep === 19.6) {
        // Wait for user to press start - don't auto-advance
        // Tutorial will advance when game actually starts
        } else if (this.tutorialStep === 20) {
          // Move to gameboard step 21
          this.tutorialStep = 21
        } else if (this.tutorialStep === 21) {
          // Move to gameboard step 22
          this.tutorialStep = 22
        } else if (this.tutorialStep === 22) {
          // Move to gameboard step 23
          this.tutorialStep = 23
        } else if (this.tutorialStep === 23) {
          // Move to gameboard step 24
          this.tutorialStep = 24
        } else if (this.tutorialStep === 24) {
          // Move to gameboard step 25
          this.tutorialStep = 25
        } else if (this.tutorialStep === 25) {
          // Move to gameboard step 26
          this.tutorialStep = 26
        } else if (this.tutorialStep === 26) {
          // Move to hints try step 26.5
          this.tutorialStep = 26.5
        } else if (this.tutorialStep === 26.5) {
          // Move to connections step 26.6
          this.tutorialStep = 26.6
        } else if (this.tutorialStep === 26.6) {
          // Move to gameboard step 27
          this.tutorialStep = 27
        } else if (this.tutorialStep === 27) {
          // Move to gameboard step 28
          this.tutorialStep = 28
        } else if (this.tutorialStep === 28) {
          // Move to win screen tutorial step 29
          this.tutorialStep = 29
        } else if (this.tutorialStep === 29) {
          // End tutorial after win screen
          this.showTutorial = false
          this.tutorialStep = 0
          this.tutorialJustCompleted = true
      } else {
        this.tutorialStep++
      }
    },
    
    setTutorialStep(step) {
      console.log('setTutorialStep called with step:', step, 'current step:', this.tutorialStep)
      this.tutorialStep = step
      console.log('tutorialStep set to:', this.tutorialStep)
    },
    
    startTutorialFromHowToPlay() {
      this.showHowToPlay = false
      this.showTutorial = true
      this.tutorialStep = 2 // Start at the Play Game step
    },
  },
  computed: {
    bgUrl() {
      try {
        const bs = useBackgroundStore()
        return bs.currentUrl || ''
      } catch (_) {
        return ''
      }
    },
    isControllerReady() {
      const ready = this.gameMode && this.gameOptions.roomCode && this.gameMode.id
      console.log('🔍 isControllerReady computed:', {
        gameMode: this.gameMode,
        roomCode: this.gameOptions.roomCode,
        gameModeId: this.gameMode?.id,
        ready: ready
      })
      return ready
    },
    controllerGameMode() {
      console.log('🔍 controllerGameMode computed called!')
      console.log('🔍 this.gameMode:', this.gameMode)
      const result = this.gameMode || { id: 'unknown', name: 'Unknown Mode', title: 'Unknown Mode' }
      console.log('🔍 controllerGameMode returning:', result)
      return result
    },
    controllerGameOptions() {
      console.log('🔍 controllerGameOptions computed:', this.gameOptions)
      return this.gameOptions || { roomCode: '', startingItems: [], playType: 'multi' }
    }
  },
  watch: {
    currentView() {
      this.$nextTick(() => {
        try {
          window.dispatchEvent(new CustomEvent('crt-channel-change'))
        } catch (_) {}
      })
    },
  },
}
</script>

<style>
/* Minimal global styles only */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #000;
}

#app {
  height: 100vh;
  width: 100vw;
  background: #000;
}
.app-bg { position: fixed; inset: 0; z-index: 0; }
.app-bg-image { position: absolute; inset: 0; background-size: cover; background-position: center; transition: background-image 0.5s ease, opacity 0.5s ease; }
#app > *:not(.app-bg) { position: relative; z-index: 1; }
.app-bg { background-size: cover; background-position: center; background-repeat: no-repeat; }
.view-fade-enter-active, .view-fade-leave-active { transition: opacity 300ms ease-in-out; }
.view-fade-enter-from, .view-fade-leave-to { opacity: 0; }

.loading-controller {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Arial', sans-serif;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}


</style>
