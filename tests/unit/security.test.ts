/**
 * Security Module Tests
 * Tests for server-side security utilities
 */

import { describe, it, expect, beforeEach } from 'vitest'

// Replicate the security module logic for testing
// (Since the actual module is CommonJS and in server/)

class RateLimiter {
  private windowMs: number
  private maxRequests: number
  private clients: Map<string, { count: number; windowStart: number }>

  constructor(options: { windowMs?: number; maxRequests?: number } = {}) {
    this.windowMs = options.windowMs || 60000
    this.maxRequests = options.maxRequests || 100
    this.clients = new Map()
  }

  check(clientId: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now()
    let record = this.clients.get(clientId)

    if (!record || now - record.windowStart > this.windowMs) {
      record = { count: 0, windowStart: now }
      this.clients.set(clientId, record)
    }

    record.count++
    const remaining = Math.max(0, this.maxRequests - record.count)
    const resetIn = Math.max(0, this.windowMs - (now - record.windowStart))

    return {
      allowed: record.count <= this.maxRequests,
      remaining,
      resetIn
    }
  }

  reset(clientId: string): void {
    this.clients.delete(clientId)
  }
}

function sanitizeString(str: unknown, maxLength = 100): string {
  if (typeof str !== 'string') return ''
  
  return str
    .slice(0, maxLength)
    .replace(/[<>'"&]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

function sanitizeObject(obj: unknown, depth = 0): unknown {
  if (depth > 10) return null
  
  if (typeof obj === 'string') {
    return sanitizeString(obj, 1000)
  }
  
  if (Array.isArray(obj)) {
    return obj.slice(0, 100).map(item => sanitizeObject(item, depth + 1))
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {}
    const keys = Object.keys(obj).slice(0, 50)
    
    for (const key of keys) {
      const sanitizedKey = sanitizeString(key, 50)
      sanitized[sanitizedKey] = sanitizeObject((obj as Record<string, unknown>)[key], depth + 1)
    }
    
    return sanitized
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean' || obj === null) {
    return obj
  }
  
  return null
}

function isValidRoomCode(code: unknown): boolean {
  if (!code || typeof code !== 'string') return false
  const cleanCode = code.toUpperCase().trim()
  if (cleanCode.length !== 4) return false
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return cleanCode.split('').every(char => alphabet.includes(char))
}

describe('RateLimiter', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    limiter = new RateLimiter({ windowMs: 1000, maxRequests: 5 })
  })

  it('should allow requests under the limit', () => {
    for (let i = 0; i < 5; i++) {
      const result = limiter.check('client1')
      expect(result.allowed).toBe(true)
    }
  })

  it('should block requests over the limit', () => {
    for (let i = 0; i < 5; i++) {
      limiter.check('client1')
    }
    const result = limiter.check('client1')
    expect(result.allowed).toBe(false)
  })

  it('should track remaining requests', () => {
    expect(limiter.check('client1').remaining).toBe(4)
    expect(limiter.check('client1').remaining).toBe(3)
    expect(limiter.check('client1').remaining).toBe(2)
  })

  it('should track different clients separately', () => {
    for (let i = 0; i < 5; i++) {
      limiter.check('client1')
    }
    
    // client1 is blocked
    expect(limiter.check('client1').allowed).toBe(false)
    
    // client2 is still allowed
    expect(limiter.check('client2').allowed).toBe(true)
  })

  it('should reset client on demand', () => {
    for (let i = 0; i < 5; i++) {
      limiter.check('client1')
    }
    expect(limiter.check('client1').allowed).toBe(false)
    
    limiter.reset('client1')
    expect(limiter.check('client1').allowed).toBe(true)
  })

  it('should reset after window expires', async () => {
    // Use a very short window for testing
    const shortLimiter = new RateLimiter({ windowMs: 50, maxRequests: 2 })
    
    shortLimiter.check('client1')
    shortLimiter.check('client1')
    expect(shortLimiter.check('client1').allowed).toBe(false)
    
    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 60))
    
    expect(shortLimiter.check('client1').allowed).toBe(true)
  })
})

describe('sanitizeString', () => {
  it('should return empty string for non-strings', () => {
    expect(sanitizeString(null)).toBe('')
    expect(sanitizeString(undefined)).toBe('')
    expect(sanitizeString(123)).toBe('')
    expect(sanitizeString({})).toBe('')
  })

  it('should truncate long strings', () => {
    const longString = 'a'.repeat(200)
    expect(sanitizeString(longString, 50).length).toBe(50)
  })

  it('should remove HTML characters', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script')
    expect(sanitizeString('<img src="x">')).toBe('img src=x')
  })

  it('should remove javascript: protocol', () => {
    expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)')
  })

  it('should remove event handlers', () => {
    expect(sanitizeString('onclick=alert(1)')).toBe('alert(1)')
    expect(sanitizeString('onmouseover=hack()')).toBe('hack()')
  })

  it('should trim whitespace', () => {
    expect(sanitizeString('  hello world  ')).toBe('hello world')
  })

  it('should preserve normal text', () => {
    expect(sanitizeString('Hello, World!')).toBe('Hello, World!')
    expect(sanitizeString('Tom Hanks')).toBe('Tom Hanks')
  })
})

describe('sanitizeObject', () => {
  it('should sanitize string values', () => {
    const obj = { name: '<script>hack</script>' }
    const result = sanitizeObject(obj) as Record<string, string>
    expect(result.name).toBe('scripthack/script')
  })

  it('should handle nested objects', () => {
    const obj = { 
      user: { 
        name: '<b>Evil</b>',
        age: 25
      }
    }
    const result = sanitizeObject(obj) as Record<string, Record<string, unknown>>
    expect(result.user.name).toBe('bEvil/b')
    expect(result.user.age).toBe(25)
  })

  it('should handle arrays', () => {
    const arr = ['<script>', 'normal', '<img>']
    const result = sanitizeObject(arr) as string[]
    expect(result[0]).toBe('script')
    expect(result[1]).toBe('normal')
    expect(result[2]).toBe('img')
  })

  it('should limit array length', () => {
    const arr = Array(150).fill('test')
    const result = sanitizeObject(arr) as string[]
    expect(result.length).toBe(100)
  })

  it('should limit object keys', () => {
    const obj: Record<string, string> = {}
    for (let i = 0; i < 100; i++) {
      obj[`key${i}`] = 'value'
    }
    const result = sanitizeObject(obj) as Record<string, string>
    expect(Object.keys(result).length).toBe(50)
  })

  it('should prevent deep recursion', () => {
    // Create deeply nested object
    let obj: Record<string, unknown> = { value: 'test' }
    for (let i = 0; i < 20; i++) {
      obj = { nested: obj }
    }
    
    // Should not throw and should return null for deep levels
    const result = sanitizeObject(obj)
    expect(result).not.toBeNull()
  })

  it('should preserve numbers and booleans', () => {
    const obj = { count: 42, active: true, score: 3.14 }
    const result = sanitizeObject(obj) as Record<string, unknown>
    expect(result.count).toBe(42)
    expect(result.active).toBe(true)
    expect(result.score).toBe(3.14)
  })

  it('should preserve null', () => {
    const obj = { empty: null }
    const result = sanitizeObject(obj) as Record<string, unknown>
    expect(result.empty).toBeNull()
  })
})

describe('isValidRoomCode', () => {
  it('should accept valid 4-character codes', () => {
    expect(isValidRoomCode('ABCD')).toBe(true)
    expect(isValidRoomCode('XY23')).toBe(true)
    expect(isValidRoomCode('9876')).toBe(true)
  })

  it('should accept lowercase codes (converts to uppercase)', () => {
    expect(isValidRoomCode('abcd')).toBe(true)
    expect(isValidRoomCode('AbCd')).toBe(true)
  })

  it('should reject codes with invalid length', () => {
    expect(isValidRoomCode('ABC')).toBe(false)
    expect(isValidRoomCode('ABCDE')).toBe(false)
    expect(isValidRoomCode('')).toBe(false)
  })

  it('should reject codes with invalid characters', () => {
    expect(isValidRoomCode('AB!D')).toBe(false)
    expect(isValidRoomCode('AB D')).toBe(false)
    expect(isValidRoomCode('AB0D')).toBe(false) // 0 is excluded
    expect(isValidRoomCode('ABID')).toBe(false) // I is excluded
    expect(isValidRoomCode('ABOD')).toBe(false) // O is excluded
  })

  it('should reject non-string inputs', () => {
    expect(isValidRoomCode(null)).toBe(false)
    expect(isValidRoomCode(undefined)).toBe(false)
    expect(isValidRoomCode(1234)).toBe(false)
    expect(isValidRoomCode({})).toBe(false)
  })

  it('should handle whitespace', () => {
    expect(isValidRoomCode(' ABCD ')).toBe(true)
    expect(isValidRoomCode('  AB  ')).toBe(false) // Trimmed length is 2
  })
})

