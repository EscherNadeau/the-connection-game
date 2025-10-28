/**
 * Game Modes Configuration
 * Defines each game mode with its default rules, settings, and behavior
 * Uses the rules engine from gameRules.js
 */

import { GAME_RULES, SEARCH_RULES, PATH_MODE_RULES } from '../rules/gameRules.ts'

// ========================================
// COMMON SETTINGS FOR ALL MODES
// ========================================
export const COMMON_MODE_SETTINGS = {
  // Timer Settings
  timer: {
    enabled: true,
    defaultTime: 300, // 5 minutes default
    options: [60, 180, 300, 600, 900], // 1min, 3min, 5min, 10min, 15min
    allowCustom: true,
  },

  // Cast Filter Settings
  castFilter: {
    enabled: true,
    default: 'mixed', // mixed, male, female
    options: ['mixed', 'male', 'female'],
  },

  // Board Settings
  board: {
    clearAfterGoal: false, // Clear board after each goal
    allowUndo: true, // Allow undoing moves
    showConnections: true, // Show connection lines
  },

  // Hint Settings
  hints: {
    enabled: true,
    maxHints: 3, // Maximum hints per game
    hintCost: 30, // Seconds penalty per hint
  },
}

// ========================================
// GAME MODE DEFINITIONS
// ========================================
export const GAME_MODES = {
  goal: {
    id: 'goal',
    name: 'Goal Mode',
    title: 'Goal Mode',
    description: 'Connect items to reach a specific goal',
    icon: '🎯',

    // Default rules for this mode
    defaultRules: [
      GAME_RULES.ALLOW_HANGERS, // Items can be left unconnected
      GAME_RULES.TIMER_ENABLED, // Has timer (user picks time)
      GAME_RULES.ALLOW_HINTS, // Can use hint system
      SEARCH_RULES.CAST_FILTER, // Filter by actor/actress
      SEARCH_RULES.MEDIA_TYPE_FILTER, // Filter by movie/tv/person
      SEARCH_RULES.DECADE_FILTER, // Filter by year range
    ],

    // Settings configuration
    maxItems: 2, // Maximum items to configure
    settings: ['goal1', 'goal2'], // Settings keys for this mode

    // Common settings (inherited by all modes)
    commonSettings: COMMON_MODE_SETTINGS,

    // Game behavior
    winCondition: 'reach_goals', // Must connect to both goal items
    allowsBranching: true, // Can create multiple paths
    timeLimit: 300, // 5 minutes default

    // Note: Path Mode rules can be applied to Goal Mode to make it harder
    // LINEAR_PATH_ONLY + NO_BACKTRACE + NO_HANGERS = "Hard Goal Mode"
  },

  knowledge: {
    id: 'knowledge',
    name: 'Knowledge Mode',
    title: 'Knowledge Mode',
    description: 'Start with ANY item, name X connections from it',
    icon: '🧠',

    defaultRules: [
      GAME_RULES.NO_HANGERS, // Every item must connect to something
      GAME_RULES.TIMER_ENABLED, // Has timer (user picks time)
      GAME_RULES.ALLOW_HINTS, // Can use hint system
      SEARCH_RULES.CAST_FILTER, // Filter by actor/actress
      SEARCH_RULES.MEDIA_TYPE_FILTER, // Filter by movie/tv/person
      SEARCH_RULES.DECADE_FILTER, // Filter by year range
    ],

    maxItems: 1, // Only need starting item
    settings: ['startingItem', 'connectionCount'],

    // Common settings (inherited by all modes)
    commonSettings: COMMON_MODE_SETTINGS,

    winCondition: 'name_connections', // Must name X number of connections
    allowsBranching: true, // Can create multiple connections
    timeLimit: 180, // 3 minutes default
  },

  hybrid: {
    id: 'hybrid',
    name: 'Hybrid Mode',
    title: 'Hybrid Mode',
    description: 'Goal Mode with Multiple Goals',
    icon: '🔗',

    defaultRules: [
      // Path Mode rules for linear progression
      PATH_MODE_RULES.NO_BACKTRACE, // No going backward (linear progression)
      PATH_MODE_RULES.NO_HANGERS, // Every item must connect (no unconnected items)
      
      // Core game rules
      GAME_RULES.TIMER_ENABLED, // Has timer (user picks time)
      GAME_RULES.ALLOW_HINTS, // Can use hint system

      // Search filters
      SEARCH_RULES.CAST_FILTER, // Filter by actor/actress
      SEARCH_RULES.MEDIA_TYPE_FILTER, // Filter by movie/tv/person
      SEARCH_RULES.DECADE_FILTER, // Filter by year range
    ],

    maxItems: Infinity, // Multiple goals possible
    settings: ['goals', 'connectionsPerPath', 'itemsPerPathStart'],

    // Common settings (inherited by all modes)
    commonSettings: COMMON_MODE_SETTINGS,

    winCondition: 'complete_all_paths', // Must complete all path challenges
    allowsBranching: true, // Allow branching from starting item
    timeLimit: 600, // 10 minutes default (more complex)
  },


  anti: {
    id: 'anti',
    name: 'Anti Mode',
    title: 'Anti Mode',
    description: 'Keep as many items unconnected as possible',
    icon: '🚫',

    defaultRules: [
      GAME_RULES.NO_CONNECTIONS, // Goal is to keep items unconnected
      GAME_RULES.TIMER_ENABLED, // Has timer (user picks time)
      GAME_RULES.DISABLE_HINTS, // No hints - avoid connections entirely
      SEARCH_RULES.CAST_FILTER, // Filter by actor/actress
      SEARCH_RULES.MEDIA_TYPE_FILTER, // Filter by movie/tv/person
      SEARCH_RULES.DECADE_FILTER, // Filter by year range
    ],

    maxItems: 19, // Generate 1-19 forbidden items based on slider
    settings: ['avoidItems', 'avoidCount'],

    // Common settings (inherited by all modes)
    commonSettings: COMMON_MODE_SETTINGS,

    winCondition: 'avoid_connections', // Must avoid making any connections
    allowsBranching: false, // No connections at all
    timeLimit: 120, // 2 minutes default
  },

  zen: {
    id: 'zen',
    name: 'Zen Mode',
    title: 'Zen Mode',
    description: 'Free play with no specific goals',
    icon: '🧘',

    defaultRules: [
      GAME_RULES.ALLOW_BRANCHING, // Can connect to multiple items from start
      GAME_RULES.ALLOW_HANGERS, // Items can have multiple connections
      GAME_RULES.ALLOW_HINTS, // Can use hint system
      SEARCH_RULES.CAST_FILTER, // Filter by actor/actress
      SEARCH_RULES.MEDIA_TYPE_FILTER, // Filter by movie/tv/person
      SEARCH_RULES.DECADE_FILTER, // Filter by year range
    ],

    maxItems: 0, // No items to configure
    settings: [], // No settings needed

    // Common settings (inherited by all modes)
    commonSettings: {
      ...COMMON_MODE_SETTINGS,
      timer: {
        ...COMMON_MODE_SETTINGS.timer,
        enabled: false, // Zen mode has no timer
      },
    },

    winCondition: 'free_play', // No specific win condition
    allowsBranching: true, // Can create multiple connections
    timeLimit: null, // No time limit
  },

  custom: {
    id: 'custom',
    name: 'Challenge Builder',
    title: 'Challenge Builder',
    description: 'Create your own game rules and experiment',
    icon: '⚙️',

    defaultRules: [], // User picks all rules

    maxItems: Infinity, // Any number of items
    settings: ['goals', 'rules', 'difficulty', 'timeLimit'],

    // Common settings (inherited by all modes)
    commonSettings: COMMON_MODE_SETTINGS,

    winCondition: 'custom', // User defines win condition
    allowsBranching: true, // Can be configured
    timeLimit: null, // User sets time limit
  },
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get a specific game mode by ID
 * @param {string} modeId - The mode ID to get
 * @returns {Object|null} - The game mode object or null if not found
 */
export function getGameMode(modeId) {
  return GAME_MODES[modeId] || null
}

/**
 * Get all game mode IDs
 * @returns {Array} - Array of all mode IDs
 */
export function getAllModeIds() {
  return Object.keys(GAME_MODES)
}

/**
 * Get all game modes as an array
 * @returns {Array} - Array of all game mode objects
 */
export function getAllGameModes() {
  return Object.values(GAME_MODES)
}

/**
 * Check if a mode has a specific rule
 * @param {string} modeId - The mode ID to check
 * @param {string} rule - The rule to check for
 * @returns {boolean} - True if the mode has the rule
 */
export function modeHasRule(modeId, rule) {
  const mode = getGameMode(modeId)
  return mode ? mode.defaultRules.includes(rule) : false
}

/**
 * Get all rules for a specific mode
 * @param {string} modeId - The mode ID to get rules for
 * @returns {Array} - Array of rule strings for the mode
 */
export function getModeRules(modeId) {
  const mode = getGameMode(modeId)
  return mode ? [...mode.defaultRules] : []
}

/**
 * Get mode settings configuration
 * @param {string} modeId - The mode ID to get settings for
 * @returns {Array} - Array of setting keys for the mode
 */
export function getModeSettings(modeId) {
  const mode = getGameMode(modeId)
  return mode ? [...mode.settings] : []
}

/**
 * Check if a mode allows branching
 * @param {string} modeId - The mode ID to check
 * @returns {boolean} - True if the mode allows branching
 */
export function modeAllowsBranching(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.allowsBranching : false
}

/**
 * Get the time limit for a mode
 * @param {string} modeId - The mode ID to get time limit for
 * @returns {number|null} - Time limit in seconds or null if no limit
 */
export function getModeTimeLimit(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.timeLimit : null
}

/**
 * Get common settings for a specific mode
 * @param {string} modeId - The mode ID to get common settings for
 * @returns {Object} - Common settings object for the mode
 */
export function getModeCommonSettings(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.commonSettings : COMMON_MODE_SETTINGS
}

/**
 * Check if a mode has timer enabled
 * @param {string} modeId - The mode ID to check
 * @returns {boolean} - True if the mode has timer enabled
 */
export function modeHasTimer(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.commonSettings?.timer?.enabled : false
}

/**
 * Check if a mode has cast filter enabled
 * @param {string} modeId - The mode ID to check
 * @returns {boolean} - True if the mode has cast filter enabled
 */
export function modeHasCastFilter(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.commonSettings?.castFilter?.enabled : false
}

/**
 * Check if a mode has board clear after goal enabled
 * @param {string} modeId - The mode ID to check
 * @returns {boolean} - True if the mode has board clear enabled
 */
export function modeHasBoardClear(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.commonSettings?.board?.clearAfterGoal : false
}

/**
 * Check if a mode has hints enabled
 * @param {string} modeId - The mode ID to check
 * @returns {boolean} - True if the mode has hints enabled
 */
export function modeHasHints(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.commonSettings?.hints?.enabled : false
}

/**
 * Get timer options for a specific mode
 * @param {string} modeId - The mode ID to get timer options for
 * @returns {Array} - Array of timer options in seconds
 */
export function getModeTimerOptions(modeId) {
  const mode = getGameMode(modeId)
  return mode
    ? mode.commonSettings?.timer?.options || [60, 180, 300, 600, 900]
    : [60, 180, 300, 600, 900]
}

/**
 * Get cast filter options for a specific mode
 * @param {string} modeId - The mode ID to get cast filter options for
 * @returns {Array} - Array of cast filter options
 */
export function getModeCastFilterOptions(modeId) {
  const mode = getGameMode(modeId)
  return mode
    ? mode.commonSettings?.castFilter?.options || ['mixed', 'male', 'female']
    : ['mixed', 'male', 'female']
}

/**
 * Check if a mode uses Path Mode rules (makes Goal Mode harder)
 * @param {string} modeId - The mode ID to check
 * @returns {boolean} - True if the mode uses Path Mode rules
 */
export function modeUsesPathRules(modeId) {
  const mode = getGameMode(modeId)
  if (!mode) return false

  const pathModeRules = Object.values(PATH_MODE_RULES)
  return pathModeRules.some((rule) => mode.defaultRules.includes(rule))
}
