/**
 * Auth Store
 * Pinia store for authentication state management
 */

import { defineStore } from 'pinia'
import { authService, type AuthUser, type AuthState } from '../services/auth/AuthService'
import type { Session, Provider } from '@supabase/supabase-js'
import { debug, warn } from '../services/ui/log'

interface AuthStoreState {
  user: AuthUser | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthStoreState => ({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isInitialized: false,
  }),

  getters: {
    /**
     * Get display name (username or email)
     */
    displayName(): string {
      if (!this.user) return 'Guest'
      return this.user.displayName || this.user.username || this.user.email.split('@')[0]
    },

    /**
     * Get user initials for avatar
     */
    initials(): string {
      const name = this.displayName
      if (!name || name === 'Guest') return 'G'
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    /**
     * Check if auth service is available
     */
    isAvailable(): boolean {
      return authService.isAvailable()
    },
  },

  actions: {
    /**
     * Initialize auth state
     */
    async initialize(): Promise<void> {
      if (this.isInitialized) return

      try {
        this.isLoading = true
        
        // Check if auth is available
        if (!authService.isAvailable()) {
          debug('Auth store: Running in offline mode')
          this.isLoading = false
          this.isInitialized = true
          return
        }

        // Get initial state from auth service
        const state = authService.getState()
        this.updateFromAuthState(state)

        // Subscribe to auth changes
        authService.onAuthStateChange((event, session) => {
          debug('Auth store: Auth state changed', { event })
          this.handleAuthChange(event, session)
        })

        this.isInitialized = true
      } catch (err) {
        warn('Auth store: Initialization failed', { error: err })
        this.error = 'Failed to initialize authentication'
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Handle auth state changes
     */
    handleAuthChange(event: string, session: Session | null): void {
      switch (event) {
        case 'SIGNED_IN':
          if (session?.user) {
            this.user = {
              id: session.user.id,
              email: session.user.email || '',
              username: session.user.user_metadata?.username || null,
              displayName: session.user.user_metadata?.display_name || null,
              avatarUrl: session.user.user_metadata?.avatar_url || null,
              createdAt: session.user.created_at,
              emailConfirmed: !!session.user.email_confirmed_at,
            }
            this.session = session
            this.isAuthenticated = true
            this.error = null
          }
          break

        case 'SIGNED_OUT':
          this.user = null
          this.session = null
          this.isAuthenticated = false
          this.error = null
          break

        case 'TOKEN_REFRESHED':
          if (session) {
            this.session = session
          }
          break

        case 'USER_UPDATED':
          if (session?.user) {
            this.user = {
              ...this.user,
              id: session.user.id,
              email: session.user.email || '',
              username: session.user.user_metadata?.username || null,
              displayName: session.user.user_metadata?.display_name || null,
              avatarUrl: session.user.user_metadata?.avatar_url || null,
            }
          }
          break
      }
    },

    /**
     * Update store from auth state
     */
    updateFromAuthState(state: AuthState): void {
      this.user = state.user
      this.session = state.session
      this.isAuthenticated = state.isAuthenticated
      this.isLoading = state.isLoading
      this.error = state.error
    },

    /**
     * Sign up with email and password
     */
    async signUp(email: string, password: string, options?: { username?: string; displayName?: string }): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.signUp({
          email,
          password,
          username: options?.username,
          displayName: options?.displayName,
        })

        if (result.success && result.user) {
          this.user = result.user
          this.session = result.session || null
          this.isAuthenticated = true
          debug('Auth store: Sign up successful')
          return true
        }

        this.error = result.error || 'Sign up failed'
        return false
      } catch (err) {
        warn('Auth store: Sign up error', { error: err })
        this.error = 'An unexpected error occurred'
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.signIn({ email, password })

        if (result.success && result.user) {
          this.user = result.user
          this.session = result.session || null
          this.isAuthenticated = true
          debug('Auth store: Sign in successful')
          return true
        }

        this.error = result.error || 'Sign in failed'
        return false
      } catch (err) {
        warn('Auth store: Sign in error', { error: err })
        this.error = 'An unexpected error occurred'
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Sign in with OAuth provider
     */
    async signInWithProvider(provider: Provider): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.signInWithProvider(provider)

        if (result.success) {
          // OAuth redirects, so we don't update state here
          return true
        }

        this.error = result.error || 'OAuth sign in failed'
        return false
      } catch (err) {
        warn('Auth store: OAuth error', { error: err })
        this.error = 'An unexpected error occurred'
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Sign out
     */
    async signOut(): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.signOut()

        if (result.success) {
          this.user = null
          this.session = null
          this.isAuthenticated = false
          debug('Auth store: Sign out successful')
          return true
        }

        this.error = result.error || 'Sign out failed'
        return false
      } catch (err) {
        warn('Auth store: Sign out error', { error: err })
        this.error = 'An unexpected error occurred'
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Request password reset
     */
    async resetPassword(email: string): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.resetPassword(email)

        if (result.success) {
          debug('Auth store: Password reset email sent')
          return true
        }

        this.error = result.error || 'Password reset failed'
        return false
      } catch (err) {
        warn('Auth store: Password reset error', { error: err })
        this.error = 'An unexpected error occurred'
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update password
     */
    async updatePassword(newPassword: string): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.updatePassword(newPassword)

        if (result.success) {
          debug('Auth store: Password updated')
          return true
        }

        this.error = result.error || 'Password update failed'
        return false
      } catch (err) {
        warn('Auth store: Password update error', { error: err })
        this.error = 'An unexpected error occurred'
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update user profile
     */
    async updateProfile(updates: { username?: string; displayName?: string; avatarUrl?: string }): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.updateProfile(updates)

        if (result.success && result.user) {
          this.user = result.user
          debug('Auth store: Profile updated')
          return true
        }

        this.error = result.error || 'Profile update failed'
        return false
      } catch (err) {
        warn('Auth store: Profile update error', { error: err })
        this.error = 'An unexpected error occurred'
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Clear error
     */
    clearError(): void {
      this.error = null
    },
  },
})

export default useAuthStore

