/**
 * Audio Service
 * Manages all game audio - sound effects, music, and volume controls
 * 
 * USAGE:
 * 1. Drop your sound files in /public/audio/
 * 2. Register them in the soundFiles map below
 * 3. Call audioService.play(SoundEvents.ITEM_PLACED)
 */

import { SoundEvents, SoundCategories, eventCategoryMap, type SoundEvent, type SoundCategory } from './soundEvents'
import { debug, warn, error as logError } from '../ui/log'

// ==========================================
// CONFIGURATION
// ==========================================

/** 
 * Map sound events to audio file paths
 * Add your sound files here!
 * 
 * Files should be in /public/audio/
 * Example: '/audio/connection_made.mp3'
 */
const soundFiles: Partial<Record<SoundEvent, string>> = {
  // GAMEPLAY
  // [SoundEvents.ITEM_PLACED]: '/audio/item_placed.mp3',
  // [SoundEvents.CONNECTION_MADE]: '/audio/connection_made.mp3',
  // [SoundEvents.CONNECTION_INVALID]: '/audio/connection_invalid.mp3',
  // [SoundEvents.GOAL_COMPLETE]: '/audio/goal_complete.mp3',
  // [SoundEvents.ITEM_REMOVED]: '/audio/item_removed.mp3',

  // GAME STATE
  // [SoundEvents.GAME_START]: '/audio/game_start.mp3',
  // [SoundEvents.GAME_WIN]: '/audio/game_win.mp3',
  // [SoundEvents.GAME_LOSE]: '/audio/game_lose.mp3',
  // [SoundEvents.TIMER_WARNING]: '/audio/timer_warning.mp3',
  // [SoundEvents.TIMER_EXPIRED]: '/audio/timer_expired.mp3',
  // [SoundEvents.ROUND_COMPLETE]: '/audio/round_complete.mp3',

  // MULTIPLAYER
  // [SoundEvents.PLAYER_JOINED]: '/audio/player_joined.mp3',
  // [SoundEvents.PLAYER_LEFT]: '/audio/player_left.mp3',
  // [SoundEvents.YOUR_TURN]: '/audio/your_turn.mp3',
  // [SoundEvents.OPPONENT_TURN]: '/audio/opponent_turn.mp3',
  // [SoundEvents.ALL_READY]: '/audio/all_ready.mp3',

  // UI
  // [SoundEvents.BUTTON_CLICK]: '/audio/button_click.mp3',
  // [SoundEvents.MENU_OPEN]: '/audio/menu_open.mp3',
  // [SoundEvents.MENU_CLOSE]: '/audio/menu_close.mp3',
  // [SoundEvents.NOTIFICATION]: '/audio/notification.mp3',
  // [SoundEvents.ERROR]: '/audio/error.mp3',
  // [SoundEvents.SUCCESS]: '/audio/success.mp3',
  // [SoundEvents.SEARCH_RESULT]: '/audio/search_result.mp3',
}

// Default volume levels (0-1)
const DEFAULT_VOLUMES: Record<SoundCategory, number> = {
  [SoundCategories.MASTER]: 0.8,
  [SoundCategories.SFX]: 1.0,
  [SoundCategories.UI]: 0.7,
  [SoundCategories.MUSIC]: 0.5,
}

// LocalStorage keys
const STORAGE_KEYS = {
  VOLUMES: 'audio_volumes',
  MUTED: 'audio_muted',
}

// ==========================================
// AUDIO SERVICE
// ==========================================

class AudioService {
  private audioCache: Map<string, HTMLAudioElement> = new Map()
  private volumes: Record<SoundCategory, number> = { ...DEFAULT_VOLUMES }
  private muted: boolean = false
  private initialized: boolean = false

  constructor() {
    this.loadSettings()
  }

  /**
   * Initialize the audio service
   * Call this early (e.g., in main.ts) to preload sounds
   */
  initialize(): void {
    if (this.initialized) return
    
    this.loadSettings()
    this.preloadSounds()
    this.initialized = true
    
    debug('[AudioService] Initialized')
  }

  /**
   * Preload all registered sounds
   */
  private preloadSounds(): void {
    Object.entries(soundFiles).forEach(([event, path]) => {
      if (path) {
        this.loadSound(path)
      }
    })
  }

  /**
   * Load a sound file into cache
   */
  private loadSound(path: string): HTMLAudioElement | null {
    if (this.audioCache.has(path)) {
      return this.audioCache.get(path)!
    }

    try {
      const audio = new Audio(path)
      audio.preload = 'auto'
      this.audioCache.set(path, audio)
      return audio
    } catch (err) {
      warn(`[AudioService] Failed to load sound: ${path}`, err)
      return null
    }
  }

  /**
   * Play a sound event
   */
  play(event: SoundEvent, options: { volume?: number; loop?: boolean } = {}): void {
    if (this.muted) return

    const path = soundFiles[event]
    if (!path) {
      // Sound not registered - this is fine, just skip
      // Uncomment below for debugging:
      // debug(`[AudioService] No sound registered for: ${event}`)
      return
    }

    const audio = this.loadSound(path)
    if (!audio) return

    try {
      // Calculate final volume
      const category = eventCategoryMap[event]
      const masterVolume = this.volumes[SoundCategories.MASTER]
      const categoryVolume = this.volumes[category]
      const eventVolume = options.volume ?? 1
      
      // Clone the audio for overlapping sounds
      const sound = audio.cloneNode() as HTMLAudioElement
      sound.volume = masterVolume * categoryVolume * eventVolume
      sound.loop = options.loop ?? false
      
      sound.play().catch(err => {
        // Browser may block autoplay - this is expected
        debug(`[AudioService] Playback blocked: ${event}`, err)
      })
    } catch (err) {
      warn(`[AudioService] Error playing sound: ${event}`, err)
    }
  }

  /**
   * Play a sound with a delay
   */
  playDelayed(event: SoundEvent, delayMs: number, options?: { volume?: number }): void {
    setTimeout(() => this.play(event, options), delayMs)
  }

  /**
   * Stop all sounds (useful for game end, etc.)
   */
  stopAll(): void {
    this.audioCache.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
  }

  // ==========================================
  // VOLUME CONTROLS
  // ==========================================

  /**
   * Set volume for a category
   */
  setVolume(category: SoundCategory, volume: number): void {
    this.volumes[category] = Math.max(0, Math.min(1, volume))
    this.saveSettings()
  }

  /**
   * Get volume for a category
   */
  getVolume(category: SoundCategory): number {
    return this.volumes[category]
  }

  /**
   * Get all volume levels
   */
  getAllVolumes(): Record<SoundCategory, number> {
    return { ...this.volumes }
  }

  /**
   * Set master volume (affects all sounds)
   */
  setMasterVolume(volume: number): void {
    this.setVolume(SoundCategories.MASTER, volume)
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.volumes[SoundCategories.MASTER]
  }

  // ==========================================
  // MUTE CONTROLS
  // ==========================================

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.muted = !this.muted
    this.saveSettings()
    return this.muted
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean): void {
    this.muted = muted
    this.saveSettings()
  }

  /**
   * Check if muted
   */
  isMuted(): boolean {
    return this.muted
  }

  // ==========================================
  // PERSISTENCE
  // ==========================================

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.VOLUMES, JSON.stringify(this.volumes))
      localStorage.setItem(STORAGE_KEYS.MUTED, JSON.stringify(this.muted))
    } catch (err) {
      debug('[AudioService] Could not save settings', err)
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const volumesJson = localStorage.getItem(STORAGE_KEYS.VOLUMES)
      if (volumesJson) {
        const saved = JSON.parse(volumesJson)
        this.volumes = { ...DEFAULT_VOLUMES, ...saved }
      }

      const mutedJson = localStorage.getItem(STORAGE_KEYS.MUTED)
      if (mutedJson) {
        this.muted = JSON.parse(mutedJson)
      }
    } catch (err) {
      debug('[AudioService] Could not load settings', err)
    }
  }

  /**
   * Reset all settings to defaults
   */
  resetSettings(): void {
    this.volumes = { ...DEFAULT_VOLUMES }
    this.muted = false
    this.saveSettings()
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  /**
   * Check if a sound is registered
   */
  hasSound(event: SoundEvent): boolean {
    return !!soundFiles[event]
  }

  /**
   * Get list of all registered sounds
   */
  getRegisteredSounds(): SoundEvent[] {
    return Object.entries(soundFiles)
      .filter(([, path]) => !!path)
      .map(([event]) => event as SoundEvent)
  }

  /**
   * Register a new sound at runtime
   */
  registerSound(event: SoundEvent, path: string): void {
    (soundFiles as Record<SoundEvent, string>)[event] = path
    this.loadSound(path)
  }
}

// Export singleton instance
export const audioService = new AudioService()
export default audioService

// Re-export types and constants for convenience
export { SoundEvents, SoundCategories, type SoundEvent, type SoundCategory }

