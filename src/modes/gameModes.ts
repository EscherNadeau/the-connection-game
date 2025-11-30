/**
 * Game Modes Configuration
 * Defines each game mode with its default rules, settings, and behavior
 * Uses the rules engine from gameRules.js
 */

import { GAME_RULES, SEARCH_RULES, PATH_MODE_RULES } from '../rules/gameRules.ts'

// ========================================
// MODE CATEGORIES
// ========================================
export const MODE_CATEGORIES = {
  MAIN: 'main',       // Primary modes shown on main screen
  ODDITY: 'oddity',   // Special/experimental modes in "Oddities" section
  HIDDEN: 'hidden',   // Deprecated modes (not shown in UI)
}

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
    description: 'Connect items to reach your goal',
    icon: '🎯',
    category: MODE_CATEGORIES.MAIN,

    // Default rules for this mode
    defaultRules: [
      GAME_RULES.ALLOW_HANGERS,
      GAME_RULES.TIMER_ENABLED,
      GAME_RULES.ALLOW_HINTS,
      SEARCH_RULES.CAST_FILTER,
      SEARCH_RULES.MEDIA_TYPE_FILTER,
      SEARCH_RULES.DECADE_FILTER,
    ],

    // Settings configuration - now includes numberOfGoals (absorbed from Hybrid)
    maxItems: 2,
    settings: ['goal1', 'goal2'],

    // Multi-goal settings (absorbed from Hybrid mode)

    // Path difficulty options

    commonSettings: COMMON_MODE_SETTINGS,
    winCondition: 'reach_goals',
    allowsBranching: true,
    timeLimit: 300,
  },

  zen: {
    id: 'zen',
    name: 'Zen Mode',
    title: 'Zen Mode',
    description: 'Free play, no pressure',
    icon: '🧘',
    category: MODE_CATEGORIES.MAIN,

    defaultRules: [
      GAME_RULES.ALLOW_BRANCHING,
      GAME_RULES.ALLOW_HANGERS,
      GAME_RULES.ALLOW_HINTS,
      SEARCH_RULES.CAST_FILTER,
      SEARCH_RULES.MEDIA_TYPE_FILTER,
      SEARCH_RULES.DECADE_FILTER,
    ],

    maxItems: 0,
    settings: [],

    commonSettings: {
      ...COMMON_MODE_SETTINGS,
      timer: {
        ...COMMON_MODE_SETTINGS.timer,
        enabled: false,
      },
    },

    winCondition: 'free_play',
    allowsBranching: true,
    timeLimit: null,
  },

  custom: {
    id: 'custom',
    name: 'Show Builder',
    title: 'Show Builder',
    description: 'Create themed challenge collections',
    icon: '📺',
    category: MODE_CATEGORIES.HIDDEN,

    defaultRules: [],

    maxItems: Infinity,
    settings: ['goals', 'rules', 'difficulty', 'timeLimit', 'episodes'],

    commonSettings: COMMON_MODE_SETTINGS,

    winCondition: 'custom',
    allowsBranching: true,
    timeLimit: null,
  },

  knowledge: {
    id: 'knowledge',
    name: 'Knowledge Mode',
    title: 'Knowledge Mode',
    description: 'Name X connections from one item',
    icon: '🧠',
    category: MODE_CATEGORIES.ODDITY,

    defaultRules: [
      GAME_RULES.NO_HANGERS,
      GAME_RULES.TIMER_ENABLED,
      GAME_RULES.ALLOW_HINTS,
      SEARCH_RULES.CAST_FILTER,
      SEARCH_RULES.MEDIA_TYPE_FILTER,
      SEARCH_RULES.DECADE_FILTER,
    ],

    maxItems: 1,
    settings: ['startingItem', 'connectionCount'],

    commonSettings: COMMON_MODE_SETTINGS,

    winCondition: 'name_connections',
    allowsBranching: true,
    timeLimit: 180,
  },

  anti: {
    id: 'anti',
    name: 'Anti Mode',
    title: 'Anti Mode',
    description: 'Avoid making connections',
    icon: '🚫',
    category: MODE_CATEGORIES.ODDITY,

    defaultRules: [
      GAME_RULES.NO_CONNECTIONS,
      GAME_RULES.TIMER_ENABLED,
      GAME_RULES.DISABLE_HINTS,
      SEARCH_RULES.CAST_FILTER,
      SEARCH_RULES.MEDIA_TYPE_FILTER,
      SEARCH_RULES.DECADE_FILTER,
    ],

    maxItems: 19,
    settings: ['avoidItems', 'avoidCount'],

    commonSettings: COMMON_MODE_SETTINGS,

    winCondition: 'avoid_connections',
    allowsBranching: false,
    timeLimit: 120,
  },

  // DEPRECATED: Hybrid mode - functionality merged into Goal Mode
  hybrid: {
    id: 'hybrid',
    name: 'Hybrid Mode',
    title: 'Hybrid Mode',
    description: 'DEPRECATED - Use Goal Mode with multiple goals',
    icon: '🔗',
    category: MODE_CATEGORIES.HIDDEN,

    defaultRules: [
      PATH_MODE_RULES.NO_BACKTRACE,
      PATH_MODE_RULES.NO_HANGERS,
      GAME_RULES.TIMER_ENABLED,
      GAME_RULES.ALLOW_HINTS,
      SEARCH_RULES.CAST_FILTER,
      SEARCH_RULES.MEDIA_TYPE_FILTER,
      SEARCH_RULES.DECADE_FILTER,
    ],

    maxItems: Infinity,
    settings: ['goals', 'connectionsPerPath', 'itemsPerPathStart'],
    commonSettings: COMMON_MODE_SETTINGS,
    winCondition: 'complete_all_paths',
    allowsBranching: true,
    timeLimit: 600,
    deprecated: true,
  },
}

// ========================================
// HELPER FUNCTIONS
// ========================================

export function getGameMode(modeId) {
  return GAME_MODES[modeId] || null
}

export function getAllModeIds() {
  return Object.keys(GAME_MODES).filter(id => 
    GAME_MODES[id].category !== MODE_CATEGORIES.HIDDEN
  )
}

export function getAllGameModes() {
  return Object.values(GAME_MODES).filter(mode => 
    mode.category !== MODE_CATEGORIES.HIDDEN
  )
}

export function getModesByCategory(category) {
  return Object.values(GAME_MODES).filter(mode => mode.category === category)
}

export function getMainModes() {
  return getModesByCategory(MODE_CATEGORIES.MAIN)
}

export function getOddityModes() {
  return getModesByCategory(MODE_CATEGORIES.ODDITY)
}

export function modeHasRule(modeId, rule) {
  const mode = getGameMode(modeId)
  return mode ? mode.defaultRules.includes(rule) : false
}

export function getModeRules(modeId) {
  const mode = getGameMode(modeId)
  return mode ? [...mode.defaultRules] : []
}

export function getModeSettings(modeId) {
  const mode = getGameMode(modeId)
  return mode ? [...mode.settings] : []
}

export function modeAllowsBranching(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.allowsBranching : false
}

export function getModeTimeLimit(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.timeLimit : null
}

export function getModeCommonSettings(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.commonSettings : COMMON_MODE_SETTINGS
}

export function modeHasTimer(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.commonSettings?.timer?.enabled : false
}

export function modeHasCastFilter(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.commonSettings?.castFilter?.enabled : false
}

export function modeHasBoardClear(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.commonSettings?.board?.clearAfterGoal : false
}

export function modeHasHints(modeId) {
  const mode = getGameMode(modeId)
  return mode ? mode.commonSettings?.hints?.enabled : false
}

export function getModeTimerOptions(modeId) {
  const mode = getGameMode(modeId)
  return mode
    ? mode.commonSettings?.timer?.options || [60, 180, 300, 600, 900]
    : [60, 180, 300, 600, 900]
}

export function getModeCastFilterOptions(modeId) {
  const mode = getGameMode(modeId)
  return mode
    ? mode.commonSettings?.castFilter?.options || ['mixed', 'male', 'female']
    : ['mixed', 'male', 'female']
}

export function modeUsesPathRules(modeId) {
  const mode = getGameMode(modeId)
  if (!mode) return false

  const pathModeRules = Object.values(PATH_MODE_RULES)
  return pathModeRules.some((rule) => mode.defaultRules.includes(rule))
}

export function modeIsDeprecated(modeId) {
  const mode = getGameMode(modeId)
  return mode?.deprecated === true
}
