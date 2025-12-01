<template>
  <div id="app">
    <div class="app-bg" :style="{ backgroundImage: bgUrl ? `url(${bgUrl})` : 'none' }">
      <div class="app-bg-image"></div>
    </div>
    <template v-if="currentView === 'start'">
      <Home 
        :show-tutorial="showTutorial"
        :tutorial-step="tutorialStep"
        :tutorial-just-completed="tutorialJustCompleted"
        @start-game="handleStartFromHome" 
        @how-to-play="showHowToPlay = true"
        @tutorial-start="startTutorial"
        @tutorial-next="nextTutorialStep"
        @tutorial-step="setTutorialStep"
        @tutorial-completion-shown="tutorialJustCompleted = false"
      />
    </template>
    <template v-else-if="currentView === 'join-room'">
      <JoinRoom @back="goToStart" @join="joinByCode" />
    </template>
    <template v-else-if="currentView === 'mode-selection'">
      <ModeSelection 
        :show-tutorial="showTutorial" 
        :tutorial-step="tutorialStep"
        @back-to-start="goToStart" 
        @mode-selected="selectGameMode"
        @tutorial-next="nextTutorialStep"
      />
    </template>
    <template v-else-if="currentView === 'settings' && gameModeWithTitle">
      <SettingsScreen 
        :mode="gameModeWithTitle" 
        :show-tutorial="showTutorial"
        :tutorial-step="tutorialStep"
        @start-game="startGameFromSettings" 
        @go-back="goBackToModeSelection"
        @tutorial-next="nextTutorialStep"
        @tutorial-jump-to-step="jumpToTutorialStepWithView"
      />
    </template>
    <template v-else-if="currentView === 'waiting-room' && gameMode">
      <WaitingRoom 
        :game-mode="gameMode" 
        :game-options="gameOptions"
        :show-tutorial="showTutorial"
        :tutorial-step="tutorialStep"
        @back="goBackToModeSelection" 
        @start-game="startGameFromWaitingRoom"
        @tutorial-next="nextTutorialStep"
      />
    </template>

    <template v-else-if="currentView === 'phone-waiting-room'">
      <PhoneWaitingRoom 
        :game-mode="gameMode" 
        :game-options="gameOptions" 
        @game-started="switchToGame" 
      />
    </template>
    <template v-else-if="currentView === 'game' && gameMode">
      <Game 
        :gameMode="gameMode" 
        :gameOptions="gameOptions" 
        :showTutorial="showTutorial"
        :tutorialStep="tutorialStep"
        @back-to-start="goToStart"
        @back-to-mode-selection="goToModeSelection"
        @tutorial-next="nextTutorialStep"
        @tutorial-start="startTutorial"
        @tutorial-completed="markTutorialCompleted"
        @finish-show="onFinishShow"
      />
    </template>
    <template v-else-if="currentView === 'controller' && gameMode">
      <ControllerView 
        v-bind="controllerViewProps"
        @game-started="switchToGame" 
      />
    </template>
    <template v-else-if="currentView === 'custom-mode'">
      <CustomModeFlow 
        ref="customModePanelRef"
        @back="goToStart" 
        @start-game="handleCustomGameStart" 
        :open-browser-on-load="openBrowserOnLoad" 
        @browser-opened="openBrowserOnLoad = false"
        :show-tutorial="showTutorial"
        :tutorial-step="tutorialStep"
        @tutorial-next="nextTutorialStep"
      />
    </template>
    <template v-else-if="currentView === 'reset-password'">
      <ResetPassword @back-to-start="goToStart" />
    </template>
    
    <!-- How to Play Overlay -->
    <HowToPlayOverlay 
      :is-visible="showHowToPlay" 
      @close="showHowToPlay = false"
      @start-tutorial="startTutorialFromHowToPlayWrapper"
    />
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import Home from './views/Home.vue'
import JoinRoom from './views/JoinRoom.vue'
import WaitingRoom from './views/WaitingRoom.vue'
import ModeSelection from './views/ModeSelection.vue'
import SettingsScreen from './components/SettingsScreen.vue'
import PhoneWaitingRoom from './components/PhoneWaitingRoom.vue'
import ControllerView from './components/ControllerView.vue'
import Game from './views/Game.vue'
import HowToPlayOverlay from './components/HowToPlayOverlay.vue'
import CustomModeFlow from './components/CustomModeFlow.vue'
import ResetPassword from './views/ResetPassword.vue'
import { debug, warn, error as logError } from './services/ui/log'
import { useBackgroundStore } from '@store/background.store'
import config from './config/env'
import { useTutorial, type ViewName } from './composables/useTutorial'
import { useShowImport } from './composables/useShowImport'
import { useRoomManagement } from './composables/useRoomManagement'
import { useAppNavigation, type GameMode } from './composables/useAppNavigation'
import type { GameOptions, ControllerViewProps } from './types/game'

// Reactive state
const currentView = ref<ViewName>('start')
const gameMode = ref<GameMode | null>(null)
const gameOptions = ref<GameOptions>({} as GameOptions)
const showHowToPlay = ref(false)
const bgReady = ref(false)
const customModePanelRef = ref<InstanceType<typeof CustomModeFlow> | null>(null)

// Computed property to ensure gameMode has required title for SettingsScreen
const gameModeWithTitle = computed(() => {
  if (!gameMode.value) return null
    return {
    ...gameMode.value,
    title: gameMode.value.title || gameMode.value.name || 'Game Mode'
  }
})

// Computed property for ControllerView props
const controllerViewProps = computed((): ControllerViewProps => ({
  modeTitle: gameMode.value?.title || gameMode.value?.name || 'Game Mode',
  roomCode: gameOptions.value.roomCode || '',
  playerName: 'Player',
  isMobile: false,
  playType: gameOptions.value.playType || 'single',
  currentUrl: typeof window !== 'undefined' ? window.location.href : '',
  itemsAdded: 0,
  maxItems: 100,
  searchResults: [],
  recentItems: [],
  currentTurnPlayer: '',
  turnTimeLeft: 0,
  playerItems: 0,
  isMyTurn: true,
  playerBoardItems: []
}))

// Composables
const tutorial = useTutorial()
const { showTutorial, tutorialStep, tutorialJustCompleted, startTutorial, nextTutorialStep, setTutorialStep, jumpToTutorialStep, markTutorialCompleted, resetTutorial, startTutorialFromHowToPlay } = tutorial

const showImport = useShowImport()
const { openBrowserOnLoad, checkForShowImport, importShow: handleShowImport } = showImport

const roomManagement = useRoomManagement()
const { suppressAutoJoin, generateRoomCodeForCouch, generateRoomCodeForPCMultiplayer, joinByCode, tryJoinFromHash } = roomManagement

const navigation = useAppNavigation(
  currentView,
  gameMode,
  gameOptions,
  roomManagement,
  tutorialStep
)
const {
  goToStart: goToStartBase,
  goToModeSelection,
  goBackToModeSelection,
  goToJoinRoom,
  handleStartFromHome: handleStartFromHomeBase,
  selectGameMode,
  startGameFromSettings,
  startGameFromWaitingRoom,
  handleCustomGameStart,
  switchToGame,
  onFinishShow,
} = navigation

// Enhanced handleStartFromHome that handles openBrowserOnLoad
function handleStartFromHome(payload: unknown): void {
  handleStartFromHomeBase(payload, openBrowserOnLoad)
}

// Enhanced goToStart that also resets tutorial
function goToStart(): void {
  goToStartBase()
  resetTutorial()
}

// Enhanced jumpToTutorialStep that handles view changes
function jumpToTutorialStepWithView(step: number): void {
  jumpToTutorialStep(step, currentView)
}

// Enhanced startTutorialFromHowToPlay
function startTutorialFromHowToPlayWrapper(): void {
  showHowToPlay.value = false
  startTutorialFromHowToPlay()
}

// Computed properties
const bgUrl = computed(() => {
  try {
    const bs = useBackgroundStore()
    return bs.currentUrl || ''
  } catch (err) {
    warn('Failed to get background URL', { error: err })
    return ''
  }
})

// Watch currentView for CRT channel change event
watch(currentView, () => {
  nextTick(() => {
    try {
      window.dispatchEvent(new CustomEvent('crt-channel-change'))
    } catch (err) {
      warn('Failed to dispatch crt-channel-change event', { error: err })
    }
  })
})

// Mounted lifecycle
onMounted(() => {
  debug('App.vue mounted', { currentView: currentView.value, hash: window.location.hash })
  
  // Check for show import from URL
  checkForShowImport((showData: unknown) => {
    handleShowImport(showData, currentView, customModePanelRef as { value?: { importShowFromUrl?: (data: unknown) => void } } | null)
  })
  
  // Auto-join game if URL has a room code
  // Check for password reset flow
  const hash = window.location.hash || ''
  if (hash.includes('reset-password') || hash.includes('type=recovery') || hash.includes('access_token')) {
    debug('Detected password reset flow', { hash })
    currentView.value = 'reset-password' as ViewName
    return
  }

  const handleTryJoinFromHash = async () => {
    await tryJoinFromHash(currentView, gameMode, gameOptions, config)
  }
  
  handleTryJoinFromHash()
  window.addEventListener('hashchange', handleTryJoinFromHash)
  
  window.addEventListener('app:navigate', (e: Event) => {
    const customEvent = e as CustomEvent<{ to: string }>
    const to = customEvent?.detail?.to || ''
    if (to === 'controller') currentView.value = 'controller'
  })
  
  // Initialize background store
      try {
        const bs = useBackgroundStore()
    bs.init('default').then(() => {
      bgReady.value = bs.ready
    }).catch((err) => {
      logError('Failed to initialize background store', { error: err })
    })
  } catch (err) {
    logError('Error accessing background store', { error: err })
  }
})
</script>

<style>
/* Minimal global styles only */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #000;
}

#app {
  height: 100vh;
  width: 100vw;
  background: #000;
}
.app-bg { position: fixed; inset: 0; z-index: 0; }
.app-bg-image { position: absolute; inset: 0; background-size: cover; background-position: center; transition: background-image 0.5s ease, opacity 0.5s ease; }
#app > *:not(.app-bg) { position: relative; z-index: 1; }
.app-bg { background-size: cover; background-position: center; background-repeat: no-repeat; }
.view-fade-enter-active, .view-fade-leave-active { transition: opacity 300ms ease-in-out; }
.view-fade-enter-from, .view-fade-leave-to { opacity: 0; }

.loading-controller {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Arial', sans-serif;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
