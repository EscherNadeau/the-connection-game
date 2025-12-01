<template>
  <div id="app">
    <div class="app-bg" :style="{ backgroundImage: bgUrl ? `url(${bgUrl})` : 'none' }">
      <div class="app-bg-image"></div>
    </div>
    
    <!-- Start Screen -->
    <template v-if="currentView === 'start'">
      <Home :show-tutorial="false" :tutorial-step="0" :tutorial-just-completed="false" 
        @start-game="handleStartGame" 
        @how-to-play="showRulebook = true"
        @open-profile-page="currentView = 'profile'"
        @open-custom-mode="currentView = 'custom-mode'"
      />
    </template>
    
    <!-- Mode Selection -->
    <template v-else-if="currentView === 'mode-selection'">
      <ModeSelection :show-tutorial="false" :tutorial-step="0" 
        @back-to-start="goToStart" 
        @mode-selected="selectGameMode"
      />
    </template>
    
    <!-- Settings Screen -->
    <template v-else-if="currentView === 'settings' && gameMode">
      <SettingsScreen :show-tutorial="false" :tutorial-step="0" 
        :mode="gameMode" 
        @start-game="startGame" 
        @go-back="currentView = 'mode-selection'"
      />
    </template>
    
    <!-- Game -->
    <template v-else-if="currentView === 'game' && gameMode">
      <Game :show-tutorial="false" :tutorial-step="0" 
        :gameMode="gameMode" 
        :gameOptions="gameOptions" 
        @back-to-start="goToStart"
        @back-to-mode-selection="currentView = 'mode-selection'"
        @finish-show="onFinishShow"
      />
    </template>
    
    <!-- Show Builder -->
    <template v-else-if="currentView === 'custom-mode'">
      <CustomModeFlow 
        ref="customModePanelRef"
        @back="goToStart" 
        @start-game="handleCustomGameStart" 
        :open-browser-on-load="openBrowserOnLoad" 
        @browser-opened="openBrowserOnLoad = false"
        :first-time="!hasSeenShowBuilder"
        @help-dismissed="markShowBuilderSeen"
      />
    </template>
    
    <!-- Reset Password -->
    <template v-else-if="currentView === 'reset-password'">
      <ResetPassword @back-to-start="goToStart" />
    </template>
    
    <!-- Profile Page -->
    <template v-else-if="currentView === 'profile'">
      <ProfilePage @back="goToStart" />
    </template>
    
    <!-- Rulebook Modal (first load + how to play button) -->
    <RulebookModal 
      :is-open="showRulebook" 
      @close="closeRulebook"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import Home from './views/Home.vue'
import ModeSelection from './views/ModeSelection.vue'
import SettingsScreen from './components/SettingsScreen.vue'
import Game from './views/Game.vue'
import RulebookModal from './components/RulebookModal.vue'
import CustomModeFlow from './components/CustomModeFlow.vue'
import ResetPassword from './views/ResetPassword.vue'
import ProfilePage from './views/ProfilePage.vue'
import { debug, error as logError } from './services/ui/log'
import { useBackgroundStore } from '@store/background.store'
import { useShowImport } from './composables/useShowImport'
import type { GameOptions } from './types/game'

// Types
type ViewName = 'start' | 'mode-selection' | 'settings' | 'game' | 'custom-mode' | 'reset-password' | 'profile'

interface GameMode {
  id: string
  name: string
  title?: string
  description?: string
  icon?: string
  color?: string
  settings?: Record<string, unknown>
}

// Reactive state
const currentView = ref<ViewName>('start')
const gameMode = ref<GameMode | null>(null)
const gameOptions = ref<GameOptions>({} as GameOptions)
const showRulebook = ref(false)
const hasSeenShowBuilder = ref(false)
const customModePanelRef = ref<InstanceType<typeof CustomModeFlow> | null>(null)

// Show import
const { openBrowserOnLoad, checkForShowImport, importShow } = useShowImport()

// Background
const bgUrl = computed(() => {
  try {
    const bs = useBackgroundStore()
    return bs.currentUrl || ''
  } catch {
    return ''
  }
})

// First load detection
const STORAGE_KEY_RULES = 'hasSeenRulebook'
const STORAGE_KEY_SHOWS = 'hasSeenShowBuilder'

function checkFirstLoad(): void {
  const hasSeen = localStorage.getItem(STORAGE_KEY_RULES)
  if (!hasSeen) {
    showRulebook.value = true
  }
  hasSeenShowBuilder.value = localStorage.getItem(STORAGE_KEY_SHOWS) === 'true'
}

function closeRulebook(): void {
  showRulebook.value = false
  localStorage.setItem(STORAGE_KEY_RULES, 'true')
}

function markShowBuilderSeen(): void {
  hasSeenShowBuilder.value = true
  localStorage.setItem(STORAGE_KEY_SHOWS, 'true')
}

// Navigation
function goToStart(): void {
  currentView.value = 'start'
  gameMode.value = null
  gameOptions.value = {} as GameOptions
}

function handleStartGame(payload: { action: string; mode: string }): void {
  debug('handleStartGame', payload)
  currentView.value = 'mode-selection'
}

function selectGameMode(mode: GameMode): void {
  debug('selectGameMode', { mode: mode.id })
  gameMode.value = {
    ...mode,
    title: mode.title || mode.name
  }
  currentView.value = 'settings'
}

function startGame(options: GameOptions): void {
  debug('startGame', { options })
  gameOptions.value = options
  currentView.value = 'game'
}

function handleCustomGameStart(data: { mode: GameMode; options: GameOptions }): void {
  debug('handleCustomGameStart', data)
  gameMode.value = data.mode
  gameOptions.value = data.options
  currentView.value = 'game'
}

function onFinishShow(): void {
  currentView.value = 'custom-mode'
}

// Channel change effect
watch(currentView, () => {
  nextTick(() => {
    try {
      window.dispatchEvent(new CustomEvent('crt-channel-change'))
    } catch { /* ignore */ }
  })
})

// Mounted
onMounted(() => {
  debug('App mounted', { view: currentView.value })
  
  // Check for password reset
  const hash = window.location.hash || ''
  if (hash.includes('reset-password') || hash.includes('type=recovery') || hash.includes('access_token')) {
    currentView.value = 'reset-password'
    return
  }
  
  // Check first load (show rulebook)
  checkFirstLoad()
  
  // Check for show import
  checkForShowImport((showData: unknown) => {
    importShow(showData, currentView as { value: string }, customModePanelRef)
  })
  
  // Init background
  try {
    const bs = useBackgroundStore()
    bs.init('default').catch((err) => {
      logError('Failed to init background', { error: err })
    })
  } catch { /* ignore */ }
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { margin: 0; padding: 0; overflow: hidden; background: #000; }
#app { height: 100vh; width: 100vw; background: #000; }
.app-bg { position: fixed; inset: 0; z-index: 0; background-size: cover; background-position: center; }
.app-bg-image { position: absolute; inset: 0; background-size: cover; background-position: center; transition: background-image 0.5s ease; }
#app > *:not(.app-bg) { position: relative; z-index: 1; }
</style>
