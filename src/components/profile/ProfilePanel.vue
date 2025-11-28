<template>
  <div class="profile-panel">
    <!-- Header -->
    <header class="profile-header">
      <button class="back-btn" @click="$emit('close')">
        ← Back
      </button>
      <h1>Profile</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- Not Logged In -->
    <div v-if="!isAuthenticated" class="not-authenticated">
      <div class="lock-icon">🔒</div>
      <h2>Sign in to view your profile</h2>
      <p>Track your stats, save favorites, and customize your experience.</p>
      <button class="sign-in-btn" @click="$emit('open-auth')">
        Sign In
      </button>
    </div>

    <!-- Profile Content -->
    <div v-else class="profile-content">
      <!-- User Info -->
      <div class="user-info">
        <div class="avatar" :style="{ borderColor: playerColor }">
          {{ displayName.charAt(0).toUpperCase() }}
        </div>
        <div class="user-details">
          <h2>{{ displayName }}</h2>
          <p class="email">{{ profile?.email }}</p>
          <p class="member-since" v-if="profile?.createdAt">
            Member since {{ formatDate(profile.createdAt) }}
          </p>
        </div>
      </div>

      <!-- Sections Grid -->
      <div class="sections-grid">
        <!-- Stats -->
        <UserStatsPanel />
        
        <!-- Favorites -->
        <FavoritesPanel />
        
        <!-- Color Picker -->
        <PlayerColorPicker />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserProfile } from '../../composables/useUserProfile'
import UserStatsPanel from './UserStatsPanel.vue'
import FavoritesPanel from './FavoritesPanel.vue'
import PlayerColorPicker from './PlayerColorPicker.vue'

defineEmits<{
  close: []
  'open-auth': []
}>()

const { isAuthenticated, profile, playerColor, displayName } = useUserProfile()

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })
}
</script>

<style scoped>
.profile-panel {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  padding: 1rem;
  color: white;
  overflow-y: auto;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.profile-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.header-spacer {
  width: 80px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Not Authenticated */
.not-authenticated {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  gap: 1rem;
}

.lock-icon {
  font-size: 4rem;
}

.not-authenticated h2 {
  margin: 0;
  font-size: 1.5rem;
}

.not-authenticated p {
  color: rgba(255, 255, 255, 0.6);
  max-width: 300px;
}

.sign-in-btn {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  border: none;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.sign-in-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(78, 205, 196, 0.4);
}

/* Profile Content */
.profile-content {
  max-width: 900px;
  margin: 0 auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  border: 3px solid;
}

.user-details h2 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
}

.email {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.member-since {
  margin: 0.5rem 0 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
}

/* Sections Grid */
.sections-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .sections-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .sections-grid > :first-child {
    grid-column: span 2;
  }
}

@media (max-width: 480px) {
  .user-info {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-header h1 {
    font-size: 1.25rem;
  }
}
</style>

