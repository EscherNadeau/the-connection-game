// Removed log import - no UI/log side effects
import goalModeService from '../../modes/GoalModeService.ts'
import hybridModeService from '../../modes/HybridModeService.ts'
import knowledgeModeService from '../../modes/KnowledgeModeService.ts'
import antiModeService from '../../modes/AntiModeService.ts'
import zenModeService from '../../modes/ZenModeService.ts'

/**
 * @typedef {import('../../types/index.ts').GameMode} GameMode
 * @typedef {import('../../types/index.ts').GameOptions} GameOptions
 * @typedef {import('../../types/index.ts').GameItem} GameItem
 * @typedef {import('../../types/index.ts').Connection} Connection
 * @typedef {import('../../types/index.ts').ModeService} ModeService
 */

class GameModeManager {
  constructor() {
    this.currentMode = null
    this.currentModeService = null
    this.gameOptions = null
    this.gameItems = []
    this.connections = []
    this.goalChain = []

    // Initialize all mode services
    this.modeServices = {
      goal: goalModeService,
      hybrid: hybridModeService,
      knowledge: knowledgeModeService,
      anti: antiModeService,
      zen: zenModeService,
    }
  }

  /**
   * Initialize the game mode manager
   * @param {string} gameMode - The game mode to initialize
   * @param {GameOptions} gameOptions - Game configuration options
   * @param {GameItem[]} [gameItems=[]] - Array of game items
   * @param {Connection[]} [connections=[]] - Array of connections
   * @param {GameItem[]} [goalChain=[]] - Array of goal items
   * @returns {boolean} Whether initialization was successful
   */
  initialize(gameMode, gameOptions, gameItems = [], connections = [], goalChain = []) {
    this.currentMode = gameMode
    this.gameOptions = gameOptions
    this.gameItems = gameItems
    this.connections = connections
    this.goalChain = goalChain

    console.log(`🎯 GameModeManager.initialize called with mode: "${gameMode}"`)
    console.log('🎯 Available mode services:', Object.keys(this.modeServices))
    
    // Get the appropriate mode service
    if (gameMode === 'custom') {
      console.log(`🎯 Custom mode, using gameType: "${gameOptions.gameType}"`)
      this.currentModeService = this.modeServices[gameOptions.gameType]
    } else {
      console.log(`🎯 Regular mode, looking for: "${gameMode}"`)
      this.currentModeService = this.modeServices[gameMode]
    }

    console.log('🎯 Found mode service:', this.currentModeService)

    if (!this.currentModeService) {
      console.log(`🎯 ERROR: No mode service found for "${gameMode}"`)
      return false
    }

    // Initialize the mode service
    console.log('🎯 Calling initialize on mode service...')
    if (this.currentModeService.initialize) {
      console.log('🎯 Mode service has initialize method, calling it...')
      this.currentModeService.initialize(gameOptions, gameItems, connections, goalChain)
    } else {
      console.log('🎯 Mode service does NOT have initialize method')
    }

    return true
  }

  /**
   * Update game state
   * @param {GameItem[]} gameItems - Array of game items
   * @param {Connection[]} connections - Array of connections
   */
  updateGameState(gameItems, connections) {
    this.gameItems = gameItems
    this.connections = connections

    if (this.currentModeService && this.currentModeService.updateGameState) {
      this.currentModeService.updateGameState(gameItems, connections)
    }
  }

  /**
   * Check win condition for current mode
   * @returns {Promise<boolean>} Whether the win condition is met
   */
  async checkWinCondition() {
    if (!this.currentModeService) {
      return false
    }

    try {
      if (this.currentMode === 'custom') {
        return await this.checkCustomModeWin()
      } else {
        return await this.currentModeService.checkWinCondition()
      }
    } catch (error) {
      return false
    }
  }

  /**
   * Check win condition for custom mode
   */
  async checkCustomModeWin() {
    if (!this.gameOptions?.gameType) return false

    switch (this.gameOptions.gameType) {
      case 'goal':
        return await this.modeServices.goal.checkGoalModeWin()
      case 'path':
        return await this.modeServices.path.checkPathModeWin()
      case 'knowledge':
        return await this.modeServices.knowledge.checkKnowledgeModeWin()
      case 'anti':
        return await this.modeServices.anti.checkAntiModeWin()
      default:
        return false
    }
  }

  /**
   * Get progress display for current mode
   */
  getProgressDisplay() {
    if (!this.currentModeService) return ''

    if (this.currentMode === 'custom') {
      return this.getCustomModeProgress()
    } else {
      return this.currentModeService.getProgressDisplay
        ? this.currentModeService.getProgressDisplay()
        : ''
    }
  }

  /**
   * Get progress display for custom mode
   */
  getCustomModeProgress() {
    if (!this.gameOptions?.gameType) return ''

    switch (this.gameOptions.gameType) {
      case 'goal':
        return this.modeServices.goal.getProgressDisplay
          ? this.modeServices.goal.getProgressDisplay()
          : ''
      case 'path':
        return this.modeServices.path.getProgressDisplay
          ? this.modeServices.path.getProgressDisplay()
          : ''
      case 'knowledge':
        return this.modeServices.knowledge.getProgressDisplay
          ? this.modeServices.knowledge.getProgressDisplay()
          : ''
      case 'anti':
        return this.modeServices.anti.getProgressDisplay
          ? this.modeServices.anti.getProgressDisplay()
          : ''
      default:
        return ''
    }
  }

  /**
   * Get current goal pair (for goal modes)
   */
  getCurrentGoalPair() {
    if (this.currentMode === 'custom' && this.gameOptions?.gameType === 'goal') {
      return this.modeServices.goal.getCurrentGoalPair()
    } else if (this.currentMode === 'goal') {
      return this.currentModeService.getCurrentGoalPair()
    }
    return null
  }

  /**
   * Get goal status (for goal modes)
   */
  getGoalStatus() {
    if (this.currentMode === 'custom' && this.gameOptions?.gameType === 'goal') {
      return this.modeServices.goal.getGoalStatus()
    } else if (this.currentMode === 'goal') {
      return this.currentModeService.getGoalStatus()
    }
    return null
  }

  /**
   * Check goal completion (for goal modes)
   */
  async checkGoalCompletion() {
    if (this.currentMode === 'custom' && this.gameOptions?.gameType === 'goal') {
      return await this.modeServices.goal.checkGoalCompletion()
    } else if (this.currentMode === 'goal') {
      return await this.currentModeService.checkGoalCompletion()
    }
    return false
  }

  /**
   * Advance goal chain (for goal modes)
   */
  advanceGoalChain() {
    if (this.currentMode === 'custom' && this.gameOptions?.gameType === 'goal') {
      this.modeServices.goal.advanceGoalChain()
    } else if (this.currentMode === 'goal') {
      this.currentModeService.advanceGoalChain()
    }
  }

  /**
   * Validate goal completable (for goal modes)
   */
  async validateGoalCompletable(goal, gameType) {
    if (this.currentMode === 'custom' && this.gameOptions?.gameType === 'goal') {
      return await this.modeServices.goal.validateGoalCompletable(goal, gameType)
    } else if (this.currentMode === 'goal') {
      return await this.currentModeService.validateGoalCompletable(goal, gameType)
    }
    return true
  }

  /**
   * Handle impossible goal (for goal modes)
   */
  async handleImpossibleGoal() {
    if (this.currentMode === 'custom' && this.gameOptions?.gameType === 'goal') {
      return await this.modeServices.goal.handleImpossibleGoal()
    } else if (this.currentMode === 'goal') {
      return await this.currentModeService.handleImpossibleGoal()
    }
  }

  /**
   * Get win message for current mode
   */
  getWinMessage() {
    if (!this.currentModeService) return 'Congratulations!'

    if (this.currentMode === 'custom') {
      return this.getCustomModeWinMessage()
    } else {
      return this.currentModeService.getWinMessage
        ? this.currentModeService.getWinMessage()
        : 'Congratulations!'
    }
  }

  /**
   * Get win message for custom mode
   */
  getCustomModeWinMessage() {
    if (!this.gameOptions?.gameType) return 'Congratulations!'

    switch (this.gameOptions.gameType) {
      case 'goal':
        return this.modeServices.goal.getWinMessage
          ? this.modeServices.goal.getWinMessage()
          : 'Goal completed!'
      case 'path':
        return this.modeServices.path.getWinMessage
          ? this.modeServices.path.getWinMessage()
          : 'Path completed!'
      case 'knowledge':
        return this.modeServices.knowledge.getWinMessage
          ? this.modeServices.knowledge.getWinMessage()
          : 'Knowledge test passed!'
      case 'anti':
        return this.modeServices.anti.getWinMessage
          ? this.modeServices.anti.getWinMessage()
          : 'Anti mode completed!'
      default:
        return 'Custom mode completed!'
    }
  }

  /**
   * Animate victory path (for goal modes)
   */
  async animateVictoryPath() {
    if (this.currentMode === 'custom' && this.gameOptions?.gameType === 'goal') {
      return await this.modeServices.goal.animateVictoryPath()
    } else if (this.currentMode === 'goal') {
      return await this.currentModeService.animateVictoryPath()
    }
  }

  /**
   * Find path items (for goal modes)
   */
  findPathItems() {
    if (this.currentMode === 'custom' && this.gameOptions?.gameType === 'goal') {
      return this.modeServices.goal.findPathItems()
    } else if (this.currentMode === 'goal') {
      return this.currentModeService.findPathItems()
    }
    return []
  }

  /**
   * Highlight victory item (for goal modes)
   */
  highlightVictoryItem(item) {
    if (this.currentMode === 'custom' && this.gameOptions?.gameType === 'goal') {
      return this.modeServices.goal.highlightVictoryItem(item)
    } else if (this.currentMode === 'goal') {
      return this.currentModeService.highlightVictoryItem(item)
    }
  }

  /**
   * Highlight victory connection (for goal modes)
   */
  highlightVictoryConnection(item, nextItem) {
    if (this.currentMode === 'custom' && this.gameOptions?.gameType === 'goal') {
      return this.modeServices.goal.highlightVictoryConnection(item, nextItem)
    } else if (this.currentMode === 'goal') {
      return this.currentModeService.highlightVictoryConnection(item, nextItem)
    }
  }

  /**
   * Clean up mode state
   */
  cleanup() {
    if (this.currentModeService && this.currentModeService.cleanup) {
      this.currentModeService.cleanup()
    }

    this.currentMode = null
    this.currentModeService = null
    this.gameOptions = null
    this.gameItems = []
    this.connections = []
    this.goalChain = []
  }

  /**
   * Get current mode info
   */
  getCurrentModeInfo() {
    return {
      mode: this.currentMode,
      gameType: this.gameOptions?.gameType,
      service: this.currentModeService?.constructor.name,
      options: this.gameOptions,
    }
  }
}

export default new GameModeManager()
