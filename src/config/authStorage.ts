/**
 * Custom Auth Storage Adapter
 * Switches between localStorage (remember me) and sessionStorage (forget on close)
 */

const REMEMBER_ME_KEY = 'auth_remember_me'

/**
 * Check if "Remember Me" is enabled
 */
export function isRememberMeEnabled(): boolean {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(REMEMBER_ME_KEY)
  // Default to true (remember me on)
  return stored !== 'false'
}

/**
 * Set "Remember Me" preference
 */
export function setRememberMe(remember: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false')
  
  // If turning off remember me, move session from localStorage to sessionStorage
  if (!remember) {
    migrateSessionToSessionStorage()
  } else {
    migrateSessionToLocalStorage()
  }
}

/**
 * Get the appropriate storage based on remember me setting
 */
function getActiveStorage(): Storage {
  return isRememberMeEnabled() ? localStorage : sessionStorage
}

/**
 * Migrate session data from localStorage to sessionStorage
 */
function migrateSessionToSessionStorage(): void {
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith('sb-') && key.includes('-auth-token')
  )
  keys.forEach(key => {
    const value = localStorage.getItem(key)
    if (value) {
      sessionStorage.setItem(key, value)
      localStorage.removeItem(key)
    }
  })
}

/**
 * Migrate session data from sessionStorage to localStorage  
 */
function migrateSessionToLocalStorage(): void {
  const keys = Object.keys(sessionStorage).filter(key => 
    key.startsWith('sb-') && key.includes('-auth-token')
  )
  keys.forEach(key => {
    const value = sessionStorage.getItem(key)
    if (value) {
      localStorage.setItem(key, value)
      sessionStorage.removeItem(key)
    }
  })
}

/**
 * Custom storage adapter for Supabase Auth
 * Routes to localStorage or sessionStorage based on remember me setting
 */
export const authStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    // Check both storages since we might be switching
    return getActiveStorage().getItem(key) || 
           localStorage.getItem(key) || 
           sessionStorage.getItem(key)
  },
  
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    const storage = getActiveStorage()
    storage.setItem(key, value)
    
    // Clean up the other storage
    const otherStorage = isRememberMeEnabled() ? sessionStorage : localStorage
    otherStorage.removeItem(key)
  },
  
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return
    // Remove from both storages to be safe
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

/**
 * Clear all auth session data (used on logout)
 */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return
  
  // Clear from both storages
  const allKeys = [
    ...Object.keys(localStorage),
    ...Object.keys(sessionStorage)
  ].filter(key => key.startsWith('sb-') && key.includes('-auth-token'))
  
  allKeys.forEach(key => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
}

export default authStorage
