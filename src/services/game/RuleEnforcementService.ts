// Moved RuleEnforcementService here from ../../services/RuleEnforcementService.js
import { GAME_RULES, CONNECTION_RULES, PATH_MODE_RULES } from '../../rules/gameRules.ts'
import { getModeRules } from '../../modes/gameModes.ts'
import { debug } from '../../services/ui/log.ts'
import {
  buildAdjacency,
  pathExists,
  bfsReachable,
  degreeMap,
  shortestPathLength,
} from '../../utils/graph.ts'

export class RuleEnforcementService {
  static validateConnection(item1, item2, gameMode, connections, gameItems) {
    const baseRules = getModeRules(gameMode.id)
    const dynamicRuleSet = new Set(baseRules)
    try {
      const pathEnabled = !!(
        gameMode &&
        (gameMode.modeSettings?.pathModeEnabled ||
          gameMode.settings?.pathModeEnabled ||
          gameMode.settings?.modeSettings?.pathModeEnabled ||
          gameMode.gameOptions?.modeSettings?.pathModeEnabled ||
          (typeof window !== 'undefined' &&
            window.gameOptions &&
            window.gameOptions.modeSettings &&
            window.gameOptions.modeSettings.pathModeEnabled))
      )
      if (pathEnabled) {
        dynamicRuleSet.add(GAME_RULES.LINEAR_PATH_ONLY)
        dynamicRuleSet.add(GAME_RULES.NO_BACKTRACE)
      }
    } catch (err) {
      // Failed to check path mode - continue without path rules
      debug('Failed to check path mode in rules', { error: err })
    }
    const modeRules = Array.from(dynamicRuleSet)
    const checks = [
      this.checkAntiRules(gameMode),
      this.checkConnectionTypeRules(item1, item2, modeRules),
      this.checkKnowledgeRules(item1, item2, gameMode, gameItems),
      this.checkBranchingRules(item1, item2, modeRules, connections, gameItems),
      this.checkPathRules(item1, item2, modeRules, connections),
      this.checkHangerRules(item1, item2, modeRules, connections, gameItems),
      this.checkHybridRules(item1, item2, gameMode, connections, gameItems),
    ]
    const failedCheck = checks.find((check) => !check.valid)
    return failedCheck || { valid: true, reason: 'Valid connection' }
  }

  static checkAntiRules(gameMode) {
    return { valid: true, reason: 'Anti mode defers blocking to loss handler' }
  }

  static checkKnowledgeRules(item1, item2, gameMode, gameItems) {
    if (!gameMode || gameMode.id !== 'knowledge')
      return { valid: true, reason: 'Not knowledge mode' }
    const startingItems = (gameItems || []).filter((i) => i.isStartingItem)
    let start = startingItems.find((i) => i.type === 'person') || startingItems[0]
    if (!start) return { valid: true, reason: 'No starting item found' }
    const isFromStart = item1.id === start.id || item2.id === start.id
    if (!isFromStart)
      return {
        valid: false,
        reason: `Knowledge mode: connections must include ${start.title || start.name}`,
      }
    return { valid: true, reason: 'Knowledge rule ok' }
  }

  static checkConnectionTypeRules(item1, item2, modeRules) {
    if (item1.type === item2.type) {
      if (modeRules.includes(CONNECTION_RULES.NO_SAME_TYPE_CONNECTIONS))
        return { valid: false, reason: 'Cannot connect same types' }
      if (modeRules.includes(CONNECTION_RULES.CROSS_TYPE_ONLY))
        return { valid: false, reason: 'Only cross-type connections allowed' }
    }
    return { valid: true, reason: 'Connection type valid' }
  }

  static checkBranchingRules(item1, item2, modeRules, connections, gameItems) {
    if (modeRules.includes(GAME_RULES.LINEAR_PATH_ONLY)) {
      const degree = new Map()
      for (const c of connections || []) {
        if (c.from) degree.set(c.from, (degree.get(c.from) || 0) + 1)
        if (c.to) degree.set(c.to, (degree.get(c.to) || 0) + 1)
      }
      const deg1 = degree.get(item1.id) || 0
      const deg2 = degree.get(item2.id) || 0
      const startingIds = new Set(
        (gameItems || []).filter((i) => i.isStartingItem).map((i) => i.id)
      )
      const limit1 = startingIds.has(item1.id) ? 1 : 2
      const limit2 = startingIds.has(item2.id) ? 1 : 2
      const proposedDeg1 = deg1 + 1
      const proposedDeg2 = deg2 + 1
      if (proposedDeg1 > limit1 || proposedDeg2 > limit2)
        return { valid: false, reason: 'Linear path only - branching not allowed' }
    }
    return { valid: true, reason: 'Branching rules valid' }
  }

  static checkPathRules(item1, item2, modeRules, connections) {
    if (modeRules.includes(GAME_RULES.NO_BACKTRACE)) {
      const exists = pathExists(item1.id, item2.id, connections)
      if (exists) return { valid: false, reason: 'No backtrace allowed' }
    }
    return { valid: true, reason: 'Path rules valid' }
  }

  static checkHangerRules(item1, item2, modeRules, connections, gameItems) {
    // Check if NO_HANGERS rule is active
    if (!modeRules.includes(PATH_MODE_RULES.NO_HANGERS)) {
      return { valid: true, reason: 'NO_HANGERS rule not active' }
    }

    // After making this connection, check if both items will be connected
    // If NO_HANGERS is active, every item must be part of the connection network
    
    // Create temporary connections list with the new connection
    const tempConnections = [...connections, { from: item1.id, to: item2.id }]
    const tempAdjacency = buildAdjacency(tempConnections)
    
    // Find starting items (items with special flags)
    const startItems = gameItems.filter(item => 
      item.isStartingItem || item.isGoal || item.isGrounding
    )
    
    // If no special items, every item must connect to every other item
    if (startItems.length === 0) {
      const allItemIds = gameItems.map(item => item.id)
      const reachableFromFirst = bfsReachable(allItemIds[0], tempAdjacency)
      
      if (!allItemIds.every(id => reachableFromFirst.has(id))) {
        return { 
          valid: false, 
          reason: 'NO_HANGERS: All items must be connected to the network' 
        }
      }
    } else {
      // Check if all items are reachable from any starting item
      let allReachable = false
      for (const startItem of startItems) {
        const reachable = bfsReachable(startItem.id, tempAdjacency)
        if (gameItems.every(item => reachable.has(item.id))) {
          allReachable = true
          break
        }
      }
      
      if (!allReachable) {
        const startLabels = startItems.map(item => 
          item.title || item.name || item.tmdbData?.title || item.tmdbData?.name || 'item'
        ).join(', ')
        
        return { 
          valid: false, 
          reason: `NO_HANGERS: All items must be connected to starting network (${startLabels})` 
        }
      }
    }
    
    return { valid: true, reason: 'NO_HANGERS rule satisfied' }
  }

  static checkHybridRules(item1, item2, gameMode, connections, gameItems) {
    if (gameMode.id !== 'hybrid') return { valid: true, reason: 'Not hybrid mode' }
    const start = (gameItems || []).find((i) => i.isStartingItem)
    if (!start) return { valid: false, reason: 'No starting item in hybrid mode' }
    const adj = buildAdjacency(connections)
    const nodes = bfsReachable(start.id, adj)
    const degs = degreeMap(connections, nodes)
    const inPath = (id) => nodes.has(id)
    const isEndpoint = (id) => (degs.get(id) || 0) <= 1
    const t1 = inPath(item1.id)
    const t2 = inPath(item2.id)
    if (!((t1 && !t2) || (!t1 && t2))) {
      const startLabel =
        start.title ||
        start.name ||
        start?.tmdbData?.title ||
        start?.tmdbData?.name ||
        'starting item'
      return { valid: false, reason: `Must extend from starting path (${startLabel})` }
    }
    const onPathId = t1 ? item1.id : item2.id
    if (!isEndpoint(onPathId))
      return { valid: false, reason: 'Linear path only - branching not allowed' }
    const goals = (gameItems || []).filter((i) => i.isGoal)
    const reached = goals.filter((g) => pathExists(start.id, g.id, adj)).length
    if (reached > 0 && reached < goals.length) {
      if (onPathId !== start.id) {
        const startLabel =
          start.title ||
          start.name ||
          start?.tmdbData?.title ||
          start?.tmdbData?.name ||
          'starting item'
        return { valid: false, reason: `After goal, extend from start (${startLabel})` }
      }
    }
    return { valid: true, reason: 'Hybrid rules valid' }
  }

  // pathExistsBetween removed; use utils/graph.pathExists

  // getPathInfoFromStart replaced by shared helpers

  static getCurrentTargetGoal(gameItems, connections) {
    const goalItems = (gameItems || []).filter((item) => item.isGoal)
    const start = (gameItems || []).find((i) => i.isStartingItem)
    if (!start || goalItems.length === 0) return null
    for (const goal of goalItems) {
      if (!this.pathExistsBetween(start.id, goal.id, connections)) return goal
    }
    return null
  }

  static checkWinCondition(gameMode, connections, gameItems) {
    switch (gameMode.id) {
      case 'goal':
        return this.checkGoalModeWin(connections, gameItems)
      case 'hybrid':
        return this.checkHybridModeWin(connections, gameItems)
      case 'knowledge':
        return this.checkKnowledgeModeWin(gameMode, connections, gameItems)
      case 'anti':
        return this.checkAntiModeWin(connections, gameItems)
      case 'timeline':
        return this.checkTimelineModeWin(gameMode, connections, gameItems)
      default:
        return { won: false, reason: 'Unknown game mode' }
    }
  }

  static checkGoalModeWin(connections, gameItems) {
    const startingItems = gameItems.filter((item) => item.isStartingItem)
    if (startingItems.length !== 2) return { won: false, reason: 'Need exactly 2 starting items' }
    const [goal1, goal2] = startingItems
    const d = shortestPathLength(goal1.id, goal2.id, connections)
    if (d >= 0) {
      const msg = d === 1 ? 'Goals connected!' : `Goals connected via ${d - 1} link(s)!`
      return { won: true, reason: msg }
    }
    return { won: false, reason: 'Goals not connected yet' }
  }

  static checkHybridModeWin(connections, gameItems) {
    const goalItems = (gameItems || []).filter((item) => item.isGoal)
    if (goalItems.length === 0) return { won: false, reason: 'No goals configured' }
    const start = (gameItems || []).find((i) => i.isStartingItem) || null
    if (!start) return { won: false, reason: 'No starting item set' }
    let reached = 0
    for (const goal of goalItems) {
      if (pathExists(start.id, goal.id, connections)) reached++
    }
    if (reached === goalItems.length) return { won: true, reason: 'All hybrid paths completed!' }
    return { won: false, reason: `Completed ${reached}/${goalItems.length} paths` }
  }

  static checkKnowledgeModeWin(gameMode, connections, gameItems) {
    const startingItems = (gameItems || []).filter((i) => i.isStartingItem)
    const start = startingItems.find((i) => i.type === 'person') || startingItems[0]
    if (!start) return { won: false, reason: 'No starting item found' }
    const required = Number(
      (gameMode &&
        (gameMode?.gameOptions?.modeSettings?.connectionCount ||
          gameMode?.modeSettings?.connectionCount ||
          gameMode?.connectionCount)) ||
        3
    )
    const connectedIds = new Set()
    for (const c of connections || []) {
      if (c.from === start.id && c.to) connectedIds.add(c.to)
      if (c.to === start.id && c.from) connectedIds.add(c.from)
    }
    const count = connectedIds.size
    if (count >= required) return { won: true, reason: `Named ${count}/${required} connections` }
    return { won: false, reason: `Named ${count}/${required} connections` }
  }

  static checkAntiModeWin(connections, gameItems) {
    // Anti Mode: High score mode - any connection = game over
    // Goal is to survive as long as possible without making connections
    
    // Any connection means game over
    if (connections && connections.length > 0) {
      const connection = connections[connections.length - 1] // Get the most recent connection
      const fromItem = gameItems.find(item => item.id === connection.from)
      const toItem = gameItems.find(item => item.id === connection.to)
      
      return { 
        won: false, 
        reason: `Game Over! Made connection: ${fromItem?.title || fromItem?.name || 'Unknown'} ↔ ${toItem?.title || toItem?.name || 'Unknown'}` 
      }
    }
    
    // No connections = still playing (high score mode)
    return { won: false, reason: 'Surviving! Avoid all connections for high score!' }
  }

  static checkTimelineModeWin(gameMode, connections, gameItems) {
    // Timeline Mode: Win when all cards are placed correctly in chronological order
    // Cards are items that are not starting items and have been placed on the timeline
    
    const startingItems = gameItems.filter(item => item.isStartingItem)
    const cards = gameItems.filter(item => !item.isStartingItem && item.isPlacedOnTimeline)
    const totalCards = gameMode.modeSettings?.cardCount || 4
    
    // Check if all cards have been placed
    if (cards.length < totalCards) {
      return { 
        won: false, 
        reason: `Place all cards! ${cards.length}/${totalCards} placed` 
      }
    }
    
    // Check if all cards are placed in correct chronological order
    const timelineItems = [...startingItems, ...cards].sort((a, b) => {
      const yearA = a.year || 0
      const yearB = b.year || 0
      return yearA - yearB
    })
    
    // Verify the timeline is in correct order
    for (let i = 0; i < timelineItems.length - 1; i++) {
      const current = timelineItems[i]
      const next = timelineItems[i + 1]
      if (current.year > next.year) {
        return { 
          won: false, 
          reason: `Timeline out of order! ${current.title || current.name} (${current.year}) should come after ${next.title || next.name} (${next.year})` 
        }
      }
    }
    
    return { 
      won: true, 
      reason: `Timeline Complete! All ${totalCards} cards placed in correct chronological order!` 
    }
  }
}
