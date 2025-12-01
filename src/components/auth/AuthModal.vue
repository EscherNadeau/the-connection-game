<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="auth-modal-overlay" @click.self="closeModal">
        <div class="auth-modal">
          <button class="close-btn" @click="closeModal" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div class="auth-header">
            <h2 class="auth-title">{{ activeTab === 'login' ? 'Welcome Back' : activeTab === 'register' ? 'Create Account' : 'Reset Password' }}</h2>
            <p class="auth-subtitle">
              {{ activeTab === 'login' ? 'Sign in to track your progress' : activeTab === 'register' ? 'Join the cinema connection community' : 'Enter your email to reset password' }}
            </p>
          </div>

          <!-- Tab Navigation (only for login/register) -->
          <div v-if="activeTab !== 'reset'" class="auth-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'login' }]" 
              @click="activeTab = 'login'"
            >
              Sign In
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'register' }]" 
              @click="activeTab = 'register'"
            >
              Sign Up
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="error || localError" class="auth-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{{ error || localError }}</span>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="auth-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>{{ successMessage }}</span>
          </div>

          <!-- Login Form -->
          <form v-if="activeTab === 'login'" class="auth-form" @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input 
                id="login-email"
                v-model="loginEmail"
                type="email"
                placeholder="Enter your email"
                required
                autocomplete="email"
              />
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input 
                id="login-password"
                v-model="loginPassword"
                type="password"
                placeholder="Enter your password"
                required
                autocomplete="current-password"
              />
            </div>
            <div class="form-options">
              <label class="remember-me">
                <input 
                  type="checkbox" 
                  v-model="rememberMe"
                  @change="handleRememberMeChange"
                />
                <span class="checkmark"></span>
                <span class="label-text">Remember me</span>
              </label>
              <button type="button" class="forgot-link" @click="activeTab = 'reset'">
                Forgot password?
              </button>
            </div>
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <!-- Register Form -->
          <form v-if="activeTab === 'register'" class="auth-form" @submit.prevent="handleRegister">
            <div class="form-group">
              <label for="register-username">Username</label>
              <input 
                id="register-username"
                v-model="registerUsername"
                type="text"
                placeholder="Choose a username"
                autocomplete="username"
              />
            </div>
            <div class="form-group">
              <label for="register-email">Email</label>
              <input 
                id="register-email"
                v-model="registerEmail"
                type="email"
                placeholder="Enter your email"
                required
                autocomplete="email"
              />
            </div>
            <div class="form-group">
              <label for="register-password">Password</label>
              <input 
                id="register-password"
                v-model="registerPassword"
                type="password"
                placeholder="Create a password (min 6 chars)"
                required
                minlength="6"
                autocomplete="new-password"
              />
            </div>
            <div class="form-group">
              <label for="register-confirm">Confirm Password</label>
              <input 
                id="register-confirm"
                v-model="registerConfirm"
                type="password"
                placeholder="Confirm your password"
                required
                autocomplete="new-password"
              />
            </div>
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              {{ isLoading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>

          <!-- Reset Password Form -->
          <form v-if="activeTab === 'reset'" class="auth-form" @submit.prevent="handleResetPassword">
            <div class="form-group">
              <label for="reset-email">Email</label>
              <input 
                id="reset-email"
                v-model="resetEmail"
                type="email"
                placeholder="Enter your email"
                required
                autocomplete="email"
              />
            </div>
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
            </button>
            <button type="button" class="back-link" @click="activeTab = 'login'">
              ← Back to Sign In
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { isRememberMeEnabled, setRememberMe } from '../../config/authStorage'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'authenticated'): void
}>()

const { signIn, signUp, resetPassword, isLoading, error, clearError } = useAuth()

// Local error state for validation
const localError = ref('')

// Form state
const activeTab = ref<'login' | 'register' | 'reset'>('login')
const loginEmail = ref('')
const loginPassword = ref('')
const registerUsername = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerConfirm = ref('')
const resetEmail = ref('')
const successMessage = ref('')

// Remember me state - defaults to true
const rememberMe = ref(true)

// Load remember me preference on mount
onMounted(() => {
  rememberMe.value = isRememberMeEnabled()
})

// Handle remember me checkbox change
const handleRememberMeChange = () => {
  setRememberMe(rememberMe.value)
}

// Clear form when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    clearError()
    localError.value = ''
    successMessage.value = ''
    // Refresh remember me state when modal opens
    rememberMe.value = isRememberMeEnabled()
  } else {
    // Reset forms when closed
    loginEmail.value = ''
    loginPassword.value = ''
    registerUsername.value = ''
    registerEmail.value = ''
    registerPassword.value = ''
    registerConfirm.value = ''
    resetEmail.value = ''
    activeTab.value = 'login'
  }
})

// Clear errors when switching tabs
watch(activeTab, () => {
  clearError()
  localError.value = ''
  successMessage.value = ''
})

const closeModal = () => {
  emit('close')
}

const handleLogin = async () => {
  clearError()
  localError.value = ''
  successMessage.value = ''
  
  // Set remember me preference before login
  setRememberMe(rememberMe.value)
  
  const success = await signIn(loginEmail.value, loginPassword.value)
  if (success) {
    emit('authenticated')
    closeModal()
  }
}

const handleRegister = async () => {
  clearError()
  localError.value = ''
  successMessage.value = ''
  
  // Validation
  if (!registerEmail.value) {
    localError.value = 'Email is required'
    return
  }
  
  if (registerPassword.value !== registerConfirm.value) {
    localError.value = 'Passwords do not match'
    return
  }
  
  if (registerPassword.value.length < 6) {
    localError.value = 'Password must be at least 6 characters'
    return
  }
  
  console.log('Attempting signup with:', registerEmail.value)
  
  const success = await signUp(registerEmail.value, registerPassword.value, {
    username: registerUsername.value || undefined,
  })
  
  console.log('Signup result:', success)
  
  if (success) {
    successMessage.value = 'Account created! Please check your email to confirm.'
  }
}

const handleResetPassword = async () => {
  clearError()
  localError.value = ''
  successMessage.value = ''
  
  const success = await resetPassword(resetEmail.value)
  if (success) {
    successMessage.value = 'Password reset email sent! Check your inbox.'
  }
}
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.auth-modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 0.05em;
}

.auth-subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.9rem;
}

.auth-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.tab-btn.active {
  background: linear-gradient(135deg, #e94560 0%, #c23a51 100%);
  color: white;
}

.tab-btn:not(.active):hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.auth-error, .auth-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.auth-error {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.auth-success {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem 1rem;
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

/* Form options row (remember me + forgot password) */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -0.25rem;
}

/* Remember Me Checkbox */
.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.remember-me input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.remember-me .checkmark {
  position: relative;
  height: 18px;
  width: 18px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  transition: all 0.2s;
}

.remember-me:hover .checkmark {
  border-color: rgba(255, 255, 255, 0.4);
}

.remember-me input:checked ~ .checkmark {
  background: linear-gradient(135deg, #e94560 0%, #c23a51 100%);
  border-color: #e94560;
}

.remember-me .checkmark::after {
  content: '';
  position: absolute;
  display: none;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.remember-me input:checked ~ .checkmark::after {
  display: block;
}

.remember-me .label-text {
  line-height: 1;
}

.forgot-link, .back-link {
  background: none;
  border: none;
  color: #e94560;
  font-size: 0.875rem;
  cursor: pointer;
  text-align: left;
  padding: 0;
}

.forgot-link:hover, .back-link:hover {
  text-decoration: underline;
}

.back-link {
  text-align: center;
  margin-top: 0.5rem;
}

.submit-btn {
  padding: 0.875rem;
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
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .auth-modal, .modal-leave-active .auth-modal {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-from .auth-modal, .modal-leave-to .auth-modal {
  transform: scale(0.95) translateY(-10px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-modal {
    padding: 1.5rem;
    margin: 0.5rem;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
