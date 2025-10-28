/**
 * Game Engine - Main entry point for starting games
 * Demonstrates how to use the modular rules system
 */

import { GAME_MODES, getGameMode, getModeRules } from './modes/gameModes.ts'
import { GAME_RULES, SEARCH_RULES, rulesConflict } from './rules/gameRules.ts'
import { pinia } from '@store/pinia.ts'
import { useFiltersStore } from '@store/filters.store.ts'
import { useGameStateStore } from '@store/gameState.store.ts'

class GameEngine {
  constructor() {
    this.currentGame = null
    this.gameState = null
  }

  /**
   * Start a game with the specified mode and optional custom rules
   * @param {string} modeId - The game mode to start
   * @param {Object} options - Additional options and custom rules
   * @returns {Object} - Game configuration object
   */
  startGame(modeId, options = {}) {
    // Starting game...

    // Clear any existing game state before starting new game
    try {
      const gs = useGameStateStore()
      gs.reset()
    } catch (error) {
      console.warn('Failed to reset game state:', error)
    }

    // Get the base mode configuration
    const mode = getGameMode(modeId)
    if (!mode) {
      throw new Error(`Unknown game mode: ${modeId}`)
    }

    // Get default rules for this mode
    const defaultRules = getModeRules(modeId)

    // Apply any custom rules (overriding defaults)
    const customRules = options.customRules || []

    // Check for rule conflicts
    this.validateRules(defaultRules, customRules)

    // Combine rules (custom rules override defaults)
    const finalRules = this.mergeRules(defaultRules, customRules)

    // Detect dynamic settings (e.g., Path Mode toggle for Goal Mode)
    const pathModeEnabled = !!(
      options?.settings?.pathModeEnabled || options?.settings?.modeSettings?.pathModeEnabled
    )

    // Create game configuration (allowsBranching is overridden by Path Mode)
    const gameConfig = {
      mode: mode,
      rules: finalRules,
      settings: options.settings || {},
      timeLimit: options.timeLimit || mode.timeLimit,
      winCondition: mode.winCondition,
      allowsBranching: pathModeEnabled ? false : mode.allowsBranching,
    }

    // Store current game
    this.currentGame = gameConfig
    this.gameState = this.initializeGameState(gameConfig)

    // Centralized filters: accept any incoming setting and normalize/store globally
    const rawCast =
      options?.settings?.castFilter ||
      options?.settings?.commonCastFilter ||
      options?.settings?.modeSettings?.castFilter ||
      options?.settings?.modeSettings?.commonCastFilter ||
      'mixed'
    const rawMedia = options?.settings?.mediaType || options?.settings?.mediaTypeFilter || 'all'
    const filtersStore = useFiltersStore(pinia)
    filtersStore.setCast(rawCast)
    filtersStore.setMediaType(rawMedia)
    const castFilter = filtersStore.cast
    const mediaTypeFilter = filtersStore.mediaType
    // Game started successfully
    return gameConfig
  }

  /**
   * Validate that rules don't conflict with each other
   * @param {Array} defaultRules - Default rules for the mode
   * @param {Array} customRules - Custom rules to apply
   */
  validateRules(defaultRules, customRules) {
    const allRules = [...defaultRules, ...customRules]

    for (let i = 0; i < allRules.length; i++) {
      for (let j = i + 1; j < allRules.length; j++) {
        const rule1 = allRules[i]
        const rule2 = allRules[j]

        if (rulesConflict(rule1, rule2)) {
          throw new Error(`Rule conflict: ${rule1} conflicts with ${rule2}`)
        }
      }
    }
  }

  /**
   * Merge default and custom rules (custom rules override defaults)
   * @param {Array} defaultRules - Default rules for the mode
   * @param {Array} customRules - Custom rules to apply
   * @returns {Array} - Final combined rules
   */
  mergeRules(defaultRules, customRules) {
    const finalRules = [...defaultRules]

    // Apply custom rules (they override defaults)
    customRules.forEach((rule) => {
      // Remove conflicting default rule if it exists
      const conflictingIndex = finalRules.findIndex((r) => rulesConflict(r, rule))

      if (conflictingIndex !== -1) {
        finalRules.splice(conflictingIndex, 1)
      }

      // Add custom rule
      if (!finalRules.includes(rule)) {
        finalRules.push(rule)
      }
    })

    return finalRules
  }

  /**
   * Initialize game state based on configuration
   * @param {Object} gameConfig - Game configuration object
   * @returns {Object} - Initial game state
   */
  initializeGameState(gameConfig) {
    return {
      mode: gameConfig.mode.id,
      rules: gameConfig.rules,
      startTime: Date.now(),
      timeLimit: gameConfig.timeLimit,
      items: [],
      connections: [],
      score: 0,
      status: 'playing',
    }
  }

  /**
   * Get current game configuration
   * @returns {Object|null} - Current game config or null if no game
   */
  getCurrentGame() {
    return this.currentGame
  }

  /**
   * Get current game state
   * @returns {Object|null} - Current game state or null if no game
   */
  getGameState() {
    return this.gameState
  }

  /**
   * Check if a specific rule is active in the current game
   * @param {string} rule - Rule to check
   * @returns {boolean} - True if rule is active
   */
  isRuleActive(rule) {
    return this.currentGame?.rules.includes(rule) || false
  }

  /**
   * End current game
   */
  endGame() {
    if (this.currentGame) {
      console.log(`🏁 Ending ${this.currentGame.mode.id} mode`)
      this.currentGame = null
      this.gameState = null
    }
  }
}

// Create and export singleton instance
const gameEngine = new GameEngine()
export default gameEngine
