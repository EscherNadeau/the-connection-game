<template>
  <transition name="wl-fade">
    <div v-if="visible" class="wl-overlay">
      <div class="wl-card" :class="type">
        <div class="wl-title">{{ title }}</div>
        <div v-if="subtitle" class="wl-subtitle">{{ subtitle }}</div>
        <div v-if="stats" class="wl-stats">
          <!-- PvP Results -->
          <div v-if="type === 'pvp_results'" class="wl-pvp-results">
            <div class="wl-pvp-title">🏆 Competition Results</div>
            <div v-for="(result, index) in stats.results" :key="result.playerId" class="wl-pvp-player" :class="{ 'wl-pvp-winner': index === 0 }">
              <div class="wl-pvp-rank">{{ index + 1 }}</div>
              <div class="wl-pvp-info">
                <div class="wl-pvp-name">Player {{ result.playerId.slice(-4) }}</div>
                <div class="wl-pvp-score">Score: {{ result.score }} | Time: {{ formatTime(result.time) }}</div>
              </div>
            </div>
          </div>
          <!-- Regular Stats -->
          <div v-else-if="stats.unconnectedCount !== undefined" class="wl-stat">
            Unconnected items: {{ stats.unconnectedCount }}
          </div>
        </div>
        <div class="wl-actions">
          <!-- PvP Results mode: Show New Game only -->
          <template v-if="type === 'pvp_results'">
            <button class="wl-button wl-primary" @click="$emit('new-game')">New Game</button>
          </template>
          <!-- Shows mode: Show Next Episode instead of New Game/Free Play -->
          <template v-else-if="isPlaylistMode">
            <button class="wl-button" @click="$emit('next-episode')" v-if="hasNextEpisode">Next Episode</button>
            <button class="wl-button" @click="$emit('show-path')" v-if="type==='win'">Show Path</button>
            <button class="wl-button" @click="$emit('finish-show')" v-if="!hasNextEpisode">Finish Show</button>
            <button class="wl-button" @click="$emit('new-game')">New Game</button>
          </template>
          <!-- Normal mode: Show New Game and Free Play -->
          <template v-else>
            <button class="wl-button" @click="$emit('new-game')">New Game</button>
            <button class="wl-button" @click="$emit('show-path')" v-if="type==='win'">Show Path</button>
            <button class="wl-button wl-primary" @click="$emit('freeplay')">Free Play</button>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WinLoseModalProps, WinLoseModalEmits } from '../../types/game'

const props = defineProps<WinLoseModalProps>()
const emit = defineEmits<WinLoseModalEmits>()

const isPlaylistMode = computed(() => {
  return props.gameMode && props.gameMode.showData && props.gameMode.showData.episodes
})

const hasNextEpisode = computed(() => {
  if (!isPlaylistMode.value) return false
  const currentIndex = props.gameMode!.showData!.currentEpisodeIndex || 0
  const totalEpisodes = props.gameMode!.showData!.totalEpisodes || 0
  return currentIndex + 1 < totalEpisodes
})

const formatTime = (total: number): string => {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.wl-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.wl-card {
  min-width: 320px;
  max-width: 520px;
  padding: 24px;
  border-radius: 14px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(18px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  text-align: center;
}
.wl-card.lose {
  border-color: #f44336;
}
.wl-card.win {
  border-color: #4caf50;
}
.wl-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 6px;
}
.wl-subtitle {
  opacity: 0.9;
  margin-bottom: 12px;
}
.wl-stats {
  margin: 8px 0 12px;
}
.wl-stat {
  opacity: 0.85;
  margin: 4px 0;
}
.wl-actions {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.wl-button {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
}
.wl-button:hover {
  background: rgba(255, 255, 255, 0.25);
}
.wl-primary {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.25);
}
.wl-primary:hover {
  background: rgba(76, 175, 80, 0.35);
}

.wl-fade-enter-active,
.wl-fade-leave-active {
  transition: opacity 0.2s ease;
}
.wl-fade-enter-from,
.wl-fade-leave-to {
  opacity: 0;
}

/* PvP Results Styles */
.wl-pvp-results {
  margin: 1rem 0;
}

.wl-pvp-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffd700;
  text-align: center;
  margin-bottom: 1rem;
}

.wl-pvp-player {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin: 0.5rem 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.wl-pvp-player.wl-pvp-winner {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.wl-pvp-rank {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
  margin-right: 1rem;
  min-width: 2rem;
  text-align: center;
}

.wl-pvp-info {
  flex: 1;
}

.wl-pvp-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.wl-pvp-score {
  font-size: 0.9rem;
  color: #ccc;
}
</style>
