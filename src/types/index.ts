/**
 * @fileoverview Type definitions for Connect The Stars game
 * @description JSDoc type definitions for core data structures used throughout the application
 */

/**
 * @typedef {Object} GameItem
 * @property {string} id - Unique identifier for the game item
 * @property {string} name - Display name of the item
 * @property {string} title - Alternative title (often same as name)
 * @property {string} type - Media type: 'movie', 'tv', 'person', 'goal', 'knowledge', 'anti', 'hybrid', 'zen'
 * @property {string} [year] - Release year for media items
 * @property {string} [image] - URL to the item's image
 * @property {string} [overview] - Description/summary of the item
 * @property {number} [rating] - TMDB rating (0-10)
 * @property {string} [mediaType] - Normalized media type: 'movie', 'tv', 'person'
 * @property {Object} [tmdbData] - Raw TMDB API data
 * @property {string} gameId - Generated game-specific ID
 * @property {number} [x] - X coordinate on game board
 * @property {number} [y] - Y coordinate on game board
 * @property {boolean} [isStartingItem] - Whether this is a starting item
 * @property {boolean} [isGoal] - Whether this is a goal item
 * @property {boolean} [isAntiModeGoal] - Whether this is an anti-mode goal
 * @property {boolean} [isVictoryHighlighted] - Whether this item is highlighted during victory
 * @property {string} [source] - Source of the item: 'goal', 'subGoal', 'search', etc.
 * @property {string} [parentGoalId] - Parent goal ID for sub-goals
 * @property {Object} [boardPosition] - Position on the board
 * @property {boolean} [isConnected] - Whether this item has connections
 * @property {Array<string>} [connections] - Array of connection IDs
 */

/**
 * @typedef {Object} Connection
 * @property {string} id - Unique identifier for the connection
 * @property {string} from - Source item ID
 * @property {string} to - Target item ID
 * @property {boolean} [isVictoryConnection] - Whether this connection is part of victory path
 * @property {number} [createdAt] - Timestamp when connection was created
 */

/**
 * @typedef {Object} GameMode
 * @property {string} id - Mode identifier: 'goal', 'knowledge', 'hybrid', 'anti', 'zen', 'custom'
 * @property {string} name - Display name of the mode
 * @property {string} title - Alternative title
 * @property {string} description - Description of the mode
 * @property {string} icon - Emoji icon for the mode
 * @property {Array<string>} [defaultRules] - Default rules for this mode
 * @property {number} [maxItems] - Maximum items to configure
 * @property {Array<string>} [settings] - Settings keys for this mode
 * @property {Object} [commonSettings] - Common settings inherited by all modes
 * @property {string} [winCondition] - Win condition description
 * @property {boolean} [allowsBranching] - Whether branching is allowed
 * @property {number} [timeLimit] - Default time limit in seconds
 */

/**
 * @typedef {Object} Filters
 * @property {string} cast - Cast filter: 'mixed', 'male', 'female'
 * @property {string} mediaType - Media type filter: 'all', 'movie', 'tv', 'person'
 * @property {string} decade - Decade filter: 'all', '1900s', '1910s', etc.
 * @property {string} [year] - Specific year filter
 * @property {string} [genre] - Genre filter
 * @property {string} [rating] - Rating filter
 */

/**
 * @typedef {Object} GameOptions
 * @property {string} gameType - Type of game: 'goal', 'path', 'knowledge', 'anti', 'zen'
 * @property {Array<GameItem>} [goals] - Goal items for the game
 * @property {GameItem} [goalStartItem] - Starting goal item
 * @property {GameItem} [goalEndItem] - Ending goal item
 * @property {GameItem} [knowledgeStartItem] - Starting item for knowledge mode
 * @property {number} [knowledgeTargetItems] - Target number of connections for knowledge mode
 * @property {Array<GameItem>} [antiModeGoals] - Goals for anti mode
 * @property {number} [timeLimit] - Time limit in seconds
 * @property {boolean} [timerEnabled] - Whether timer is enabled
 * @property {boolean} [hintsEnabled] - Whether hints are enabled
 * @property {Filters} [filters] - Search and display filters
 * @property {Array<string>} [rules] - Active game rules
 * @property {Object} [customSettings] - Custom mode settings
 */

/**
 * @typedef {Object} GameState
 * @property {string} gameMode - Current game mode
 * @property {Array<GameItem>} gameItems - All items on the game board
 * @property {Array<Connection>} connections - All connections between items
 * @property {Array<GameItem>} goalChain - Chain of goals for goal mode
 * @property {GameOptions} gameOptions - Current game options
 * @property {boolean} showWinMenu - Whether win menu is shown
 * @property {boolean} isAnimatingVictory - Whether victory animation is playing
 * @property {number} [currentGoalIndex] - Current goal index for goal mode
 * @property {number} [totalGoals] - Total number of goals
 * @property {Object} [physics] - Physics system state
 * @property {boolean} [isPaused] - Whether game is paused
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} title - Alternative title
 * @property {string} type - Media type: 'movie', 'tv', 'person'
 * @property {string} [year] - Release year
 * @property {string} [image] - Image URL
 * @property {string} [overview] - Description
 * @property {number} [rating] - TMDB rating
 * @property {string} [media_type] - TMDB media type
 * @property {string} [release_date] - Release date
 * @property {string} [first_air_date] - First air date for TV shows
 * @property {string} [profile_path] - Profile image path for people
 * @property {Object} [originalData] - Raw TMDB data
 * @property {number} [gender] - Gender for people (1=female, 2=male)
 * @property {Array<Object>} [known_for] - Known for items
 */

/**
 * @typedef {Object} GoalPair
 * @property {GameItem} start - Starting goal item
 * @property {GameItem} target - Target goal item
 */

/**
 * @typedef {Object} GoalStatus
 * @property {boolean} hasGoals - Whether there are active goals
 * @property {GoalPair|null} currentGoal - Current goal pair
 * @property {number} progress - Progress (0-1)
 * @property {number} [currentIndex] - Current goal index
 * @property {number} [totalGoals] - Total number of goals
 */

/**
 * @typedef {Object} WinCondition
 * @property {boolean} won - Whether the game is won
 * @property {string} [reason] - Reason for win/loss
 * @property {GameItem} [startItem] - Starting item for win
 * @property {GameItem} [endItem] - Ending item for win
 * @property {boolean} [isLastGoal] - Whether this is the last goal
 */

/**
 * @typedef {Object} PhysicsItem
 * @property {string} id - Item ID
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} vx - X velocity
 * @property {number} vy - Y velocity
 * @property {number} radius - Collision radius
 * @property {boolean} [isMoving] - Whether item is currently moving
 */

/**
 * @typedef {Object} BoardPosition
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} [z] - Z coordinate (for layering)
 */

/**
 * @typedef {Object} Viewport
 * @property {number} x - X offset
 * @property {number} y - Y offset
 * @property {number} scale - Zoom scale
 * @property {string} [transformOrigin] - CSS transform origin
 */

/**
 * @typedef {Object} Notification
 * @property {string} type - Notification type: 'success', 'error', 'info', 'warning'
 * @property {string} message - Notification message
 * @property {number} [duration] - Duration in milliseconds
 * @property {boolean} [persistent] - Whether notification is persistent
 */

/**
 * @typedef {Object} CacheEntry
 * @property {*} data - Cached data
 * @property {number} timestamp - Cache timestamp
 * @property {number} ttl - Time to live in milliseconds
 * @property {string} key - Cache key
 */

/**
 * @typedef {Object} TMDBResponse
 * @property {Array<Object>} results - Array of results
 * @property {number} page - Current page
 * @property {number} total_pages - Total pages
 * @property {number} total_results - Total results
 */

/**
 * @typedef {Object} TMDBPerson
 * @property {number} id - TMDB person ID
 * @property {string} name - Person name
 * @property {string} [profile_path] - Profile image path
 * @property {number} [gender] - Gender (1=female, 2=male)
 * @property {string} [biography] - Biography
 * @property {string} [birthday] - Birthday
 * @property {string} [place_of_birth] - Place of birth
 * @property {Array<Object>} [known_for] - Known for items
 */

/**
 * @typedef {Object} TMDBCredits
 * @property {Array<TMDBPerson>} cast - Cast members
 * @property {Array<Object>} crew - Crew members
 * @property {number} id - TMDB ID
 */

/**
 * @typedef {Object} GameRule
 * @property {string} id - Rule identifier
 * @property {string} name - Rule name
 * @property {string} description - Rule description
 * @property {string} category - Rule category
 * @property {boolean} [enabled] - Whether rule is enabled
 * @property {Object} [config] - Rule configuration
 */

/**
 * @typedef {Object} ModeService
 * @property {Function} initialize - Initialize the service
 * @property {Function} updateGameState - Update game state
 * @property {Function} checkWinCondition - Check win condition
 * @property {Function} [getProgressDisplay] - Get progress display
 * @property {Function} [getWinMessage] - Get win message
 * @property {Function} [cleanup] - Cleanup service
 */

/**
 * @typedef {Object} SearchOptions
 * @property {string} query - Search query
 * @property {string} [type] - Search type filter
 * @property {Filters} [filters] - Additional filters
 * @property {number} [page] - Page number
 * @property {number} [limit] - Results limit
 */

/**
 * @typedef {Object} ConnectionValidation
 * @property {boolean} valid - Whether connection is valid
 * @property {string} [reason] - Reason for validation result
 * @property {Array<string>} [violatedRules] - List of violated rules
 * @property {Object} [metadata] - Additional validation metadata
 */

// Export types for use in JSDoc comments
export {
  // Core types
  GameItem,
  Connection,
  GameMode,
  Filters,
  GameOptions,
  GameState,
  SearchResult,
  GoalPair,
  GoalStatus,
  WinCondition,
  PhysicsItem,
  BoardPosition,
  Viewport,
  Notification,
  CacheEntry,
  TMDBResponse,
  TMDBPerson,
  TMDBCredits,
  GameRule,
  ModeService,
  SearchOptions,
  ConnectionValidation,
}
