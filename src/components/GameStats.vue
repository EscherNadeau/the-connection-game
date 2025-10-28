<template>
  <div class="game-stats" :class="{ 'mobile': isMobile }">
    <!-- Anti Mode Stats -->
    <div v-if="gameMode === 'anti'" class="stats-section">
      <div class="stat-item critical">
        <div class="stat-label">Unconnected</div>
        <div class="stat-value">{{ unconnectedCount }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Connected</div>
        <div class="stat-value">{{ connectedCount }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Total</div>
        <div class="stat-value">{{ totalItems }}</div>
      </div>
    </div>

    <!-- Goal Mode Stats -->
    <div v-else-if="gameMode === 'goal'" class="stats-section">
      <div class="stat-item">
        <div class="stat-label">Connections</div>
        <div class="stat-value">{{ connectionCount }}</div>
      </div>
    </div>

    <!-- Knowledge Mode Stats -->
    <div v-else-if="gameMode === 'knowledge'" class="stats-section">
      <div class="stat-item">
        <div class="stat-label">Knowledge</div>
        <div class="stat-value">{{ knowledgeCurrent }}/{{ knowledgeTarget }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Connections</div>
        <div class="stat-value">{{ connectionCount }}</div>
      </div>
    </div>

    <!-- Hybrid Mode Stats -->
    <div v-else-if="gameMode === 'hybrid'" class="stats-section">
      <div class="stat-item">
        <div class="stat-label">Goals</div>
        <div class="stat-value">{{ completedGoals }}/{{ totalGoals }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Connections</div>
        <div class="stat-value">{{ connectionCount }}</div>
      </div>
    </div>

    <!-- Zen Mode Stats -->
    <div v-else-if="gameMode === 'zen'" class="stats-section">
      <div class="stat-item">
        <div class="stat-label">Connections</div>
        <div class="stat-value">{{ connectionCount }}</div>
      </div>
    </div>

    <!-- Custom Mode Stats -->
    <div v-else-if="gameMode === 'custom'" class="stats-section">
      <div class="stat-item">
        <div class="stat-label">Goals</div>
        <div class="stat-value">{{ completedGoals }}/{{ totalGoals }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Connections</div>
        <div class="stat-value">{{ connectionCount }}</div>
      </div>
    </div>

    <!-- Split Stats - Show on all modes -->
    <div v-if="gameMode !== 'anti'" class="split-stats-section">
      <div class="stat-item">
        <div class="stat-label">Actors</div>
        <div class="stat-value">{{ actorCount }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Actresses</div>
        <div class="stat-value">{{ actressCount }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Movies</div>
        <div class="stat-value">{{ movieCount }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">TV Shows</div>
        <div class="stat-value">{{ tvCount }}</div>
      </div>
    </div>

    <!-- Timer (if enabled) -->
    <div v-if="timerEnabled" class="timer-section">
      <div class="stat-item timer" :class="{ 'warning': timerRemaining < 60, 'critical': timerRemaining < 30 }">
        <div class="stat-label">Time</div>
        <div class="stat-value">{{ formatTime(timerRemaining) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore
import { useGameStateStore } from '../store/gameState.store.ts'
import { storeToRefs } from 'pinia'
import type { GameStatsProps } from '../types/game'

// @ts-ignore
const gameStateStore = useGameStateStore()
const { gameItems, connections, timerEnabled, timerRemaining } = storeToRefs(gameStateStore)

const props = withDefaults(defineProps<GameStatsProps>(), {
  gameMode: 'goal',
  isMobile: false
})

// Computed properties
const totalItems = computed(() => {
  return gameItems.value?.length || 0
})

const connectionCount = computed(() => {
  return connections.value?.length || 0
})

// Anti mode stats
const unconnectedCount = computed(() => {
  if (props.gameMode !== 'anti') return 0
  return gameItems.value?.filter((item: any) => !isItemConnected(item)).length || 0
})

const connectedCount = computed(() => {
  if (props.gameMode !== 'anti') return 0
  return gameItems.value?.filter((item: any) => isItemConnected(item)).length || 0
})

// Goal mode stats - just show connections made
const completedGoals = computed(() => {
  if (props.gameMode !== 'goal') return 0
  // For now, just show connections as progress indicator
  return connectionCount.value
})

const totalGoals = computed(() => {
  if (props.gameMode !== 'goal') return 0
  // Show total items as potential goals
  return totalItems.value
})

// Knowledge mode stats
const knowledgeCurrent = computed(() => {
  if (props.gameMode !== 'knowledge') return 0
  // Show connections made as knowledge progress
  return connectionCount.value
})

const knowledgeTarget = computed(() => {
  if (props.gameMode !== 'knowledge') return 0
  // Show total items as knowledge target
  return totalItems.value
})

// Zen mode fun stats
const actorCount = computed(() => {
  if (props.gameMode !== 'zen') return 0
  return gameItems.value?.filter((item: any) => item.type === 'person' && item.gender === 'male').length || 0
})

const actressCount = computed(() => {
  if (props.gameMode !== 'zen') return 0
  return gameItems.value?.filter((item: any) => item.type === 'person' && item.gender === 'female').length || 0
})

const movieCount = computed(() => {
  if (props.gameMode !== 'zen') return 0
  return gameItems.value?.filter((item: any) => item.type === 'movie').length || 0
})

const tvCount = computed(() => {
  if (props.gameMode !== 'zen') return 0
  return gameItems.value?.filter((item: any) => item.type === 'tv').length || 0
})

// Methods
const isItemConnected = (item: any) => {
  if (!connections.value || !item) return false
  return connections.value.some((conn: any) => 
    conn.from === item.id || conn.to === item.id
  )
}

const formatTime = (seconds: number) => {
  if (!seconds || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.game-stats {
  position: fixed;
  top: 80px;
  right: 20px;
  background: rgba(0, 255, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  z-index: 1000;
  min-width: 180px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.game-stats.mobile {
  position: relative;
  top: auto;
  right: auto;
  left: auto;
  margin: 0;
  padding: 12px 16px;
  min-width: auto;
  font-size: 0.9rem;
  width: 100%;
  border-radius: 0;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timer-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.split-stats-section {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.8;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.stat-item.critical {
  background: rgba(255, 0, 0, 0.2);
  border-radius: 6px;
  padding: 6px 8px;
  margin: -2px 0;
}

.stat-item.warning {
  background: rgba(255, 165, 0, 0.2);
  border-radius: 6px;
  padding: 6px 8px;
  margin: -2px 0;
}

.stat-item.timer {
  font-weight: 600;
  font-size: 1.1em;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85em;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  color: #4ecdc4;
  font-weight: 600;
  font-size: 1.1em;
}

.stat-item.critical .stat-value {
  color: #ff6b6b;
}

.stat-item.warning .stat-value {
  color: #ffa726;
}

/* Mobile adjustments */
.game-stats.mobile .stats-section {
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: space-around;
}

.game-stats.mobile .split-stats-section {
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: space-around;
  flex-wrap: wrap;
}

.game-stats.mobile .stat-item {
  flex-direction: row;
  text-align: center;
  gap: 4px;
  justify-content: center;
}

.game-stats.mobile .stat-label {
  font-size: 0.75em;
}

.game-stats.mobile .stat-value {
  font-size: 1em;
}
</style>
