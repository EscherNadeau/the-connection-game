import { buildAdjacency, bfsReachable } from '../utils/graph.ts'
import { debug, warn } from '../services/ui/log.ts'

class HybridModeService {
  constructor() {
    debug('HybridModeService class constructor called')
    this.gameOptions = null
    this.gameItems = []
    this.connections = []
  }

  initialize(gameOptions, gameItems, connections, goalChain) {
    debug('Hybrid Mode initialization called')
    this.gameOptions = gameOptions
    this.gameItems = gameItems
    this.connections = connections
    
    // Print goal structure
    const start = this.getStartItem()
    const goals = this.getGoals()
    const mainGoal = start?.title || start?.name || 'Main Goal'
    const subsCount = goals.length
    
    debug('Hybrid Mode initialized', {
      mainGoal,
      subsCount,
      startItem: start?.id,
      goalsCount: goals.length
    })
  }

  updateGameState(gameItems, connections) {
    this.gameItems = gameItems
    this.connections = connections
  }

  getStartItem() {
    // Prefer explicit start flags
    return this.gameItems.find((i) => i.isStartingItem || i.isGrounding) || null
  }

  getGoals() {
    return this.gameItems.filter((i) => i.isGoal === true)
  }

  /**
   * BFS from start over current connections to check reachability
   */
  isReachableFromStart(targetId) {
    const start = this.getStartItem()
    if (!start || !targetId) return false
    const adj = buildAdjacency(this.connections)
    const seen = bfsReachable(start.id, adj)
    return seen.has(targetId)
  }

  /**
   * Win when ALL goals are reachable via a path from the start item
   */
  async checkWinCondition() {
    const start = this.getStartItem()
    const goals = this.getGoals()
    if (!start || goals.length === 0) return false
    const allConnected = goals.every((g) => this.isReachableFromStart(g.id))
    return allConnected
  }

  getWinMessage() {
    const start = this.getStartItem()
    const goals = this.getGoals()
    const startLabel = start?.title || start?.name || 'Start'
    return `All ${goals.length} goals connected from ${startLabel}!`
  }

  getProgressDisplay() {
    const start = this.getStartItem()
    const goals = this.getGoals()
    if (!start || goals.length === 0) return ''
    const reached = goals.filter((g) => this.isReachableFromStart(g.id)).length
    return `Hybrid: ${reached}/${goals.length} goals reached`
  }
}

const hybridService = new HybridModeService()
debug('HybridModeService module loaded and instantiated')
export default hybridService
