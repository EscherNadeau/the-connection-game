/**
 * Centralized Item Service
 * Handles all item creation, formatting, and conversion across the app
 */

import type { GameItem, SearchResult } from '../types/game'

interface TMDBResult {
  id: number
  title?: string
  name?: string
  media_type?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string
  first_air_date?: string
  overview?: string
  [key: string]: any
}

export interface ItemOptions {
  x?: number
  y?: number
  isStartingItem?: boolean
  [key: string]: any
}

class ItemService {
  itemIdCounter: number = 0

  /**
   * Create a unique ID for an item
   */
  createItemId(prefix: string = 'item'): string {
    return `${prefix}_${Date.now()}_${++this.itemIdCounter}`
  }

  /**
   * Convert TMDB search result to standardized item format
   */
  fromTMDBResult(tmdbResult: TMDBResult, options: ItemOptions = {}): GameItem | null {
    if (!tmdbResult) return null

    const item = {
      id: this.createItemId('tmdb'),
      title: tmdbResult.title || tmdbResult.name,
      type: (tmdbResult.media_type || 'movie').toLowerCase(),
      year: this.extractYear(tmdbResult),
      image: this.getImageUrl(tmdbResult),
      tmdbData: tmdbResult,
      tmdbId: tmdbResult.id,
      ...options
    }

    return item
  }

  /**
   * Convert string goal to standardized item format
   * @param {string} goalString - Simple string goal
   * @param {Object} options - Additional options
   * @returns {Object} Standardized item
   */
  fromString(goalString, options = {}) {
    if (!goalString || typeof goalString !== 'string') return null

    return {
      id: this.createItemId('string'),
      title: goalString,
      type: 'movie', // Default type
      year: null,
      image: null,
      tmdbData: null,
      tmdbId: null,
      ...options
    }
  }

  /**
   * Convert any goal (string or object) to standardized item format
   * @param {any} goal - Goal data (string, object, etc.)
   * @param {Object} options - Additional options
   * @returns {Object} Standardized item
   */
  fromGoal(goal, options = {}) {
    if (!goal) return null

    // If it's already a standardized item, return it
    if (this.isStandardizedItem(goal)) {
      return { ...goal, ...options }
    }

    // If it's a string, convert it
    if (typeof goal === 'string') {
      return this.fromString(goal, options)
    }

    // If it's an object with TMDB data
    if (typeof goal === 'object' && goal.tmdbData) {
      return this.fromTMDBResult(goal.tmdbData, options)
    }

    // If it's an object with basic properties (like from SearchPanel)
    if (typeof goal === 'object' && (goal.title || goal.name)) {
      return {
        id: this.createItemId('object'),
        title: goal.title || goal.name,
        type: (goal.type || goal.media_type || 'movie').toLowerCase(),
        year: goal.year || this.extractYear(goal),
        image: goal.image || this.getImageUrl(goal.tmdbData || goal),
        tmdbData: goal.tmdbData || goal,
        tmdbId: goal.id || goal.tmdbId,
        ...options
      }
    }

    // Fallback: convert to string
    return this.fromString(String(goal), options)
  }

  /**
   * Convert goals array to starting items for game board
   * @param {Array} goals - Array of goals (strings or objects)
   * @param {string} modeType - Game mode type
   * @returns {Array} Starting items for game board
   */
  goalsToStartingItems(goals, modeType) {
    if (!goals || !Array.isArray(goals)) return []

    const startingItems = []

    goals.forEach((goal, index) => {
      const item = this.fromGoal(goal)
      if (!item) return

      // Set mode-specific properties
      const isStartingItem = modeType === 'knowledge' ? index === 0 : 
                            modeType === 'goal' ? index < 2 : 
                            index === 0
      
      const isGoal = modeType === 'goal' ? index < 2 : 
                    modeType === 'hybrid' ? index > 0 : 
                    false

      const source = modeType === 'goal' ? `goal${index + 1}` : 
                    modeType === 'knowledge' ? 'knowledgeStart' : 
                    modeType === 'hybrid' ? (index === 0 ? 'hybridStartingItem' : `hybridGoal${index}`) : 
                    'episode'

      startingItems.push({
        ...item,
        isStartingItem,
        isGoal,
        source,
        mode: modeType
      })
    })

    return startingItems
  }

  /**
   * Check if an item is in standardized format
   * @param {any} item - Item to check
   * @returns {boolean} True if standardized
   */
  isStandardizedItem(item) {
    return item && 
           typeof item === 'object' && 
           typeof item.id === 'string' && 
           typeof item.title === 'string' && 
           typeof item.type === 'string'
  }

  /**
   * Extract year from TMDB result
   * @param {Object} tmdbResult - TMDB API result
   * @returns {number|null} Year
   */
  extractYear(tmdbResult) {
    if (tmdbResult.release_date) {
      return new Date(tmdbResult.release_date).getFullYear()
    }
    if (tmdbResult.first_air_date) {
      return new Date(tmdbResult.first_air_date).getFullYear()
    }
    return null
  }

  /**
   * Get image URL from TMDB result
   * @param {Object} tmdbResult - TMDB API result
   * @returns {string|null} Image URL
   */
  getImageUrl(tmdbResult) {
    if (!tmdbResult) return null

    if (tmdbResult.poster_path) {
      return `https://image.tmdb.org/t/p/w500${tmdbResult.poster_path}`
    }
    if (tmdbResult.profile_path) {
      return `https://image.tmdb.org/t/p/w500${tmdbResult.profile_path}`
    }
    return null
  }

  /**
   * Get display name for any goal type
   * @param {any} goal - Goal data
   * @returns {string} Display name
   */
  getDisplayName(goal) {
    if (!goal) return ''
    if (typeof goal === 'string') return goal
    if (typeof goal === 'object') {
      return goal.title || goal.name || String(goal)
    }
    return String(goal)
  }

  /**
   * Create game item for GameBoard.addItem()
   * @param {any} goal - Goal data
   * @param {Object} options - Additional options
   * @returns {Object} Game item
   */
  createGameItem(goal, options = {}) {
    const item = this.fromGoal(goal, options)
    if (!item) return null

    return {
      id: item.id,
      title: item.title,
      type: item.type,
      image: item.image,
      year: item.year,
      tmdbData: item.tmdbData,
      tmdbId: item.tmdbId,
      ...options
    }
  }
}

// Export singleton instance
export default new ItemService()
