/**
 * Simple, clean logging service
 * Usage: import { log } from './log.ts' then call log('message', data)
 */

// Log levels
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS]

// Current log level (change this to control what gets logged)
let currentLogLevel: LogLevel = LOG_LEVELS.WARN

/**
 * Main logging function
 * @param level - Log level or message string
 * @param data - Optional data to log
 */
export function log(level: string | LogLevel, data: unknown = null): void {
  // Handle different call patterns
  let message: string
  let logData: unknown
  let logLevel: LogLevel

  if (typeof level === 'string') {
    // log('message', data)
    message = level
    logData = data
    logLevel = LOG_LEVELS.INFO
  } else if (typeof level === 'number') {
    // log(100, { message: 'text', data: value })
    logLevel = level as LogLevel
    if (data && typeof data === 'object' && data !== null && 'message' in data) {
      message = String((data as { message: unknown }).message)
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
 * @param level - New log level
 */
export function setLogLevel(level: LogLevel): void {
  if (Object.values(LOG_LEVELS).includes(level)) {
    currentLogLevel = level
    log(`Log level set to ${level}`)
  } else {
    console.warn(`Invalid log level: ${level}`)
  }
}

/**
 * Get current log level
 * @returns Current log level
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel
}

/**
 * Disable all logging
 */
export function disableLogging(): void {
  currentLogLevel = (LOG_LEVELS.ERROR + 1) as LogLevel
}

/**
 * Enable all logging
 */
export function enableAllLogging(): void {
  currentLogLevel = LOG_LEVELS.DEBUG
}

/**
 * Quick debug logging
 * @param message - Debug message
 * @param data - Optional debug data
 */
export function debug(message: string, data: unknown = null): void {
  log(LOG_LEVELS.DEBUG, { message, data })
}

/**
 * Quick info logging
 * @param message - Info message
 * @param data - Optional info data
 */
export function info(message: string, data: unknown = null): void {
  log(LOG_LEVELS.INFO, { message, data })
}

/**
 * Quick warning logging
 * @param message - Warning message
 * @param data - Optional warning data
 */
export function warn(message: string, data: unknown = null): void {
  log(LOG_LEVELS.WARN, { message, data })
}

/**
 * Quick error logging
 * @param message - Error message
 * @param data - Optional error data
 */
export function error(message: string, data: unknown = null): void {
  log(LOG_LEVELS.ERROR, { message, data })
}

/**
 * Test method to verify log service is working
 * Call this from browser console to test
 */
export function testLogService(): { success: boolean; message?: string; error?: string } {
  debug('Testing LogService...')

  try {
    // Test 1: Basic string logging
    debug('Test 1: Basic string logging')
    log('This is a test message')

    // Test 2: Log with data
    debug('Test 2: Log with data')
    log('Test with data', { test: true, value: 42 })

    // Test 3: Number code logging
    debug('Test 3: Number code logging')
    log(LOG_LEVELS.INFO, { message: 'Test message', data: 'test data' })

    // Test 4: Quick functions
    debug('Test 4: Quick functions')
    debug('Debug message', { debug: true })
    info('Info message', { info: true })
    warn('Warning message', { warning: true })
    error('Error message', { error: true })

    // Test 5: Log level control
    debug('Test 5: Log level control')
    const currentLevel = getLogLevel()
    debug('Current log level', { level: currentLevel })

    // Test 6: Change log level
    debug('Test 6: Change log level')
    setLogLevel(LOG_LEVELS.DEBUG)
    debug('New log level', { level: getLogLevel() })

    // Test 7: Test level filtering
    debug('Test 7: Test level filtering')
    log(LOG_LEVELS.DEBUG, { message: 'This should show with DEBUG level' })

    // Reset to original level
    setLogLevel(currentLevel)

    info('All log service tests completed!')
    return { success: true, message: 'Log service working correctly' }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    error('Log service test failed', { error: errorMessage })
    return { success: false, error: errorMessage }
  }
}
