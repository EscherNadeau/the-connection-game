/**
 * Game Rules Engine
 * Defines all available rules that can be applied to game modes
 * Uses simple yes/no boolean states for cleaner rule management
 */

// ========================================
// UI & GAMEPLAY RULES (No API calls needed)
// ========================================
export const GAME_RULES = {
  // Connection & Path Rules
  ALLOW_BRANCHING: 'allow_branching', // Can connect to multiple items from start
  LINEAR_PATH_ONLY: 'linear_path_only', // One path forward only (no side branches)
  NO_BACKTRACE: 'no_backtrace', // No backward connections (C → A)

  // Hanger Rules
  ALLOW_HANGERS: 'allow_hangers', // Items can be left unconnected

  // Time Rules
  TIMER_ENABLED: 'timer_enabled', // Has timer (user picks time)

  // Hint Rules
  ALLOW_HINTS: 'allow_hints', // Can use hint system
  DISABLE_HINTS: 'disable_hints', // Cannot use hint system

  // Board Flow Rules
  CLEAR_BOARD: 'clear_board', // Clear board after each goal/challenge

  // Anti Mode Rules
  NO_CONNECTIONS: 'no_connections', // Goal is to keep items unconnected (isolation mode)
}

// ========================================
// SEARCH & FILTER RULES (Use existing TMDB API)
// ========================================
export const SEARCH_RULES = {
  CAST_FILTER: 'cast_filter', // Filter by actor/actress
  MEDIA_TYPE_FILTER: 'media_type_filter', // Filter by movie/tv/person
  DECADE_FILTER: 'decade_filter', // Filter by year range
}

// ========================================
// FUTURE RULES (For upcoming game modes)
// ========================================
export const FUTURE_RULES = {
  // Timeline Mode (just dates, no cast checking)
  TIMELINE_ORDER: 'timeline_order', // Must place items in chronological order
  ALLOW_TIMELINE_BRANCHING: 'allow_timeline_branching', // Can have multiple timeline paths
}

// ========================================
// CONNECTION RESTRICTIONS
// ========================================
export const CONNECTION_RULES = {
  // Connection type restrictions - only cross-type connections allowed
  CROSS_TYPE_ONLY: 'cross_type_only', // Actor↔Movie, Actor↔TV Show only (no Actor→Actor, Movie→Movie, etc.)
  NO_SAME_TYPE_CONNECTIONS: 'no_same_type_connections', // Cannot connect same media types
}

// ========================================
// PATH MODE RULE COLLECTION (Applied to Goal Mode)
// ========================================
export const PATH_MODE_RULES = {
  // Path Mode is now a collection of rules that make Goal Mode harder
  LINEAR_PATH_ONLY: 'linear_path_only', // One path forward only (no side branches)
  NO_BACKTRACE: 'no_backtrace', // No backward connections (keep moving forward)
  NO_HANGERS: 'no_hangers', // Every item must connect (no unconnected items)
  SINGLE_PATH: 'single_path', // Only one path allowed (no branching)
}

// ========================================
// RULE DESCRIPTIONS (For UI display)
// ========================================
export const RULE_DESCRIPTIONS = {
  // UI & Gameplay Rules
  [GAME_RULES.ALLOW_BRANCHING]: 'Allow multiple connections from starting point',
  [GAME_RULES.LINEAR_PATH_ONLY]: 'One path forward only (no side branches)',
  [GAME_RULES.NO_BACKTRACE]: 'No backward connections (keep moving forward)',
  [GAME_RULES.ALLOW_HANGERS]: 'Items can be left unconnected',
  [GAME_RULES.TIMER_ENABLED]: 'Game has timer (user picks time)',
  [GAME_RULES.ALLOW_HINTS]: 'Can use hint system',
  [GAME_RULES.DISABLE_HINTS]: 'Cannot use hint system',
  [GAME_RULES.CLEAR_BOARD]: 'Clear board after each goal/challenge',
  [GAME_RULES.NO_CONNECTIONS]: 'Goal is to keep items unconnected (isolation mode)',

  // Search Rules
  [SEARCH_RULES.CAST_FILTER]: 'Filter by actor/actress',
  [SEARCH_RULES.MEDIA_TYPE_FILTER]: 'Filter by movie/tv/person',
  [SEARCH_RULES.DECADE_FILTER]: 'Filter by year range',

  // Future Rules
  [FUTURE_RULES.TIMELINE_ORDER]: 'Must place items in chronological order',
  [FUTURE_RULES.ALLOW_TIMELINE_BRANCHING]: 'Can have multiple timeline paths',

  // Connection Rules
  [CONNECTION_RULES.CROSS_TYPE_ONLY]:
    'Only connect different media types (Actor↔Movie, Actor↔TV Show). You can start with anything.',
  [CONNECTION_RULES.NO_SAME_TYPE_CONNECTIONS]:
    'Cannot connect same media types (no Actor→Actor, Movie→Movie)',

  // Path Mode Rules (Applied to Goal Mode)
  [PATH_MODE_RULES.LINEAR_PATH_ONLY]: 'One path forward only (no side branches)',
  [PATH_MODE_RULES.NO_BACKTRACE]: 'No backward connections (keep moving forward)',
  [PATH_MODE_RULES.NO_HANGERS]: 'Every item must connect (no unconnected items)',
  [PATH_MODE_RULES.SINGLE_PATH]: 'Only one path allowed (no branching)',
}

// ========================================
// RULE CATEGORIES (For organization)
// ========================================
export const RULE_CATEGORIES = {
  CONNECTION: 'connection',
  PATH: 'path',
  HANGERS: 'hangers',
  TIME: 'time',
  HINTS: 'hints',
  BOARD: 'board',
  SEARCH: 'search',
  FUTURE: 'future',
  RESTRICTIONS: 'restrictions',
  PATH_MODE: 'path_mode',
}

// ========================================
// RULE VALIDATION (Check if rules conflict)
// ========================================
export const CONFLICTING_RULES = {
  // Rules that cannot be used together
  [GAME_RULES.ALLOW_BRANCHING]: [GAME_RULES.LINEAR_PATH_ONLY], // Can't allow branching AND require linear path
  [GAME_RULES.LINEAR_PATH_ONLY]: [GAME_RULES.ALLOW_BRANCHING], // Can't require linear path AND allow branching
  [GAME_RULES.ALLOW_HANGERS]: [GAME_RULES.NO_CONNECTIONS], // Can't allow hangers AND require no connections
  [GAME_RULES.NO_CONNECTIONS]: [GAME_RULES.ALLOW_HANGERS], // Can't require no connections AND allow hangers
  [GAME_RULES.ALLOW_HINTS]: [GAME_RULES.DISABLE_HINTS], // Can't allow hints AND disable hints
  [GAME_RULES.DISABLE_HINTS]: [GAME_RULES.ALLOW_HINTS], // Can't disable hints AND allow hints

  // Path Mode rule conflicts
  [PATH_MODE_RULES.LINEAR_PATH_ONLY]: [GAME_RULES.ALLOW_BRANCHING], // Path Mode rules conflict with branching
  [PATH_MODE_RULES.SINGLE_PATH]: [GAME_RULES.ALLOW_BRANCHING], // Single path conflicts with branching
}

/**
 * Check if two rules conflict with each other
 * @param {string} rule1 - First rule
 * @param {string} rule2 - Second rule
 * @returns {boolean} - True if rules conflict
 */
export function rulesConflict(rule1, rule2) {
  const conflicts = CONFLICTING_RULES[rule1] || []
  return conflicts.includes(rule2)
}

/**
 * Get all available rules
 * @returns {Object} - All game rules combined
 */
export function getAllRules() {
  return {
    ...GAME_RULES,
    ...SEARCH_RULES,
    ...FUTURE_RULES,
    ...CONNECTION_RULES,
    ...PATH_MODE_RULES,
  }
}

/**
 * Get rules by category
 * @param {string} category - Rule category
 * @returns {Array} - Array of rule keys in that category
 */
export function getRulesByCategory(category) {
  switch (category) {
    case RULE_CATEGORIES.CONNECTION:
      return [GAME_RULES.ALLOW_BRANCHING, GAME_RULES.LINEAR_PATH_ONLY, GAME_RULES.NO_BACKTRACE]
    case RULE_CATEGORIES.PATH:
      return [GAME_RULES.LINEAR_PATH_ONLY, GAME_RULES.NO_BACKTRACE]
    case RULE_CATEGORIES.HANGERS:
      return [GAME_RULES.ALLOW_HANGERS, GAME_RULES.NO_CONNECTIONS]
    case RULE_CATEGORIES.TIME:
      return [GAME_RULES.TIMER_ENABLED]
    case RULE_CATEGORIES.HINTS:
      return [GAME_RULES.ALLOW_HINTS, GAME_RULES.DISABLE_HINTS]
    case RULE_CATEGORIES.BOARD:
      return [GAME_RULES.CLEAR_BOARD]
    case RULE_CATEGORIES.SEARCH:
      return Object.values(SEARCH_RULES)
    case RULE_CATEGORIES.FUTURE:
      return Object.values(FUTURE_RULES)
    case RULE_CATEGORIES.RESTRICTIONS:
      return Object.values(CONNECTION_RULES)
    case RULE_CATEGORIES.PATH_MODE:
      return Object.values(PATH_MODE_RULES)
    default:
      return []
  }
}

/**
 * Get Path Mode rules as a collection (for applying to Goal Mode)
 * @returns {Array} - Array of Path Mode rule keys
 */
export function getPathModeRules() {
  return Object.values(PATH_MODE_RULES)
}

/**
 * Check if a set of rules would create Path Mode behavior
 * @param {Object} selectedRules - Object with rule keys as keys and boolean values
 * @returns {boolean} - True if rules would create Path Mode behavior
 */
export function isPathModeRules(selectedRules) {
  const pathModeRules = getPathModeRules()
  return pathModeRules.every((rule) => selectedRules[rule])
}
