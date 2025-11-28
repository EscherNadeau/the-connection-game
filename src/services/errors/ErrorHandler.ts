/**
 * Centralized Error Handler Service
 * Provides consistent error handling, logging, and user-friendly messages
 */

import { debug, warn, error as logError } from '../ui/log'

// Error codes for categorization
export enum ErrorCode {
  // Network errors
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  API_ERROR = 'API_ERROR',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
  
  // Game errors
  GAME_STATE_INVALID = 'GAME_STATE_INVALID',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  INVALID_MOVE = 'INVALID_MOVE',
  
  // Data errors
  CACHE_ERROR = 'CACHE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  
  // UI errors
  COMPONENT_ERROR = 'COMPONENT_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  
  // Generic
  UNKNOWN = 'UNKNOWN'
}

// Severity levels
export enum ErrorSeverity {
  LOW = 'low',       // Minor issues, app continues normally
  MEDIUM = 'medium', // Noticeable issues, some features affected
  HIGH = 'high',     // Major issues, core features affected
  CRITICAL = 'critical' // App unusable, needs recovery
}

// User-friendly messages for each error code
const USER_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_OFFLINE]: 'You appear to be offline. Check your internet connection.',
  [ErrorCode.NETWORK_TIMEOUT]: 'The request took too long. Please try again.',
  [ErrorCode.API_ERROR]: 'Unable to fetch data. Please try again later.',
  [ErrorCode.WEBSOCKET_ERROR]: 'Connection to game server lost. Reconnecting...',
  [ErrorCode.GAME_STATE_INVALID]: 'Game state error. The game will reset.',
  [ErrorCode.CONNECTION_FAILED]: 'Could not connect these items. Try a different pair.',
  [ErrorCode.INVALID_MOVE]: 'That move is not allowed.',
  [ErrorCode.CACHE_ERROR]: 'Cache error. Some data may need to reload.',
  [ErrorCode.STORAGE_ERROR]: 'Could not save your progress. Check storage permissions.',
  [ErrorCode.PARSE_ERROR]: 'Data format error. Please refresh the page.',
  [ErrorCode.COMPONENT_ERROR]: 'A component encountered an error.',
  [ErrorCode.RENDER_ERROR]: 'Display error. Please refresh the page.',
  [ErrorCode.UNKNOWN]: 'An unexpected error occurred. Please try again.'
}

// Structured error type
export interface AppError {
  code: ErrorCode
  message: string
  userMessage: string
  severity: ErrorSeverity
  timestamp: number
  context?: Record<string, unknown>
  originalError?: Error
  recoverable: boolean
  retryable: boolean
}

// Error handler options
interface ErrorHandlerOptions {
  enableLogging?: boolean
  enableReporting?: boolean
  maxErrorsStored?: number
  onError?: (error: AppError) => void
}

class ErrorHandler {
  private options: Required<ErrorHandlerOptions>
  private errorLog: AppError[] = []
  private errorListeners: Set<(error: AppError) => void> = new Set()
  
  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      enableLogging: true,
      enableReporting: false, // Enable when error reporting service is set up
      maxErrorsStored: 50,
      onError: () => {},
      ...options
    }
  }
  
  /**
   * Main error handling method
   * Converts any error to a structured AppError
   */
  handleError(
    error: unknown,
    context?: Record<string, unknown>,
    options?: { silent?: boolean; rethrow?: boolean }
  ): AppError {
    const appError = this.normalizeError(error, context)
    
    // Store error
    this.storeError(appError)
    
    // Log error
    if (this.options.enableLogging && !options?.silent) {
      this.logError(appError)
    }
    
    // Notify listeners
    this.notifyListeners(appError)
    
    // Call global handler
    this.options.onError(appError)
    
    // Report to external service if enabled
    if (this.options.enableReporting) {
      this.reportError(appError)
    }
    
    // Rethrow if requested
    if (options?.rethrow) {
      throw appError.originalError || new Error(appError.message)
    }
    
    return appError
  }
  
  /**
   * Normalize any error to AppError structure
   */
  private normalizeError(error: unknown, context?: Record<string, unknown>): AppError {
    // Already an AppError
    if (this.isAppError(error)) {
      return { ...error, context: { ...error.context, ...context } }
    }
    
    // Standard Error object
    if (error instanceof Error) {
      return this.createAppError(error, context)
    }
    
    // String error
    if (typeof error === 'string') {
      return this.createAppError(new Error(error), context)
    }
    
    // Unknown error type
    return this.createAppError(
      new Error(String(error) || 'Unknown error'),
      context
    )
  }
  
  /**
   * Create AppError from standard Error
   */
  private createAppError(error: Error, context?: Record<string, unknown>): AppError {
    const code = this.inferErrorCode(error)
    const severity = this.inferSeverity(code, error)
    
    return {
      code,
      message: error.message,
      userMessage: USER_MESSAGES[code],
      severity,
      timestamp: Date.now(),
      context,
      originalError: error,
      recoverable: this.isRecoverable(code),
      retryable: this.isRetryable(code)
    }
  }
  
  /**
   * Infer error code from error message/type
   */
  private inferErrorCode(error: Error): ErrorCode {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()
    
    // Check timeout first (before general network errors)
    if (message.includes('timeout')) {
      return ErrorCode.NETWORK_TIMEOUT
    }
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || name === 'typeerror') {
      if (!navigator.onLine) return ErrorCode.NETWORK_OFFLINE
      return ErrorCode.API_ERROR
    }
    
    // WebSocket errors
    if (message.includes('websocket') || message.includes('ws://') || message.includes('wss://')) {
      return ErrorCode.WEBSOCKET_ERROR
    }
    
    // Parse errors
    if (message.includes('json') || message.includes('parse') || name === 'syntaxerror') {
      return ErrorCode.PARSE_ERROR
    }
    
    // Storage errors
    if (message.includes('storage') || message.includes('quota') || message.includes('localstorage')) {
      return ErrorCode.STORAGE_ERROR
    }
    
    // Game-specific errors
    if (message.includes('connection') || message.includes('connect')) {
      return ErrorCode.CONNECTION_FAILED
    }
    
    if (message.includes('invalid') || message.includes('not allowed')) {
      return ErrorCode.INVALID_MOVE
    }
    
    return ErrorCode.UNKNOWN
  }
  
  /**
   * Infer severity from error code and error
   */
  private inferSeverity(code: ErrorCode, _error: Error): ErrorSeverity {
    switch (code) {
      case ErrorCode.NETWORK_OFFLINE:
      case ErrorCode.WEBSOCKET_ERROR:
        return ErrorSeverity.HIGH
        
      case ErrorCode.GAME_STATE_INVALID:
      case ErrorCode.STORAGE_ERROR:
        return ErrorSeverity.HIGH
        
      case ErrorCode.API_ERROR:
      case ErrorCode.NETWORK_TIMEOUT:
        return ErrorSeverity.MEDIUM
        
      case ErrorCode.CONNECTION_FAILED:
      case ErrorCode.INVALID_MOVE:
      case ErrorCode.CACHE_ERROR:
        return ErrorSeverity.LOW
        
      case ErrorCode.RENDER_ERROR:
      case ErrorCode.COMPONENT_ERROR:
        return ErrorSeverity.CRITICAL
        
      default:
        return ErrorSeverity.MEDIUM
    }
  }
  
  /**
   * Check if error is recoverable
   */
  private isRecoverable(code: ErrorCode): boolean {
    const nonRecoverable = [
      ErrorCode.GAME_STATE_INVALID,
      ErrorCode.RENDER_ERROR
    ]
    return !nonRecoverable.includes(code)
  }
  
  /**
   * Check if error action is retryable
   */
  private isRetryable(code: ErrorCode): boolean {
    const retryable = [
      ErrorCode.NETWORK_OFFLINE,
      ErrorCode.NETWORK_TIMEOUT,
      ErrorCode.API_ERROR,
      ErrorCode.WEBSOCKET_ERROR,
      ErrorCode.CACHE_ERROR
    ]
    return retryable.includes(code)
  }
  
  /**
   * Check if value is AppError
   */
  private isAppError(value: unknown): value is AppError {
    return (
      typeof value === 'object' &&
      value !== null &&
      'code' in value &&
      'message' in value &&
      'severity' in value
    )
  }
  
  /**
   * Store error in log
   */
  private storeError(error: AppError): void {
    this.errorLog.push(error)
    
    // Trim log if too large
    if (this.errorLog.length > this.options.maxErrorsStored) {
      this.errorLog = this.errorLog.slice(-this.options.maxErrorsStored)
    }
  }
  
  /**
   * Log error using app's logging service
   */
  private logError(appError: AppError): void {
    const logData = {
      code: appError.code,
      message: appError.message,
      severity: appError.severity,
      context: appError.context,
      stack: appError.originalError?.stack
    }
    
    switch (appError.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        logError('Error occurred', logData)
        break
      case ErrorSeverity.MEDIUM:
        warn('Warning', logData)
        break
      case ErrorSeverity.LOW:
        debug('Minor issue', logData)
        break
    }
  }
  
  /**
   * Report error to external service (Sentry, LogRocket, etc.)
   * Currently a placeholder - implement when service is chosen
   */
  private reportError(_appError: AppError): void {
    // TODO: Integrate with error reporting service
    // Example: Sentry.captureException(appError.originalError)
  }
  
  /**
   * Notify all registered listeners
   */
  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error)
      } catch (e) {
        debug('Error listener threw exception', { error: e })
      }
    })
  }
  
  /**
   * Subscribe to error events
   */
  subscribe(listener: (error: AppError) => void): () => void {
    this.errorListeners.add(listener)
    return () => this.errorListeners.delete(listener)
  }
  
  /**
   * Get recent errors
   */
  getRecentErrors(count = 10): AppError[] {
    return this.errorLog.slice(-count)
  }
  
  /**
   * Get errors by code
   */
  getErrorsByCode(code: ErrorCode): AppError[] {
    return this.errorLog.filter(e => e.code === code)
  }
  
  /**
   * Clear error log
   */
  clearErrors(): void {
    this.errorLog = []
  }
  
  /**
   * Create a typed error with specific code
   */
  createError(
    code: ErrorCode,
    message: string,
    context?: Record<string, unknown>
  ): AppError {
    const error = new Error(message)
    return this.createAppError(error, context)
  }
  
  /**
   * Wrap an async function with error handling
   */
  wrapAsync<T>(
    fn: () => Promise<T>,
    context?: Record<string, unknown>,
    options?: { fallback?: T; silent?: boolean }
  ): Promise<T> {
    return fn().catch((error) => {
      this.handleError(error, context, { silent: options?.silent })
      if (options?.fallback !== undefined) {
        return options.fallback
      }
      throw error
    })
  }
  
  /**
   * Wrap a sync function with error handling
   */
  wrapSync<T>(
    fn: () => T,
    context?: Record<string, unknown>,
    options?: { fallback?: T; silent?: boolean }
  ): T {
    try {
      return fn()
    } catch (error) {
      this.handleError(error, context, { silent: options?.silent })
      if (options?.fallback !== undefined) {
        return options.fallback
      }
      throw error
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler()

// Export for testing/custom instances
export { ErrorHandler }

// Convenience functions
export function handleError(
  error: unknown,
  context?: Record<string, unknown>
): AppError {
  return errorHandler.handleError(error, context)
}

export function createError(
  code: ErrorCode,
  message: string,
  context?: Record<string, unknown>
): AppError {
  return errorHandler.createError(code, message, context)
}

