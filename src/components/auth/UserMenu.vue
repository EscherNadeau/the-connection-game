<template>
  <div class="user-menu-container" ref="containerRef">
    <!-- Guest/Sign In Button -->
    <button 
      v-if="!isAuthenticated" 
      class="auth-trigger guest"
      @click="$emit('open-auth')"
    >
      <div class="avatar guest-avatar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
      <span class="auth-label">Sign In</span>
    </button>

    <!-- Authenticated User Button -->
    <button 
      v-else 
      class="auth-trigger authenticated"
      @click="toggleMenu"
    >
      <div class="avatar user-avatar" :style="avatarStyle">
        <img v-if="user?.avatarUrl" :src="user.avatarUrl" :alt="displayName" />
        <span v-else class="avatar-initials">{{ initials }}</span>
      </div>
      <span class="auth-label">{{ displayName }}</span>
      <svg 
        class="dropdown-arrow" 
        :class="{ open: isMenuOpen }"
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M7 10l5 5 5-5z"/>
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition name="dropdown">
      <div v-if="isMenuOpen && isAuthenticated" class="dropdown-menu">
        <div class="user-info">
          <div class="avatar user-avatar large" :style="avatarStyle">
            <img v-if="user?.avatarUrl" :src="user.avatarUrl" :alt="displayName" />
            <span v-else class="avatar-initials">{{ initials }}</span>
          </div>
          <div class="user-details">
            <span class="user-name">{{ displayName }}</span>
            <span class="user-email">{{ user?.email }}</span>
          </div>
        </div>

        <div class="menu-divider"></div>

        <button class="menu-item" @click="handleProfile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          Profile & Stats
        </button>

        <button class="menu-item" @click="handleLeaderboard">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z"/>
          </svg>
          Leaderboard
        </button>

        <div class="menu-divider"></div>

        <button class="menu-item danger" @click="handleSignOut">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Sign Out
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../../composables/useAuth'

const { user, isAuthenticated, displayName, initials, signOut } = useAuth()

const containerRef = ref<HTMLElement | null>(null)
const isMenuOpen = ref(false)

// Generate a gradient based on user ID for avatar background
const avatarStyle = computed(() => {
  if (user.value?.avatarUrl) return {}
  
  const colors = [
    ['#e94560', '#c23a51'],
    ['#6366f1', '#4f46e5'],
    ['#8b5cf6', '#7c3aed'],
    ['#14b8a6', '#0d9488'],
    ['#f59e0b', '#d97706'],
  ]
  
  const index = user.value?.id ? 
    parseInt(user.value.id.slice(-2), 16) % colors.length : 
    0
  const [start, end] = colors[index]
  
  return {
    background: `linear-gradient(135deg, ${start} 0%, ${end} 100%)`,
  }
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const emit = defineEmits<{
  (e: 'open-auth'): void
  (e: 'open-profile'): void
  (e: 'open-stats'): void
  (e: 'open-leaderboard'): void
}>()

const handleProfile = () => {
  closeMenu()
  emit('open-profile')
}


const handleLeaderboard = () => {
  closeMenu()
  emit('open-leaderboard')
}

const handleSignOut = async () => {
  closeMenu()
  await signOut()
}
</script>

<style scoped>
.user-menu-container {
  position: relative;
}

.auth-trigger {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auth-trigger:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.auth-trigger.guest {
  background: rgba(78, 205, 196, 0.2);
  border: 1px solid rgba(78, 205, 196, 0.5);
  color: #4ecdc4;
}

.auth-trigger.guest:hover {
  background: rgba(78, 205, 196, 0.3);
  border-color: rgba(78, 205, 196, 0.7);
  box-shadow: 0 4px 20px rgba(78, 205, 196, 0.3);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar.large {
  width: 48px;
  height: 48px;
}

.guest-avatar {
  background: rgba(78, 205, 196, 0.3);
  color: #4ecdc4;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: white;
}

.avatar.large .avatar-initials {
  font-size: 1rem;
}

.auth-label {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  transition: transform 0.2s;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 240px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  z-index: 600;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.25rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.15s;
  text-align: left;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu-item.danger {
  color: #f87171;
}

.menu-item.danger:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

/* Dropdown animation */
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive */
@media (max-width: 480px) {
  .auth-label {
    display: none;
  }
  
  .auth-trigger {
    padding: 0.5rem;
  }
  
  .dropdown-arrow {
    display: none;
  }
  
  .dropdown-menu {
    right: -0.5rem;
    min-width: 220px;
  }
}
</style>

