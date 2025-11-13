import { normalizeMediaType } from '../utils/constants.ts'
import tmdbCache from '../services/cache/tmdbCache.ts'
import cacheService from '../services/cacheService.ts'
import { shortestPathLength } from '../utils/graph.ts'
import { debug, warn, error as logError } from '../services/ui/log.ts'

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
    } catch (err) {
      debug('Failed to validate goal', { error: err })
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
    } catch (err) {
      debug('Failed to validate path goal', { error: err })
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
    // Ensure items have valid IDs and are different
    if (!startItem.id || !endItem.id) return false
    if (startItem.id === endItem.id) return false // Same item, no path
    const d = shortestPathLength(startItem.id, endItem.id, this.connections)
    // shortestPathLength returns -1 if no path, or >= 0 if path exists
    return d > 0 // Must be > 0, not >= 0 (0 means same item, which we already checked)
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
      debug('GoalModeService checkWinCondition called', {
        goalChainLength: this.goalChain.length,
        currentGoalIndex: this.currentGoalIndex,
        gameItemsCount: this.gameItems.length
      })
      
      const currentPair = this.getCurrentGoalPair()
      debug('Current goal pair', {
        hasPair: !!currentPair,
        startName: currentPair?.start?.name,
        startSource: currentPair?.start?.source,
        targetName: currentPair?.target?.name,
        targetSource: currentPair?.target?.source
      })
      
      if (!currentPair) {
        debug('No current pair found, returning false')
        return false
      }
      
      // Find items by ID first, then fallback to matching by source if ID doesn't match
      let startItem = this.gameItems.find((item) => item.id === currentPair.start.id)
      let endItem = this.gameItems.find((item) => item.id === currentPair.target.id)
      
      // If not found by ID, try matching by source (in case items were recreated)
      if (!startItem) {
        startItem = this.gameItems.find((item) => item.source === 'goal1')
      }
      if (!endItem) {
        endItem = this.gameItems.find((item) => item.source === 'goal2')
      }
      
      debug('Goal items search', {
        startFound: !!startItem,
        startName: startItem?.name || startItem?.title || 'no name',
        startSource: startItem?.source,
        endFound: !!endItem,
        endName: endItem?.name || endItem?.title || 'no name',
        endSource: endItem?.source,
        pairStartId: currentPair.start.id,
        pairTargetId: currentPair.target.id
      })
      
      if (!startItem || !endItem) {
        debug('Missing start or end item, returning false')
        return false
      }
      
      // Verify these are actually the goal items (not random items)
      // Start item should be goal1, end item should be goal2
      const isStartGoal = startItem.source === 'goal1'
      const isEndGoal = endItem.source === 'goal2'
      
      if (!isStartGoal || !isEndGoal) {
        debug('These are not the correct goal items (start must be goal1, end must be goal2), returning false', {
          isStartGoal,
          isEndGoal,
          startSource: startItem.source,
          endSource: endItem.source
        })
        return false
      }
      
      const hasPath = this.checkPathBetweenItems(startItem, endItem)
      debug('Path check result', { hasPath })
      
      if (hasPath) {
        debug('WIN DETECTED!')
        return true
      }
      return false
    } catch (err) {
      logError('Error in checkWinCondition', { error: err })
      return false
    }
  }
}

export default new GoalModeService()
