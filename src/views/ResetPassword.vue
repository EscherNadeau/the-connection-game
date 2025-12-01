<template>
  <div class="reset-password-page">
    <div class="reset-container">
      <div class="reset-header">
        <h1 class="reset-title">🔐 Reset Password</h1>
        <p class="reset-subtitle">{{ subtitle }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Processing...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <p class="error-message">{{ error }}</p>
        <button class="action-btn" @click="goToStart">Back to Home</button>
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="success-state">
        <div class="success-icon">✅</div>
        <p class="success-message">Password updated successfully!</p>
        <p class="success-hint">You can now sign in with your new password.</p>
        <button class="action-btn primary" @click="goToStart">Go to Home</button>
      </div>

      <!-- Same Password State (funny) -->
      <div v-else-if="samePassword" class="same-password-state">
        <div class="same-icon">🎉</div>
        <p class="same-title">Congratulations!</p>
        <p class="same-message">You've successfully remembered your current password!</p>
        <p class="same-hint">That's... that's what you already had. 🤦</p>
        <div class="same-warning">
          <p>Also, quick thought: if you're resetting because someone hacked you...</p>
          <p><strong>maybe pick a DIFFERENT password?</strong> Just a suggestion. 🔒</p>
        </div>
        <div class="same-actions">
          <button class="action-btn" @click="samePassword = false">Try Again (Different Password)</button>
          <button class="action-btn secondary" @click="goToStart">Keep My Amazing Password</button>
        </div>
      </div>

      <!-- Password Form -->
      <form v-else class="reset-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="new-password">New Password</label>
          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            placeholder="Enter new password (min 6 chars)"
            required
            minlength="6"
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            required
            autocomplete="new-password"
          />
        </div>

        <div v-if="formError" class="form-error">
          {{ formError }}
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner small"></span>
          {{ isSubmitting ? 'Updating...' : 'Update Password' }}
        </button>

        <button type="button" class="back-link" @click="goToStart">
          ← Back to Home
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getSupabaseClient } from '../config/supabase'

const emit = defineEmits<{
  (e: 'back-to-start'): void
}>()

const isLoading = ref(true)
const isSubmitting = ref(false)
const error = ref('')
const success = ref(false)
const samePassword = ref(false)
const formError = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const hasValidSession = ref(false)

const subtitle = computed(() => {
  if (isLoading.value) return 'Verifying your reset link...'
  if (error.value) return 'Something went wrong'
  if (success.value) return 'All done!'
  if (samePassword.value) return 'Well, this is awkward...'
  return 'Enter your new password below'
})

onMounted(async () => {
  // Check if we have a valid recovery session from Supabase
  const client = getSupabaseClient()
  
  if (!client) {
    error.value = 'Authentication service not available'
    isLoading.value = false
    return
  }

  try {
    // Supabase should have already processed the hash and created a session
    const { data: { session }, error: sessionError } = await client.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      error.value = 'Invalid or expired reset link. Please request a new one.'
      isLoading.value = false
      return
    }

    if (!session) {
      // Check if there's a recovery token in the URL
      const hash = window.location.hash
      if (hash.includes('type=recovery') || hash.includes('access_token')) {
        // Wait a moment for Supabase to process the token
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { session: retrySession } } = await client.auth.getSession()
        if (!retrySession) {
          error.value = 'Invalid or expired reset link. Please request a new one.'
          isLoading.value = false
          return
        }
        hasValidSession.value = true
      } else {
        error.value = 'No reset token found. Please use the link from your email.'
        isLoading.value = false
        return
      }
    } else {
      hasValidSession.value = true
    }
    
    isLoading.value = false
  } catch (err) {
    console.error('Reset password init error:', err)
    error.value = 'Failed to verify reset link. Please try again.'
    isLoading.value = false
  }
})

const handleSubmit = async () => {
  formError.value = ''
  samePassword.value = false
  
  // Validation
  if (newPassword.value.length < 6) {
    formError.value = 'Password must be at least 6 characters'
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    formError.value = 'Passwords do not match'
    return
  }
  
  const client = getSupabaseClient()
  if (!client) {
    formError.value = 'Authentication service not available'
    return
  }
  
  isSubmitting.value = true
  
  try {
    const { error: updateError } = await client.auth.updateUser({
      password: newPassword.value
    })
    
    if (updateError) {
      console.error('Password update error:', updateError)
      
      // Check if it's the "same password" error
      const errorMsg = updateError.message?.toLowerCase() || ''
      if (errorMsg.includes('same') || errorMsg.includes('different') || errorMsg.includes('previously used')) {
        samePassword.value = true
        newPassword.value = ''
        confirmPassword.value = ''
        isSubmitting.value = false
        return
      }
      
      formError.value = updateError.message || 'Failed to update password'
      isSubmitting.value = false
      return
    }
    
    // Success!
    success.value = true
    
    // Clear the hash to clean up the URL
    window.location.hash = ''
    
  } catch (err) {
    console.error('Password update error:', err)
    formError.value = 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}

const goToStart = () => {
  window.location.hash = ''
  emit('back-to-start')
}
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
}

.reset-container {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.reset-header {
  text-align: center;
  margin-bottom: 2rem;
}

.reset-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 0.05em;
}

.reset-subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.95rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
}

.error-message {
  color: #fca5a5;
  font-size: 1rem;
}

/* Success State */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  text-align: center;
}

.success-icon {
  font-size: 3rem;
}

.success-message {
  color: #86efac;
  font-size: 1.1rem;
  font-weight: 600;
}

.success-hint {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

/* Same Password State (funny) */
.same-password-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  text-align: center;
}

.same-icon {
  font-size: 3rem;
}

.same-title {
  color: #fbbf24;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}

.same-message {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  margin: 0;
}

.same-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  font-style: italic;
  margin: 0;
}

.same-warning {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  text-align: left;
}

.same-warning p {
  margin: 0 0 0.5rem;
  color: #fca5a5;
  font-size: 0.9rem;
}

.same-warning p:last-child {
  margin-bottom: 0;
}

.same-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.5rem;
}

/* Form */
.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  padding: 0.875rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-group input:focus {
  outline: none;
  border-color: #e94560;
  box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.2);
}

.form-error {
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #fca5a5;
  font-size: 0.875rem;
}

.submit-btn {
  padding: 1rem;
  background: linear-gradient(135deg, #e94560 0%, #c23a51 100%);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-btn {
  padding: 0.875rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.action-btn.primary {
  background: linear-gradient(135deg, #e94560 0%, #c23a51 100%);
  border: none;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4);
}

.action-btn.secondary {
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.action-btn.secondary:hover {
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
}

.back-link {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem;
  text-align: center;
  transition: color 0.2s;
}

.back-link:hover {
  color: white;
}

/* Spinner */
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(233, 69, 96, 0.2);
  border-top-color: #e94560;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner.small {
  width: 18px;
  height: 18px;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: white;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 480px) {
  .reset-container {
    padding: 1.5rem;
    margin: 0.5rem;
  }
  
  .reset-title {
    font-size: 1.75rem;
  }
}
</style>
