// Pure service: no UI/log side effects

class ZenModeService {
  constructor() {
    this.gameItems = []
    this.connections = []
    this.gameOptions = null
    this.isZenMode = false
  }

  initialize(gameOptions, gameItems, connections) {
    this.gameOptions = gameOptions
    this.gameItems = gameItems
    this.connections = connections
    this.isZenMode = this.gameOptions?.gameType === 'zen' || false
  }

  updateGameState(gameItems, connections) {
    this.gameItems = gameItems
    this.connections = connections
  }

  isActive() {
    return this.isZenMode
  }
  getDisplayName() {
    return 'Zen Mode'
  }
  getDescription() {
    return 'No rules, no goals - just pure connection creativity!'
  }
  canAddItem(item) {
    return true
  }
  canMakeConnection(item1, item2) {
    return true
  }

  handleItemAdded(item) {}
  handleConnectionCreated(item1, item2) {}

  checkWinCondition() {
    return { won: false, reason: 'Zen mode has no end - keep creating!' }
  }

  getProgressDisplay() {
    const itemCount = this.gameItems.length
    const connectionCount = this.connections.length
    return {
      mode: 'Zen Mode',
      items: itemCount,
      connections: connectionCount,
      message: `${itemCount} items, ${connectionCount} connections`,
    }
  }

  getStats() {
    return {
      totalItems: this.gameItems.length,
      totalConnections: this.connections.length,
      averageConnectionsPerItem:
        this.gameItems.length > 0
          ? (this.connections.length / this.gameItems.length).toFixed(2)
          : 0,
      mode: 'zen',
      hasRules: false,
      hasWinCondition: false,
    }
  }

  reset() {}
  getTips() {
    return [
      '🧘‍♀️ No rules, no pressure - just connect what feels right!',
      '🎨 Create beautiful connection webs and patterns',
      '🔗 Add as many items and connections as you want',
      '🌟 Explore different types of media and people',
      "💫 There's no wrong way to play Zen Mode",
    ]
  }
  shouldShowSpecialUI() {
    return false
  }

  handleGameEvent(event, data) {
    switch (event) {
      case 'item_added':
        this.handleItemAdded(data.item)
        break
      case 'connection_created':
        this.handleConnectionCreated(data.item1, data.item2)
        break
      case 'game_reset':
        this.reset()
        break
      default:
        break
    }
  }
}

export default new ZenModeService()
