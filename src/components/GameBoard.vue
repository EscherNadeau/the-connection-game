<template>
  <div
    class="game-board-container"
    @mousedown="startBoardPan"
    @mousemove="onBoardPan"
    @mouseup="stopBoardPan"
    @wheel="onWheel"
    @mouseleave="stopBoardPan"
  >
    <!-- Game Board Layout (All Modes) -->
    <div class="game-board-viewport" :style="viewportStyle">
      <!-- Dot Grid Background -->
      <div class="dot-grid-background" :style="gridStyle"></div>

      <!-- Connection Lines -->
      <ConnectionLayer :connections="connections" :highlight-path-ids="highlightPathIds || []" />

      <!-- Game Items will be rendered here -->
      <div class="game-items">
        <GameItem
          v-for="(item, index) in gameItems"
          :key="item.id || index"
          :item="item"
          :index="index"
          :hints-enabled="hintsEnabled"
          :highlight-path-ids="highlightPathIds || []"
          :item-state="getItemState(item)"
          :is-queue-mode="isQueueMode"
          @mousedown="startItemDrag"
          @mouseup="onItemMouseUp"
          @mousemove="onItemMouseMove"
          @hint-click="onItemHintClick"
        />
      </div>
      
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RuleEnforcementService } from '@/services/game/RuleEnforcementService.ts'
import connectionService from '@/services/game/ConnectionService.ts'
import connectionEngine from '@/services/ConnectionEngineService.ts'
import physicsService from '@/services/game/physicsService.ts'
import notify from '@/services/ui/NotifyService.ts'
import { normalizeMediaType, getGenderDisplayLabel, GENDERS } from '@/utils/constants.ts'
import { useGameStateStore } from '@store/gameState.store.ts'
import GameItem from './GameItem.vue'
import ConnectionLayer from './ConnectionLayer.vue'
import { shortestPathNodes } from '@/utils/graph.ts'
import { debug, warn, error as logError } from '../services/ui/log.ts'
import type { GameItem as GameItemType, Connection, GameBoardProps, GameBoardEmits } from '../types/game'

const props = defineProps<GameBoardProps>()
const emit = defineEmits<GameBoardEmits>()

// Reactive data
const lastMousePos = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const viewport = ref<{ x: number, y: number, scale: number }>({
        x: 0,
        y: 0,
        scale: 1,
})
const minScale = ref<number>(0.3)
const maxScale = ref<number>(2)
const gameItems = ref<GameItemType[]>([])
const connections = ref<Connection[]>([])

const animationFrameId = ref<number | null>(null)
const isPanning = ref<boolean>(false)

const isDraggingItem = ref<boolean>(false)
const spawnIndex = ref<number>(0)

      // Auto-connect system
const autoConnectIntervalId = ref<ReturnType<typeof setInterval> | null>(null)

      // Mouse drag system
const dragState = ref<{
  isDragging: boolean
  dragItem: GameItemType | null
  dragIndex: number
  startX: number
  startY: number
  offsetX: number
  offsetY: number
}>({
        isDragging: false,
        dragItem: null,
        dragIndex: -1,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
})

// Computed properties
const viewportStyle = computed(() => {
      return {
    transform: `translate(${viewport.value.x}px, ${viewport.value.y}px) scale(${viewport.value.scale})`,
        transformOrigin: `0 0`,
      }
})

const gridStyle = computed(() => ({
  transform: `translate(${viewport.value.x}px, ${viewport.value.y}px) scale(${viewport.value.scale})`,
  transformOrigin: '0 0',
  backgroundSize: `${30 / viewport.value.scale}px ${30 / viewport.value.scale}px`,
}))

const hintsEnabled = computed(() => {
      // Anti Mode should never have hints enabled
  if (props.gameMode?.id === 'anti') {
        return false
      }
      
  // Default to true for now since modeSettings structure may vary
  return true
})

const isQueueMode = computed(() => {
  return props.goalQueue && props.goalQueue.length > 0
})

// Methods
function getItemState(item: GameItemType): string {
  if (!isQueueMode.value || !props.goalQueue || !Array.isArray(props.goalQueue)) {
        return 'active' // Normal mode - all items active
      }

      // Determine item state based on goal queue
  const goalIndex = getGoalIndexForItem(item)
      
      if (goalIndex === null) {
        return 'active' // Item not part of any goal
      }
      
  if (goalIndex < props.currentGoalIndex) {
        return 'completed' // Previous goal - dimmed/locked
  } else if (goalIndex === props.currentGoalIndex) {
        return 'current' // Current goal - active
      } else {
        return 'upcoming' // Future goal - hidden
      }
}

function getGoalIndexForItem(item: GameItemType): number | null {
  if (!props.goalQueue || !Array.isArray(props.goalQueue) || !item) {
        return null
      }
      
      // Find which goal this item belongs to
  for (let i = 0; i < props.goalQueue.length; i++) {
    const goal = props.goalQueue[i]
        
        if (!goal) continue
        
        // Check if item matches goal's starting item
    if ((goal.id && item.id && goal.id === item.id) || (goal.description && item.name && goal.description === item.name)) {
            return i
          }
        }
        
      return null
}

function startBoardPan(event: MouseEvent): void {
  // Don't start panning if clicking on an item (items handle their own interactions)
  const target = event.target as HTMLElement
  if (target.closest('.game-item')) {
    // Items handle their own drag - don't start board pan
        return
      }

  // Allow left-click (button 0) for panning when clicking empty space only
  // Only start panning if not dragging an item
  if (!isDraggingItem.value && !dragState.value.isDragging) {
    // Left-click (button 0) now pans the board when clicking empty space
    if (event.button === 0) {
      isPanning.value = true
      lastMousePos.value = { x: event.clientX, y: event.clientY }
      event.preventDefault()
      event.stopPropagation()
    }
  }
}

function onBoardPan(event: MouseEvent): void {
  if (isPanning.value) {
    const deltaX = event.clientX - lastMousePos.value.x
    const deltaY = event.clientY - lastMousePos.value.y
    
    viewport.value.x += deltaX
    viewport.value.y += deltaY
    
    lastMousePos.value = { x: event.clientX, y: event.clientY }
    emit('viewport-changed', viewport.value)
  }
}

function stopBoardPan(): void {
  isPanning.value = false
}

function onWheel(event: WheelEvent): void {
  event.preventDefault()
  
  const zoomFactor = 0.05 // Reduced from 0.1 for smoother zooming
  const delta = event.deltaY > 0 ? -zoomFactor : zoomFactor
  const newScale = Math.max(minScale.value, Math.min(maxScale.value, viewport.value.scale + delta))
  
  if (newScale !== viewport.value.scale) {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    const scaleRatio = newScale / viewport.value.scale
    viewport.value.x = mouseX - (mouseX - viewport.value.x) * scaleRatio
    viewport.value.y = mouseY - (mouseY - viewport.value.y) * scaleRatio
    viewport.value.scale = newScale
    
    emit('viewport-changed', viewport.value)
  }
}

function startItemDrag(event: MouseEvent, item: GameItemType, index: number): void {
  if (event.button !== 0) return // Only left mouse button
  
  // Set dragging state on the item
  item.isDragging = true
  
  // Get the game board container rect for proper coordinate calculation
  const gameBoardContainer = document.querySelector('.game-board-container') as HTMLElement
  const containerRect = gameBoardContainer.getBoundingClientRect()
  const mouseX = event.clientX - containerRect.left
  const mouseY = event.clientY - containerRect.top
  
  dragState.value = {
        isDragging: true,
        dragItem: item,
        dragIndex: index,
        startX: event.clientX,
        startY: event.clientY,
    // Store the initial offset between mouse and item center
    offsetX: mouseX - item.x * viewport.value.scale,
    offsetY: mouseY - item.y * viewport.value.scale,
  }
  
  isDraggingItem.value = true
  event.preventDefault()
}

function onItemMouseMove(event: MouseEvent): void {
  // This function is called by individual items, but we'll handle it globally
  handleGlobalMouseMove(event)
}

function handleGlobalMouseMove(event: MouseEvent): void {
  if (dragState.value.isDragging && dragState.value.dragItem) {
    // Get the game board container rect for proper coordinate calculation
    const gameBoardContainer = document.querySelector('.game-board-container') as HTMLElement
    const containerRect = gameBoardContainer.getBoundingClientRect()
    const mouseX = event.clientX - containerRect.left
    const mouseY = event.clientY - containerRect.top
    
    // Calculate new position accounting for zoom and initial offset
    const newX = (mouseX - dragState.value.offsetX) / viewport.value.scale
    const newY = (mouseY - dragState.value.offsetY) / viewport.value.scale
    
    // Update item position
    dragState.value.dragItem.x = newX
    dragState.value.dragItem.y = newY
  }
}

function handleGlobalMouseUp(event: MouseEvent): void {
  if (dragState.value.isDragging && dragState.value.dragItem) {
    // Get the game board container rect for proper coordinate calculation
    const gameBoardContainer = document.querySelector('.game-board-container') as HTMLElement
    const containerRect = gameBoardContainer.getBoundingClientRect()
    const mouseX = event.clientX - containerRect.left
    const mouseY = event.clientY - containerRect.top
    
    // Calculate final position accounting for zoom and initial offset
    const finalX = (mouseX - dragState.value.offsetX) / viewport.value.scale
    const finalY = (mouseY - dragState.value.offsetY) / viewport.value.scale
    
    // Apply final position
    dragState.value.dragItem.x = finalX
    dragState.value.dragItem.y = finalY
    
    // Clear dragging state on the item
    dragState.value.dragItem.isDragging = false
    
    emit('item-moved', {
      item: dragState.value.dragItem,
      deltaX: finalX - dragState.value.dragItem.x,
      deltaY: finalY - dragState.value.dragItem.y,
    })
    
    // Reset drag state
    dragState.value = {
        isDragging: false,
        dragItem: null,
        dragIndex: -1,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
      }

    isDraggingItem.value = false
  }
}

function onItemMouseUp(event: MouseEvent): void {
  // This function is called by individual items, but we'll handle it globally
  handleGlobalMouseUp(event)
}

function onItemHintClick(item: GameItemType): void {
  emit('hint-requested', item)
}

async function addItem(item: GameItemType): Promise<void> {
  // Generate spawn position
  const spawnPos = getSpawnPosition()
  item.x = spawnPos.x
  item.y = spawnPos.y
  
  gameItems.value.push(item)
  
  // Start auto-connect system
  startAutoConnect()
  
  // Immediately check for connections with existing items (regardless of distance)
  for (const existingItem of gameItems.value) {
    if (existingItem.id === item.id) continue // Skip self
    
    // Check if connection already exists
    const existingConnection = connections.value.find(conn => 
      (conn.from === item.id && conn.to === existingItem.id) ||
      (conn.from === existingItem.id && conn.to === item.id)
    )
    
    if (!existingConnection) {
      // Check if items are actually related
      try {
        const areRelated = await connectionService.checkIfItemsAreRelated(item, existingItem)
        if (areRelated) {
          debug('Auto-connecting items', { 
            from: item.name || item.title, 
            to: existingItem.name || existingItem.title 
          })
          createConnection(item, existingItem)
        }
      } catch (err) {
        warn('Immediate connection check failed', { error: err })
      }
    }
  }
  
  emit('item-added', { item })
}

function getSpawnPosition(): { x: number, y: number } {
  // Get the game board container to calculate center
  const gameBoardContainer = document.querySelector('.game-board-container') as HTMLElement
  if (!gameBoardContainer) {
    // Fallback to default center if container not found
    const baseX = 400
    const baseY = 300
    return { x: baseX, y: baseY }
  }
  
  const containerRect = gameBoardContainer.getBoundingClientRect()
  const centerX = containerRect.width / 2
  const centerY = containerRect.height / 2
  
  // Account for current viewport offset and zoom
  const baseX = (centerX - viewport.value.x) / viewport.value.scale
  const baseY = (centerY - viewport.value.y) / viewport.value.scale
  
  const angle = (spawnIndex.value * 137.5) % 360 // Golden angle
  const radius = Math.sqrt(spawnIndex.value) * 50
  
  spawnIndex.value++
  
  return {
    x: baseX + Math.cos(angle * Math.PI / 180) * radius,
    y: baseY + Math.sin(angle * Math.PI / 180) * radius,
  }
}

function createConnection(from: GameItemType, to: GameItemType): void {
  const connection: Connection = {
    id: `conn-${Date.now()}`,
    from: from.id,
    to: to.id,
    fromItem: from, // Add the actual item objects
    toItem: to,     // Add the actual item objects
    type: 'custom',
  }
  
  connections.value.push(connection)
  emit('connection-created', { connection, from, to })
  
  // Check for goal completion
  checkGoalCompletion()
}

function checkGoalCompletion(): void {
  // Don't check goals in Zen/Free Play mode
  if (props.gameMode?.id === 'zen') {
    debug('Skipping goal check in Zen/Free Play mode')
    return
  }
  debug('checkGoalCompletion called', { connectionCount: connections.value.length })
  emit('check-goals', connections.value)
}

async function isValidConnection(item1: GameItemType, item2: GameItemType): Promise<boolean> {
  try {
    // Check if items can connect based on type
    if (!connectionService.canItemsConnect(item1, item2)) {
          return false
      }
    
    // Check if items are actually related
    const areRelated = await connectionService.checkIfItemsAreRelated(item1, item2)
    return areRelated
  } catch (err) {
    warn('Connection validation failed', { error: err })
    return false
  }
}

function startAutoConnect(): void {
  if (autoConnectIntervalId.value) return
  
  autoConnectIntervalId.value = setInterval(async () => {
    await autoConnectTick()
  }, 1000)
}

async function autoConnectTick(): Promise<void> {
  // Auto-connect logic: check if any items are close enough AND related
  if (gameItems.value.length < 2) return
  
  for (let i = 0; i < gameItems.value.length; i++) {
    for (let j = i + 1; j < gameItems.value.length; j++) {
      const item1 = gameItems.value[i]
      const item2 = gameItems.value[j]
      
      // TypeScript safety check
      if (!item1 || !item2) continue
      
      // Check if items are close enough (within 100 pixels)
      const distance = Math.sqrt(
        Math.pow(item1.x - item2.x, 2) + Math.pow(item1.y - item2.y, 2)
      )
      
      if (distance < 100) {
        // Check if connection already exists
        const existingConnection = connections.value.find(conn => 
          (conn.from === item1.id && conn.to === item2.id) ||
          (conn.from === item2.id && conn.to === item1.id)
        )
        
        if (!existingConnection) {
          // Check if items are actually related using ConnectionService
          try {
            const areRelated = await connectionService.checkIfItemsAreRelated(item1, item2)
            if (areRelated) {
              createConnection(item1, item2)
            }
          } catch (err) {
            // If relationship check fails, don't create connection
            debug('Relationship check failed during auto-connect', { error: err })
          }
        }
      }
    }
  }
}

// Lifecycle
onMounted(() => {
  // Initialize ConnectionService with game options and items
  const gameOptions = props.gameOptions || {}
  connectionService.initialize(gameOptions, gameItems.value, connections.value)
  debug('ConnectionService initialized', { 
    itemCount: gameItems.value.length, 
    connectionCount: connections.value.length 
  })
  
  // Initialize starting items
  if (props.startingItems && props.startingItems.length > 0) {
    props.startingItems.forEach(item => {
      addItem(item)
    })
  }
  
  // Start physics service
  physicsService.start(
    () => gameItems.value, // getGameItems callback
    () => {
      // onUpdate callback - physics service will call this when items move
      // We can add any additional update logic here if needed
    }
  )
  
  // Add global mouse event listeners for smooth dragging
  document.addEventListener('mousemove', handleGlobalMouseMove)
  document.addEventListener('mouseup', handleGlobalMouseUp)
  
  emit('game-started')
})

onBeforeUnmount(() => {
  if (autoConnectIntervalId.value) {
    clearInterval(autoConnectIntervalId.value)
  }
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  
  // Remove global mouse event listeners
  document.removeEventListener('mousemove', handleGlobalMouseMove)
  document.removeEventListener('mouseup', handleGlobalMouseUp)

    // Stop physics service
    physicsService.stop()
})

function resetZoom(): void {
  viewport.value.scale = 1
  emit('viewport-changed', viewport.value)
}

function resetPan(): void {
  viewport.value.x = 0
  viewport.value.y = 0
  emit('viewport-changed', viewport.value)
}

// Expose methods for parent component
defineExpose({
  addItem,
  createConnection,
  isValidConnection,
  checkGoalCompletion,
  resetZoom,
  resetPan,
  gameItems,
  connections,
})
</script>

<style scoped>
.game-board-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
}

.game-board-container:active {
  cursor: grabbing;
}

.game-board-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
}

.dot-grid-background {
  position: absolute;
  top: -3000px;
  left: -3000px;
  width: calc(100% + 6000px);
  height: calc(100% + 6000px);
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
  background-repeat: repeat;
  background-size: 30px 30px;
  pointer-events: none;
  z-index: -1;
  /* Ensure grid stays visible at all zoom levels */
  transform-origin: 0 0;
}

.game-items {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>
