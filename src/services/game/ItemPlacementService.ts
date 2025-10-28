import { log } from '../ui/log.ts'

class ItemPlacementService {
  constructor() {
    this.placementStrategy = {
      goal: this.placeGoalModeItems.bind(this),
      path: this.placePathModeItems.bind(this),
      knowledge: this.placeKnowledgeModeItems.bind(this),
      custom: this.placeCustomModeItems.bind(this),
      anti: this.placeAntiModeItems.bind(this),
      zen: this.placeZenModeItems.bind(this),
    }
  }

  // Main method - GameScreen calls this
  async placeItems(gameMode, gameOptions) {
    log(2000, { message: 'ItemPlacementService: Starting item placement', mode: gameMode })

    if (!gameOptions) {
      log(1004, { message: 'No game options provided for item placement' })
      return []
    }

    const strategy = this.placementStrategy[gameMode]
    if (!strategy) {
      log(1004, { message: 'Unknown game mode for item placement', mode: gameMode })
      return []
    }

    try {
      const items = await strategy(gameOptions)
      log(2000, { message: 'ItemPlacementService: Items placed successfully', count: items.length })
      return items
    } catch (error) {
      log(1004, { message: 'Item placement failed', error: error.message })
      return []
    }
  }

  // Goal Mode: Start and End items
  placeGoalModeItems(gameOptions) {
    const items = []

    if (gameOptions.goalStartItem) {
      const startItem = {
        ...gameOptions.goalStartItem,
        gameId: `goal-start-${Date.now()}`,
        x: 400, // Left side
        y: 400, // Below top UI
      }
      items.push(startItem)
      log(2000, { message: 'Placed goal start item', name: startItem.name })
    }

    if (gameOptions.goalEndItem) {
      const endItem = {
        ...gameOptions.goalEndItem,
        gameId: `goal-end-${Date.now()}`,
        x: 800, // Right side
        y: 400, // Below top UI
      }
      items.push(endItem)
      log(2000, { message: 'Placed goal end item', name: endItem.name })
    }

    return items
  }

  // Path Mode: Start item only
  placePathModeItems(gameOptions) {
    if (!gameOptions.pathStartItem) {
      log(1004, { message: 'No path start item provided' })
      return []
    }

    const pathStartItem = {
      ...gameOptions.pathStartItem,
      gameId: `path-start-${Date.now()}`,
      x: 400, // Same as goal mode
      y: 400, // Same as goal mode
    }

    log(2000, { message: 'Placed path start item', name: pathStartItem.name })
    return [pathStartItem]
  }

  // Knowledge Mode: Start item only
  placeKnowledgeModeItems(gameOptions) {
    if (!gameOptions.knowledgeStartItem) {
      log(1004, { message: 'No knowledge start item provided' })
      return []
    }

    const knowledgeStartItem = {
      ...gameOptions.knowledgeStartItem,
      gameId: `knowledge-start-${Date.now()}`,
      x: 400, // Same as goal mode
      y: 400, // Same as goal mode
    }

    log(2000, { message: 'Placed knowledge start item', name: knowledgeStartItem.name })
    return [knowledgeStartItem]
  }

  // Custom Mode: Goals + random items
  placeCustomModeItems(gameOptions) {
    const items = []

    // Place custom goals
    if (gameOptions.customGoals && gameOptions.customGoals.length > 0) {
      gameOptions.customGoals.forEach((goal, index) => {
        const goalItem = {
          ...goal,
          tmdbId: goal.id,
          gameId: `custom-goal-${index}-${Date.now()}`,
          x: 400 + (Math.random() * 200 - 100), // Spread around left side
          y: 400 + (Math.random() * 200 - 100), // Same Y as goal mode
          isCustomGoal: true,
          goalIndex: index,
        }
        items.push(goalItem)
      })
    }

    // Place random items if specified
    if (gameOptions.customRandomItems && gameOptions.customRandomItems.length > 0) {
      gameOptions.customRandomItems.forEach((item, index) => {
        const randomItem = {
          ...item,
          tmdbId: item.id,
          gameId: `custom-random-${index}-${Date.now()}`,
          x: 400 + (Math.random() * 200 - 100), // Spread around left side
          y: 400 + (Math.random() * 200 - 100), // Same Y as goal mode
          isCustomGoal: false,
        }
        items.push(randomItem)
      })
    }

    log(2000, { message: 'Placed custom mode items', count: items.length })
    return items
  }

  // Anti Mode: All goals at once
  placeAntiModeItems(gameOptions) {
    if (!gameOptions.customGoals || gameOptions.customGoals.length === 0) {
      log(1004, { message: 'No custom goals provided for anti mode' })
      return []
    }

    const items = gameOptions.customGoals.map((goal, index) => ({
      ...goal,
      tmdbId: goal.id,
      gameId: `anti-goal-${index}-${Date.now()}`,
      x: 400 + (Math.random() * 200 - 100), // Spread around left side
      y: 400 + (Math.random() * 200 - 100), // Same Y as goal mode
      isAntiModeGoal: true,
      goalIndex: index,
    }))

    log(2000, { message: 'Placed anti mode goals', count: items.length })
    return items
  }

  // Zen Mode: No initial items
  placeZenModeItems() {
    log(2000, { message: 'Zen mode - no initial items to place' })
    return []
  }

  // Get placement coordinates for any mode
  getPlacementCoordinates(mode, index = 0) {
    const baseX = 400
    const baseY = 400

    if (mode === 'goal' && index === 1) {
      return { x: 800, y: baseY } // End item on right
    }

    // All other items on left side with slight variation
    return {
      x: baseX + (Math.random() * 100 - 50),
      y: baseY + (Math.random() * 100 - 50),
    }
  }
}

export default new ItemPlacementService()
