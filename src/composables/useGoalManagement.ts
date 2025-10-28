import { ref, type Ref } from 'vue'
// @ts-ignore
import { useGameStateStore } from '@store/gameState.store.ts'
// @ts-ignore
import { log } from '@/services/ui/log.ts'
import type { GameItem, Connection, GameOptions, GameMode, GoalData, GoalAdvancementData, ResultModal, GameBoard, StartingItem } from '@/types/game'

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
    handlePvPGoalCompletion: (goalData: GoalData, gameOptions: GameOptions, roomCode?: string) => boolean,
    resultModal: ResultModal
  ): void {
    log('info', '🎉 Goal completed!', goalData)
    
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
      
      resultModal.value = {
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
      // Check if this is a PvP game and handle completion
      if (handlePvPGoalCompletion(goalData, gameOptions, roomCode)) {
        // PvP completion was handled, continue with normal win flow
      }
      
      resultModal.value = {
        visible: true,
        type: 'win',
        title: 'You Win',
        subtitle: goalData?.message || 'Goal completed!',
        stats: Object.assign({}, goalData?.stats || {}, {
          pathLength: goalData?.pathLength,
        }),
      }
      
      // Cache path for Show Path flow; do not show bottom bar until Show Path pressed
      savedWinPathIds.value = Array.isArray(goalData?.pathIds) ? goalData.pathIds : []
      highlightPathIds.value = savedWinPathIds.value
      bottomBarVisible.value = false
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
    log('info', '🎯 Goal advanced!', goalData)
    
    // Update the current goal index in gameOptions
    if (gameOptions && goalData.newGoalIndex !== undefined) {
      gameOptions.currentGoalIndex = goalData.newGoalIndex
      
      // Update game state store for multiplayer sync
      try {
        gs.updateGameOptions(gameOptions)
      } catch (_) {}
      
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

    log('info', '🎯 Added new starting items for next goal:', newItems)
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
        log('warn', 'Unknown game type for goal advancement:', gameType)
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
    log('info', '🎯 Goal advancement notification:', notification)
  }

  /**
   * Handle goal checking
   */
  async function onCheckGoals(connections: Connection[]): Promise<void> {
    log('info', '🎯 Checking goals with connections:', connections.length)
    
    // Get the current game mode service
    const gameMode = gameOptions.value?.mode || 'hybrid'
    
    try {
      // Import the appropriate mode service
      let modeService: any = null
      
      switch (gameMode) {
        case 'hybrid':
          // @ts-ignore
          modeService = await import('../modes/HybridModeService.ts')
          break
        case 'goal':
          // @ts-ignore
          modeService = await import('../modes/GoalModeService.ts')
          break
        case 'knowledge':
          // @ts-ignore
          modeService = await import('../modes/KnowledgeModeService.ts')
          break
        case 'anti':
          // @ts-ignore
          modeService = await import('../modes/AntiModeService.ts')
          break
        case 'zen':
          // @ts-ignore
          modeService = await import('../modes/ZenModeService.ts')
          break
        default:
          log('warn', 'Unknown game mode:', gameMode)
          return
      }
      
      if (modeService && modeService.default) {
        const service = modeService.default
        
        // Update the service with current game state
        if (service.updateGameState) {
          service.updateGameState(gameItems.value, connections)
        }
        
        // Check win condition
        if (service.checkWinCondition) {
          const hasWon = await service.checkWinCondition()
          
          if (hasWon) {
            log('info', '🎉 WIN CONDITION MET!')
            
            // Get win message and progress
            const winMessage = service.getWinMessage ? service.getWinMessage() : 'You won!'
            const progress = service.getProgressDisplay ? service.getProgressDisplay() : ''
            
            // Emit win event
            emit('goal-completed', {
              type: 'win',
              message: winMessage,
              progress: progress,
              connections: connections
            })
          } else {
            // Update progress display
            const progress = service.getProgressDisplay ? service.getProgressDisplay() : ''
            if (progress) {
              log('info', 'Progress:', progress)
            }
          }
        }
      }
    } catch (error) {
      log('error', 'Error checking goals:', error)
    }
  }

  /**
   * Show path functionality
   */
  function onShowPath(resultModal: ResultModal): void {
    try {
      resultModal.value.visible = false
      bottomBarVisible.value = true
      // Reapply saved path highlight
      if (Array.isArray(savedWinPathIds.value) && savedWinPathIds.value.length > 0) {
        highlightPathIds.value = [...savedWinPathIds.value]
      }
    } catch (error) {
      log('error', 'Failed to show path:', error)
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
    if (Array.isArray(savedWinPathIds.value) && savedWinPathIds.value.length > 0) {
      highlightPathIds.value = [...savedWinPathIds.value]
    }
  }

  /**
   * Enter zen free play mode
   */
  function enterZenFreePlay(resultModal: ResultModal, gameMode: GameMode | null, gameBoard: GameBoard): void {
    try {
      resultModal.value.visible = false
      // Emit mode change event if needed
      // this.$emit('mode-changed', zenMode)
      if (gameMode && gameMode.id !== 'zen') {
        gameMode.id = 'zen'
      }
      if (gameBoard && typeof gameBoard.checkGoalCompletion === 'function') {
        gameBoard.checkGoalCompletion()
      }
      // Show bottom bar and clear highlight when entering Free Play from modal
      bottomBarVisible.value = true
      highlightPathIds.value = []
    } catch (error) {
      log('error', 'Failed to enter zen free play:', error)
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
    handleCheckGoals: onCheckGoals,
    handleShowPath: onShowPath,
    handleHidePathFromBar: hidePathFromBar,
    handleReShowPath: reShowPath,
    enterZenFreePlay
  }
}
