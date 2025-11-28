/**
 * Security Module for Game Server
 * - Input validation with Zod
 * - Rate limiting for WebSocket messages
 * - Payload sanitization
 */

const { z } = require('zod')

// ============================================
// RATE LIMITING
// ============================================

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000 // 1 minute window
    this.maxRequests = options.maxRequests || 100 // 100 messages per window
    this.clients = new Map() // clientId -> { count, windowStart }
  }

  /**
   * Check if client is rate limited
   * @param {string} clientId - Unique client identifier
   * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
   */
  check(clientId) {
    const now = Date.now()
    let record = this.clients.get(clientId)

    // New client or window expired
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

  /**
   * Reset a client's rate limit (e.g., on disconnect)
   */
  reset(clientId) {
    this.clients.delete(clientId)
  }

  /**
   * Clean up old entries periodically
   */
  cleanup() {
    const now = Date.now()
    for (const [clientId, record] of this.clients.entries()) {
      if (now - record.windowStart > this.windowMs * 2) {
        this.clients.delete(clientId)
      }
    }
  }
}

// ============================================
// MESSAGE VALIDATION SCHEMAS
// ============================================

// Base action payload schema
const ActionKindSchema = z.enum([
  'profile',
  'ready', 
  'prompt',
  'prompt_request',
  'answer',
  'start_game',
  'pvp_complete',
  'end_game',
  'game_type',
  'add_item',
  'remove_item',
  'move_item',
  'connect',
  'disconnect'
])

// Profile action schema
const ProfilePayloadSchema = z.object({
  kind: z.literal('profile'),
  name: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  answer: z.string().max(100).optional()
})

// Ready action schema
const ReadyPayloadSchema = z.object({
  kind: z.literal('ready'),
  isReady: z.boolean()
})

// Prompt action schema
const PromptPayloadSchema = z.object({
  kind: z.literal('prompt'),
  text: z.string().max(500)
})

// Answer action schema
const AnswerPayloadSchema = z.object({
  kind: z.literal('answer'),
  image: z.string().max(500).optional(),
  title: z.string().max(100).optional()
})

// Start game action schema
const StartGamePayloadSchema = z.object({
  kind: z.literal('start_game'),
  items: z.array(z.any()).max(100).optional(),
  connections: z.array(z.any()).max(200).optional(),
  mode: z.string().max(50).optional(),
  gameOptions: z.object({
    playType: z.string().max(50).optional(),
    timer: z.number().max(3600).optional()
  }).passthrough().optional()
})

// PvP complete action schema
const PvPCompletePayloadSchema = z.object({
  kind: z.literal('pvp_complete'),
  score: z.number().max(999999),
  time: z.number().max(3600000) // Max 1 hour in ms
})

// Generic action schema (fallback)
const GenericActionPayloadSchema = z.object({
  kind: ActionKindSchema
}).passthrough()

// State message schema
const StatePayloadSchema = z.object({
  items: z.array(z.any()).max(100).optional(),
  connections: z.array(z.any()).max(200).optional(),
  gameOptions: z.any().optional()
})

// Top-level message schema
const MessageSchema = z.object({
  type: z.enum(['ping', 'state', 'action', 'presence', 'roster']),
  payload: z.any().optional()
})

// ============================================
// SANITIZATION
// ============================================

/**
 * Sanitize a string to prevent XSS and injection
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum length
 * @returns {string} - Sanitized string
 */
function sanitizeString(str, maxLength = 100) {
  if (typeof str !== 'string') return ''
  
  return str
    .slice(0, maxLength)
    .replace(/[<>'"&]/g, '') // Remove potential HTML/script chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Deep sanitize an object's string values
 * @param {any} obj - Object to sanitize
 * @param {number} depth - Current depth (prevents infinite recursion)
 * @returns {any} - Sanitized object
 */
function sanitizeObject(obj, depth = 0) {
  if (depth > 10) return null // Prevent deep recursion attacks
  
  if (typeof obj === 'string') {
    return sanitizeString(obj, 1000)
  }
  
  if (Array.isArray(obj)) {
    return obj.slice(0, 100).map(item => sanitizeObject(item, depth + 1))
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {}
    const keys = Object.keys(obj).slice(0, 50) // Limit number of keys
    
    for (const key of keys) {
      const sanitizedKey = sanitizeString(key, 50)
      sanitized[sanitizedKey] = sanitizeObject(obj[key], depth + 1)
    }
    
    return sanitized
  }
  
  // Numbers, booleans, null - pass through
  if (typeof obj === 'number' || typeof obj === 'boolean' || obj === null) {
    return obj
  }
  
  return null // Unknown types become null
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate and sanitize an incoming WebSocket message
 * @param {string} rawData - Raw message string
 * @returns {{ valid: boolean, message?: object, error?: string }}
 */
function validateMessage(rawData) {
  // Size check
  if (typeof rawData !== 'string' || rawData.length > 50000) {
    return { valid: false, error: 'Message too large or invalid type' }
  }

  // Parse JSON
  let parsed
  try {
    parsed = JSON.parse(rawData)
  } catch (e) {
    return { valid: false, error: 'Invalid JSON' }
  }

  // Validate base structure
  const baseResult = MessageSchema.safeParse(parsed)
  if (!baseResult.success) {
    return { valid: false, error: 'Invalid message structure' }
  }

  // Sanitize the message
  const sanitized = sanitizeObject(parsed)
  
  // Type-specific validation
  if (sanitized.type === 'ping') {
    return { valid: true, message: sanitized }
  }

  if (sanitized.type === 'state') {
    const stateResult = StatePayloadSchema.safeParse(sanitized.payload)
    if (!stateResult.success) {
      return { valid: false, error: 'Invalid state payload' }
    }
    return { valid: true, message: sanitized }
  }

  if (sanitized.type === 'action' && sanitized.payload) {
    const kind = sanitized.payload.kind
    
    // Validate specific action types
    let actionResult
    switch (kind) {
      case 'profile':
        actionResult = ProfilePayloadSchema.safeParse(sanitized.payload)
        break
      case 'ready':
        actionResult = ReadyPayloadSchema.safeParse(sanitized.payload)
        break
      case 'prompt':
        actionResult = PromptPayloadSchema.safeParse(sanitized.payload)
        break
      case 'answer':
        actionResult = AnswerPayloadSchema.safeParse(sanitized.payload)
        break
      case 'start_game':
        actionResult = StartGamePayloadSchema.safeParse(sanitized.payload)
        break
      case 'pvp_complete':
        actionResult = PvPCompletePayloadSchema.safeParse(sanitized.payload)
        break
      default:
        // Generic validation for other action types
        actionResult = GenericActionPayloadSchema.safeParse(sanitized.payload)
    }

    if (actionResult && !actionResult.success) {
      return { valid: false, error: `Invalid ${kind} action payload` }
    }

    return { valid: true, message: sanitized }
  }

  return { valid: true, message: sanitized }
}

/**
 * Validate room code format
 * @param {string} code - Room code
 * @returns {boolean}
 */
function isValidRoomCode(code) {
  if (!code || typeof code !== 'string') return false
  const cleanCode = code.toUpperCase().trim()
  if (cleanCode.length !== 4) return false
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return cleanCode.split('').every(char => alphabet.includes(char))
}

/**
 * Validate snapshot data
 * @param {any} data - Snapshot data
 * @returns {{ valid: boolean, error?: string }}
 */
function validateSnapshotData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid snapshot data' }
  }
  
  // Check size (rough estimate)
  const size = JSON.stringify(data).length
  if (size > 2 * 1024 * 1024) { // 2MB limit
    return { valid: false, error: 'Snapshot too large' }
  }
  
  return { valid: true }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  RateLimiter,
  validateMessage,
  validateSnapshotData,
  isValidRoomCode,
  sanitizeString,
  sanitizeObject
}

