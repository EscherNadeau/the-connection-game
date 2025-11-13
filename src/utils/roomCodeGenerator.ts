/**
 * Centralized room code generation utility
 * Handles room code generation with server fallback logic
 */

import { debug, warn, error as logError } from '../services/ui/log'

export interface RoomCodePayload {
  modeId: string
  modeTitle: string
  modeSettings?: Record<string, unknown>
  startingItems?: unknown[]
  playType: string
  goalQueue?: unknown[]
  currentGoalIndex?: number
  gameType?: string
}

export interface RoomCodeResult {
  code: string
  url: string
}

/**
 * Generate a random room code
 * @returns 4-character uppercase alphanumeric code
 */
export function generateRandomCode(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase()
}

/**
 * Encode payload as base64 for URL hash
 * @param payload - Room code payload to encode
 * @returns Base64 encoded string
 */
export function encodePayload(payload: RoomCodePayload): string {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
  } catch (err) {
    logError('Failed to encode payload', { error: err, payload })
    return ''
  }
}

/**
 * Save room code to session storage
 * @param code - Room code to save
 */
export function saveRoomCode(code: string): void {
  try {
    sessionStorage.setItem('lastRoomCode', code)
  } catch (err) {
    debug('Failed to save room code to sessionStorage', { error: err, code })
  }
}

/**
 * Generate room code with server fallback
 * Attempts to store on snapshot server for short code, falls back to local encoding
 * @param payload - Room code payload
 * @param serverUrl - Optional server URL (defaults to localhost:3011)
 * @returns Promise resolving to room code result
 */
export async function generateRoomCode(
  payload: RoomCodePayload,
  serverUrl?: string
): Promise<RoomCodeResult> {
  const code = generateRandomCode()
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  const url = serverUrl || `http://${hostname}:3011/api/snapshots`

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: payload }),
    })

    if (resp.ok) {
      const json = await resp.json()
      if (json && json.code) {
        // Server returned short code
        saveRoomCode(json.code)
        const hash = `room=${json.code}`
        if (typeof window !== 'undefined') {
          window.location.hash = hash
        }
        debug('Generated room code via server', { code: json.code })
        return { code: json.code, url: hash }
      }
    }
  } catch (err) {
    warn('Room code server error, using fallback', { error: err })
  }

  // Fallback to local encoding
  const encoded = encodePayload(payload)
  const hash = `room=${code}&s=${encoded}`
  saveRoomCode(code)
  
  if (typeof window !== 'undefined') {
    window.location.hash = hash
  }
  
  debug('Generated fallback room code', { code })
  return { code, url: hash }
}

/**
 * Generate room code synchronously (for callback-based code)
 * Uses the same logic as generateRoomCode but with Promise-based callbacks
 * @param payload - Room code payload
 * @param onSuccess - Success callback
 * @param onError - Error callback
 */
export function generateRoomCodeSync(
  payload: RoomCodePayload,
  onSuccess?: (result: RoomCodeResult) => void,
  onError?: (error: unknown) => void
): void {
  generateRoomCode(payload)
    .then((result) => {
      if (onSuccess) onSuccess(result)
    })
    .catch((err) => {
      logError('Error generating room code', { error: err })
      if (onError) onError(err)
      // Still provide fallback result
      const code = generateRandomCode()
      const encoded = encodePayload(payload)
      const hash = `room=${code}&s=${encoded}`
      saveRoomCode(code)
      if (typeof window !== 'undefined') {
        window.location.hash = hash
      }
      if (onSuccess) {
        onSuccess({ code, url: hash })
      }
    })
}

