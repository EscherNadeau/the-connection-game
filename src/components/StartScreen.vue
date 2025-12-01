<template>
  <div class="container">
    <!-- Auth Button in top right -->
    <div class="auth-corner">
      <UserMenu 
        @open-auth="showAuthModal = true" 
        @open-profile="emit('open-profile-page')"
        @open-leaderboard="showLeaderboard = true"
        @open-friends="showFriends = true"
      />
    </div>

    <!-- Auth Modal -->
    <AuthModal :is-open="showAuthModal" @close="showAuthModal = false" />

    <!-- Leaderboard Panel -->
    <LeaderboardPanel v-if="showLeaderboard" @close="showLeaderboard = false" />

    <!-- Friends Panel -->
    <FriendsPanel v-if="showFriends" @close="showFriends = false" />

    <!-- Header -->
    <div class="header">
      <h1 class="game-title">THE CONNECTION GAME</h1>
    </div>

    <!-- Main actions grid -->
    <div class="main-actions">
      
      <!-- PLAY GAME -->
      <div class="action-card" @click="emit('start-game', { action: 'create', mode: 'solo' })">
        <div class="card-icon">🎮</div>
        <div class="card-info">
          <div class="action-title">Play Game</div>
          <div class="action-description">Start a new game</div>
        </div>
      </div>
      
      <!-- SHOWS -->
      <div class="action-card" @click="emit('open-custom-mode')">
        <div class="card-icon">📺</div>
        <div class="card-info">
          <div class="action-title">Shows</div>
          <div class="action-description">Create & share challenges</div>
        </div>
      </div>
      
      <!-- HOW TO PLAY -->
      <div class="action-card" @click="emit('how-to-play')">
        <div class="card-icon">❓</div>
        <div class="card-info">
          <div class="action-title">How to Play</div>
          <div class="action-description">Learn the game</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserMenu from './auth/UserMenu.vue'
import AuthModal from './auth/AuthModal.vue'
import LeaderboardPanel from './leaderboard/LeaderboardPanel.vue'
import FriendsPanel from './friends/FriendsPanel.vue'

const emit = defineEmits<{
  (e: 'start-game', data: { action: string; mode: string }): void
  (e: 'how-to-play'): void
  (e: 'open-profile-page'): void
  (e: 'open-custom-mode'): void
}>()

const showAuthModal = ref(false)
const showLeaderboard = ref(false)
const showFriends = ref(false)
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  position: relative;
}

.auth-corner {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 100;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.game-title {
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: 0.1em;
  background: linear-gradient(135deg, #fff 0%, #e94560 50%, #fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 60px rgba(233, 69, 96, 0.5);
}

.main-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 280px));
  gap: 1.5rem;
  max-width: 900px;
  width: 100%;
  justify-content: center;
}

.action-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-4px);
  border-color: rgba(233, 69, 96, 0.5);
  box-shadow: 0 10px 40px rgba(233, 69, 96, 0.2);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.action-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #fff;
}

.action-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 640px) {
  .main-actions {
    grid-template-columns: 1fr;
  }
}
</style>
