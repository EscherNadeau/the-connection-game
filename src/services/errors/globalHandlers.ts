/**
 * Global Error Handlers
 * Sets up window-level error catching for uncaught exceptions and rejections
 */

import type { App } from 'vue'
import { errorHandler, ErrorCode, type AppError } from './ErrorHandler'
import { debug, error as logError } from '../ui/log'

interface GlobalHandlersOptions {
  onUnhandledError?: (error: AppError) => void
  showNotification?: (message: string, type: 'error' | 'warning') => void
}

/**
 * Setup global error handlers for the application
 */
export function setupGlobalErrorHandlers(
  app: App,
  options: GlobalHandlersOptions = {}
): void {
  const { onUnhandledError, showNotification } = options

  // Vue error handler
  app.config.errorHandler = (err, instance, info) => {
    const appError = errorHandler.handleError(err, {
      source: 'vue',
      component: instance?.$options?.name || 'Unknown',
      info,
      props: instance?.$props
    })

    onUnhandledError?.(appError)
    
    logError('Vue Error', {
      component: instance?.$options?.name,
      info,
      error: err
    })
  }

  // Vue warning handler (development only)
  if (import.meta.env.DEV) {
    app.config.warnHandler = (msg, instance, trace) => {
      debug('Vue Warning', {
        message: msg,
        component: instance?.$options?.name,
        trace
      })
    }
  }

  // Global unhandled error
  window.addEventListener('error', (event) => {
    // Ignore ResizeObserver errors (common and non-critical)
    if (event.message?.includes('ResizeObserver')) {
      return
    }

    const appError = errorHandler.handleError(event.error || event.message, {
      source: 'window',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })

    onUnhandledError?.(appError)
    
    // Show user notification for critical errors
    if (showNotification && appError.severity === 'critical') {
      showNotification(appError.userMessage, 'error')
    }

    // Prevent default browser error handling for handled errors
    event.preventDefault()
  })

  // Unhandled promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    const appError = errorHandler.handleError(event.reason, {
      source: 'promise',
      type: 'unhandledrejection'
    })

    onUnhandledError?.(appError)
    
    // Show user notification for network errors
    if (showNotification && appError.code === ErrorCode.API_ERROR) {
      showNotification(appError.userMessage, 'warning')
    }

    // Prevent default browser handling
    event.preventDefault()
  })

  // Network status monitoring
  window.addEventListener('online', () => {
    debug('Network status: online')
    showNotification?.('You are back online!', 'warning')
  })

  window.addEventListener('offline', () => {
    const appError = errorHandler.handleError(
      new Error('Network connection lost'),
      { source: 'network' }
    )
    
    onUnhandledError?.(appError)
    showNotification?.(appError.userMessage, 'error')
  })

  debug('Global error handlers initialized')
}

/**
 * Create a safe version of a function that catches errors
 */
export function createSafeHandler<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args)
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          errorHandler.handleError(error, {
            ...context,
            args: args.map(a => typeof a)
          })
          return undefined
        })
      }
      
      return result
    } catch (error) {
      errorHandler.handleError(error, {
        ...context,
        args: args.map(a => typeof a)
      })
      return undefined
    }
  }) as T
}

/**
 * Decorator-style error boundary for class methods
 */
export function withErrorBoundary<T>(
  target: T,
  methodNames: (keyof T)[],
  context?: Record<string, unknown>
): T {
  const wrapped = { ...target }
  
  for (const name of methodNames) {
    const original = wrapped[name]
    if (typeof original === 'function') {
      (wrapped as Record<keyof T, unknown>)[name] = createSafeHandler(
        original.bind(wrapped) as (...args: unknown[]) => unknown,
        { ...context, method: String(name) }
      )
    }
  }
  
  return wrapped
}

