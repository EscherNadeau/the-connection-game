<template>
  <div>
    <!-- Connection Success Popup - Using NotifyBanner design -->
    <transition name="popdown">
      <div v-if="showConnectionSuccess" class="notify success">
        <span class="icon">✅</span>
        <span class="text">{{ connectionMessage }}</span>
      </div>
    </transition>

    <!-- Connection Error Popup - Using NotifyBanner design -->
    <transition name="popdown">
      <div v-if="showConnectionError" class="notify error">
        <span class="icon">❌</span>
        <span class="text">{{ connectionErrorMessage }}</span>
      </div>
    </transition>

    <!-- Win Modal - Using WinLoseModal design -->
    <transition name="wl-fade">
      <div v-if="showWin" class="wl-overlay">
        <div class="wl-card win">
          <div class="wl-title">{{ winTitle }}</div>
          <div v-if="winSubtitle" class="wl-subtitle">{{ winSubtitle }}</div>
          <div v-if="winStats" class="wl-stats">
            <div v-for="(value, key) in winStats" :key="key" class="wl-stat">
              {{ key }}: {{ value }}
            </div>
          </div>
          <div class="wl-actions">
            <!-- Shows mode: Show Next Episode instead of New Game/Free Play -->
            <template v-if="isPlaylistMode">
              <button class="wl-button" @click="nextEpisode" v-if="hasNextEpisode">Next Episode</button>
              <button class="wl-button" @click="$emit('show-path')">Show Path</button>
              <button class="wl-button" @click="finishShow" v-if="!hasNextEpisode">Finish Show</button>
              <button class="wl-button" @click="dismissWin">New Game</button>
            </template>
            <!-- Normal mode: Show New Game and Free Play -->
            <template v-else>
              <button class="wl-button" @click="dismissWin">New Game</button>
              <button class="wl-button" @click="$emit('show-path')">Show Path</button>
              <button class="wl-button wl-primary" @click="enterZenMode">Free Play</button>
            </template>
          </div>
        </div>
      </div>
    </transition>

    <!-- Lose Modal - Using WinLoseModal design -->
    <transition name="wl-fade">
      <div v-if="showLose" class="wl-overlay">
        <div class="wl-card lose">
          <div class="wl-title">{{ loseTitle }}</div>
          <div v-if="loseSubtitle" class="wl-subtitle">{{ loseSubtitle }}</div>
          <div v-if="loseStats" class="wl-stats">
            <div v-for="(value, key) in loseStats" :key="key" class="wl-stat">
              {{ key }}: {{ value }}
            </div>
          </div>
          <div class="wl-actions">
            <!-- Shows mode: Show Next Episode instead of New Game/Free Play -->
            <template v-if="isPlaylistMode">
              <button class="wl-button" @click="nextEpisode" v-if="hasNextEpisode">Next Episode</button>
              <button class="wl-button" @click="finishShow" v-if="!hasNextEpisode">Finish Show</button>
              <button class="wl-button" @click="dismissLose">New Game</button>
            </template>
            <!-- Normal mode: Show New Game and Free Play -->
            <template v-else>
              <button class="wl-button" @click="dismissLose">New Game</button>
              <button class="wl-button wl-primary" @click="enterZenMode">Free Play (Zen)</button>
            </template>
          </div>
        </div>
      </div>
    </transition>

    <!-- Game End Popup - Using NotifyBanner design -->
    <transition name="popdown">
      <div v-if="showGameEnd" class="notify info">
        <span class="icon">🏁</span>
        <span class="text">{{ gameEndTitle }}</span>
      </div>
    </transition>

    <!-- Custom Error Popup - Using NotifyBanner design -->
    <transition name="popdown">
      <div v-if="showCustomError" class="notify error">
        <span class="icon">{{ customErrorIcon }}</span>
        <span class="text">{{ customErrorMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
// @ts-ignore
import PopupService from '../../services/ui/PopupService.ts'
import type { UnifiedPopupProps, UnifiedPopupEmits } from '../../types/game'

const props = defineProps<UnifiedPopupProps>()
const emit = defineEmits<UnifiedPopupEmits>()

// Connection popups
const showConnectionSuccess = ref(false)
const connectionMessage = ref('')
const connectionData = ref<any>(null)

const showConnectionError = ref(false)
const connectionErrorMessage = ref('')
const connectionErrorData = ref<any>(null)

// Win/Lose modals
const showWin = ref(false)
const winTitle = ref('')
const winSubtitle = ref('')
const winStats = ref<any>(null)

const showLose = ref(false)
const loseTitle = ref('')
const loseSubtitle = ref('')
const loseStats = ref<any>(null)

// Game end
const showGameEnd = ref(false)
const gameEndTitle = ref('')
const gameEndSubtitle = ref('')

// Custom error
const showCustomError = ref(false)
const customErrorMessage = ref('')
const customErrorIcon = ref('❌')

// Timeouts
const timeouts = ref(new Map<string, ReturnType<typeof setTimeout>>())

let unsubscribe: (() => void) | null = null

const isPlaylistMode = computed(() => {
  return props.gameMode && props.gameMode.showData && props.gameMode.showData.episodes
})

const hasNextEpisode = computed(() => {
  if (!isPlaylistMode.value) return false
  const currentIndex = props.gameMode!.showData!.currentEpisodeIndex || 0
  const totalEpisodes = props.gameMode!.showData!.totalEpisodes || 0
  return currentIndex + 1 < totalEpisodes
})

const handlePopup = (popupData: any) => {
  console.log('UnifiedPopup handlePopup called with type:', popupData.type)
  switch (popupData.type) {
    case 'connection_success':
      showConnectionSuccessPopup(popupData)
      break
    case 'connection_error':
      showConnectionErrorPopup(popupData)
      break
    case 'win':
      showWinPopup(popupData)
      break
    case 'lose':
      showLosePopup(popupData)
      break
    case 'game_end':
      showGameEndPopup(popupData)
      break
    case 'error':
      console.log('UnifiedPopup handling error popup:', popupData)
      showCustomErrorPopup(popupData)
      break
    case 'dismiss':
      dismissPopup(popupData.dismissType)
      break
    case 'clear_all':
      clearAllPopups()
      break
  }
}

const showConnectionSuccessPopup = (data: any) => {
  connectionMessage.value = data.message
  connectionData.value = data.data
  showConnectionSuccess.value = true
  
  // Auto-dismiss after duration
  if (data.duration > 0) {
    const timeout = setTimeout(() => {
      dismissConnectionSuccess()
    }, data.duration)
    timeouts.value.set('connection_success', timeout)
  }
}

const showConnectionErrorPopup = (data: any) => {
  connectionErrorMessage.value = data.message
  connectionErrorData.value = data.data
  showConnectionError.value = true
  
  // Auto-dismiss after duration
  if (data.duration > 0) {
    const timeout = setTimeout(() => {
      dismissConnectionError()
    }, data.duration)
    timeouts.value.set('connection_error', timeout)
  }
}

const showWinPopup = (data: any) => {
  winTitle.value = data.title
  winSubtitle.value = data.subtitle
  winStats.value = data.stats
  showWin.value = true
}

const showLosePopup = (data: any) => {
  loseTitle.value = data.title
  loseSubtitle.value = data.subtitle
  loseStats.value = data.stats
  showLose.value = true
}

const showGameEndPopup = (data: any) => {
  gameEndTitle.value = data.title
  gameEndSubtitle.value = data.subtitle
  showGameEnd.value = true
  
  // Auto-dismiss after duration
  if (data.duration > 0) {
    const timeout = setTimeout(() => {
      dismissGameEnd()
    }, data.duration)
    timeouts.value.set('game_end', timeout)
  }
}

const showCustomErrorPopup = (data: any) => {
  customErrorMessage.value = data.message
  customErrorIcon.value = data.icon || '❌'
  showCustomError.value = true
  
  // Auto-dismiss after duration
  if (data.duration > 0) {
    const timeout = setTimeout(() => {
      dismissCustomError()
    }, data.duration)
    timeouts.value.set('custom_error', timeout)
  }
}

const dismissPopup = (type: string) => {
  switch (type) {
    case 'connection_success':
      dismissConnectionSuccess()
      break
    case 'connection_error':
      dismissConnectionError()
      break
    case 'win':
      dismissWin()
      break
    case 'lose':
      dismissLose()
      break
    case 'game_end':
      dismissGameEnd()
      break
    case 'error':
      dismissCustomError()
      break
  }
}

const clearAllPopups = () => {
  showConnectionSuccess.value = false
  showConnectionError.value = false
  showWin.value = false
  showLose.value = false
  showGameEnd.value = false
  showCustomError.value = false
  
  // Clear all timeouts
  timeouts.value.forEach(timeout => clearTimeout(timeout))
  timeouts.value.clear()
}

// Dismiss methods
const dismissConnectionSuccess = () => {
  showConnectionSuccess.value = false
  clearTimeoutById('connection_success')
}

const dismissConnectionError = () => {
  showConnectionError.value = false
  clearTimeoutById('connection_error')
}

const dismissWin = () => {
  showWin.value = false
  emit('new-game')
}

const dismissLose = () => {
  showLose.value = false
  emit('new-game')
}

const dismissGameEnd = () => {
  showGameEnd.value = false
  clearTimeoutById('game_end')
}

const dismissCustomError = () => {
  showCustomError.value = false
  clearTimeoutById('custom_error')
}

const enterZenMode = () => {
  showWin.value = false
  showLose.value = false
  emit('enter-zen')
}

const nextEpisode = () => {
  showWin.value = false
  showLose.value = false
  emit('next-episode')
}

const finishShow = () => {
  showWin.value = false
  showLose.value = false
  emit('finish-show')
}

const clearTimeoutById = (type: string) => {
  const timeout = timeouts.value.get(type)
  if (timeout) {
    clearTimeout(timeout)
    timeouts.value.delete(type)
  }
}

onMounted(() => {
  console.log('UnifiedPopup mounted, setting up PopupService listener')
  unsubscribe = PopupService.on((popupData: any) => {
    console.log('UnifiedPopup received popup data:', popupData)
    handlePopup(popupData)
  })
})

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
  // Clear all timeouts
  timeouts.value.forEach(timeout => clearTimeout(timeout))
  timeouts.value.clear()
})
</script>

<style scoped>
/* NotifyBanner design for connection messages */
.notify {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  padding: 12px 18px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9999;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}
.notify.success {
  border-color: var(--notify-success);
}
.notify.error {
  border-color: var(--notify-error);
}
.notify.info {
  border-color: var(--notify-info);
}
.icon {
  font-size: 18px;
}
.text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

/* WinLoseModal design for win/lose modals */
.wl-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.wl-card {
  min-width: 320px;
  max-width: 520px;
  padding: 24px;
  border-radius: 14px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(18px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  text-align: center;
}
.wl-card.lose {
  border-color: #f44336;
}
.wl-card.win {
  border-color: #4caf50;
}
.wl-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 6px;
}
.wl-subtitle {
  opacity: 0.9;
  margin-bottom: 12px;
}
.wl-stats {
  margin: 8px 0 12px;
}
.wl-stat {
  opacity: 0.85;
  margin: 4px 0;
}
.wl-actions {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.wl-button {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
}
.wl-button:hover {
  background: rgba(255, 255, 255, 0.25);
}
.wl-primary {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.25);
}
.wl-primary:hover {
  background: rgba(76, 175, 80, 0.35);
}

/* Transitions */
.popdown-enter-active,
.popdown-leave-active {
  transition: all 300ms ease-in-out;
}
.popdown-enter-from {
  transform: translate(-50%, -60%);
  opacity: 0;
}
.popdown-enter-to {
  transform: translate(-50%, -50%);
  opacity: 1;
}
.popdown-leave-from {
  transform: translate(-50%, -50%);
  opacity: 1;
}
.popdown-leave-to {
  transform: translate(-50%, -40%);
  opacity: 0;
}

.wl-fade-enter-active,
.wl-fade-leave-active {
  transition: opacity 0.2s ease;
}
.wl-fade-enter-from,
.wl-fade-leave-to {
  opacity: 0;
}
</style>
