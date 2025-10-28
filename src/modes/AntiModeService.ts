// Pure service: no UI/log side effects

class AntiModeService {
  constructor() {
    this.gameOptions = null
    this.gameItems = []
    this.connections = []
    this.antiModeConnections = 0
    this.antiModeMessage = null
    this.antiModeMessageTimer = null
    this.isAntiModeWin = false
  }

  initialize(gameOptions, gameItems, connections) {
    this.gameOptions = gameOptions
    this.gameItems = gameItems
    this.connections = connections
    this.antiModeConnections = 0
    this.antiModeMessage = null
    this.antiModeMessageTimer = null
    this.isAntiModeWin = false
  }

  updateGameState(gameItems, connections) {
    this.gameItems = gameItems
    this.connections = connections
  }

  handleAntiModeConnection(sourceItem, targetItem) {
    this.antiModeConnections = (this.antiModeConnections || 0) + 1
    this.antiModeMessage = this.buildAntiModeConnectionMessage(sourceItem.name, targetItem.name)
    return this.checkAntiModeGameOver()
  }

  checkAntiModeWin() {
    return false
  }

  checkAntiModeGameOver() {
    return {
      gameOver: this.antiModeConnections > 0,
      reason: 'Connection made',
      connections: this.antiModeConnections,
    }
  }

  countUnconnectedItems() {
    const connectedItemIds = new Set()
    this.connections.forEach((connection) => {
      connectedItemIds.add(connection.from)
      connectedItemIds.add(connection.to)
    })
    return this.gameItems.filter((item) => !connectedItemIds.has(item.id)).length
  }

  countConnectedItems() {
    const connectedItemIds = new Set()
    this.connections.forEach((connection) => {
      connectedItemIds.add(connection.from)
      connectedItemIds.add(connection.to)
    })
    return connectedItemIds.size
  }

  buildAntiModeConnectionMessage(sourceName, targetName) {
    const isGoal1 = this.gameItems.find((item) => item.name === sourceName)?.isAntiModeGoal
    const isGoal2 = this.gameItems.find((item) => item.name === targetName)?.isAntiModeGoal
    if (isGoal1 || isGoal2) {
      const goalName = isGoal1 ? sourceName : targetName
      return `Oops! You connected to the goal "${goalName}" - Game Over!`
    } else {
      return `Good Try! Connected ${sourceName} to ${targetName}`
    }
  }

  getAntiModeWinMessage(unconnectedCount, connectedCount) {
    const totalGoals = this.gameItems.filter((item) => item.isAntiModeGoal).length
    if (totalGoals > 0)
      return `🎉 Anti Mode Victory! You avoided connecting ALL ${totalGoals} goals while keeping ${unconnectedCount} out of ${this.gameItems.length} items unconnected. Your score: ${unconnectedCount} unconnected items!`
    return `🎉 Anti Mode Victory! You kept ${unconnectedCount} out of ${this.gameItems.length} items unconnected while only connecting ${connectedCount} items. Your score: ${unconnectedCount} unconnected items!`
  }

  getAntiModeGameOverMessage() {
    const unconnectedCount = this.countUnconnectedItems()
    const totalItems = this.gameItems.length
    const totalGoals = this.gameItems.filter((item) => item.isAntiModeGoal).length
    if (totalGoals > 0)
      return `💀 Anti Mode Game Over! You connected to one of the ${totalGoals} goals. Your score: ${unconnectedCount} unconnected items.`
    return `💀 Anti Mode Game Over! Your score: ${unconnectedCount} unconnected items.`
  }

  endAntiModeGame() {
    const unconnectedItems = this.countUnconnectedItems()
    const connectedItems = this.countConnectedItems()
    const totalGoals = this.gameItems.filter((item) => item.isAntiModeGoal).length
    if (unconnectedItems > connectedItems) {
      this.isAntiModeWin = true
      return {
        won: true,
        unconnectedItems,
        connectedItems,
        totalGoals,
        totalItems: this.gameItems.length,
        message: this.getAntiModeWinMessage(unconnectedItems, connectedItems),
      }
    } else {
      this.isAntiModeWin = false
      return {
        won: false,
        unconnectedItems,
        connectedItems,
        totalGoals,
        totalItems: this.gameItems.length,
        message: this.getAntiModeGameOverMessage(),
      }
    }
  }

  async checkIfAntiModeGoalImpossible() {
    return { impossible: false, reason: 'Anti mode has no goals to check' }
  }

  resetAntiModeState() {
    this.antiModeConnections = 0
    this.antiModeMessage = null
    this.isAntiModeWin = false
    return {
      connections: this.antiModeConnections,
      message: this.antiModeMessage,
      isWin: this.isAntiModeWin,
    }
  }

  getAntiModeStatus() {
    const unconnectedItems = this.countUnconnectedItems()
    const connectedItems = this.countConnectedItems()
    const totalGoals = this.gameItems.filter((item) => item.isAntiModeGoal).length
    return {
      connections: this.antiModeConnections,
      message: this.antiModeMessage,
      isWin: this.isAntiModeWin,
      unconnectedItems,
      connectedItems,
      totalGoals,
      totalItems: this.gameItems.length,
      progress: unconnectedItems / this.gameItems.length,
    }
  }

  getAntiModeDisplayText() {
    const totalGoals = this.gameItems.filter((item) => item.isAntiModeGoal).length
    if (totalGoals > 0) return `Anti Mode: Avoid ${totalGoals} goals`
    return 'Anti Mode: Avoid connections'
  }

  getAntiModeStatsText() {
    const unconnectedItems = this.countUnconnectedItems()
    const connectedItems = this.countConnectedItems()
    return `Unconnected: ${unconnectedItems} | Connected: ${connectedItems}`
  }

  isAntiModeGoal(item) {
    return item.isAntiModeGoal === true
  }
  getAntiModeGoals() {
    return this.gameItems.filter((item) => this.isAntiModeGoal(item))
  }
  isConnectionToAntiModeGoal(sourceItem, targetItem) {
    return this.isAntiModeGoal(sourceItem) || this.isAntiModeGoal(targetItem)
  }
  getAntiModeGoalName(sourceItem, targetItem) {
    if (this.isAntiModeGoal(sourceItem)) return sourceItem.name
    if (this.isAntiModeGoal(targetItem)) return targetItem.name
    return null
  }
  getAntiModeMessage() {
    return this.antiModeMessage
  }

  async checkWinCondition() {
    try {
      if (this.antiModeConnections === 0 && this.gameItems.length > 0) return false
      return false
    } catch (error) {
      return false
    }
  }
}

export default new AntiModeService()
