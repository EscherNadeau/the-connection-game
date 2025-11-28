<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
        </svg>
      </div>
      
      <h2 class="error-title">{{ title }}</h2>
      <p class="error-message">{{ message }}</p>
      
      <div class="error-actions">
        <button class="btn-retry" @click="retry">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
          Try Again
        </button>
        <button class="btn-home" @click="goHome">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Go Home
        </button>
      </div>
      
      <details v-if="showDetails && errorInfo" class="error-details">
        <summary>Technical Details</summary>
        <pre>{{ errorInfo }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, computed } from 'vue'
import { errorHandler, type AppError } from '@/services/errors/ErrorHandler'

interface Props {
  fallbackTitle?: string
  fallbackMessage?: string
  showDetails?: boolean
  onError?: (error: AppError) => void
}

const props = withDefaults(defineProps<Props>(), {
  fallbackTitle: 'Something went wrong',
  fallbackMessage: 'We encountered an unexpected error. Please try again.',
  showDetails: import.meta.env.DEV,
  onError: undefined
})

const emit = defineEmits<{
  (e: 'error', error: AppError): void
  (e: 'retry'): void
  (e: 'home'): void
}>()

const hasError = ref(false)
const capturedError = ref<AppError | null>(null)

const title = computed(() => capturedError.value?.userMessage || props.fallbackTitle)
const message = computed(() => {
  if (capturedError.value?.recoverable) {
    return props.fallbackMessage
  }
  return capturedError.value?.userMessage || props.fallbackMessage
})

const errorInfo = computed(() => {
  if (!capturedError.value) return ''
  return JSON.stringify({
    code: capturedError.value.code,
    message: capturedError.value.message,
    context: capturedError.value.context,
    timestamp: capturedError.value.timestamp
  }, null, 2)
})

onErrorCaptured((err, instance, info) => {
  const appError = errorHandler.handleError(err, {
    component: instance?.$options?.name || 'Unknown',
    lifecycleHook: info
  })
  
  capturedError.value = appError
  hasError.value = true
  
  emit('error', appError)
  props.onError?.(appError)
  
  // Return false to prevent error from propagating
  return false
})

function retry() {
  hasError.value = false
  capturedError.value = null
  emit('retry')
}

function goHome() {
  hasError.value = false
  capturedError.value = null
  emit('home')
  // Navigate to home - this will be handled by parent
  window.location.hash = ''
  window.location.reload()
}

// Expose reset method for programmatic use
defineExpose({
  reset: () => {
    hasError.value = false
    capturedError.value = null
  },
  hasError,
  error: capturedError
})
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.error-container {
  max-width: 480px;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  text-align: center;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  color: #f87171;
  animation: pulse 2s ease-in-out infinite;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.95); }
}

.error-title {
  margin: 0 0 0.75rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

.error-message {
  margin: 0 0 2rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-retry,
.btn-home {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-retry svg,
.btn-home svg {
  width: 18px;
  height: 18px;
}

.btn-retry {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.btn-home {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-home:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.error-details {
  margin-top: 2rem;
  text-align: left;
}

.error-details summary {
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.error-details summary:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
}

.error-details pre {
  margin: 0.75rem 0 0;
  padding: 1rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>

