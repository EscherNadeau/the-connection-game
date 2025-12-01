/**
 * Authentication Service
 * Handles user authentication using Supabase Auth
 */

import type { User, Session, AuthError, Provider } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseConfigured } from '../../config/supabase'
import { debug, warn, error as logError } from '../ui/log'

export interface AuthUser {
  id: string
  email: string
  username?: string | null
  displayName?: string | null
  avatarUrl?: string | null
  createdAt?: string
  emailConfirmed?: boolean
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface SignUpData {
  email: string
  password: string
  username?: string
  displayName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  user?: AuthUser | null
  session?: Session | null
  error?: string
}

type AuthEventCallback = (event: string, session: Session | null) => void

class AuthService {
  private listeners: Set<AuthEventCallback> = new Set()
  private currentUser: AuthUser | null = null
  private currentSession: Session | null = null
  private initialized = false
  private initPromise: Promise<void> | null = null

  constructor() {
    // Start initialization immediately
    this.initPromise = this.initializeAuth()
  }

  /**
   * Wait for auth to be initialized
   */
  async waitForInit(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise
    }
  }

  /**
   * Initialize authentication state and set up listeners
   */
  private async initializeAuth(): Promise<void> {
    if (this.initialized) return

    const client = getSupabaseClient()
    if (!client) {
      debug('AuthService: Supabase not configured, running in offline mode')
      this.initialized = true
      return
    }

    try {
      // Get initial session from storage
      const { data: { session }, error } = await client.auth.getSession()
      
      if (error) {
        warn('AuthService: Failed to get initial session', { error })
      } else if (session) {
        this.currentSession = session
        this.currentUser = this.mapUser(session.user)
        debug('AuthService: Restored session', { userId: session.user.id })
      } else {
        debug('AuthService: No existing session')
      }

      // Set up auth state change listener
      client.auth.onAuthStateChange((event, session) => {
        debug('AuthService: Auth state changed', { event, hasSession: !!session })
        
        this.currentSession = session
        this.currentUser = session ? this.mapUser(session.user) : null

        // Notify all listeners
        this.listeners.forEach(callback => {
          try {
            callback(event, session)
          } catch (err) {
            warn('AuthService: Listener callback failed', { error: err })
          }
        })
      })

      this.initialized = true
    } catch (err) {
      logError('AuthService: Initialization failed', { error: err })
      this.initialized = true
    }
  }

  /**
   * Check if auth service is available
   */
  isAvailable(): boolean {
    return isSupabaseConfigured()
  }

  /**
   * Get current auth state (call waitForInit first for accurate state)
   */
  getState(): AuthState {
    return {
      user: this.currentUser,
      session: this.currentSession,
      isAuthenticated: !!this.currentUser,
      isLoading: !this.initialized,
      error: null,
    }
  }

  /**
   * Get session
   */
  getSession(): Session | null {
    return this.currentSession
  }

  /**
   * Map Supabase User to AuthUser
   */
  private mapUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      username: user.user_metadata?.username || null,
      displayName: user.user_metadata?.display_name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
      createdAt: user.created_at,
      emailConfirmed: !!user.email_confirmed_at,
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: AuthEventCallback): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Sign up with email and password
   */
  async signUp(data: SignUpData): Promise<AuthResult> {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, error: 'Authentication not available' }
    }

    try {
      const { data: authData, error } = await client.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            display_name: data.displayName,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (authData.user) {
        this.currentUser = this.mapUser(authData.user)
        this.currentSession = authData.session

        // Create user profile in database
        await this.createUserProfile(authData.user, data)
      }

      return {
        success: true,
        user: this.currentUser,
        session: authData.session,
      }
    } catch (err) {
      logError('AuthService: Sign up failed', { error: err })
      return { success: false, error: 'Sign up failed. Please try again.' }
    }
  }

  /**
   * Create user profile in database
   */
  private async createUserProfile(user: User, data: SignUpData): Promise<void> {
    const client = getSupabaseClient()
    if (!client) return

    try {
      await client.from('users').upsert({
        id: user.id,
        email: user.email,
        username: data.username || null,
        display_name: data.displayName || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    } catch (err) {
      warn('AuthService: Failed to create user profile', { error: err })
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInData): Promise<AuthResult> {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, error: 'Authentication not available' }
    }

    try {
      const { data: authData, error } = await client.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (authData.user) {
        this.currentUser = this.mapUser(authData.user)
        this.currentSession = authData.session
      }

      return {
        success: true,
        user: this.currentUser,
        session: authData.session,
      }
    } catch (err) {
      logError('AuthService: Sign in failed', { error: err })
      return { success: false, error: 'Sign in failed. Please try again.' }
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(provider: Provider): Promise<AuthResult> {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, error: 'Authentication not available' }
    }

    try {
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      logError('AuthService: OAuth sign in failed', { error: err })
      return { success: false, error: 'Sign in failed. Please try again.' }
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<AuthResult> {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, error: 'Authentication not available' }
    }

    try {
      const { error } = await client.auth.signOut()

      if (error) {
        return { success: false, error: error.message }
      }

      this.currentUser = null
      this.currentSession = null

      return { success: true }
    } catch (err) {
      logError('AuthService: Sign out failed', { error: err })
      return { success: false, error: 'Sign out failed. Please try again.' }
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<AuthResult> {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, error: 'Authentication not available' }
    }

    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' 
          ? `${window.location.origin}/#/reset-password`
          : undefined,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      logError('AuthService: Reset password failed', { error: err })
      return { success: false, error: 'Failed to send reset email. Please try again.' }
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<AuthResult> {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, error: 'Authentication not available' }
    }

    try {
      const { error } = await client.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      logError('AuthService: Update password failed', { error: err })
      return { success: false, error: 'Failed to update password. Please try again.' }
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: { username?: string; displayName?: string; avatarUrl?: string }): Promise<AuthResult> {
    const client = getSupabaseClient()
    if (!client || !this.currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      // Update auth user metadata
      const { error: authError } = await client.auth.updateUser({
        data: {
          username: updates.username,
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl,
        },
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      // Update database profile
      const { error: dbError } = await client.from('users').update({
        username: updates.username,
        display_name: updates.displayName,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString(),
      }).eq('id', this.currentUser.id)

      if (dbError) {
        warn('AuthService: Failed to update database profile', { error: dbError })
      }

      // Update local state
      this.currentUser = {
        ...this.currentUser,
        username: updates.username ?? this.currentUser.username,
        displayName: updates.displayName ?? this.currentUser.displayName,
        avatarUrl: updates.avatarUrl ?? this.currentUser.avatarUrl,
      }

      return { success: true, user: this.currentUser }
    } catch (err) {
      logError('AuthService: Update profile failed', { error: err })
      return { success: false, error: 'Failed to update profile. Please try again.' }
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService
