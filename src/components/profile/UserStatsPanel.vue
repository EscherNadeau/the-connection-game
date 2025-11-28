<template>
  <div class="stats-panel">
    <div class="stats-header">
      <h2>📊 Your Stats</h2>
      <button v-if="!isLoading" class="refresh-btn" @click="refresh" title="Refresh">
        🔄
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <span>Loading stats...</span>
    </div>

    <!-- No Stats -->
    <div v-else-if="!stats" class="no-stats">
      <p>No games played yet!</p>
      <p class="hint">Play some games to see your stats here.</p>
    </div>

    <!-- Stats Grid -->
    <div v-else class="stats-grid">
      <!-- Games Played -->
      <div class="stat-card primary">
        <div class="stat-icon">🎮</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalGamesPlayed }}</div>
          <div class="stat-label">Games Played</div>
        </div>
      </div>

      <!-- Win Rate -->
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-info">
          <div class="stat-value" :style="{ color: getWinRateColor(stats.winRate) }">
            {{ stats.winRate }}%
          </div>
          <div class="stat-label">Win Rate</div>
        </div>
        <div class="stat-detail">
          {{ stats.totalWins }}W / {{ stats.totalLosses }}L
        </div>
      </div>

      <!-- Connections Made -->
      <div class="stat-card">
        <div class="stat-icon">🔗</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalConnectionsMade }}</div>
          <div class="stat-label">Connections Made</div>
        </div>
      </div>

      <!-- Time Played -->
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-info">
          <div class="stat-value">{{ formatDuration(stats.totalTimePlayed) }}</div>
          <div class="stat-label">Total Time</div>
        </div>
        <div class="stat-detail">
          Avg: {{ formatDuration(stats.averageGameTime) }}/game
        </div>
      </div>

      <!-- Win Streak -->
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.currentWinStreak }}</div>
          <div class="stat-label">Current Streak</div>
        </div>
        <div class="stat-detail">
          Best: {{ stats.longestWinStreak }}
        </div>
      </div>

      <!-- Favorite Mode -->
      <div class="stat-card" v-if="stats.favoriteMode">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <div class="stat-value mode">{{ formatMode(stats.favoriteMode) }}</div>
          <div class="stat-label">Favorite Mode</div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="stat-card wide">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <div class="stat-label">Recent Activity</div>
          <div class="activity-row">
            <span>This week: <strong>{{ stats.gamesThisWeek }}</strong></span>
            <span>This month: <strong>{{ stats.gamesThisMonth }}</strong></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserProfile } from '../../composables/useUserProfile'

const { stats, isLoading, loadStats, formatDuration, getWinRateColor } = useUserProfile()

function formatMode(mode: string): string {
  const modes: Record<string, string> = {
    goal: 'Goal',
    hybrid: 'Hybrid',
    knowledge: 'Knowledge',
    anti: 'Anti',
    zen: 'Zen',
    custom: 'Custom',
  }
  return modes[mode] || mode
}

async function refresh() {
  await loadStats()
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.stats-panel {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.stats-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: white;
}

.refresh-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(180deg);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #4ecdc4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-stats {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.no-stats .hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  opacity: 0.7;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-card.primary {
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(78, 205, 196, 0.05));
  border-color: rgba(78, 205, 196, 0.3);
}

.stat-card.wide {
  grid-column: span 2;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.stat-value.mode {
  font-size: 1.1rem;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-detail {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.activity-row {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.activity-row strong {
  color: #4ecdc4;
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .stat-card.wide {
    grid-column: span 2;
  }
}
</style>

