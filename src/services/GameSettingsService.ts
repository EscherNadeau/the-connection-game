import { log } from './ui/log.ts'

class GameSettingsService {
  constructor() {
    this.gameOptions = null
    this.defaultSettings = {
      // Goal Mode Settings
      goalStartType: 'random',
      goalEndType: 'random',
      goalStartItem: null,
      goalEndItem: null,

      // Path Mode Settings
      pathStartType: 'random',
      pathLength: '5',
      customPathLength: 5,
      pathStartItem: null,

      // Knowledge Mode Settings
      knowledgeStartType: 'random',
      questionCount: '10',
      knowledgeStartItem: null,

      // Anti Mode Settings
      antiModeRules: 'avoid_connections',

      // Custom Mode Settings
      gameType: 'goal', // goal, path, knowledge, anti
      goals: [],
      timeLimit: '5',
      customTimeLimit: 5,
      castFilter: 'mixed', // mixed, actors_only, movies_only

      // General Settings
      difficulty: 'normal',
      theme: 'classic',
      soundEnabled: true,
      animationsEnabled: true,
      debugMode: false,
    }

    this.availableGameTypes = ['goal', 'path', 'knowledge', 'anti']
    this.availableCastFilters = ['mixed', 'actors_only', 'movies_only']
    this.availableDifficulties = ['easy', 'normal', 'hard']
    this.availableThemes = ['classic', 'modern', 'dark', 'light']
  }

  /**
   * Initialize the service with game options
   */
  initialize(gameOptions) {
    this.gameOptions = gameOptions || {}
    this.validateAndMergeSettings()

    log(602, { count: 'Game Settings Service initialized' })
  }

  /**
   * Validate and merge settings with defaults
   */
  validateAndMergeSettings() {
    if (!this.gameOptions) {
      this.gameOptions = { ...this.defaultSettings }
      return
    }

    // Merge with defaults, keeping user settings
    this.gameOptions = {
      ...this.defaultSettings,
      ...this.gameOptions,
    }

    // Validate critical settings
    this.validateGameType()
    this.validateCastFilter()
    this.validateDifficulty()
    this.validateTheme()

    log(602, { count: 'Settings validated and merged' })
  }

  /**
   * Validate game type
   */
  validateGameType() {
    if (this.gameOptions.gameType && !this.availableGameTypes.includes(this.gameOptions.gameType)) {
      log(1004, { state: `Invalid game type: ${this.gameOptions.gameType}, using default: goal` })
      this.gameOptions.gameType = 'goal'
    }
  }

  /**
   * Validate cast filter
   */
  validateCastFilter() {
    if (
      this.gameOptions.castFilter &&
      !this.availableCastFilters.includes(this.gameOptions.castFilter)
    ) {
      log(1004, {
        state: `Invalid cast filter: ${this.gameOptions.castFilter}, using default: mixed`,
      })
      this.gameOptions.castFilter = 'mixed'
    }
  }

  /**
   * Validate difficulty
   */
  validateDifficulty() {
    if (
      this.gameOptions.difficulty &&
      !this.availableDifficulties.includes(this.gameOptions.difficulty)
    ) {
      log(1004, {
        state: `Invalid difficulty: ${this.gameOptions.difficulty}, using default: normal`,
      })
      this.gameOptions.difficulty = 'normal'
    }
  }

  /**
   * Validate theme
   */
  validateTheme() {
    if (this.gameOptions.theme && !this.availableThemes.includes(this.gameOptions.theme)) {
      log(1004, { state: `Invalid theme: ${this.gameOptions.theme}, using default: classic` })
      this.gameOptions.theme = 'classic'
    }
  }

  /**
   * Get current game options
   */
  getGameOptions() {
    return this.gameOptions
  }

  /**
   * Get a specific setting value
   */
  getSetting(key, defaultValue = null) {
    return this.gameOptions?.[key] ?? defaultValue
  }

  /**
   * Set a specific setting value
   */
  setSetting(key, value) {
    if (!this.gameOptions) {
      this.gameOptions = {}
    }

    this.gameOptions[key] = value
    log(602, { count: `Setting updated: ${key} = ${value}` })
  }

  /**
   * Get game type
   */
  getGameType() {
    return this.gameOptions?.gameType || 'goal'
  }

  /**
   * Set game type
   */
  setGameType(gameType) {
    if (this.availableGameTypes.includes(gameType)) {
      this.setSetting('gameType', gameType)
      log(602, { count: `Game type set to: ${gameType}` })
    } else {
      log(1004, { state: `Invalid game type: ${gameType}` })
    }
  }

  /**
   * Get cast filter
   */
  getCastFilter() {
    return this.gameOptions?.castFilter || 'mixed'
  }

  /**
   * Set cast filter
   */
  setCastFilter(filter) {
    if (this.availableCastFilters.includes(filter)) {
      this.setSetting('castFilter', filter)
      log(602, { count: `Cast filter set to: ${filter}` })
    } else {
      log(1004, { state: `Invalid cast filter: ${filter}` })
    }
  }

  /**
   * Get difficulty
   */
  getDifficulty() {
    return this.gameOptions?.difficulty || 'normal'
  }

  /**
   * Set difficulty
   */
  setDifficulty(difficulty) {
    if (this.availableDifficulties.includes(difficulty)) {
      this.setSetting('difficulty', difficulty)
      log(602, { count: `Difficulty set to: ${difficulty}` })
    } else {
      log(1004, { state: `Invalid difficulty: ${difficulty}` })
    }
  }

  /**
   * Get theme
   */
  getTheme() {
    return this.gameOptions?.theme || 'classic'
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    if (this.availableThemes.includes(theme)) {
      this.setSetting('theme', theme)
      log(602, { count: `Theme set to: ${theme}` })
    } else {
      log(1004, { state: `Invalid theme: ${theme}` })
    }
  }

  /**
   * Get goals array
   */
  getGoals() {
    return this.gameOptions?.goals || []
  }

  /**
   * Set goals array
   */
  setGoals(goals) {
    if (Array.isArray(goals)) {
      this.setSetting('goals', goals)
      log(602, { count: `Goals set: ${goals.length} goals` })
    } else {
      log(1004, { state: 'Goals must be an array' })
    }
  }

  /**
   * Add a goal
   */
  addGoal(goal) {
    const goals = this.getGoals()
    goals.push(goal)
    this.setGoals(goals)
  }

  /**
   * Remove a goal by index
   */
  removeGoal(index) {
    const goals = this.getGoals()
    if (index >= 0 && index < goals.length) {
      goals.splice(index, 1)
      this.setGoals(goals)
      log(602, { count: `Goal removed at index: ${index}` })
    }
  }

  /**
   * Get time limit
   */
  getTimeLimit() {
    const timeLimit = this.gameOptions?.timeLimit || '5'
    // Convert to number and ensure it's positive
    const minutes = parseInt(timeLimit, 10)
    return minutes > 0 ? minutes : 5
  }

  /**
   * Set time limit
   */
  setTimeLimit(timeLimit) {
    this.setSetting('timeLimit', timeLimit)
    log(602, { count: `Time limit set to: ${timeLimit}` })
  }

  /**
   * Get custom time limit
   */
  getCustomTimeLimit() {
    return this.gameOptions?.customTimeLimit || 5
  }

  /**
   * Set custom time limit
   */
  setCustomTimeLimit(minutes) {
    if (typeof minutes === 'number' && minutes > 0) {
      this.setSetting('customTimeLimit', minutes)
      log(602, { count: `Custom time limit set to: ${minutes} minutes` })
    } else {
      log(1004, { state: 'Custom time limit must be a positive number' })
    }
  }

  /**
   * Get path length
   */
  getPathLength() {
    return this.gameOptions?.pathLength || '5'
  }

  /**
   * Set path length
   */
  setPathLength(length) {
    this.setSetting('pathLength', length)
    log(602, { count: `Path length set to: ${length}` })
  }

  /**
   * Get custom path length
   */
  getCustomPathLength() {
    return this.gameOptions?.customPathLength || 5
  }

  /**
   * Set custom path length
   */
  setCustomPathLength(length) {
    if (typeof length === 'number' && length > 0) {
      this.setSetting('customPathLength', length)
      log(602, { count: `Custom path length set to: ${length}` })
    } else {
      log(1004, { state: 'Custom path length must be a positive number' })
    }
  }

  /**
   * Get question count for knowledge mode
   */
  getQuestionCount() {
    return this.gameOptions?.questionCount || '10'
  }

  /**
   * Set question count for knowledge mode
   */
  setQuestionCount(count) {
    this.setSetting('questionCount', count)
    log(602, { count: `Question count set to: ${count}` })
  }

  /**
   * Get start type for a specific mode
   */
  getStartType(mode) {
    const key = `${mode}StartType`
    return this.gameOptions?.[key] || 'random'
  }

  /**
   * Set start type for a specific mode
   */
  setStartType(mode, startType) {
    const key = `${mode}StartType`
    this.setSetting(key, startType)
    log(602, { count: `${mode} start type set to: ${startType}` })
  }

  /**
   * Get start item for a specific mode
   */
  getStartItem(mode) {
    const key = `${mode}StartItem`
    return this.gameOptions?.[key] || null
  }

  /**
   * Set start item for a specific mode
   */
  setStartItem(mode, item) {
    const key = `${mode}StartItem`
    this.setSetting(key, item)
    log(602, { count: `${mode} start item set` })
  }

  /**
   * Check if sound is enabled
   */
  isSoundEnabled() {
    return this.gameOptions?.soundEnabled ?? true
  }

  /**
   * Set sound enabled/disabled
   */
  setSoundEnabled(enabled) {
    this.setSetting('soundEnabled', !!enabled)
    log(602, { count: `Sound ${enabled ? 'enabled' : 'disabled'}` })
  }

  /**
   * Check if animations are enabled
   */
  areAnimationsEnabled() {
    return this.gameOptions?.animationsEnabled ?? true
  }

  /**
   * Set animations enabled/disabled
   */
  setAnimationsEnabled(enabled) {
    this.setSetting('animationsEnabled', !!enabled)
    log(602, { count: `Animations ${enabled ? 'enabled' : 'disabled'}` })
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugMode() {
    return this.gameOptions?.debugMode ?? false
  }

  /**
   * Set debug mode enabled/disabled
   */
  setDebugMode(enabled) {
    this.setSetting('debugMode', !!enabled)
    log(602, { count: `Debug mode ${enabled ? 'enabled' : 'disabled'}` })
  }

  /**
   * Reset all settings to defaults
   */
  resetToDefaults() {
    this.gameOptions = { ...this.defaultSettings }
    log(602, { count: 'Settings reset to defaults' })
  }

  /**
   * Get all available options for a specific setting type
   */
  getAvailableOptions(settingType) {
    switch (settingType) {
      case 'gameTypes':
        return this.availableGameTypes
      case 'castFilters':
        return this.availableCastFilters
      case 'difficulties':
        return this.availableDifficulties
      case 'themes':
        return this.availableThemes
      default:
        return []
    }
  }

  /**
   * Export current settings
   */
  exportSettings() {
    return {
      ...this.gameOptions,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    }
  }

  /**
   * Import settings
   */
  importSettings(settings) {
    if (settings && typeof settings === 'object') {
      // Remove metadata
      const { exportDate, version, ...gameSettings } = settings

      this.gameOptions = { ...this.defaultSettings, ...gameSettings }
      this.validateAndMergeSettings()

      log(602, { count: 'Settings imported successfully' })
      return true
    } else {
      log(1004, { state: 'Invalid settings format for import' })
      return false
    }
  }

  /**
   * Get settings summary
   */
  getSettingsSummary() {
    return {
      gameType: this.getGameType(),
      castFilter: this.getCastFilter(),
      difficulty: this.getDifficulty(),
      theme: this.getTheme(),
      goalsCount: this.getGoals().length,
      timeLimit: this.getTimeLimit(),
      pathLength: this.getPathLength(),
      questionCount: this.getQuestionCount(),
      soundEnabled: this.isSoundEnabled(),
      animationsEnabled: this.areAnimationsEnabled(),
      debugMode: this.isDebugMode(),
    }
  }

  /**
   * Validate all settings
   */
  validateAllSettings() {
    const errors = []

    // Validate game type
    if (!this.availableGameTypes.includes(this.getGameType())) {
      errors.push(`Invalid game type: ${this.getGameType()}`)
    }

    // Validate cast filter
    if (!this.availableCastFilters.includes(this.getCastFilter())) {
      errors.push(`Invalid cast filter: ${this.getCastFilter()}`)
    }

    // Validate difficulty
    if (!this.availableDifficulties.includes(this.getDifficulty())) {
      errors.push(`Invalid difficulty: ${this.getDifficulty()}`)
    }

    // Validate theme
    if (!this.availableThemes.includes(this.getTheme())) {
      errors.push(`Invalid theme: ${this.getTheme()}`)
    }

    // Validate numeric values
    if (this.getCustomTimeLimit() <= 0) {
      errors.push('Custom time limit must be positive')
    }

    if (this.getCustomPathLength() <= 0) {
      errors.push('Custom path length must be positive')
    }

    if (errors.length > 0) {
      log(1004, { state: `Settings validation errors: ${errors.join(', ')}` })
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  }
}

export default new GameSettingsService()
