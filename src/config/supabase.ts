/**
 * Supabase Configuration
 * Initializes the Supabase client for authentication and database access
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { authStorage } from './authStorage'

// Get Supabase configuration from environment variables
const getSupabaseUrl = (): string => {
  return import.meta.env.VITE_SUPABASE_URL || ''
}

const getSupabaseAnonKey = (): string => {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || ''
}

// Create the Supabase client
let supabaseClient: SupabaseClient<Database> | null = null

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()

  // If no configuration, return null (app works in offline/solo mode)
  if (!url || !anonKey) {
    return null
  }

  // Create client only once (singleton pattern)
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Use custom storage that respects "Remember Me" setting
        storage: typeof window !== 'undefined' ? authStorage : undefined,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  }

  return supabaseClient
}

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}

// Export configuration info
export const supabaseConfig = {
  url: getSupabaseUrl(),
  isConfigured: isSupabaseConfigured(),
}

export default getSupabaseClient
