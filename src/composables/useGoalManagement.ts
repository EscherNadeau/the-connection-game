import { ref, type Ref } from 'vue'
import { useGameStateStore } from '@store/gameState.store'
import { info, debug, warn, error as logError } from '@/services/ui/log'
import { shortestPathNodes } from '@/utils/graph'
import type { GameItem, Connection, GameOptions, GameMode, GoalData, GoalAdvancementData, ResultModal, GameBoard, StartingItem } from '@/types/game'

interface ModeService {
  initialize: (options: unknown) => void
  updateGameState: (items: GameItem[], connections: Connection[]) => void
  checkWinCondition: (items: GameItem[], connections: Connection[]) => boolean
}

export function useGoalManagement() {
  const highlightPathIds: Ref<string[]> = ref([])
  const savedWinPathIds: Ref<string[]> = ref([])
  const bottomBarVisible: Ref<boolean> = ref(false)

  const gs = useGameStateStore()

  /**
   * Get starting items for the game
   */
  function getStartingItems(gameMode: GameMode | null, gameOptions: GameOptions): GameItem[] {
    if (gameMode && gameMode.id === 'zen') return []
    if (gameOptions && Array.isArray(gameOptions.startingItems) && gameOptions.startingItems.length) {
      return gameOptions.startingItems
    }
    return import.meta.env && import.meta.env.DEV && typeof window !== 'undefined'
      ? (window as any).gameStartingItems || []
      : []
  }

  /**
   * Handle goal completion
   */
  function onGoalCompleted(
    goalData: GoalData, 
    gameOptions: GameOptions, 
    roomCode: string | undefined,
    handlePvPGoalCompletion?: (goalData: GoalData, gameOptions: GameOptions, roomCode?: string) => boolean,
    resultModal?: ResultModal
  ): void {
      info( { message: '🎉 Goal completed!', data: goalData })
    
    // Use provided resultModal or create a ref-like wrapper
    const modal = resultModal || { value: { visible: false, type: 'win', title: '', subtitle: '', stats: null } }
    
    if (goalData?.lost) {
      const unconnected = goalData?.stats?.unconnectedCount || 0
      const flair =
        unconnected >= 100
          ? 'INSANE!'
          : unconnected >= 20
            ? 'Epic run!'
            : unconnected >= 5
              ? 'Nice attempt!'
              : 'Quick round!'
      
      modal.value = {
        visible: true,
        type: 'lose',
        title: 'You Lose',
        subtitle: `${goalData?.message || ''} • ${flair}`.trim(),
        stats: { unconnectedCount: unconnected },
        losingPair: goalData?.losingPair || null,
      }
      return
    }
    
    if (goalData && goalData.mode && goalData.mode !== 'anti' && goalData.mode !== 'zen') {
      // Check if this is a PvP game and handle completion (if handler provided)
      if (handlePvPGoalCompletion && handlePvPGoalCompletion(goalData, gameOptions, roomCode)) {
        // PvP completion was handled, continue with normal win flow
      }
      
      // Update modal properties directly to maintain reactivity
      if (modal && modal.value) {
        modal.value.visible = true
        modal.value.type = 'win'
        modal.value.title = 'You Win'
        modal.value.subtitle = goalData?.message || 'Goal completed!'
        modal.value.stats = Object.assign({}, goalData?.stats || {}, {
          pathLength: goalData?.pathLength,
        })
        debug('Modal set to visible', { visible: modal.value })
      } else {
        warn('Modal not available - cannot show win screen!')
      }
      
      // Cache path for Show Path flow; do not show bottom bar or path until Show Path pressed
      debug('Saving path IDs from goalData', { pathIds: goalData?.pathIds })
      savedWinPathIds.value = Array.isArray(goalData?.pathIds) ? goalData.pathIds : []
      debug('Saved path IDs', { count: savedWinPathIds.value.length })
      // DO NOT set highlightPathIds here - only save it. Path will be shown when user clicks "Show Path"
      highlightPathIds.value = [] // Clear any existing highlights
      bottomBarVisible.value = false // Hide bottom bar until user clicks "Show Path"
      return
    }
  }

  /**
   * Handle goal advancement
   */
  function onGoalAdvanced(
    goalData: GoalAdvancementData, 
    gameOptions: GameOptions, 
    gameBoard: GameBoard, 
    addNewStartingItems: (nextGoal: GoalData, gameBoard: GameBoard, gameOptions: GameOptions) => void,
    showGoalAdvancementNotification: (goalData: GoalAdvancementData) => void
  ): void {
    info('🎯 Goal advanced!', goalData)
    
    // Update the current goal index in gameOptions
    if (gameOptions && goalData.newGoalIndex !== undefined) {
      gameOptions.currentGoalIndex = goalData.newGoalIndex
      
      // Update game state store for multiplayer sync
      try {
        gs.updateGameOptions(gameOptions)
      } catch (err) {
        warn('Failed to update game options in store', { error: err })
      }
      
      // Add new starting items for the next goal
      if (goalData.newGoal) {
        addNewStartingItems(goalData.newGoal, gameBoard, gameOptions)
      }
      
      // Show goal advancement notification
      showGoalAdvancementNotification(goalData)
    }
  }

  /**
   * Add new starting items for the next goal
   */
  function addNewStartingItems(nextGoal: GoalData, gameBoard: GameBoard, gameOptions: GameOptions): void {
    if (!nextGoal || !gameBoard) return

    const gameType = gameOptions?.gameType || 'goal'

    // Generate starting items for the next goal based on game type
    const newItems = generateStartingItemsForGoal(nextGoal, gameType)
    
    // Add items to the game board
    for (const item of newItems) {
      gameBoard.addItem(item)
    }

    info('🎯 Added new starting items for next goal', newItems)
  }

  /**
   * Generate starting items for a goal based on game type
   */
  function generateStartingItemsForGoal(goal: GoalData, gameType: string): StartingItem[] {
    const items: StartingItem[] = []

    switch (gameType) {
      case 'goal':
        // Goal Mode: Add both starting item and goal item
        items.push({
          id: `${goal.id}-start`,
          name: goal.description, // Using description as title
          type: 'movie', // Default type, should be determined from goal data
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          connections: [],
          title: goal.description,
          isStartingItem: true,
          isGoal: false,
          source: 'goal-start'
        })
        items.push({
          id: `${goal.id}-target`,
          name: `Connect to ${goal.description}`,
          type: 'movie', // Default type
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          connections: [],
          title: `Connect to ${goal.description}`,
          isStartingItem: false,
          isGoal: true,
          source: 'goal-target'
        })
        break

      case 'hybrid':
        // Hybrid Mode: Add starting item and sub-goals
        items.push({
          id: goal.id,
          name: goal.description,
          type: 'movie', // Default type
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          connections: [],
          title: goal.description,
          isStartingItem: true,
          isGoal: false,
          source: 'hybrid-start'
        })
        
        // Note: subGoals would need to be added to GoalData interface if needed
        break

      case 'knowledge':
        // Knowledge Mode: Add only starting item
        items.push({
          id: goal.id,
          name: goal.description,
          type: 'movie', // Default type
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          connections: [],
          title: goal.description,
          isStartingItem: true,
          isGoal: false,
          source: 'knowledge-start'
        })
        break

      case 'anti':
        // Anti Mode: Add only starting item
        items.push({
          id: goal.id,
          name: goal.description,
          type: 'movie', // Default type
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          connections: [],
          title: goal.description,
          isStartingItem: true,
          isGoal: false,
          source: 'anti-start'
        })
        break

      default:
        warn( { message: 'Unknown game type for goal advancement', data: gameType })
    }

    return items
  }

  /**
   * Show goal advancement notification
   */
  function showGoalAdvancementNotification(goalData: GoalAdvancementData): void {
    // Show a temporary notification for goal advancement
    const notification = {
      visible: true,
      type: 'info',
      title: 'Goal Advanced!',
      subtitle: `Now working on: ${goalData.newGoal?.description || 'Next Goal'}`,
      duration: 3000 // 3 seconds
    }

    // You can implement a notification system here
    // For now, just log it
    info('🎯 Goal advancement notification', notification)
  }

  /**
   * Handle goal checking
   */
  async function handleCheckGoals(connections: Connection[], gameOptionsParam: GameOptions, gameItemsParam: GameItem[]): Promise<any> {
    info('🎯 Checking goals', { connections: connections.length })
    
    // Get the current game mode service
    const gameMode = gameOptionsParam?.mode || 'hybrid'
    
    try {
      // Import the appropriate mode service
      type ModeServiceModule = { default: ModeService }
      let modeService: ModeServiceModule | null = null
      
      switch (gameMode) {
        case 'hybrid':
          modeService = await import('../modes/HybridModeService')
          break
        case 'goal':
          modeService = await import('../modes/GoalModeService')
          break
        case 'knowledge':
          modeService = await import('../modes/KnowledgeModeService')
          break
        case 'anti':
          modeService = await import('../modes/AntiModeService')
          break
        case 'zen':
          modeService = await import('../modes/ZenModeService')
          break
        default:
          warn( { message: 'Unknown game mode', data: gameMode })
          return
      }
      
      if (modeService && modeService.default) {
        const service: ModeService = modeService.default
        
        debug('Mode service loaded', { gameMode, itemCount: gameItemsParam.length, connectionCount: connections.length })
        
        // For Goal Mode: Extract goal chain from starting items
        let goalChain: GameItem[] = []
        if (gameMode === 'goal' && gameOptionsParam.startingItems) {
          // Extract the goal items from starting items
          const goalItems = gameItemsParam.filter((item: GameItem & { source?: string }) => 
            item.isStartingItem && (item.source === 'goal1' || item.source === 'goal2')
          )
          debug('Goal items found', { count: goalItems.length })
          goalChain = goalItems
          
          // Initialize the service with goal chain
          if (service.initialize) {
            debug('Initializing GoalModeService with goal chain')
            service.initialize(gameOptionsParam, gameItemsParam, connections, goalChain)
          }
        }
        
        // Update the service with current game state
        if (service.updateGameState) {
          debug('Updating game state in service')
          service.updateGameState(gameItemsParam, connections)
        }
        
        // Check win condition
        if (service.checkWinCondition) {
          debug('Checking win condition')
          const hasWon = await service.checkWinCondition()
          debug('Win condition result', { hasWon })
          
          if (hasWon) {
            info( '🎉 WIN CONDITION MET!')
            
            // Get win message and progress
            const winMessage = service.getWinMessage ? service.getWinMessage() : 'You won!'
            const progress = service.getProgressDisplay ? service.getProgressDisplay() : ''
            
            // Calculate path IDs for Goal Mode
            let pathIds: string[] = []
            if (gameMode === 'goal') {
              try {
                // Get goal items
            const goalItems = gameItemsParam.filter((item: GameItem & { source?: string }) => 
              item.isStartingItem && (item.source === 'goal1' || item.source === 'goal2')
            )
                debug('Goal items found for path calculation', { count: goalItems.length })
                if (goalItems.length >= 2) {
                  const startItem = goalItems.find((item: any) => item.source === 'goal1')
                  const endItem = goalItems.find((item: any) => item.source === 'goal2')
                  debug('Path calculation items', { 
                    startId: startItem?.id, 
                    startName: startItem?.name || startItem?.title,
                    endId: endItem?.id,
                    endName: endItem?.name || endItem?.title,
                    connectionCount: connections.length
                  })
                  
                  if (startItem && endItem && startItem.id && endItem.id) {
                    // Calculate the shortest path between goal items
                    pathIds = shortestPathNodes(startItem.id, endItem.id, connections)
                    debug('Calculated path IDs', { count: pathIds.length, pathIds })
                    
                    if (pathIds.length === 0) {
                      warn('No path found between goal items!')
                    } else {
                      info( { message: '🎯 Calculated path IDs', data: { count: pathIds.length, pathIds } })
                    }
                  } else {
                    warn('Missing start or end item for path calculation')
                  }
                }
              } catch (error) {
                logError( { message: 'Failed to calculate path IDs', data: error })
              }
            }
            
            // Return win data with mode to trigger win modal
            return {
              mode: gameMode, // Add mode so handleGoalCompleted recognizes it
              type: 'win',
              message: winMessage,
              progress: progress,
              connections: connections,
              pathIds: pathIds, // Add path IDs for Show Path functionality
              stats: {
                connections: connections.length,
                items: gameItemsParam.length
              }
            }
          } else {
            // Update progress display
            const progress = service.getProgressDisplay ? service.getProgressDisplay() : ''
            if (progress) {
              info( { message: 'Progress', data: progress })
            }
            return null
          }
        } else {
          warn('No checkWinCondition method found on service', { gameMode })
        }
      }
    } catch (error) {
      logError( { message: 'Error checking goals', data: error })
    }
  }

  /**
   * Show path functionality - works like Free Play but with path shown
   */
  function onShowPath(resultModal: ResultModal, gameMode: GameMode | null): void {
    try {
      resultModal.value.visible = false
      bottomBarVisible.value = true
      
      // Switch to Zen mode (no goal checking) - just like Free Play
      if (gameMode && gameMode.id !== 'zen') {
        gameMode.id = 'zen'
      }
      
      // Show the saved path
      debug('Show Path clicked', { savedPathCount: savedWinPathIds.value.length })
      if (Array.isArray(savedWinPathIds.value) && savedWinPathIds.value.length > 0) {
        highlightPathIds.value = [...savedWinPathIds.value]
        debug('Applied path highlight', { itemCount: highlightPathIds.value.length })
      } else {
        warn('No saved path IDs found!')
      }
      
      info( '✅ Entered Show Path mode (Free Play with path)')
    } catch (error) {
      logError( { message: 'Failed to show path', data: error })
    }
  }

  /**
   * Hide path functionality
   */
  function hidePathFromBar(): void {
    highlightPathIds.value = []
  }

  /**
   * Re-show path functionality
   */
  function reShowPath(): void {
    debug('ReShowPath called', { savedPathCount: savedWinPathIds.value.length })
    if (Array.isArray(savedWinPathIds.value) && savedWinPathIds.value.length > 0) {
      highlightPathIds.value = [...savedWinPathIds.value]
      debug('Re-applied path highlight', { itemCount: highlightPathIds.value.length })
    } else {
      warn('ReShowPath: No saved path IDs found!')
    }
  }

  /**
   * Enter zen free play mode
   */
  function enterZenFreePlay(resultModal: ResultModal, gameMode: GameMode | null, gameBoard: GameBoard): void {
    try {
      resultModal.value.visible = false
      // Switch to Zen mode (no goal checking)
      if (gameMode && gameMode.id !== 'zen') {
        gameMode.id = 'zen'
      }
      // Don't call checkGoalCompletion - we're entering free play, no more goals
      // Show bottom bar and clear highlight when entering Free Play from modal
      bottomBarVisible.value = true
      highlightPathIds.value = []
      info( '✅ Entered Zen Free Play mode')
    } catch (error) {
      logError( { message: 'Failed to enter zen free play', data: error })
    }
  }

  return {
    // Reactive state
    highlightPathIds,
    savedWinPathIds,
    bottomBarVisible,
    
    // Methods
    getStartingItemsComposable: getStartingItems,
    handleGoalCompleted: onGoalCompleted,
    handleGoalAdvanced: onGoalAdvanced,
    handleAddNewStartingItems: addNewStartingItems,
    generateStartingItemsForGoal,
    showGoalAdvancementNotification,
    handleCheckGoals,
    handleShowPath: onShowPath,
    handleHidePathFromBar: hidePathFromBar,
    handleReShowPath: reShowPath,
    enterZenFreePlay
  }
}
