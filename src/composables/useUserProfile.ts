/**
 * useUserProfile Composable
 * Easy access to user profile, settings, favorites, and stats
 * Uses shared state so all components see the same data
 */

import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../store/auth.store'
import userProfileService, {
  type UserProfile,
  type UserSettings,
  type UserStats,
  type FavoriteItem,
  PLAYER_COLORS,
} from '../services/user/UserProfileService'

// ==========================================
// SHARED STATE (singleton)
// ==========================================
const profile = ref<UserProfile | null>(null)
const stats = ref<UserStats | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
let initialized = false

export function useUserProfile() {
  const authStore = useAuthStore()

  // Computed
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const userId = computed(() => authStore.user?.id || null)
  const playerColor = computed(() => profile.value?.playerColor || '#4ecdc4')
  const favorites = computed(() => profile.value?.favorites || [])
  const settings = computed(() => profile.value?.settings || null)
  const displayName = computed(() => 
    profile.value?.displayName || profile.value?.username || 'Player'
  )

  // ==========================================
  // LOAD DATA
  // ==========================================

  async function loadProfile(): Promise<void> {
    if (!userId.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      profile.value = await userProfileService.getProfile(userId.value)
    } catch (err) {
      error.value = 'Failed to load profile'
    } finally {
      isLoading.value = false
    }
  }

  async function loadStats(): Promise<void> {
    if (!userId.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      stats.value = await userProfileService.getStats(userId.value)
    } catch (err) {
      error.value = 'Failed to load stats'
    } finally {
      isLoading.value = false
    }
  }

  async function refresh(): Promise<void> {
    await Promise.all([loadProfile(), loadStats()])
  }

  // ==========================================
  // SETTINGS
  // ==========================================

  async function updateSettings(newSettings: Partial<UserSettings>): Promise<boolean> {
    if (!userId.value) return false
    
    const success = await userProfileService.updateSettings(userId.value, newSettings)
    if (success && profile.value) {
      profile.value = {
        ...profile.value,
        settings: { ...profile.value.settings, ...newSettings }
      }
    }
    return success
  }

  async function setPlayerColor(color: string): Promise<boolean> {
    if (!userId.value) return false
    
    const success = await userProfileService.setPlayerColor(userId.value, color)
    if (success && profile.value) {
      // Update the profile object to trigger reactivity
      profile.value = {
        ...profile.value,
        playerColor: color,
        settings: { ...profile.value.settings, playerColor: color }
      }
    }
    return success
  }

  async function setTheme(theme: 'dark' | 'light' | 'system'): Promise<boolean> {
    return updateSettings({ theme })
  }

  async function setSoundEnabled(enabled: boolean): Promise<boolean> {
    return updateSettings({ soundEnabled: enabled })
  }

  // ==========================================
  // FAVORITES
  // ==========================================

  async function addFavorite(item: {
    id: number
    type: 'movie' | 'tv' | 'person'
    name: string
    image: string | null
    year?: number
  }): Promise<boolean> {
    if (!userId.value) return false
    
    if (favorites.value.length >= 4) {
      error.value = 'Maximum 4 favorites allowed'
      return false
    }
    
    const success = await userProfileService.addFavorite(userId.value, item)
    if (success) {
      await loadProfile()
    }
    return success
  }

  async function removeFavorite(itemId: number, itemType: string): Promise<boolean> {
    if (!userId.value) return false
    
    const success = await userProfileService.removeFavorite(userId.value, itemId, itemType)
    if (success) {
      await loadProfile()
    }
    return success
  }

  function isFavorite(itemId: number, itemType: string): boolean {
    return favorites.value.some(f => f.id === itemId && f.type === itemType)
  }

  function canAddFavorite(): boolean {
    return favorites.value.length < 4
  }

  // ==========================================
  // STATS HELPERS
  // ==========================================

  function formatDuration(ms: number): string {
    return userProfileService.formatDuration(ms)
  }

  function getWinRateColor(rate: number): string {
    if (rate >= 70) return '#22c55e' // green
    if (rate >= 50) return '#eab308' // yellow
    if (rate >= 30) return '#f97316' // orange
    return '#ef4444' // red
  }

  // ==========================================
  // LIFECYCLE - only set up watcher once
  // ==========================================

  if (!initialized) {
    initialized = true
    
    // Load profile when user changes
    watch(() => authStore.user?.id, async (newId) => {
      if (newId) {
        await loadProfile()
      } else {
        profile.value = null
        stats.value = null
        userProfileService.clearCache()
      }
    }, { immediate: true })
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // State (shared)
    profile,
    stats,
    isLoading,
    error,
    
    // Computed
    isAuthenticated,
    userId,
    playerColor,
    favorites,
    settings,
    displayName,
    
    // Methods
    loadProfile,
    loadStats,
    refresh,
    
    // Settings
    updateSettings,
    setPlayerColor,
    setTheme,
    setSoundEnabled,
    
    // Favorites
    addFavorite,
    removeFavorite,
    isFavorite,
    canAddFavorite,
    
    // Stats helpers
    formatDuration,
    getWinRateColor,
    
    // Constants
    PLAYER_COLORS,
  }
}

export default useUserProfile
export { PLAYER_COLORS }
export type { FavoriteItem, UserProfile, UserSettings, UserStats }
