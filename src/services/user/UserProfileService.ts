/**
 * User Profile Service
 * Manages user settings, favorites, and stats
 */

import { getSupabaseClient } from '../../config/supabase'
import { debug, warn } from '../ui/log'

// ==========================================
// TYPES
// ==========================================

export interface UserSettings {
  // Appearance
  playerColor: string
  theme: 'dark' | 'light' | 'system'
  
  // Audio
  soundEnabled: boolean
  musicEnabled: boolean
  masterVolume: number
  sfxVolume: number
  
  // Gameplay
  showHints: boolean
  showTimer: boolean
  
  // Accessibility
  reducedMotion: boolean
  highContrast: boolean
  
  // Favorites stored here too
  favorites?: FavoriteItem[]
}

export interface FavoriteItem {
  id: number
  type: 'movie' | 'tv' | 'person'
  name: string
  image: string | null
  year?: number
  addedAt: string
}

export interface UserProfile {
  id: string
  email: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  playerColor: string
  favorites: FavoriteItem[]
  settings: UserSettings
  createdAt: string
}

export interface UserStats {
  totalGamesPlayed: number
  totalWins: number
  totalLosses: number
  winRate: number
  totalConnectionsMade: number
  totalTimePlayed: number // in ms
  averageGameTime: number // in ms
  favoriteMode: string | null
  longestWinStreak: number
  currentWinStreak: number
  gamesThisWeek: number
  gamesThisMonth: number
}

// Database row types
interface UserRow {
  id: string
  email: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  settings: UserSettings | null
  created_at: string
  updated_at: string
}

interface GameHistoryRow {
  id: string
  user_id: string
  mode: string
  result: 'win' | 'lose' | 'incomplete'
  score: number
  connections_made: number
  duration_ms: number
  played_at: string
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  playerColor: '#4ecdc4',
  theme: 'dark',
  soundEnabled: true,
  musicEnabled: true,
  masterVolume: 0.8,
  sfxVolume: 1.0,
  showHints: true,
  showTimer: true,
  reducedMotion: false,
  highContrast: false,
  favorites: [],
}

// Available player colors
export const PLAYER_COLORS = [
  { name: 'Teal', value: '#4ecdc4' },
  { name: 'Coral', value: '#ff6b6b' },
  { name: 'Purple', value: '#9b59b6' },
  { name: 'Gold', value: '#f1c40f' },
  { name: 'Blue', value: '#3498db' },
  { name: 'Green', value: '#2ecc71' },
  { name: 'Orange', value: '#e67e22' },
  { name: 'Pink', value: '#e91e63' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Cyan', value: '#00bcd4' },
]

// ==========================================
// SERVICE
// ==========================================

class UserProfileService {
  private cachedProfile: UserProfile | null = null
  private cachedStats: UserStats | null = null

  /**
   * Get user profile with settings and favorites
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const client = getSupabaseClient()
    if (!client) return null

    try {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        warn('UserProfileService: Failed to get profile', { error })
        return null
      }

      const row = data as unknown as UserRow
      const settings = row.settings || DEFAULT_SETTINGS

      const profile: UserProfile = {
        id: row.id,
        email: row.email,
        username: row.username,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        playerColor: settings.playerColor || DEFAULT_SETTINGS.playerColor,
        favorites: settings.favorites || [],
        settings: { ...DEFAULT_SETTINGS, ...settings },
        createdAt: row.created_at,
      }

      this.cachedProfile = profile
      return profile
    } catch (err) {
      warn('UserProfileService: Error getting profile', { error: err })
      return null
    }
  }

  /**
   * Update user settings
   */
  async updateSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
    const client = getSupabaseClient()
    if (!client) return false

    try {
      // Get current settings
      const { data: currentUser } = await client
        .from('users')
        .select('settings')
        .eq('id', userId)
        .single()

      const row = currentUser as unknown as { settings: UserSettings | null } | null
      const currentSettings = row?.settings || {}
      const newSettings = { ...currentSettings, ...settings }

      const { error } = await client
        .from('users')
        .update({ 
          settings: newSettings,
          updated_at: new Date().toISOString()
        } as Record<string, unknown>)
        .eq('id', userId)

      if (error) {
        warn('UserProfileService: Failed to update settings', { error })
        return false
      }

      // Update cache
      if (this.cachedProfile) {
        this.cachedProfile.settings = { ...this.cachedProfile.settings, ...settings }
        if (settings.playerColor) {
          this.cachedProfile.playerColor = settings.playerColor
        }
      }

      debug('UserProfileService: Settings updated')
      return true
    } catch (err) {
      warn('UserProfileService: Error updating settings', { error: err })
      return false
    }
  }

  /**
   * Update player color
   */
  async setPlayerColor(userId: string, color: string): Promise<boolean> {
    return this.updateSettings(userId, { playerColor: color })
  }

  /**
   * Get player color
   */
  getPlayerColor(): string {
    return this.cachedProfile?.playerColor || DEFAULT_SETTINGS.playerColor
  }

  // ==========================================
  // FAVORITES
  // ==========================================

  /**
   * Get user's favorite movies/shows/people (max 4)
   */
  async getFavorites(userId: string): Promise<FavoriteItem[]> {
    const profile = await this.getProfile(userId)
    return profile?.favorites || []
  }

  /**
   * Add a favorite (max 4)
   */
  async addFavorite(userId: string, item: Omit<FavoriteItem, 'addedAt'>): Promise<boolean> {
    const client = getSupabaseClient()
    if (!client) return false

    try {
      const profile = await this.getProfile(userId)
      if (!profile) return false

      const favorites = profile.favorites || []
      
      // Check if already a favorite
      if (favorites.some(f => f.id === item.id && f.type === item.type)) {
        debug('UserProfileService: Item already in favorites')
        return true
      }

      // Max 4 favorites
      if (favorites.length >= 4) {
        warn('UserProfileService: Max 4 favorites allowed')
        return false
      }

      const newFavorite: FavoriteItem = {
        ...item,
        addedAt: new Date().toISOString(),
      }

      const newFavorites = [...favorites, newFavorite]

      const { error } = await client
        .from('users')
        .update({
          settings: { ...profile.settings, favorites: newFavorites },
          updated_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq('id', userId)

      if (error) {
        warn('UserProfileService: Failed to add favorite', { error })
        return false
      }

      // Update cache
      if (this.cachedProfile) {
        this.cachedProfile.favorites = newFavorites
      }

      debug('UserProfileService: Favorite added')
      return true
    } catch (err) {
      warn('UserProfileService: Error adding favorite', { error: err })
      return false
    }
  }

  /**
   * Remove a favorite
   */
  async removeFavorite(userId: string, itemId: number, itemType: string): Promise<boolean> {
    const client = getSupabaseClient()
    if (!client) return false

    try {
      const profile = await this.getProfile(userId)
      if (!profile) return false

      const newFavorites = profile.favorites.filter(
        f => !(f.id === itemId && f.type === itemType)
      )

      const { error } = await client
        .from('users')
        .update({
          settings: { ...profile.settings, favorites: newFavorites },
          updated_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq('id', userId)

      if (error) {
        warn('UserProfileService: Failed to remove favorite', { error })
        return false
      }

      // Update cache
      if (this.cachedProfile) {
        this.cachedProfile.favorites = newFavorites
      }

      debug('UserProfileService: Favorite removed')
      return true
    } catch (err) {
      warn('UserProfileService: Error removing favorite', { error: err })
      return false
    }
  }

  /**
   * Reorder favorites
   */
  async reorderFavorites(userId: string, favorites: FavoriteItem[]): Promise<boolean> {
    const client = getSupabaseClient()
    if (!client) return false

    try {
      const profile = await this.getProfile(userId)
      if (!profile) return false

      const { error } = await client
        .from('users')
        .update({
          settings: { ...profile.settings, favorites },
          updated_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq('id', userId)

      if (error) {
        warn('UserProfileService: Failed to reorder favorites', { error })
        return false
      }

      if (this.cachedProfile) {
        this.cachedProfile.favorites = favorites
      }

      return true
    } catch (err) {
      warn('UserProfileService: Error reordering favorites', { error: err })
      return false
    }
  }

  // ==========================================
  // STATS
  // ==========================================

  /**
   * Get user stats
   */
  async getStats(userId: string): Promise<UserStats | null> {
    const client = getSupabaseClient()
    if (!client) return null

    try {
      // Get game history
      const { data: history, error } = await client
        .from('game_history')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })

      if (error) {
        warn('UserProfileService: Failed to get stats', { error })
        return null
      }

      const games = (history || []) as unknown as GameHistoryRow[]
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Calculate stats
      const totalGamesPlayed = games.length
      const wins = games.filter(g => g.result === 'win')
      const totalWins = wins.length
      const totalLosses = games.filter(g => g.result === 'lose').length
      const winRate = totalGamesPlayed > 0 ? (totalWins / totalGamesPlayed) * 100 : 0

      const totalConnectionsMade = games.reduce((sum, g) => sum + (g.connections_made || 0), 0)
      const totalTimePlayed = games.reduce((sum, g) => sum + (g.duration_ms || 0), 0)
      const averageGameTime = totalGamesPlayed > 0 ? totalTimePlayed / totalGamesPlayed : 0

      // Favorite mode
      const modeCounts: Record<string, number> = {}
      games.forEach(g => {
        modeCounts[g.mode] = (modeCounts[g.mode] || 0) + 1
      })
      
      let favoriteMode: string | null = null
      let maxCount = 0
      for (const mode in modeCounts) {
        const count = modeCounts[mode]
        if (count !== undefined && count > maxCount) {
          maxCount = count
          favoriteMode = mode
        }
      }

      // Win streaks
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0

      for (const game of games) {
        if (game.result === 'win') {
          tempStreak++
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak
          }
        } else {
          if (currentStreak === 0 && tempStreak > 0) {
            currentStreak = tempStreak
          }
          tempStreak = 0
        }
      }
      if (tempStreak > 0 && currentStreak === 0) {
        currentStreak = tempStreak
      }

      // Recent activity
      const gamesThisWeek = games.filter(g => new Date(g.played_at) > weekAgo).length
      const gamesThisMonth = games.filter(g => new Date(g.played_at) > monthAgo).length

      const stats: UserStats = {
        totalGamesPlayed,
        totalWins,
        totalLosses,
        winRate: Math.round(winRate * 10) / 10,
        totalConnectionsMade,
        totalTimePlayed,
        averageGameTime: Math.round(averageGameTime),
        favoriteMode,
        longestWinStreak: longestStreak,
        currentWinStreak: currentStreak,
        gamesThisWeek,
        gamesThisMonth,
      }

      this.cachedStats = stats
      return stats
    } catch (err) {
      warn('UserProfileService: Error getting stats', { error: err })
      return null
    }
  }

  /**
   * Format time duration
   */
  formatDuration(ms: number): string {
    if (ms < 60000) {
      return `${Math.round(ms / 1000)}s`
    }
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.round((ms % 60000) / 1000)
    if (minutes < 60) {
      return `${minutes}m ${seconds}s`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cachedProfile = null
    this.cachedStats = null
  }
}

// Export singleton
export const userProfileService = new UserProfileService()
export default userProfileService
