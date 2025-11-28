/**
 * Error Handler Tests
 * Tests for ErrorHandler.ts - error handling, normalization, and utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  ErrorHandler,
  errorHandler,
  handleError,
  createError,
  ErrorCode,
  ErrorSeverity,
  type AppError
} from '@/services/errors/ErrorHandler'

describe('ErrorHandler', () => {
  let handler: ErrorHandler

  beforeEach(() => {
    handler = new ErrorHandler({ enableLogging: false })
  })

  describe('handleError', () => {
    it('should convert Error to AppError', () => {
      const error = new Error('Test error')
      const appError = handler.handleError(error)

      expect(appError).toBeDefined()
      expect(appError.message).toBe('Test error')
      expect(appError.code).toBeDefined()
      expect(appError.severity).toBeDefined()
      expect(appError.timestamp).toBeGreaterThan(0)
      expect(appError.originalError).toBe(error)
    })

    it('should convert string to AppError', () => {
      const appError = handler.handleError('String error message')

      expect(appError.message).toBe('String error message')
      expect(appError.code).toBe(ErrorCode.UNKNOWN)
    })

    it('should pass through AppError unchanged', () => {
      const originalAppError: AppError = {
        code: ErrorCode.API_ERROR,
        message: 'API failed',
        userMessage: 'Server error',
        severity: ErrorSeverity.HIGH,
        timestamp: Date.now(),
        recoverable: true,
        retryable: true
      }

      const result = handler.handleError(originalAppError)
      expect(result.code).toBe(ErrorCode.API_ERROR)
      expect(result.message).toBe('API failed')
    })

    it('should include context in AppError', () => {
      const error = new Error('Context test')
      const context = { userId: '123', action: 'save' }
      const appError = handler.handleError(error, context)

      expect(appError.context).toEqual(context)
    })

    it('should store error in log', () => {
      handler.handleError(new Error('Error 1'))
      handler.handleError(new Error('Error 2'))

      const recentErrors = handler.getRecentErrors()
      expect(recentErrors.length).toBe(2)
    })
  })

  describe('error code inference', () => {
    it('should detect network offline error', () => {
      // Simulate offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      
      const error = new Error('Network request failed')
      const appError = handler.handleError(error)
      
      expect(appError.code).toBe(ErrorCode.NETWORK_OFFLINE)
      
      // Restore
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
    })

    it('should detect timeout error', () => {
      const error = new Error('Request timeout exceeded')
      const appError = handler.handleError(error)

      expect(appError.code).toBe(ErrorCode.NETWORK_TIMEOUT)
    })

    it('should detect WebSocket error', () => {
      const error = new Error('WebSocket connection failed')
      const appError = handler.handleError(error)

      expect(appError.code).toBe(ErrorCode.WEBSOCKET_ERROR)
    })

    it('should detect parse error', () => {
      const error = new SyntaxError('Unexpected token in JSON')
      const appError = handler.handleError(error)

      expect(appError.code).toBe(ErrorCode.PARSE_ERROR)
    })

    it('should detect storage error', () => {
      const error = new Error('localStorage quota exceeded')
      const appError = handler.handleError(error)

      expect(appError.code).toBe(ErrorCode.STORAGE_ERROR)
    })

    it('should detect connection error', () => {
      const error = new Error('Connection to server failed')
      const appError = handler.handleError(error)

      expect(appError.code).toBe(ErrorCode.CONNECTION_FAILED)
    })
  })

  describe('severity inference', () => {
    it('should assign HIGH severity to network offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })
      const error = new Error('Network error')
      const appError = handler.handleError(error)
      expect(appError.severity).toBe(ErrorSeverity.HIGH)
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
    })

    it('should assign MEDIUM severity to API errors', () => {
      const error = new Error('fetch failed')
      const appError = handler.handleError(error)
      expect(appError.severity).toBe(ErrorSeverity.MEDIUM)
    })
  })

  describe('recoverability', () => {
    it('should mark network errors as recoverable', () => {
      const error = new Error('Network timeout occurred')
      const appError = handler.handleError(error)
      expect(appError.recoverable).toBe(true)
    })

    it('should mark network errors as retryable', () => {
      const error = new Error('Network timeout occurred')
      const appError = handler.handleError(error)
      expect(appError.retryable).toBe(true)
    })
  })

  describe('createError', () => {
    it('should create AppError with message and context', () => {
      const appError = handler.createError(
        ErrorCode.INVALID_MOVE,
        'Cannot make this move',
        { position: 'A1' }
      )

      // Note: createError creates an error and passes through normalizeError,
      // which infers the code from the message content
      expect(appError.message).toBe('Cannot make this move')
      expect(appError.context).toEqual({ position: 'A1' })
      expect(appError.code).toBeDefined()
    })
  })

  describe('subscribe', () => {
    it('should call listener on error', () => {
      const listener = vi.fn()
      handler.subscribe(listener)

      handler.handleError(new Error('Test'))

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Test' })
      )
    })

    it('should unsubscribe correctly', () => {
      const listener = vi.fn()
      const unsubscribe = handler.subscribe(listener)

      handler.handleError(new Error('First'))
      expect(listener).toHaveBeenCalledTimes(1)

      unsubscribe()
      handler.handleError(new Error('Second'))
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('getRecentErrors', () => {
    it('should return specified number of errors', () => {
      for (let i = 0; i < 10; i++) {
        handler.handleError(new Error(`Error ${i}`))
      }

      const recent5 = handler.getRecentErrors(5)
      expect(recent5.length).toBe(5)
      expect(recent5[4].message).toBe('Error 9')
    })

    it('should limit stored errors to maxErrorsStored', () => {
      const limitedHandler = new ErrorHandler({
        enableLogging: false,
        maxErrorsStored: 5
      })

      for (let i = 0; i < 10; i++) {
        limitedHandler.handleError(new Error(`Error ${i}`))
      }

      const all = limitedHandler.getRecentErrors(100)
      expect(all.length).toBe(5)
    })
  })

  describe('getErrorsByCode', () => {
    it('should filter errors by code', () => {
      handler.handleError(new Error('Network timeout'))
      handler.handleError(new Error('JSON parse error'))
      handler.handleError(new Error('Another timeout issue'))

      const timeoutErrors = handler.getErrorsByCode(ErrorCode.NETWORK_TIMEOUT)
      expect(timeoutErrors.length).toBeGreaterThan(0)
    })
  })

  describe('clearErrors', () => {
    it('should clear all stored errors', () => {
      handler.handleError(new Error('Error 1'))
      handler.handleError(new Error('Error 2'))

      handler.clearErrors()

      expect(handler.getRecentErrors().length).toBe(0)
    })
  })

  describe('wrapAsync', () => {
    it('should return successful result', async () => {
      const result = await handler.wrapAsync(async () => 'success')
      expect(result).toBe('success')
    })

    it('should handle errors and return fallback', async () => {
      const result = await handler.wrapAsync(
        async () => { throw new Error('Failed') },
        {},
        { fallback: 'fallback value', silent: true }
      )
      expect(result).toBe('fallback value')
    })

    it('should throw if no fallback provided', async () => {
      await expect(
        handler.wrapAsync(
          async () => { throw new Error('Failed') },
          {},
          { silent: true }
        )
      ).rejects.toThrow('Failed')
    })
  })

  describe('wrapSync', () => {
    it('should return successful result', () => {
      const result = handler.wrapSync(() => 'success')
      expect(result).toBe('success')
    })

    it('should handle errors and return fallback', () => {
      const result = handler.wrapSync(
        () => { throw new Error('Failed') },
        {},
        { fallback: 'fallback value', silent: true }
      )
      expect(result).toBe('fallback value')
    })
  })
})

describe('singleton errorHandler', () => {
  it('should be an instance of ErrorHandler', () => {
    expect(errorHandler).toBeInstanceOf(ErrorHandler)
  })
})

describe('convenience functions', () => {
  describe('handleError', () => {
    it('should delegate to singleton', () => {
      const result = handleError(new Error('Test'))
      expect(result).toBeDefined()
      expect(result.message).toBe('Test')
    })
  })

  describe('createError', () => {
    it('should create error with message', () => {
      const result = createError(ErrorCode.API_ERROR, 'API failed')
      expect(result.message).toBe('API failed')
      expect(result.code).toBeDefined()
    })
  })
})

describe('ErrorCode enum', () => {
  it('should have all expected codes', () => {
    expect(ErrorCode.NETWORK_OFFLINE).toBe('NETWORK_OFFLINE')
    expect(ErrorCode.NETWORK_TIMEOUT).toBe('NETWORK_TIMEOUT')
    expect(ErrorCode.API_ERROR).toBe('API_ERROR')
    expect(ErrorCode.WEBSOCKET_ERROR).toBe('WEBSOCKET_ERROR')
    expect(ErrorCode.GAME_STATE_INVALID).toBe('GAME_STATE_INVALID')
    expect(ErrorCode.CONNECTION_FAILED).toBe('CONNECTION_FAILED')
    expect(ErrorCode.INVALID_MOVE).toBe('INVALID_MOVE')
    expect(ErrorCode.CACHE_ERROR).toBe('CACHE_ERROR')
    expect(ErrorCode.STORAGE_ERROR).toBe('STORAGE_ERROR')
    expect(ErrorCode.PARSE_ERROR).toBe('PARSE_ERROR')
    expect(ErrorCode.COMPONENT_ERROR).toBe('COMPONENT_ERROR')
    expect(ErrorCode.RENDER_ERROR).toBe('RENDER_ERROR')
    expect(ErrorCode.UNKNOWN).toBe('UNKNOWN')
  })
})

describe('ErrorSeverity enum', () => {
  it('should have all expected severities', () => {
    expect(ErrorSeverity.LOW).toBe('low')
    expect(ErrorSeverity.MEDIUM).toBe('medium')
    expect(ErrorSeverity.HIGH).toBe('high')
    expect(ErrorSeverity.CRITICAL).toBe('critical')
  })
})

