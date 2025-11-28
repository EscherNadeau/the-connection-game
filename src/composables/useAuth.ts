/**
 * useAuth Composable
 * Provides reactive authentication state and methods for Vue components
 */

import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../store/auth.store'
import type { Provider } from '@supabase/supabase-js'

export interface UseAuthReturn {
  // State
  user: ReturnType<typeof computed>
  isAuthenticated: ReturnType<typeof computed>
  isLoading: ReturnType<typeof computed>
  error: ReturnType<typeof computed>
  isAvailable: ReturnType<typeof computed>
  displayName: ReturnType<typeof computed>
  initials: ReturnType<typeof computed>

  // Methods
  signUp: (email: string, password: string, options?: { username?: string; displayName?: string }) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<boolean>
  signInWithGoogle: () => Promise<boolean>
  signInWithDiscord: () => Promise<boolean>
  signOut: () => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  updatePassword: (newPassword: string) => Promise<boolean>
  updateProfile: (updates: { username?: string; displayName?: string; avatarUrl?: string }) => Promise<boolean>
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const authStore = useAuthStore()
  const { user, isAuthenticated, isLoading, error, displayName, initials, isAvailable } = storeToRefs(authStore)

  // Initialize auth on first use
  onMounted(() => {
    authStore.initialize()
  })

  // Methods
  const signUp = async (
    email: string,
    password: string,
    options?: { username?: string; displayName?: string }
  ): Promise<boolean> => {
    return authStore.signUp(email, password, options)
  }

  const signIn = async (email: string, password: string): Promise<boolean> => {
    return authStore.signIn(email, password)
  }

  const signInWithGoogle = async (): Promise<boolean> => {
    return authStore.signInWithProvider('google' as Provider)
  }

  const signInWithDiscord = async (): Promise<boolean> => {
    return authStore.signInWithProvider('discord' as Provider)
  }

  const signOut = async (): Promise<boolean> => {
    return authStore.signOut()
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    return authStore.resetPassword(email)
  }

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    return authStore.updatePassword(newPassword)
  }

  const updateProfile = async (updates: {
    username?: string
    displayName?: string
    avatarUrl?: string
  }): Promise<boolean> => {
    return authStore.updateProfile(updates)
  }

  const clearError = (): void => {
    authStore.clearError()
  }

  return {
    // State (reactive refs from store)
    user,
    isAuthenticated,
    isLoading,
    error,
    isAvailable,
    displayName,
    initials,

    // Methods
    signUp,
    signIn,
    signInWithGoogle,
    signInWithDiscord,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    clearError,
  }
}

export default useAuth

