import { ref, type Ref, type ComputedRef } from 'vue'
import { debug, warn, error as logError, info } from '../services/ui/log'
import { multiplayerService } from '../services/MultiplayerService'
import { validate } from '../utils/validation'
import type { ViewName } from './useTutorial'
import type { useRoomManagement } from './useRoomManagement'

export type GameMode = {
  id: string
  name?: string
  title?: string
  modeSettings?: Record<string, unknown>
  gameOptions?: Record<string, unknown>
}

import type { GameOptions, CustomGameData } from '../types/game'

export function useAppNavigation(
  currentView: Ref<ViewName>,
  gameMode: Ref<GameMode | null>,
  gameOptions: Ref<GameOptions>,
  roomManagement: ReturnType<typeof useRoomManagement>,
  tutorialStep?: Ref<number>
) {
  /**
   * Navigate to start screen and reset state
   */
  function goToStart(): void {
    currentView.value = 'start'
    gameMode.value = null
    gameOptions.value = {}
  }

  /**
   * Navigate to mode selection
   */
  function goToModeSelection(): void {
    currentView.value = 'mode-selection'
  }

  /**
   * Navigate back to mode selection from settings
   */
  function goBackToModeSelection(): void {
    info( 'App.vue received go-back event from settings')
    currentView.value = 'mode-selection'
    gameMode.value = null
    gameOptions.value = {}
  }

  /**
   * Navigate to join room view
   */
  function goToJoinRoom(): void {
    currentView.value = 'join-room'
  }

  /**
   * Handle start action from home screen
   * @param payload - Start action payload with optional action, code, and mode
   * @param openBrowserOnLoad - Optional ref to control browser opening behavior
   */
  function handleStartFromHome(
    payload: { action?: string; code?: string; mode?: string } | unknown,
    openBrowserOnLoad?: Ref<boolean>
  ): void {
    try {
      // Type guard to safely access payload properties
      const safePayload = payload && typeof payload === 'object' && 'action' in payload
        ? payload as { action?: string; code?: string; mode?: string }
        : null
      
      const action = safePayload?.action || ''
      if (action === 'join') {
        // Go directly to waiting room with the room code
        const code = safePayload?.code || ''
        if (code) {
          window.location.hash = `room=${encodeURIComponent(code.toUpperCase())}`
        }
        return
      }
      // Handle show actions
      if (action === 'create-playlist') {
        currentView.value = 'custom-mode'
        return
      }
      if (action === 'browse-shows') {
        currentView.value = 'custom-mode'
        if (openBrowserOnLoad) {
          openBrowserOnLoad.value = true
        }
        return
      }
      // Handle play mode selection from StartScreen menu
      if (action === 'create' && safePayload?.mode) {
        const mode = safePayload.mode
        try { 
          window.location.hash = `play=${mode}`
          sessionStorage.setItem('playType', mode)
        } catch (err) {
          warn('Failed to set play type in URL/sessionStorage', { error: err, mode })
        }
        currentView.value = 'mode-selection'
        return
      }
      // default to create flow -> go directly to mode selection
      currentView.value = 'mode-selection'
    } catch (err) {
      logError('Error handling start from home', { error: err })
      currentView.value = 'mode-selection'
    }
  }

  /**
   * Select game mode and route appropriately
   */
  function selectGameMode(mode: GameMode): void {
    info( 'App.vue received mode-selected event', mode)
    gameMode.value = mode
    gameOptions.value = {}
    
    // Use MultiplayerService to determine routing
    const playTypeMatch = window.location.hash.match(/play=(solo|multi|pvp|couch-multiplayer|couch-pvp)/)
    const playType: string = playTypeMatch && playTypeMatch[1] ? playTypeMatch[1] : 'solo'
    
    // Map URL play types to GameOptions play types
    const mapPlayTypeToGameOptions = (urlPlayType: string): 'single' | 'pvp' | 'collaborative' | undefined => {
      if (urlPlayType === 'solo') return 'single'
      if (urlPlayType === 'multi') return 'collaborative'
      if (urlPlayType === 'pvp') return 'pvp'
      // couch-multiplayer and couch-pvp are handled separately, default to collaborative
      if (urlPlayType === 'couch-multiplayer') return 'collaborative'
      if (urlPlayType === 'couch-pvp') return 'pvp'
      return undefined
    }
    
    // Special handling for Zen mode - skip settings screen
    if (mode.id === 'zen') {
      gameOptions.value.playType = mapPlayTypeToGameOptions(playType)
      
      // For solo Zen mode, go directly to game
      if (playType === 'solo') {
        info( 'Zen mode solo - going directly to game')
        currentView.value = 'game'
        return
      }
      
      // For multiplayer/PvP Zen mode, go to waiting room
      if (playType === 'couch-multiplayer' || playType === 'couch-pvp') {
        info( 'Zen mode couch - going to waiting room')
        roomManagement.generateRoomCodeForCouch(mode, playType)
        currentView.value = 'waiting-room'
        return
      }
      
      // For PC multiplayer Zen mode, generate room code and go to waiting room
      if (playType === 'multi' || playType === 'pvp') {
        info( 'Zen mode PC multiplayer - going to waiting room')
        roomManagement.generateRoomCodeForPCMultiplayer(mode, playType).then(() => {
          currentView.value = 'waiting-room'
        })
        return
      }
      
      // For PC multiplayer, use MultiplayerService routing
      const multiplayerConfig = multiplayerService.initializeMultiplayer(mode.id, playType, gameOptions.value)
      currentView.value = multiplayerConfig.view as ViewName
      return
    }
    
    // Check if mode supports the selected play type
    if (multiplayerService.supportsPlayType(mode.id, playType)) {
      // Set the play type in game options
      gameOptions.value.playType = mapPlayTypeToGameOptions(playType)
      
      // For couch play modes, go to settings first to configure the game
      if (playType === 'couch-multiplayer' || playType === 'couch-pvp') {
        currentView.value = 'settings'
      } else if (playType === 'multi' || playType === 'pvp') {
        // For PC multiplayer, generate room code THEN navigate
        roomManagement.generateRoomCodeForPCMultiplayer(mode, playType).then(() => {
          const multiplayerConfig = multiplayerService.initializeMultiplayer(mode.id, playType, gameOptions.value)
          currentView.value = multiplayerConfig.view as ViewName
        })
      } else {
        // For solo and other modes, use MultiplayerService routing
        const multiplayerConfig = multiplayerService.initializeMultiplayer(mode.id, playType, gameOptions.value)
        currentView.value = multiplayerConfig.view as ViewName
      }
    } else {
      // Fallback to settings if play type not supported
      currentView.value = 'settings'
    }
  }

  /**
   * Start game from settings screen
   */
  /**
   * Start game from settings screen
   */
  function startGameFromSettings(modeWithSettings: GameMode): void {
    info( 'App.vue received start-game from settings', modeWithSettings)
    gameMode.value = modeWithSettings
    gameOptions.value = modeWithSettings.gameOptions || {}
    
    // Advance tutorial if we're in step 19.6 (waiting room final step)
    if (tutorialStep && tutorialStep.value === 19.6) {
      tutorialStep.value = 20
    }
    
    // Get play type from gameOptions (mapped type) and also check URL for original play type
    const mappedPlayType = gameOptions.value.playType || 'single'
    const playTypeMatch = window.location.hash.match(/play=(solo|multi|pvp|couch-multiplayer|couch-pvp)/)
    const urlPlayType: string = playTypeMatch && playTypeMatch[1] ? playTypeMatch[1] : 'solo'
    
    // Use MultiplayerService to determine the next view (needs original URL play type)
    const multiplayerConfig = multiplayerService.initializeMultiplayer(modeWithSettings.id, urlPlayType, gameOptions.value)
    
    // Determine if we're joining (phone scanned QR) or hosting (PC created room)
    const isJoiningRoom = sessionStorage.getItem('isJoiningRoom') === 'true'
    let targetView = multiplayerConfig.view
    
    debug('Settings: Routing decision', { urlPlayType, mappedPlayType, targetView, isJoiningRoom, isMobile: multiplayerService.isMobile })
    
    // For couch modes, override the isMobile detection:
    // - If HOSTING (PC created the room): always show waiting-room with QR code
    // - If JOINING (phone scanned QR): always show phone-waiting-room
    if (urlPlayType === 'couch-multiplayer' || urlPlayType === 'couch-pvp') {
      if (isJoiningRoom) {
        debug('Settings: Couch mode + joining room → phone-waiting-room')
        targetView = 'phone-waiting-room'
        sessionStorage.removeItem('isJoiningRoom')
      } else {
        debug('Settings: Couch mode + hosting room → waiting-room (PC with QR)')
        targetView = 'waiting-room'
      }
    }
    
    // Route based on play type
    if (urlPlayType === 'solo') {
      roomManagement.suppressAutoJoin.value = false
      currentView.value = 'game'
    } else {
      roomManagement.suppressAutoJoin.value = true
      currentView.value = targetView as ViewName
    }
  }
  function startGameFromWaitingRoom(): void {
    info( 'App.vue received start-game from waiting room')
    roomManagement.suppressAutoJoin.value = false
    
    // Advance tutorial if we're in step 19.6 (waiting room final step)
    if (tutorialStep && tutorialStep.value === 19.6) {
      tutorialStep.value = 20
    }
    
    // Navigate to game view
    currentView.value = 'game'
  }

  /**
   * Handle custom game start
   * @param customGameData - Custom game configuration data
   */
  function handleCustomGameStart(customGameData: CustomGameData): void {
    info( 'App.vue received start-game from custom mode', customGameData)
    
    // Validate custom game data before starting
    if (customGameData.showData && customGameData.showData.episodes) {
      const validationErrors: string[] = []
      customGameData.showData.episodes.forEach((episode: unknown, index: number) => {
        const result = validate.episode(episode)
        if (!result.valid) {
          validationErrors.push(`Episode ${index + 1}: ${result.errors.join(', ')}`)
        }
      })
      
      if (validationErrors.length > 0) {
        logError('Custom show validation failed', { errors: validationErrors })
        alert(`Cannot start show with invalid episodes:\n${validationErrors.join('\n')}`)
        return
      }
    }
    
    // Set up the custom game mode with episode data
    // Map playType from CustomGameData to GameOptions format
    const customGameOptions = customGameData.gameOptions
    const mappedPlayType = customGameOptions?.playType 
      ? (customGameOptions.playType === 'solo' ? 'single' : 
         customGameOptions.playType === 'multi' ? 'collaborative' :
         customGameOptions.playType === 'pvp' ? 'pvp' :
         customGameOptions.playType as 'single' | 'pvp' | 'collaborative' | undefined)
      : 'single'
    
    const mappedGameOptions: GameOptions = {
      ...customGameOptions,
      playType: mappedPlayType
    } as GameOptions
    
    gameMode.value = {
      id: customGameData.id,
      name: customGameData.name,
      title: customGameData.name,
      // Pass through the episode's specific configuration
      gameOptions: mappedGameOptions
    }
    gameOptions.value = mappedGameOptions
    
    // For custom shows, go directly to game (solo mode)
    roomManagement.suppressAutoJoin.value = false
    currentView.value = 'game'
  }

  /**
   * Switch to game view (from controller)
   */
  function switchToGame(): void {
    currentView.value = 'game'
  }

  /**
   * Handle show completion
   */
  function onFinishShow(): void {
    info('Show completed!')
    goToModeSelection()
  }

  return {
    goToStart,
    goToModeSelection,
    goBackToModeSelection,
    goToJoinRoom,
    handleStartFromHome,
    selectGameMode,
    startGameFromSettings,
    startGameFromWaitingRoom,
    handleCustomGameStart,
    switchToGame,
    onFinishShow,
  }
}

