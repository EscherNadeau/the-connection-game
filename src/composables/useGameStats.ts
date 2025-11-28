/**
 * useGameStats Composable
 * Tracks game statistics during gameplay and saves to database on game end
 */

import { ref, computed } from 'vue'
import { useAuthStore } from '../store/auth.store'
import { databaseService } from '../services/database/DatabaseService'
import { debug, warn } from '../services/ui/log'
import type { GameResult } from '../types/database'

export interface GameStatsData {
  mode: string
  result: GameResult
  score: number
  connectionsMade: number
  durationMs: number
  itemsUsed?: number
  goalsCompleted?: number
}

// Shared state for current game
const gameStartTime = ref<number | null>(null)
const connectionsMade = ref(0)
const currentMode = ref<string>('goal')
const itemsUsed = ref(0)
const goalsCompleted = ref(0)
const isSaving = ref(false)

export function useGameStats() {
  const authStore = useAuthStore()

  // Computed
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const userId = computed(() => authStore.user?.id || null)
  const elapsedMs = computed(() => {
    if (!gameStartTime.value) return 0
    return Date.now() - gameStartTime.value
  })

  /**
   * Start tracking a new game
   */
  function startGame(mode: string): void {
    gameStartTime.value = Date.now()
    connectionsMade.value = 0
    itemsUsed.value = 0
    goalsCompleted.value = 0
    currentMode.value = mode || 'goal'
    debug('[GameStats] Game started', { mode, startTime: gameStartTime.value })
  }

  /**
   * Track a connection being made
   */
  function trackConnection(): void {
    connectionsMade.value++
    debug('[GameStats] Connection tracked', { total: connectionsMade.value })
  }

  /**
   * Track an item being added
   */
  function trackItemAdded(): void {
    itemsUsed.value++
  }

  /**
   * Track a goal being completed
   */
  function trackGoalCompleted(): void {
    goalsCompleted.value++
    debug('[GameStats] Goal tracked', { total: goalsCompleted.value })
  }

  /**
   * End game and save stats to database
   */
  async function endGame(result: GameResult, score: number = 0): Promise<boolean> {
    if (!userId.value) {
      debug('[GameStats] Not saving - user not authenticated')
      return false
    }

    if (!gameStartTime.value) {
      warn('[GameStats] No game in progress')
      return false
    }

    if (isSaving.value) {
      warn('[GameStats] Already saving')
      return false
    }

    isSaving.value = true
    const durationMs = Date.now() - gameStartTime.value

    try {
      const statsData: GameStatsData = {
        mode: currentMode.value,
        result,
        score,
        connectionsMade: connectionsMade.value,
        durationMs,
        itemsUsed: itemsUsed.value,
        goalsCompleted: goalsCompleted.value,
      }

      debug('[GameStats] Saving game stats', statsData)

      // Map mode to database format
      const modeMap: Record<string, string> = {
        goal: 'goal',
        hybrid: 'hybrid',
        knowledge: 'knowledge',
        anti: 'anti',
        zen: 'zen',
        custom: 'custom',
      }

      const dbMode = modeMap[currentMode.value.toLowerCase()] || 'goal'

      const { error } = await databaseService.addGameHistory({
        user_id: userId.value,
        mode: dbMode as 'goal' | 'hybrid' | 'knowledge' | 'anti' | 'zen' | 'custom',
        result,
        score,
        connections_made: connectionsMade.value,
        duration_ms: durationMs,
        played_at: new Date().toISOString(),
      })

      if (error) {
        warn('[GameStats] Failed to save game history', { error })
        return false
      }

      debug('[GameStats] Game stats saved successfully')
      
      // Reset state
      resetStats()
      return true
    } catch (err) {
      warn('[GameStats] Error saving game stats', { error: err })
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Cancel game without saving
   */
  function cancelGame(): void {
    debug('[GameStats] Game cancelled')
    resetStats()
  }

  /**
   * Reset all stats
   */
  function resetStats(): void {
    gameStartTime.value = null
    connectionsMade.value = 0
    itemsUsed.value = 0
    goalsCompleted.value = 0
  }

  /**
   * Get current stats summary
   */
  function getStats(): GameStatsData {
    return {
      mode: currentMode.value,
      result: 'incomplete',
      score: 0,
      connectionsMade: connectionsMade.value,
      durationMs: elapsedMs.value,
      itemsUsed: itemsUsed.value,
      goalsCompleted: goalsCompleted.value,
    }
  }

  return {
    // State
    gameStartTime,
    connectionsMade,
    itemsUsed,
    goalsCompleted,
    currentMode,
    isSaving,
    elapsedMs,
    
    // Computed
    isAuthenticated,
    userId,

    // Methods
    startGame,
    trackConnection,
    trackItemAdded,
    trackGoalCompleted,
    endGame,
    cancelGame,
    resetStats,
    getStats,
  }
}

export default useGameStats

