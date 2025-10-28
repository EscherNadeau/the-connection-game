import { normalizeMediaType } from '../utils/constants.ts'
import tmdbCache from '../services/cache/tmdbCache.ts'
import cacheService from '../services/cacheService.ts'
import { shortestPathLength } from '../utils/graph.ts'

/**
 * @typedef {import('../types/index.ts').GameOptions} GameOptions
 * @typedef {import('../types/index.ts').GameItem} GameItem
 * @typedef {import('../types/index.ts').Connection} Connection
 * @typedef {import('../types/index.ts').GoalPair} GoalPair
 * @typedef {import('../types/index.ts').GoalStatus} GoalStatus
 * @typedef {import('../types/index.ts').WinCondition} WinCondition
 */

class GoalModeService {
  constructor() {
    this.gameOptions = null
    this.gameItems = []
    this.connections = []
    this.currentGoalIndex = 0
    this.totalGoals = 0
    this.goalChain = []
  }

  /**
   * Initialize the service with game state
   * @param {GameOptions} gameOptions - Game configuration options
   * @param {GameItem[]} gameItems - Array of game items
   * @param {Connection[]} connections - Array of connections
   * @param {GameItem[]} goalChain - Array of goal items
   */
  initialize(gameOptions, gameItems, connections, goalChain) {
    this.gameOptions = gameOptions
    this.gameItems = gameItems
    this.connections = connections
    this.goalChain = goalChain
    this.totalGoals = goalChain.length
    this.currentGoalIndex = 0
  }

  /**
   * Update game state (called when items or connections change)
   * @param {GameItem[]} gameItems - Array of game items
   * @param {Connection[]} connections - Array of connections
   */
  updateGameState(gameItems, connections) {
    this.gameItems = gameItems
    this.connections = connections
  }

  /**
   * Smart Goal Validation Methods
   * @param {GameItem} goal - Goal item to validate
   * @param {string} gameType - Type of game
   * @returns {Promise<boolean>} Whether goal is completable
   */
  async validateGoalCompletable(goal, gameType) {
    try {
      if (!this.gameOptions?.castFilter || this.gameOptions.castFilter === 'mixed') return true
      if (gameType === 'knowledge') return await this.validateKnowledgeGoal(goal)
      if (gameType === 'path') return await this.validatePathGoal(goal)
      return true
    } catch (_) {
      return false
    }
  }

  async validateKnowledgeGoal(goal) {
    try {
      const targetCount = this.gameOptions.knowledgeTargetItems || 5
      if (normalizeMediaType(goal.type) === 'person') return true
      if (goal.tmdbId) {
        const credits = await cacheService.getOrSet(`credits_${goal.tmdbId}`, async () =>
          normalizeMediaType(goal.type) === 'movie'
            ? await tmdbCache.getMovieWithCast(goal.tmdbId)
            : await tmdbCache.getTVShowWithCast(goal.tmdbId)
        )
        if (credits && credits.cast) {
          const validCastCount = credits.cast.filter((actor) => {
            if (this.gameOptions.castFilter === 'actorOnly') return actor.gender === 2
            if (this.gameOptions.castFilter === 'actressOnly') return actor.gender === 1
            return true
          }).length
          return validCastCount >= targetCount
        }
      }
      return true
    } catch (_) {
      return true
    }
  }

  async validatePathGoal(goal) {
    try {
      return true
    } catch (error) {
      return true
    }
  }

  /**
   * Check if current goal is completed
   * @returns {WinCondition} Goal completion status
   */
  checkGoalCompletion() {
    if (this.gameOptions?.gameType === 'anti') return false
    const currentPair = this.getCurrentGoalPair()
    if (!currentPair) return false
    const startItem = this.gameItems.find((item) => item.name === currentPair.start.name)
    const targetItem = this.gameItems.find((item) => item.name === currentPair.target.name)
    if (startItem && targetItem) {
      const isDirectlyConnected = this.connections.some(
        (conn) =>
          (conn.from === startItem.id && conn.to === targetItem.id) ||
          (conn.from === targetItem.id && conn.to === startItem.id)
      )
      const hasPath = this.checkPathBetweenItems(startItem, targetItem)
      if (isDirectlyConnected || hasPath) {
        if (this.currentGoalIndex >= this.totalGoals - 2) {
          return { completed: true, isLastGoal: true }
        } else {
          return { completed: true, isLastGoal: false }
        }
      }
    } else {
      // Missing items
    }
    return { completed: false, isLastGoal: false }
  }

  checkGoalModeWin() {
    let startItem, endItem
    if (this.currentGameMode === 'custom' && this.gameOptions?.gameType === 'goal') {
      const currentPair = this.getCurrentGoalPair()
      if (!currentPair) {
        return false
      }
      startItem = this.gameItems.find((item) => item.name === currentPair.start.name)
      endItem = this.gameItems.find((item) => item.name === currentPair.target.name)
    } else {
      startItem = this.gameItems.find((item) => item.gameId === this.goalStartItem?.gameId)
      endItem = this.gameItems.find((item) => item.gameId === this.goalEndItem?.gameId)
    }
    if (!startItem || !endItem) return false
    const hasPath = this.checkPathBetweenItems(startItem, endItem)
    if (hasPath) {
      return { won: true, startItem, endItem }
    }
    return { won: false, startItem: null, endItem: null }
  }

  /**
   * Get current goal pair
   * @returns {GoalPair|null} Current goal pair or null
   */
  getCurrentGoalPair() {
    if (this.goalChain.length === 0 || this.currentGoalIndex >= this.goalChain.length - 1)
      return null
    return {
      start: this.goalChain[this.currentGoalIndex],
      target: this.goalChain[this.currentGoalIndex + 1],
    }
  }

  advanceGoalChain() {
    if (this.currentGoalIndex < this.totalGoals - 2) {
      this.currentGoalIndex++
      return true
    }
    return false
  }

  checkPathBetweenItems(startItem, endItem) {
    if (!startItem || !endItem) return false
    const d = shortestPathLength(startItem.id, endItem.id, this.connections)
    return d >= 0
  }

  async handleImpossibleGoal() {
    if (this.gameOptions?.gameType === 'anti') {
      return
    }
    return {
      action: 'skip',
      reason: 'Goal is impossible with current cast filter',
      currentGoal: this.getCurrentGoalPair(),
    }
  }

  /**
   * Get goal status information
   * @returns {GoalStatus} Goal status information
   */
  getGoalStatus() {
    const currentPair = this.getCurrentGoalPair()
    if (!currentPair) return { hasGoals: false, currentGoal: null, progress: 0 }
    const progress = this.currentGoalIndex / Math.max(1, this.totalGoals - 1)
    return {
      hasGoals: true,
      currentGoal: currentPair,
      progress: Math.min(progress, 1),
      currentIndex: this.currentGoalIndex,
      totalGoals: this.totalGoals,
    }
  }

  async checkWinCondition() {
    try {
      console.log('🎯 GoalModeService checkWinCondition called')
      console.log('🎯 Goal chain length:', this.goalChain.length)
      console.log('🎯 Current goal index:', this.currentGoalIndex)
      console.log('🎯 Game items:', this.gameItems.length)
      
      const currentPair = this.getCurrentGoalPair()
      console.log('🎯 Current pair:', currentPair)
      
      if (!currentPair) {
        console.log('🎯 No current pair found, returning false')
        return false
      }
      
      const startItem = this.gameItems.find((item) => item.name === currentPair.start.name)
      const endItem = this.gameItems.find((item) => item.name === currentPair.target.name)
      console.log('🎯 Start item:', startItem)
      console.log('🎯 End item:', endItem)
      
      if (!startItem || !endItem) {
        console.log('🎯 Missing start or end item, returning false')
        return false
      }
      
      const hasPath = this.checkPathBetweenItems(startItem, endItem)
      console.log('🎯 Has path:', hasPath)
      
      if (hasPath) {
        console.log('🎯 WIN DETECTED!')
        return true
      }
      return false
    } catch (error) {
      console.log('🎯 Error in checkWinCondition:', error)
      return false
    }
  }
}

export default new GoalModeService()
