// Pure service: no UI/log side effects

import { normalizeMediaType, isPersonType, isMediaType } from '@utils/constants.ts'
import { debug } from '../services/ui/log.ts'

class KnowledgeModeService {
  constructor() {
    this.gameOptions = null
    this.gameItems = []
    this.connections = []
    this.knowledgeStartItem = null
    this.knowledgeTargetItems = 5
    this.knowledgeCurrentItems = 0
    this.knowledgeLockedItems = new Set()
  }

  initialize(gameOptions, gameItems, connections, knowledgeStartItem, knowledgeTargetItems) {
    this.gameOptions = gameOptions
    this.gameItems = gameItems
    this.connections = connections
    this.knowledgeStartItem = knowledgeStartItem
    this.knowledgeTargetItems = knowledgeTargetItems || 5
    this.knowledgeCurrentItems = 0
    this.knowledgeLockedItems.clear()
  }

  updateGameState(gameItems, connections) {
    this.gameItems = gameItems
    this.connections = connections
  }

  async canItemMakeValidKnowledgeConnection(newItem) {
    if (this.knowledgeCurrentItems >= this.knowledgeTargetItems) return false
    for (const existingItem of this.gameItems) {
      if (this.knowledgeLockedItems.has(existingItem.id)) continue
      if (existingItem.id === this.knowledgeStartItem?.id) {
      }
      if (this.canItemsConnect(newItem, existingItem)) {
        try {
          const areRelated = await this.checkIfItemsAreRelated(newItem, existingItem)
          if (areRelated) return true
        } catch (err) {
          // Relationship check failed - continue checking other items
          debug('Failed to check if items are related in KnowledgeMode', { error: err })
        }
      }
    }
    return false
  }

  canMakeKnowledgeConnection(sourceItem, targetItem) {
    if (this.knowledgeCurrentItems >= this.knowledgeTargetItems) return false
    if (this.knowledgeLockedItems.has(sourceItem.id)) return false
    const sourceConnections = this.connections.filter(
      (conn) => conn.from === sourceItem.id || conn.to === sourceItem.id
    )
    if (sourceConnections.length > 0) return false
    if (targetItem.id === this.knowledgeStartItem?.id) {
    }
    if (this.knowledgeLockedItems.has(targetItem.id)) return false
    return true
  }

  updateKnowledgeState(sourceItem, targetItem) {
    if (sourceItem.id !== this.knowledgeStartItem?.id) {
      this.knowledgeLockedItems.add(sourceItem.id)
    }
    this.knowledgeCurrentItems++
    return {
      currentItems: this.knowledgeCurrentItems,
      targetItems: this.knowledgeTargetItems,
      isComplete: this.knowledgeCurrentItems >= this.knowledgeTargetItems,
      lockedItems: Array.from(this.knowledgeLockedItems),
    }
  }

  checkKnowledgeModeWin() {
    return {
      won: this.knowledgeCurrentItems >= this.knowledgeTargetItems,
      currentItems: this.knowledgeCurrentItems,
      targetItems: this.knowledgeTargetItems,
    }
  }

  checkKnowledgeModeGoalCompletion() {
    return {
      completed: this.knowledgeCurrentItems >= this.knowledgeTargetItems,
      currentItems: this.knowledgeCurrentItems,
      targetItems: this.knowledgeTargetItems,
    }
  }

  async checkIfKnowledgeGoalImpossible() {
    if (this.gameOptions?.gameType === 'anti')
      return { impossible: false, reason: 'Anti mode has no goals' }
    if (this.gameOptions?.gameType !== 'knowledge')
      return { impossible: false, reason: 'Not knowledge mode' }
    try {
      const remainingNeeded = this.knowledgeTargetItems - this.knowledgeCurrentItems
      if (remainingNeeded > 2)
        return { impossible: false, reason: 'Too early to check', remainingNeeded }
      if (this.gameOptions?.castFilter === 'mixed')
        return { impossible: false, reason: 'Mixed mode - too aggressive' }
      const availableItems = await this.getAvailableItemsForGoal()
      if (availableItems.length < remainingNeeded) {
        return {
          impossible: true,
          reason: 'Not enough available items',
          available: availableItems.length,
          needed: remainingNeeded,
        }
      }
      return {
        impossible: false,
        reason: 'Enough items available',
        available: availableItems.length,
        needed: remainingNeeded,
      }
    } catch (error) {
      return { impossible: false, reason: 'Error checking impossibility', error: error.message }
    }
  }

  async getAvailableItemsForGoal() {
    try {
      const availableItems = []
      const unlockedItems = this.gameItems.filter((item) => !this.knowledgeLockedItems.has(item.id))
      for (const item of unlockedItems) {
        if (this.canAcceptNewConnections(item)) availableItems.push(item)
      }
      return availableItems
    } catch (error) {
      return []
    }
  }

  canAcceptNewConnections(item) {
    if (this.knowledgeLockedItems.has(item.id)) return false
    const itemConnections = this.connections.filter(
      (conn) => conn.from === item.id || conn.to === item.id
    )
    return itemConnections.length === 0
  }

  resetKnowledgeState(newTargetItems) {
    this.knowledgeCurrentItems = 0
    this.knowledgeTargetItems = newTargetItems || 5
    this.knowledgeLockedItems.clear()
    return {
      currentItems: this.knowledgeCurrentItems,
      targetItems: this.knowledgeTargetItems,
      lockedItems: Array.from(this.knowledgeLockedItems),
    }
  }

  getKnowledgeStatus() {
    return {
      currentItems: this.knowledgeCurrentItems,
      targetItems: this.knowledgeTargetItems,
      progress: this.knowledgeCurrentItems / this.knowledgeTargetItems,
      isComplete: this.knowledgeCurrentItems >= this.knowledgeTargetItems,
      lockedItems: Array.from(this.knowledgeLockedItems),
      startItem: this.knowledgeStartItem,
    }
  }

  setKnowledgeStartItem(startItem) {
    this.knowledgeStartItem = startItem
  }

  getKnowledgeDisplayText() {
    if (this.knowledgeStartItem)
      return `Knowledge: ${this.knowledgeStartItem.name} → ${this.knowledgeTargetItems} items`
    return 'Knowledge: Start → Target items'
  }

  getKnowledgeStatsText() {
    return `Items: ${this.knowledgeCurrentItems}/${this.knowledgeTargetItems}`
  }

  canItemsConnect(item1, item2) {
    const t1 = normalizeMediaType(item1?.type)
    const t2 = normalizeMediaType(item2?.type)
    if (t1 === 'unknown' || t2 === 'unknown') return false
    if ((isPersonType(t1) && isMediaType(t2)) || (isPersonType(t2) && isMediaType(t1))) return true
    if (isPersonType(t1) && isPersonType(t2)) return true
    return false
  }

  async checkIfItemsAreRelated(item1, item2) {
    try {
      return this.canItemsConnect(item1, item2)
    } catch (error) {
      return false
    }
  }

  async checkWinCondition() {
    return this.knowledgeCurrentItems >= this.knowledgeTargetItems
  }
}

export default new KnowledgeModeService()
