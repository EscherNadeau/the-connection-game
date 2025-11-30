<template>
  <div class="leaderboard-overlay" @click.self="$emit('close')">
    <div class="leaderboard-panel">
      <div class="panel-header">
        <h2 class="panel-title">🏆 Leaderboard</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <div class="leaderboard-content">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button class="retry-btn" @click="loadData">Retry</button>
        </div>

        <div v-else-if="currentData.length === 0" class="empty-state">
          <div class="empty-icon">🎮</div>
          <p>No players on the leaderboard yet!</p>
          <p class="empty-hint">Be the first to play and claim your spot.</p>
        </div>

        <div v-else class="leaderboard-list">
          <div 
            v-for="(player, index) in currentData" 
            :key="player.userId"
            class="leaderboard-row"
            :class="{ 
              'top-1': index === 0,
              'top-2': index === 1,
              'top-3': index === 2,
              'is-current-user': player.userId === currentUserId
            }"
          >
            <div class="rank">
              <span v-if="index === 0" class="rank-medal">🥇</span>
              <span v-else-if="index === 1" class="rank-medal">🥈</span>
              <span v-else-if="index === 2" class="rank-medal">🥉</span>
              <span v-else class="rank-number">{{ index + 1 }}</span>
            </div>

            <div class="player-info">
              <div class="avatar" :style="getAvatarStyle(player)">
                <img v-if="player.avatarUrl" :src="player.avatarUrl" :alt="getDisplayName(player)" />
                <span v-else class="avatar-initials">{{ getInitials(player) }}</span>
              </div>
              <div class="player-name">{{ getDisplayName(player) }}</div>
            </div>

            <div class="stat-value">
              <span class="stat-number">{{ getStatValue(player) }}</span>
              <span class="stat-label">{{ getStatLabel() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { databaseService } from '../../services/database/DatabaseService'
import { useAuth } from '../../composables/useAuth'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { user } = useAuth()

interface PlayerData {
  userId: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  totalWins?: number
  totalGamesPlayed?: number
  totalConnections?: number
}

const tabs = [
  { id: 'wins', label: 'Wins', icon: '🏆' },
  { id: 'games', label: 'Games', icon: '🎮' },
  { id: 'connections', label: 'Connections', icon: '🔗' },
]

const activeTab = ref('wins')
const loading = ref(true)
const error = ref<string | null>(null)

const winsData = ref<PlayerData[]>([])
const gamesData = ref<PlayerData[]>([])
const connectionsData = ref<PlayerData[]>([])

const currentUserId = computed(() => user.value?.id || null)

const currentData = computed(() => {
  switch (activeTab.value) {
    case 'wins': return winsData.value
    case 'games': return gamesData.value
    case 'connections': return connectionsData.value
    default: return []
  }
})

const getAvatarStyle = (player: PlayerData) => {
  if (player.avatarUrl) return {}
  
  const colors = [
    ['#e94560', '#c23a51'],
    ['#6366f1', '#4f46e5'],
    ['#8b5cf6', '#7c3aed'],
    ['#14b8a6', '#0d9488'],
    ['#f59e0b', '#d97706'],
  ]
  
  const index = player.userId ? 
    parseInt(player.userId.slice(-2), 16) % colors.length : 
    0
  const [start, end] = colors[index]
  
  return {
    background: `linear-gradient(135deg, ${start} 0%, ${end} 100%)`,
  }
}

const getDisplayName = (player: PlayerData) => {
  return player.displayName || player.username || 'Anonymous'
}

const getInitials = (player: PlayerData) => {
  const name = getDisplayName(player)
  return name.slice(0, 2).toUpperCase()
}

const getStatValue = (player: PlayerData) => {
  switch (activeTab.value) {
    case 'wins': return player.totalWins || 0
    case 'games': return player.totalGamesPlayed || 0
    case 'connections': return player.totalConnections || 0
    default: return 0
  }
}

const getStatLabel = () => {
  switch (activeTab.value) {
    case 'wins': return 'wins'
    case 'games': return 'games'
    case 'connections': return 'links'
    default: return ''
  }
}

const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    const [winsResult, gamesResult, connectionsResult] = await Promise.all([
      databaseService.getTopPlayersByWins(10),
      databaseService.getTopPlayersByGamesPlayed(10),
      databaseService.getTopPlayersByConnections(10),
    ])

    if (winsResult.error || gamesResult.error || connectionsResult.error) {
      error.value = 'Failed to load leaderboard data'
      return
    }

    winsData.value = winsResult.data
    gamesData.value = gamesResult.data
    connectionsData.value = connectionsResult.data
  } catch (err) {
    error.value = 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

// Reload when tab changes (in case of stale data)
watch(activeTab, () => {
  // Data is already loaded, no need to reload
})
</script>

<style scoped>
.leaderboard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.leaderboard-panel {
  background: linear-gradient(145deg, #1a2a1d, #0d1a10);
  border: 2px solid rgba(78, 205, 196, 0.3);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  font-family: 'Courier New', monospace;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.tabs {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.tab-btn.active {
  background: rgba(78, 205, 196, 0.2);
  border-color: rgba(78, 205, 196, 0.5);
  color: #4ecdc4;
}

.leaderboard-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(78, 205, 196, 0.2);
  border-top-color: #4ecdc4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: rgba(78, 205, 196, 0.2);
  border: 1px solid rgba(78, 205, 196, 0.5);
  border-radius: 8px;
  color: #4ecdc4;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: rgba(78, 205, 196, 0.3);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-hint {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 8px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.2s;
}

.leaderboard-row:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.leaderboard-row.top-1 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05));
  border-color: rgba(255, 215, 0, 0.3);
}

.leaderboard-row.top-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(192, 192, 192, 0.05));
  border-color: rgba(192, 192, 192, 0.3);
}

.leaderboard-row.top-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(205, 127, 50, 0.05));
  border-color: rgba(205, 127, 50, 0.3);
}

.leaderboard-row.is-current-user {
  border-color: rgba(78, 205, 196, 0.5);
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.2);
}

.rank {
  width: 32px;
  text-align: center;
}

.rank-medal {
  font-size: 1.5rem;
}

.rank-number {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
}

.player-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
}

.player-name {
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4ecdc4;
}

.stat-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Scrollbar */
.leaderboard-content::-webkit-scrollbar {
  width: 6px;
}

.leaderboard-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.leaderboard-content::-webkit-scrollbar-thumb {
  background: rgba(78, 205, 196, 0.3);
  border-radius: 3px;
}

.leaderboard-content::-webkit-scrollbar-thumb:hover {
  background: rgba(78, 205, 196, 0.5);
}
</style>

