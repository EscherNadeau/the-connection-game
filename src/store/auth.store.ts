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
    displayName(): string {
      if (!this.user) return 'Guest'
      return this.user.displayName || this.user.username || this.user.email.split('@')[0]
    },

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

    isAvailable(): boolean {
      return authService.isAvailable()
    },
  },

  actions: {
    /**
     * Initialize auth state - MUST be called on app start
     */
    async initialize(): Promise<void> {
      if (this.isInitialized) return

      try {
        // Clear session from localStorage if Remember Me is disabled
        clearSessionIfRememberMeDisabled()
        this.isLoading = true
        
        if (!authService.isAvailable()) {
          debug('Auth store: Running in offline mode')
          this.isLoading = false
          this.isInitialized = true
          return
        }

        // IMPORTANT: Wait for AuthService to fully initialize first
        await authService.waitForInit()

        // Now get the state (session should be restored)
        const state = authService.getState()
        this.updateFromAuthState(state)

        debug('Auth store: Initialized', { 
          isAuthenticated: this.isAuthenticated,
          userId: this.user?.id 
        })

        // Subscribe to future auth changes
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

    handleAuthChange(event: string, session: Session | null): void {
      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
        case 'INITIAL_SESSION':
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

    updateFromAuthState(state: AuthState): void {
      this.user = state.user
      this.session = state.session
      this.isAuthenticated = state.isAuthenticated
      this.isLoading = state.isLoading
      this.error = state.error
    },

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
          return true
        }

        this.error = result.error || 'Sign up failed'
        return false
      } catch (err) {
        this.error = 'Sign up failed. Please try again.'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async signIn(email: string, password: string): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.signIn({ email, password })

        if (result.success && result.user) {
          this.user = result.user
          this.session = result.session || null
          this.isAuthenticated = true
          return true
        }

        this.error = result.error || 'Sign in failed'
        return false
      } catch (err) {
        this.error = 'Sign in failed. Please try again.'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async signInWithProvider(provider: Provider): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.signInWithProvider(provider)
        if (!result.success) {
          this.error = result.error || 'Sign in failed'
          return false
        }
        return true
      } catch (err) {
        this.error = 'Sign in failed. Please try again.'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async signOut(): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.signOut()
        if (result.success) {
          this.user = null
          this.session = null
          this.isAuthenticated = false
          return true
        }
        this.error = result.error || 'Sign out failed'
        return false
      } catch (err) {
        this.error = 'Sign out failed. Please try again.'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async resetPassword(email: string): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.resetPassword(email)
        if (!result.success) {
          this.error = result.error || 'Failed to send reset email'
          return false
        }
        return true
      } finally {
        this.isLoading = false
      }
    },

    async updatePassword(newPassword: string): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const result = await authService.updatePassword(newPassword)
        if (!result.success) {
          this.error = result.error || 'Failed to update password'
          return false
        }
        return true
      } finally {
        this.isLoading = false
      }
    },

    async updateProfile(updates: { username?: string; displayName?: string; avatarUrl?: string }): Promise<boolean> {
      this.error = null

      try {
        const result = await authService.updateProfile(updates)
        if (result.success && result.user) {
          this.user = result.user
          return true
        }
        this.error = result.error || 'Failed to update profile'
        return false
      } catch (err) {
        this.error = 'Failed to update profile. Please try again.'
        return false
      }
    },

    clearError(): void {
      this.error = null
    },
  },
})
