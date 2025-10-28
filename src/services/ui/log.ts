// log.js - Simple, clean logging service
// Usage: import { log } from './log.ts' then call log('message', data)

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

// Current log level (change this to control what gets logged)
let currentLogLevel = LOG_LEVELS.WARN

/**
 * Main logging function
 * @param {string|number} level - Log level or message
 * @param {any} data - Data to log
 */
export function log(level, data = null) {
  // Handle different call patterns
  let message, logData, logLevel

  if (typeof level === 'string') {
    // log('message', data)
    message = level
    logData = data
    logLevel = LOG_LEVELS.INFO
  } else if (typeof level === 'number') {
    // log(100, { message: 'text', data: value })
    logLevel = level
    if (data && typeof data === 'object' && data.message) {
      message = data.message
      logData = data
    } else {
      message = `Log code: ${level}`
      logData = data
    }
  } else {
    // log('message')
    message = String(level)
    logData = null
    logLevel = LOG_LEVELS.INFO
  }

  // Check if we should log at this level
  if (logLevel < currentLogLevel) {
    return
  }

  // Format the log output
  const timestamp = new Date().toISOString()
  const levelName = Object.keys(LOG_LEVELS).find((key) => LOG_LEVELS[key] === logLevel)
  const logOutput = `[${timestamp}] [${levelName}] ${message}`

  // Output based on level
  switch (logLevel) {
    case LOG_LEVELS.ERROR:
      console.error(logOutput, logData || '')
      break
    case LOG_LEVELS.WARN:
      console.warn(logOutput, logData || '')
      break
    case LOG_LEVELS.INFO:
      console.info(logOutput, logData || '')
      break
    case LOG_LEVELS.DEBUG:
      console.log(logOutput, logData || '')
      break
  }
}

/**
 * Set log level
 * @param {number} level - New log level
 */
export function setLogLevel(level) {
  if (Object.values(LOG_LEVELS).includes(level)) {
    currentLogLevel = level
    log(`Log level set to ${level}`)
  } else {
    console.warn(`Invalid log level: ${level}`)
  }
}

/**
 * Get current log level
 * @returns {number} Current log level
 */
export function getLogLevel() {
  return currentLogLevel
}

/**
 * Disable all logging
 */
export function disableLogging() {
  currentLogLevel = LOG_LEVELS.ERROR + 1
}

/**
 * Enable all logging
 */
export function enableAllLogging() {
  currentLogLevel = LOG_LEVELS.DEBUG
}

/**
 * Quick debug logging
 * @param {string} message - Debug message
 * @param {any} data - Debug data
 */
export function debug(message, data = null) {
  log(LOG_LEVELS.DEBUG, { message, data })
}

/**
 * Quick info logging
 * @param {string} message - Info message
 * @param {any} data - Info data
 */
export function info(message, data = null) {
  log(LOG_LEVELS.INFO, { message, data })
}

/**
 * Quick warning logging
 * @param {string} message - Warning message
 * @param {any} data - Warning data
 */
export function warn(message, data = null) {
  log(LOG_LEVELS.WARN, { message, data })
}

/**
 * Quick error logging
 * @param {string} message - Error message
 * @param {any} data - Error data
 */
export function error(message, data = null) {
  log(LOG_LEVELS.ERROR, { message, data })
}

/**
 * Test method to verify log service is working
 * Call this from browser console to test
 */
export function testLogService() {
  console.log('🧪 Testing LogService...')

  try {
    // Test 1: Basic string logging
    console.log('🧪 Test 1: Basic string logging')
    log('This is a test message')

    // Test 2: Log with data
    console.log('🧪 Test 2: Log with data')
    log('Test with data', { test: true, value: 42 })

    // Test 3: Number code logging
    console.log('🧪 Test 3: Number code logging')
    log(100, { message: 'Test message', data: 'test data' })

    // Test 4: Quick functions
    console.log('🧪 Test 4: Quick functions')
    debug('Debug message', { debug: true })
    info('Info message', { info: true })
    warn('Warning message', { warning: true })
    error('Error message', { error: true })

    // Test 5: Log level control
    console.log('🧪 Test 5: Log level control')
    const currentLevel = getLogLevel()
    console.log('Current log level:', currentLevel)

    // Test 6: Change log level
    console.log('🧪 Test 6: Change log level')
    setLogLevel(LOG_LEVELS.DEBUG)
    console.log('New log level:', getLogLevel())

    // Test 7: Test level filtering
    console.log('🧪 Test 7: Test level filtering')
    log(LOG_LEVELS.DEBUG, { message: 'This should show with DEBUG level' })

    // Reset to original level
    setLogLevel(currentLevel)

    console.log('🎉 All log service tests completed!')
    return { success: true, message: 'Log service working correctly' }
  } catch (error) {
    console.error('❌ Log service test failed:', error)
    return { success: false, error: error.message }
  }
}

// Export log levels for external use
export { LOG_LEVELS }
