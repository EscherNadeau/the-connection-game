// MultiplayerService.ts - Reusable multiplayer system for all game modes

import { debug } from './ui/log.ts'

export class MultiplayerService {
  public isMobile: boolean
  public playType: string = 'solo' // solo, multi, pvp
  public mode: any = null

  constructor() {
    this.isMobile = this.detectMobile()
  }

  /**
   * Detect if device is mobile
   */
  detectMobile(): boolean {
    try {
      // Check for manual override in URL hash or query params
      const hash = window.location.hash || ''
      const search = window.location.search || ''
      const forceMobileHash = hash.includes('mobile=true')
      const forceMobileQuery = search.includes('mobile=true')
      const forceMobile = forceMobileHash || forceMobileQuery
      
      const isMobileUA = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      const isMobileWidth = window.innerWidth < 768
      const isMobile = forceMobile || isMobileUA || isMobileWidth
      return isMobile
    } catch (err) {
      debug('Failed to detect mobile device, defaulting to desktop', { error: err })
      return false
    }
  }

  /**
   * Get appropriate view for multiplayer mode
   * @param {string} modeId - Game mode ID
   * @param {string} playType - Play type (solo, multi, pvp, couch-multiplayer, couch-pvp)
   * @returns {string} - View to show
   */
  getMultiplayerView(modeId, playType = 'solo') {
    this.playType = playType
    this.mode = modeId
    this.isMobile = this.detectMobile() // Update mobile detection


    // Solo mode - always go to settings first
    if (playType === 'solo') {
      return 'settings'
    }

    // PC-only modes (multi, pvp) - always show waiting room
    if (playType === 'multi' || playType === 'pvp') {
      return 'waiting-room'
    }

    // Couch modes - phone-based with TV as main board
    if (playType === 'couch-multiplayer' || playType === 'couch-pvp') {
      
      if (this.isMobile) {
        return 'phone-waiting-room' // Phone gets special waiting room
      } else {
        return 'waiting-room' // Desktop gets normal waiting room
      }
    }

    return 'settings' // Fallback
  }


  /**
   * Get multiplayer rules for a specific mode
   * @param {string} modeId - Game mode ID
   * @param {string} playType - Play type (solo, multi, pvp, couch-multiplayer, couch-pvp)
   * @returns {Object} - Multiplayer rules
   */
  getMultiplayerRules(modeId, playType = 'solo') {
    const rules = {
      solo: {
        players: 1,
        turnBased: false,
        sharedState: false,
        winCondition: 'individual',
        timerEnabled: true,
        deviceType: 'desktop'
      },
      multi: {
        players: 'unlimited',
        turnBased: false,
        sharedState: true,
        winCondition: 'collaborative',
        timerEnabled: true,
        deviceType: 'desktop'
      },
      pvp: {
        players: 2,
        turnBased: false,
        sharedState: false,
        winCondition: 'competitive',
        timerEnabled: false,
        deviceType: 'desktop'
      },
      'couch-multiplayer': {
        players: 'unlimited',
        turnBased: false,
        sharedState: true,
        winCondition: 'collaborative',
        timerEnabled: true,
        deviceType: 'mixed'
      },
      'couch-pvp': {
        players: 2,
        turnBased: true,
        sharedState: false,
        winCondition: 'competitive',
        timerEnabled: true,
        deviceType: 'mixed'
      }
    }

    // Mode-specific overrides
    switch (modeId) {
      case 'knowledge':
        return {
          ...rules[playType],
          turnBased: playType === 'multi' || playType === 'pvp' || playType === 'couch-multiplayer' || playType === 'couch-pvp', // Knowledge is always turn-based
          sharedState: playType === 'multi' || playType === 'couch-multiplayer' // Shared knowledge in multi
        }
      
      case 'goal':
      case 'hybrid':
      case 'anti':
      case 'zen':
      default:
        return rules[playType]
    }
  }

  /**
   * Check if mode supports a specific play type
   * @param {string} modeId - Game mode ID
   * @param {string} playType - Play type (solo, multi, pvp, couch-multiplayer, couch-pvp)
   * @returns {boolean} - Whether mode supports play type
   */
  supportsPlayType(modeId, playType) {
    // All modes support solo
    if (playType === 'solo') return true

    // All modes support multi and pvp
    if (playType === 'multi' || playType === 'pvp') return true

    // Couch modes support varies by mode
    if (playType === 'couch-multiplayer' || playType === 'couch-pvp') {
      switch (modeId) {
        case 'goal':
        case 'hybrid':
        case 'anti':
        case 'knowledge':
          return true
        case 'zen':
        case 'custom':
          return false // These modes don't work well with Couch
        default:
          return false
      }
    }

    return false
  }

  /**
   * Get device-specific settings for a mode
   * @param {string} modeId - Game mode ID
   * @param {string} playType - Play type (solo, multi, pvp, couch-multiplayer, couch-pvp)
   * @returns {Object} - Device-specific settings
   */
  getDeviceSettings(modeId, playType = 'solo') {
    const settings = {
      isMobile: this.isMobile,
      playType: playType,
      mode: modeId
    }

    // Device-specific settings based on play type
    if (playType === 'couch-multiplayer' || playType === 'couch-pvp') {
      return {
        ...settings,
        isTV: !this.isMobile, // Desktop/TV is main board
        isController: this.isMobile, // Mobile is controller
        sharedDisplay: !this.isMobile // TV shows shared game state
      }
    }

    return settings
  }

  /**
   * Initialize multiplayer for a mode
   * @param {string} modeId - Game mode ID
   * @param {string} playType - Play type (solo, multi, pvp, couch-multiplayer, couch-pvp)
   * @param {Object} gameOptions - Game options
   * @returns {Object} - Multiplayer configuration
   */
  initializeMultiplayer(modeId, playType = 'solo', gameOptions = {}) {
    const rules = this.getMultiplayerRules(modeId, playType)
    const deviceSettings = this.getDeviceSettings(modeId, playType)
    const view = this.getMultiplayerView(modeId, playType)

    return {
      view: view,
      rules: rules,
      device: deviceSettings,
      gameOptions: gameOptions
    }
  }
}

// Export singleton instance
export const multiplayerService = new MultiplayerService()
export default multiplayerService
