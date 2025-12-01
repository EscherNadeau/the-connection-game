/**
 * MultiplayerService (Simplified)
 * Now just handles basic routing - always solo mode
 */

import { debug } from './ui/log'

export class MultiplayerService {
  public isMobile: boolean
  public playType: string = 'solo'
  public mode: string | null = null

  constructor() {
    this.isMobile = this.detectMobile()
  }

  detectMobile(): boolean {
    try {
      const isMobileUA = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      return isMobileUA
    } catch {
      return false
    }
  }

  // Always returns settings view now (no multiplayer routing)
  getMultiplayerView(modeId: string, playType = 'solo'): string {
    this.playType = 'solo' // Force solo
    this.mode = modeId
    return 'settings'
  }

  getMultiplayerRules(modeId: string, playType = 'solo'): Record<string, unknown> {
    return {
      allowMultiplePlayers: false,
      syncRequired: false,
      turnBased: false
    }
  }

  getDeviceSettings(modeId: string, playType = 'solo'): Record<string, unknown> {
    return {
      showOnMobile: true,
      showOnDesktop: true,
      mobileOptimized: this.isMobile
    }
  }

  initializeMultiplayer(modeId: string, playType = 'solo', gameOptions = {}): {
    view: string
    rules: Record<string, unknown>
    device: Record<string, unknown>
    gameOptions: Record<string, unknown>
  } {
    return {
      view: 'settings',
      rules: this.getMultiplayerRules(modeId, 'solo'),
      device: this.getDeviceSettings(modeId, 'solo'),
      gameOptions
    }
  }

  supportsPlayType(modeId: string, playType: string): boolean {
    return playType === 'solo' // Only solo supported now
  }
}

export const multiplayerService = new MultiplayerService()
export default multiplayerService
