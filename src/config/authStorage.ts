/**
 * Custom Auth Storage Adapter
 * Handles "Remember Me" functionality for Supabase Auth
 */

const REMEMBER_ME_KEY = 'auth_remember_me'

/**
 * Check if "Remember Me" is enabled (defaults to TRUE)
 */
export function isRememberMeEnabled(): boolean {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(REMEMBER_ME_KEY)
  // Default to true if not set
  return stored !== 'false'
}

/**
 * Set "Remember Me" preference
 */
export function setRememberMe(remember: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false')
}

/**
 * Custom storage adapter for Supabase Auth
 * Always uses localStorage for simplicity and reliability
 * The "remember me" setting controls whether we clear on signOut
 */
export const authStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  },
  
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, value)
  },
  
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },
}

/**
 * Clear all auth session data
 */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return
  
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith('sb-') && key.includes('-auth-token')
  )
  
  keys.forEach(key => localStorage.removeItem(key))
}


/**
 * Clear session from localStorage if Remember Me is disabled
 * Call this on app initialization
 */
export function clearSessionIfRememberMeDisabled(): void {
  if (typeof window === 'undefined') return
  if (!isRememberMeEnabled()) {
    // Clear all Supabase auth tokens from localStorage
    const supabaseKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') && key.includes('auth-token')
    )
    supabaseKeys.forEach(key => localStorage.removeItem(key))
  }
}

export default authStorage
