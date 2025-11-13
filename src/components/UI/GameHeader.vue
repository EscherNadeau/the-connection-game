<template>
  <div class="game-header">
    <button class="back-button" @click="$emit('back')">← Back</button>
    <div class="spacer"></div>
    
    <!-- Center Stats -->
    <div v-if="showStats" class="center-stats">
      <div class="stats-row">
        <div v-for="stat in mainStats" :key="stat.label" class="stat-chip">
          <span class="stat-label">{{ stat.label }}:</span>
          <span class="stat-value">{{ stat.value }}</span>
        </div>
      </div>
      <div v-if="splitStats.length > 0" class="split-stats-row">
        <div v-for="stat in splitStats" :key="stat.label" class="split-stat-chip">
          <span class="split-stat-label">{{ stat.label }}:</span>
          <span class="split-stat-value">{{ stat.value }}</span>
        </div>
      </div>
      <div class="connections-row">
        <div class="connection-chip">
          <span class="connection-label">Connections:</span>
          <span class="connection-value">{{ connectionCount || 0 }}</span>
        </div>
      </div>
    </div>
    
    <div class="spacer"></div>
    <div class="viewport-controls">
      <div class="control-item" @click="$emit('reset-zoom')">
        <span class="control-label">Zoom:</span>
        <span class="control-value">{{ Math.round(viewport.scale * 100) }}%</span>
      </div>
      <div class="control-separator">|</div>
      <div class="control-item" @click="$emit('reset-pan')">
        <span class="control-label">Pan:</span>
        <span class="control-value">{{ Math.round(viewport.x) }}</span>
        <span class="control-value">{{ Math.round(viewport.y) }}</span>
      </div>
    </div>
    <div v-if="timerEnabled" class="timer-chip">{{ formatTime(timerRemaining) }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStateStore } from '@store/gameState.store'
import type { GameHeaderProps, GameHeaderEmits, GoalData, GameItem } from '../../types/game'

const props = defineProps<GameHeaderProps>()
const emit = defineEmits<GameHeaderEmits>()

const gs = useGameStateStore()
const { timerEnabled, timerRemaining, gameItems, connections, gameOptions } = storeToRefs(gs)

const formatTime = (total: number): string => {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Compute stats based on game mode
const mainStats = computed(() => {
  if (!props.gameMode) return []
  
  const connectionCount = connections.value?.length || 0
  const goals = (gameOptions.value && 'goals' in gameOptions.value ? (gameOptions.value.goals as GoalData[] | undefined) : undefined) || []
  const totalGoals = goals.length
  const completed = goals.filter((goal: GoalData) => goal.status === 'completed').length
  
  // Check if we're in queue mode (custom mode with goalQueue)
  const isQueueMode = props.gameMode === 'custom' && props.goalQueue && props.goalQueue.length > 0
  
  // Handle queue-based modes
  if (isQueueMode) {
    const currentGoal = props.goalQueue![props.currentGoalIndex!]
    const totalQueueGoals = props.goalQueue!.length
    const currentGoalNumber = props.currentGoalIndex! + 1
    
    switch (props.gameType) {
      case 'goal':
        return [
          { label: 'Goal', value: `${currentGoalNumber}/${totalQueueGoals}` },
          { label: 'Current', value: currentGoal?.title || 'Unknown' }
        ]
      
      case 'hybrid':
        const subGoalsCount = currentGoal?.subGoals?.length || 0
        return [
          { label: 'Goal', value: `${currentGoalNumber}/${totalQueueGoals}` },
          { label: 'Sub-goals', value: subGoalsCount },
          { label: 'Current', value: currentGoal?.title || 'Unknown' }
        ]
      
      case 'knowledge':
        const requiredConnections = currentGoal?.knowledgeCount || 3
        return [
          { label: 'Goal', value: `${currentGoalNumber}/${totalQueueGoals}` },
          { label: 'Connections', value: `${connectionCount}/${requiredConnections}` },
          { label: 'Current', value: currentGoal?.title || 'Unknown' }
        ]
      
      default:
        return [
          { label: 'Goal', value: `${currentGoalNumber}/${totalQueueGoals}` },
          { label: 'Current', value: currentGoal?.title || 'Unknown' }
        ]
    }
  }
  
  // Handle regular modes
  switch (props.gameMode) {
    case 'goal':
      // Show connections only in the dedicated connections row below
      return []
    
    case 'knowledge':
      const totalItems = gameItems.value?.length || 0
      const knowledgeTarget = Math.ceil(totalItems * 0.7)
      const knowledgeCurrent = Math.min(connectionCount, knowledgeTarget)
      return [
        { label: 'Knowledge', value: `${knowledgeCurrent}/${knowledgeTarget}` }
      ]
    
    case 'hybrid':
      return [
        { label: 'Goals', value: `${completed}/${totalGoals}` }
      ]
    
    case 'zen':
      return []
    
    case 'custom':
      return [
        { label: 'Goals', value: `${completed}/${totalGoals}` }
      ]
    
    case 'anti':
      const unconnected = (gameItems.value?.length || 0) - connectionCount
      const connected = connectionCount
      const total = gameItems.value?.length || 0
      return [
        { label: 'Unconnected', value: unconnected },
        { label: 'Connected', value: connected },
        { label: 'Total', value: total }
      ]
    
    default:
      return []
  }
})

const splitStats = computed(() => {
  if (!props.gameMode || props.gameMode === 'anti') return []
  
  const items: GameItem[] = gameItems.value || []
  const getType = (it: GameItem): string => it?.type || it?.tmdbData?.media_type || ''
  const isPerson = (it: GameItem): boolean => getType(it) === 'person'
  const isMovie = (it: GameItem): boolean => getType(it) === 'movie'
  const isTV = (it: GameItem): boolean => getType(it) === 'tv'
  const getGenderRaw = (it: GameItem): number | string | undefined => {
    return it?.tmdbData?.gender
  }
  const getGender = (it: GameItem): number | string | undefined => {
    const g = getGenderRaw(it)
    if (typeof g === 'string') return g.toLowerCase()
    return g
  }
  
  const actorCount = items.filter((it: GameItem) => isPerson(it) && (getGender(it) === 'male' || getGender(it) === 2)).length
  const actressCount = items.filter((it: GameItem) => isPerson(it) && (getGender(it) === 'female' || getGender(it) === 1)).length
  const movieCount = items.filter((it: GameItem) => isMovie(it)).length
  const tvCount = items.filter((it: GameItem) => isTV(it)).length
  
  return [
    { label: 'Actors', value: actorCount },
    { label: 'Actresses', value: actressCount },
    { label: 'Movies', value: movieCount },
    { label: 'TV Shows', value: tvCount }
  ]
})

const connectionCount = computed(() => connections.value?.length || 0)

// Watch for changes in gameItems to debug stats updates
watch(gameItems, (_newItems) => {
  // console.log('GameHeader: gameItems changed, new count:', newItems?.length || 0)
}, { immediate: true })

// Watch mainStats to see if it's updating
watch(mainStats, (_newStats) => {
  // console.log('GameHeader: mainStats changed:', newStats)
}, { immediate: true })
</script>

<style scoped>
.game-header { position: absolute; top: 0; left: 0; right: 0; display: flex; align-items: center; gap: 12px; padding: 1rem; background: transparent; pointer-events: none; z-index: 1000; }
.game-header > * { pointer-events: auto; }
.spacer {
  flex: 1;
}
.background-button {
  padding: 0.5rem 1rem;
  background: var(--glass-bg);
  color: white;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  cursor: pointer;
}
.glass-btn { padding: 0.5rem; margin-left: 8px; background: var(--glass-bg); color: white; border: 1px solid var(--glass-border); border-radius: 8px; cursor: pointer; }
.back-button {
  padding: 0.5rem 0.8rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}
.back-button:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}
.timer-chip {
  padding: 0.5rem 0.8rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  font-size: 0.85rem;
}
.viewport-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
  flex-shrink: 0;
}
.control-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  padding: 0.5rem 0.8rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  min-width: 120px;
  justify-content: center;
  flex-wrap: nowrap;
  font-weight: 600;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  font-size: 0.85rem;
}
.control-item:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}
.control-separator {
  opacity: 0.5;
  font-weight: 300;
}
.control-label {
  font-weight: 500;
  opacity: 0.8;
  font-size: 0.9rem;
}
.control-value {
  font-weight: 600;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  width: 40px;
  text-align: center;
  display: inline-block;
  flex-shrink: 0;
}

/* Center Stats */
.center-stats {
  position: absolute;
  left: 50%;
  top: 80%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  max-width: 600px;
  pointer-events: none;
}

.stats-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.split-stats-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  opacity: 0.8;
}

.connections-row {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.25rem 0.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  font-size: 0.85rem;
  white-space: nowrap;
}


.split-stat-chip {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 0.2rem 0.4rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
}

.stat-label, .split-stat-label {
  font-weight: 500;
  opacity: 0.8;
  color: white;
}

.stat-value, .split-stat-value {
  font-weight: 600;
  color: white;
  font-family: 'Courier New', monospace;
}

.connection-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  font-size: 0.85rem;
  white-space: nowrap;
}

.connection-label {
  font-weight: 500;
  opacity: 0.9;
  color: white;
}

.connection-value {
  font-weight: 600;
  color: white;
  font-family: 'Courier New', monospace;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .stats-row {
    gap: 8px;
  }
  
  .split-stats-row {
    gap: 6px;
  }
  
  .stat-chip {
    font-size: 0.8rem;
    padding: 0.2rem 0.4rem;
  }
  
  .split-stat-chip {
    font-size: 0.75rem;
    padding: 0.15rem 0.3rem;
  }
}

@media (max-width: 900px) {
  .center-stats {
    display: none;
  }
}
</style>
