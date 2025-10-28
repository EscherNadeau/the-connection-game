/**
 * Comprehensive Validation System for Connect The Stars
 * Validates all data structures used throughout the application
 */

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {Array<string>} errors - Array of error messages
 * @property {Array<string>} warnings - Array of warning messages
 */

/**
 * Base validation class
 */
class ValidationService {
  constructor() {
    this.errors = []
    this.warnings = []
  }

  /**
   * Reset validation state
   */
  reset() {
    this.errors = []
    this.warnings = []
  }

  /**
   * Add an error
   * @param {string} message - Error message
   */
  addError(message) {
    this.errors.push(message)
  }

  /**
   * Add a warning
   * @param {string} message - Warning message
   */
  addWarning(message) {
    this.warnings.push(message)
  }

  /**
   * Get validation result
   * @returns {ValidationResult} Validation result
   */
  getResult() {
    return {
      valid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings]
    }
  }

  /**
   * Validate a string field
   * @param {string} value - Value to validate
   * @param {string} fieldName - Name of the field
   * @param {Object} options - Validation options
   * @returns {boolean} Whether validation passed
   */
  validateString(value, fieldName, options = {}) {
    const { required = true, minLength = 0, maxLength = Infinity, allowEmpty = false } = options

    if (required && (value === undefined || value === null)) {
      this.addError(`${fieldName} is required`)
      return false
    }

    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') {
        this.addError(`${fieldName} must be a string`)
        return false
      }

      if (!allowEmpty && value.trim().length === 0) {
        this.addError(`${fieldName} cannot be empty`)
        return false
      }

      if (value.length < minLength) {
        this.addError(`${fieldName} must be at least ${minLength} characters long`)
        return false
      }

      if (value.length > maxLength) {
        this.addError(`${fieldName} must be no more than ${maxLength} characters long`)
        return false
      }
    }

    return true
  }

  /**
   * Validate an array field
   * @param {Array} value - Value to validate
   * @param {string} fieldName - Name of the field
   * @param {Object} options - Validation options
   * @returns {boolean} Whether validation passed
   */
  validateArray(value, fieldName, options = {}) {
    const { required = true, minLength = 0, maxLength = Infinity, itemValidator = null } = options

    if (required && (value === undefined || value === null)) {
      this.addError(`${fieldName} is required`)
      return false
    }

    if (value !== undefined && value !== null) {
      if (!Array.isArray(value)) {
        this.addError(`${fieldName} must be an array`)
        return false
      }

      if (value.length < minLength) {
        this.addError(`${fieldName} must have at least ${minLength} items`)
        return false
      }

      if (value.length > maxLength) {
        this.addError(`${fieldName} must have no more than ${maxLength} items`)
        return false
      }

      // Validate array items if validator provided
      if (itemValidator && typeof itemValidator === 'function') {
        value.forEach((item, index) => {
          const itemResult = itemValidator(item, `${fieldName}[${index}]`)
          if (!itemResult.valid) {
            itemResult.errors.forEach(error => this.addError(error))
            itemResult.warnings.forEach(warning => this.addWarning(warning))
          }
        })
      }
    }

    return true
  }

  /**
   * Validate an object field
   * @param {Object} value - Value to validate
   * @param {string} fieldName - Name of the field
   * @param {Object} options - Validation options
   * @returns {boolean} Whether validation passed
   */
  validateObject(value, fieldName, options = {}) {
    const { required = true, properties = {} } = options

    if (required && (value === undefined || value === null)) {
      this.addError(`${fieldName} is required`)
      return false
    }

    if (value !== undefined && value !== null) {
      if (typeof value !== 'object' || Array.isArray(value)) {
        this.addError(`${fieldName} must be an object`)
        return false
      }

      // Validate object properties
      Object.entries(properties).forEach(([propName, propOptions]) => {
        this.validateField(value[propName], propName, propOptions)
      })
    }

    return true
  }

  /**
   * Validate a field based on its type
   * @param {any} value - Value to validate
   * @param {string} fieldName - Name of the field
   * @param {Object} options - Validation options
   * @returns {boolean} Whether validation passed
   */
  validateField(value, fieldName, options = {}) {
    const { type = 'string' } = options

    switch (type) {
      case 'string':
        return this.validateString(value, fieldName, options)
      case 'array':
        return this.validateArray(value, fieldName, options)
      case 'object':
        return this.validateObject(value, fieldName, options)
      case 'number':
        return this.validateNumber(value, fieldName, options)
      case 'boolean':
        return this.validateBoolean(value, fieldName, options)
      default:
        return true
    }
  }

  /**
   * Validate a number field
   * @param {number} value - Value to validate
   * @param {string} fieldName - Name of the field
   * @param {Object} options - Validation options
   * @returns {boolean} Whether validation passed
   */
  validateNumber(value, fieldName, options = {}) {
    const { required = true, min = -Infinity, max = Infinity, integer = false } = options

    if (required && (value === undefined || value === null)) {
      this.addError(`${fieldName} is required`)
      return false
    }

    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || isNaN(value)) {
        this.addError(`${fieldName} must be a number`)
        return false
      }

      if (integer && !Number.isInteger(value)) {
        this.addError(`${fieldName} must be an integer`)
        return false
      }

      if (value < min) {
        this.addError(`${fieldName} must be at least ${min}`)
        return false
      }

      if (value > max) {
        this.addError(`${fieldName} must be no more than ${max}`)
        return false
      }
    }

    return true
  }

  /**
   * Validate a boolean field
   * @param {boolean} value - Value to validate
   * @param {string} fieldName - Name of the field
   * @param {Object} options - Validation options
   * @returns {boolean} Whether validation passed
   */
  validateBoolean(value, fieldName, options = {}) {
    const { required = true } = options

    if (required && (value === undefined || value === null)) {
      this.addError(`${fieldName} is required`)
      return false
    }

    if (value !== undefined && value !== null && typeof value !== 'boolean') {
      this.addError(`${fieldName} must be a boolean`)
      return false
    }

    return true
  }
}

/**
 * Game Item validation
 */
class GameItemValidator extends ValidationService {
  /**
   * Validate a game item
   * @param {Object} item - Game item to validate
   * @returns {ValidationResult} Validation result
   */
  validate(item) {
    this.reset()

    if (!item || typeof item !== 'object') {
      this.addError('Game item must be an object')
      return this.getResult()
    }

    // Required fields
    this.validateString(item.id, 'id', { required: true, minLength: 1 })
    this.validateString(item.name || item.title, 'name/title', { required: true, minLength: 1 })
    this.validateString(item.type, 'type', { required: true })

    // Optional fields
    if (item.year !== undefined) {
      this.validateNumber(item.year, 'year', { min: 1800, max: new Date().getFullYear() + 10, integer: true })
    }

    if (item.rating !== undefined) {
      this.validateNumber(item.rating, 'rating', { min: 0, max: 10 })
    }

    if (item.x !== undefined) {
      this.validateNumber(item.x, 'x', { min: 0 })
    }

    if (item.y !== undefined) {
      this.validateNumber(item.y, 'y', { min: 0 })
    }

    // Validate TMDB data if present
    if (item.tmdbData) {
      this.validateTmdbData(item.tmdbData)
    }

    return this.getResult()
  }

  /**
   * Validate TMDB data
   * @param {Object} tmdbData - TMDB data to validate
   */
  validateTmdbData(tmdbData) {
    if (!tmdbData || typeof tmdbData !== 'object') {
      this.addError('TMDB data must be an object')
      return
    }

    this.validateNumber(tmdbData.id, 'tmdbData.id', { required: true, integer: true, min: 1 })
    this.validateString(tmdbData.name || tmdbData.title, 'tmdbData.name/title', { required: true, minLength: 1 })
  }
}

/**
 * Episode validation
 */
class EpisodeValidator extends ValidationService {
  /**
   * Validate an episode
   * @param {Object} episode - Episode to validate
   * @returns {ValidationResult} Validation result
   */
  validate(episode) {
    this.reset()

    if (!episode || typeof episode !== 'object') {
      this.addError('Episode must be an object')
      return this.getResult()
    }

    // Required fields
    this.validateString(episode.id, 'id', { required: true, minLength: 1 })
    this.validateString(episode.name, 'name', { required: true, minLength: 1, maxLength: 100 })
    this.validateString(episode.icon, 'icon', { required: true, minLength: 1, maxLength: 10 })
    this.validateString(episode.description, 'description', { required: true, minLength: 1, maxLength: 500 })
    this.validateString(episode.modeType, 'modeType', { required: true })

    // Validate mode type
    const validModeTypes = ['goal', 'knowledge', 'hybrid', 'anti', 'zen']
    if (episode.modeType && !validModeTypes.includes(episode.modeType)) {
      this.addError(`Invalid modeType: ${episode.modeType}. Must be one of: ${validModeTypes.join(', ')}`)
    }

    // Validate goals array
    this.validateArray(episode.goals, 'goals', {
      required: true,
      minLength: 1,
      maxLength: 10,
      itemValidator: (goal, fieldName) => {
        const goalValidator = new ValidationService()
        if (typeof goal === 'string') {
          goalValidator.validateString(goal, fieldName, { required: true, minLength: 1, maxLength: 200 })
        } else if (typeof goal === 'object' && goal !== null) {
          goalValidator.validateString(goal.name || goal.title, fieldName, { required: true, minLength: 1, maxLength: 200 })
        } else {
          goalValidator.addError(`${fieldName} must be a string or object`)
        }
        return goalValidator.getResult()
      }
    })

    // Validate settings object
    this.validateObject(episode.settings, 'settings', {
      required: true,
      properties: {
        'path-mode': { type: 'boolean' },
        'time-limit': { type: 'string' },
        'cast-filter': { type: 'string' },
        'hints': { type: 'boolean' }
      }
    })

    // Validate settings values
    if (episode.settings) {
      this.validateSettings(episode.settings)
    }

    return this.getResult()
  }

  /**
   * Validate episode settings
   * @param {Object} settings - Settings to validate
   */
  validateSettings(settings) {
    // Validate time-limit
    if (settings['time-limit'] !== undefined) {
      const validTimeLimits = ['none', '1min', '5min', '10min', 'custom']
      if (!validTimeLimits.includes(settings['time-limit'])) {
        this.addError(`Invalid time-limit: ${settings['time-limit']}. Must be one of: ${validTimeLimits.join(', ')}`)
      }
    }

    // Validate cast-filter
    if (settings['cast-filter'] !== undefined) {
      const validCastFilters = ['mixed', 'male', 'female']
      if (!validCastFilters.includes(settings['cast-filter'])) {
        this.addError(`Invalid cast-filter: ${settings['cast-filter']}. Must be one of: ${validCastFilters.join(', ')}`)
      }
    }

    // Validate knowledge-items for knowledge mode
    if (settings['knowledge-items'] !== undefined) {
      this.validateNumber(settings['knowledge-items'], 'knowledge-items', { min: 1, max: 20, integer: true })
    }
  }
}

/**
 * Show validation
 */
class ShowValidator extends ValidationService {
  /**
   * Validate a show
   * @param {Object} show - Show to validate
   * @returns {ValidationResult} Validation result
   */
  validate(show) {
    this.reset()

    if (!show || typeof show !== 'object') {
      this.addError('Show must be an object')
      return this.getResult()
    }

    // Required fields
    this.validateString(show.id, 'id', { required: true, minLength: 1 })
    this.validateString(show.name, 'name', { required: true, minLength: 1, maxLength: 100 })
    this.validateString(show.icon, 'icon', { required: true, minLength: 1, maxLength: 10 })
    this.validateString(show.createdAt, 'createdAt', { required: true })

    // Validate createdAt is a valid date
    if (show.createdAt) {
      const date = new Date(show.createdAt)
      if (isNaN(date.getTime())) {
        this.addError('createdAt must be a valid ISO date string')
      }
    }

    // Validate lastModified if present
    if (show.lastModified) {
      const date = new Date(show.lastModified)
      if (isNaN(date.getTime())) {
        this.addError('lastModified must be a valid ISO date string')
      }
    }

    // Validate metadata if present
    if (show.metadata) {
      this.validateMetadata(show.metadata)
    }

    // Validate episodes array
    this.validateArray(show.episodes, 'episodes', {
      required: true,
      minLength: 1,
      maxLength: 50,
      itemValidator: (episode, fieldName) => {
        const episodeValidator = new EpisodeValidator()
        return episodeValidator.validate(episode)
      }
    })

    // Validate totalEpisodes if present
    if (show.totalEpisodes !== undefined) {
      this.validateNumber(show.totalEpisodes, 'totalEpisodes', { min: 1, max: 50, integer: true })
      
      // Check consistency with episodes array
      if (show.episodes && show.totalEpisodes !== show.episodes.length) {
        this.addWarning('totalEpisodes does not match episodes array length')
      }
    }

    return this.getResult()
  }

  /**
   * Validate show metadata
   * @param {Object} metadata - Metadata to validate
   */
  validateMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') {
      this.addError('metadata must be an object')
      return
    }

    // Validate numeric fields
    if (metadata.totalGoals !== undefined) {
      this.validateNumber(metadata.totalGoals, 'metadata.totalGoals', { min: 0, integer: true })
    }

    if (metadata.averageGoalsPerEpisode !== undefined) {
      this.validateNumber(metadata.averageGoalsPerEpisode, 'metadata.averageGoalsPerEpisode', { min: 0, integer: true })
    }

    if (metadata.estimatedDuration !== undefined) {
      this.validateNumber(metadata.estimatedDuration, 'metadata.estimatedDuration', { min: 0, integer: true })
    }

    // Validate boolean fields
    if (metadata.hasTimeLimit !== undefined) {
      this.validateBoolean(metadata.hasTimeLimit, 'metadata.hasTimeLimit')
    }

    if (metadata.hasHints !== undefined) {
      this.validateBoolean(metadata.hasHints, 'metadata.hasHints')
    }

    if (metadata.hasPathMode !== undefined) {
      this.validateBoolean(metadata.hasPathMode, 'metadata.hasPathMode')
    }

    // Validate difficulty
    if (metadata.difficulty !== undefined) {
      const validDifficulties = ['Easy', 'Medium', 'Hard', 'Expert']
      if (!validDifficulties.includes(metadata.difficulty)) {
        this.addError(`Invalid difficulty: ${metadata.difficulty}. Must be one of: ${validDifficulties.join(', ')}`)
      }
    }

    // Validate modeTypes array
    if (metadata.modeTypes !== undefined) {
      this.validateArray(metadata.modeTypes, 'metadata.modeTypes', {
        itemValidator: (modeType, fieldName) => {
          const validModeTypes = ['goal', 'knowledge', 'hybrid', 'anti', 'zen']
          const modeValidator = new ValidationService()
          if (!validModeTypes.includes(modeType)) {
            modeValidator.addError(`${fieldName} must be one of: ${validModeTypes.join(', ')}`)
          }
          return modeValidator.getResult()
        }
      })
    }
  }
}

/**
 * Game Options validation
 */
class GameOptionsValidator extends ValidationService {
  /**
   * Validate game options
   * @param {Object} options - Game options to validate
   * @returns {ValidationResult} Validation result
   */
  validate(options) {
    this.reset()

    if (!options || typeof options !== 'object') {
      this.addError('Game options must be an object')
      return this.getResult()
    }

    // Validate gameType
    this.validateString(options.gameType, 'gameType', { required: true })
    const validGameTypes = ['goal', 'path', 'knowledge', 'anti', 'zen', 'custom']
    if (options.gameType && !validGameTypes.includes(options.gameType)) {
      this.addError(`Invalid gameType: ${options.gameType}. Must be one of: ${validGameTypes.join(', ')}`)
    }

    // Validate goals if present
    if (options.goals) {
      this.validateArray(options.goals, 'goals', {
        minLength: 1,
        maxLength: 10,
        itemValidator: (goal, fieldName) => {
          const goalValidator = new GameItemValidator()
          return goalValidator.validate(goal)
        }
      })
    }

    // Validate timeLimit if present
    if (options.timeLimit !== undefined) {
      this.validateNumber(options.timeLimit, 'timeLimit', { min: 0, max: 3600, integer: true })
    }

    // Validate boolean flags
    if (options.timerEnabled !== undefined) {
      this.validateBoolean(options.timerEnabled, 'timerEnabled')
    }

    if (options.hintsEnabled !== undefined) {
      this.validateBoolean(options.hintsEnabled, 'hintsEnabled')
    }

    return this.getResult()
  }
}

// Export validators
export {
  ValidationService,
  GameItemValidator,
  EpisodeValidator,
  ShowValidator,
  GameOptionsValidator
}

// Export convenience functions
export const validateGameItem = (item) => new GameItemValidator().validate(item)
export const validateEpisode = (episode) => new EpisodeValidator().validate(episode)
export const validateShow = (show) => new ShowValidator().validate(show)
export const validateGameOptions = (options) => new GameOptionsValidator().validate(options)

// Export main validation function
export const validate = {
  gameItem: validateGameItem,
  episode: validateEpisode,
  show: validateShow,
  gameOptions: validateGameOptions
}
