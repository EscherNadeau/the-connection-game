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

  constructor() {
    // Initialize auth state on construction
    this.initializeAuth()
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
      // Get initial session
      const { data: { session }, error } = await client.auth.getSession()
      
      if (error) {
        warn('AuthService: Failed to get initial session', { error })
      } else if (session) {
        this.currentSession = session
        this.currentUser = this.mapUser(session.user)
        debug('AuthService: Restored session', { userId: session.user.id })
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
   * Get current auth state
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
   * Get current user
   */
  getUser(): AuthUser | null {
    return this.currentUser
  }

  /**
   * Get current session
   */
  getSession(): Session | null {
    return this.currentSession
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.currentUser
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
            username: data.username || null,
            display_name: data.displayName || data.username || null,
          },
        },
      })

      if (error) {
        warn('AuthService: Sign up failed', { error: error.message })
        return { success: false, error: this.getErrorMessage(error) }
      }

      if (authData.user) {
        // Create user profile in database
        await this.createUserProfile(authData.user, data)
        
        debug('AuthService: User signed up', { userId: authData.user.id })
        return {
          success: true,
          user: this.mapUser(authData.user),
          session: authData.session,
        }
      }

      return { success: false, error: 'Sign up failed' }
    } catch (err) {
      logError('AuthService: Sign up error', { error: err })
      return { success: false, error: 'An unexpected error occurred' }
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
        warn('AuthService: Sign in failed', { error: error.message })
        return { success: false, error: this.getErrorMessage(error) }
      }

      if (authData.user) {
        // Update last login timestamp
        await this.updateLastLogin(authData.user.id)
        
        debug('AuthService: User signed in', { userId: authData.user.id })
        return {
          success: true,
          user: this.mapUser(authData.user),
          session: authData.session,
        }
      }

      return { success: false, error: 'Sign in failed' }
    } catch (err) {
      logError('AuthService: Sign in error', { error: err })
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Sign in with OAuth provider (Google, Discord, etc.)
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
        warn('AuthService: OAuth sign in failed', { error: error.message, provider })
        return { success: false, error: this.getErrorMessage(error) }
      }

      // OAuth redirects, so we return success here
      debug('AuthService: OAuth redirect initiated', { provider })
      return { success: true }
    } catch (err) {
      logError('AuthService: OAuth error', { error: err })
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<AuthResult> {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, error: 'Authentication not available' }
    }

    try {
      const { error } = await client.auth.signOut()

      if (error) {
        warn('AuthService: Sign out failed', { error: error.message })
        return { success: false, error: this.getErrorMessage(error) }
      }

      this.currentUser = null
      this.currentSession = null
      
      debug('AuthService: User signed out')
      return { success: true }
    } catch (err) {
      logError('AuthService: Sign out error', { error: err })
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Send password reset email
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
        warn('AuthService: Password reset failed', { error: error.message })
        return { success: false, error: this.getErrorMessage(error) }
      }

      debug('AuthService: Password reset email sent', { email })
      return { success: true }
    } catch (err) {
      logError('AuthService: Password reset error', { error: err })
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update password (when user is logged in or has reset token)
   */
  async updatePassword(newPassword: string): Promise<AuthResult> {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, error: 'Authentication not available' }
    }

    try {
      const { data, error } = await client.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        warn('AuthService: Password update failed', { error: error.message })
        return { success: false, error: this.getErrorMessage(error) }
      }

      debug('AuthService: Password updated')
      return { success: true, user: data.user ? this.mapUser(data.user) : null }
    } catch (err) {
      logError('AuthService: Password update error', { error: err })
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: { 
    username?: string
    displayName?: string
    avatarUrl?: string 
  }): Promise<AuthResult> {
    const client = getSupabaseClient()
    if (!client || !this.currentUser) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      // Update auth user metadata
      const { data: authData, error: authError } = await client.auth.updateUser({
        data: {
          username: updates.username,
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl,
        },
      })

      if (authError) {
        warn('AuthService: Profile update failed', { error: authError.message })
        return { success: false, error: this.getErrorMessage(authError) }
      }

      // Also update the users table
      const { error: dbError } = await client
        .from('users')
        .update({
          username: updates.username,
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.currentUser.id)

      if (dbError) {
        warn('AuthService: Profile database update failed', { error: dbError })
      }

      debug('AuthService: Profile updated')
      return { 
        success: true, 
        user: authData.user ? this.mapUser(authData.user) : null 
      }
    } catch (err) {
      logError('AuthService: Profile update error', { error: err })
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Refresh session token
   */
  async refreshSession(): Promise<AuthResult> {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, error: 'Authentication not available' }
    }

    try {
      const { data, error } = await client.auth.refreshSession()

      if (error) {
        warn('AuthService: Session refresh failed', { error: error.message })
        return { success: false, error: this.getErrorMessage(error) }
      }

      if (data.session) {
        this.currentSession = data.session
        this.currentUser = data.user ? this.mapUser(data.user) : null
        debug('AuthService: Session refreshed')
        return { 
          success: true, 
          user: this.currentUser, 
          session: data.session 
        }
      }

      return { success: false, error: 'Session refresh failed' }
    } catch (err) {
      logError('AuthService: Session refresh error', { error: err })
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: AuthEventCallback): () => void {
    this.listeners.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * Map Supabase user to AuthUser
   */
  private mapUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      username: user.user_metadata?.username || null,
      displayName: user.user_metadata?.display_name || user.user_metadata?.username || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
      createdAt: user.created_at,
      emailConfirmed: !!user.email_confirmed_at,
    }
  }

  /**
   * Create user profile in database after sign up
   */
  private async createUserProfile(user: User, data: SignUpData): Promise<void> {
    const client = getSupabaseClient()
    if (!client) return

    try {
      const { error } = await client.from('users').insert({
        id: user.id,
        email: user.email || data.email,
        username: data.username || null,
        display_name: data.displayName || data.username || null,
      })

      if (error) {
        // Profile might already exist from trigger, ignore duplicate
        if (!error.message.includes('duplicate')) {
          warn('AuthService: Failed to create user profile', { error })
        }
      }
    } catch (err) {
      warn('AuthService: Error creating user profile', { error: err })
    }
  }

  /**
   * Update last login timestamp
   */
  private async updateLastLogin(userId: string): Promise<void> {
    const client = getSupabaseClient()
    if (!client) return

    try {
      await client
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId)
    } catch (err) {
      // Non-critical, just log
      debug('AuthService: Failed to update last login', { error: err })
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: AuthError): string {
    const messages: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please confirm your email before signing in',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters': 'Password must be at least 6 characters',
      'Email rate limit exceeded': 'Too many attempts. Please try again later',
    }

    return messages[error.message] || error.message || 'An error occurred'
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService

