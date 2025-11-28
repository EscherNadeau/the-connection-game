<template>
  <div class="container">
    <!-- Auth Button in top right -->
    <div class="auth-corner">
      <UserMenu @open-auth="showAuthModal = true" />
    </div>

    <!-- Auth Modal -->
    <AuthModal :is-open="showAuthModal" @close="showAuthModal = false" @authenticated="onAuthenticated" />

    <!-- Header with title -->
    <div class="header">
      <div class="title-wrap">
        <h1 class="game-title">THE CONNECTION GAME</h1>
      </div>
    </div>

    <!-- Tutorial Tooltip - moved outside header -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 0" 
           class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title" id="tutorial-title-0">Welcome!</div>
          <div class="tooltip-subtitle">Ready to learn how this works?</div>
          <div class="tooltip-description" id="tutorial-desc-0">
            This will be a full guide of all menus and features!
          </div>
          <button class="tooltip-button" @click="startTutorial">
            Let's Start!
         </button>
        </div>
      </div>
    </transition>

    <!-- Tutorial Completion Popup -->
    <transition name="tooltip-fade">
      <div v-if="tutorialJustCompleted" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">🎉 You Did It!</div>
          <div class="tooltip-subtitle">Tutorial Complete!</div>
          <div class="tooltip-description">
            You've learned the basics! Ready to start playing?
          </div>
          <button class="tooltip-button" @click="closeCompletion">
            Start Playing
          </button>
        </div>
            </div>
    </transition>

    <!-- Main actions grid -->
    <div class="main-actions">
      <div class="action-card" :class="{ 'tutorial-glow': showTutorial && (tutorialStep === 2 || tutorialStep === 5) }" @click.stop="handlePlayMenuClick">
        <div class="card-image">
          <div class="card-icon">🎮</div>
        </div>
        <div class="card-info">
          <div class="ticket-details">
            <div class="ticket-time">7:30 PM</div>
            <div class="ticket-price">FREE</div>
          </div>
          <div class="action-title">Play Game</div>
          <div class="action-description">Start a new game</div>
        </div>
        
        <!-- Play Menu Overlay -->
        <transition name="menu-fade">
          <div v-if="showPlayMenu" class="play-menu-overlay" @click="showPlayMenu = false">
            <transition name="menu-slide">
              <div v-if="showPlayMenu" class="play-menu" @click.stop>
                <div class="menu-title">Choose Play Mode</div>
                <button class="menu-option solo-option" @click="selectSolo">
                  <div class="option-icon">👤</div>
                  <div class="option-text">Solo</div>
          </button>
                <button class="menu-option" @click="selectMultiplayer">
                  <div class="option-icon">👥</div>
                  <div class="option-text">Multiplayer</div>
                  <div class="option-arrow">→</div>
                </button>
                <button class="menu-option" @click="selectPvP">
                  <div class="option-icon">⚔️</div>
                  <div class="option-text">PvP</div>
                  <div class="option-arrow">→</div>
                </button>
                <div class="menu-close" @click="showPlayMenu = false">
                  <div class="close-icon">▼</div>
        </div>
            </div>
            </transition>
          </div>
        </transition>
        
        <!-- Couch Sub-Menu Overlay -->
        <transition name="menu-fade">
          <div v-if="showCouchMenu" class="couch-menu-overlay" @click="showCouchMenu = false">
            <transition name="menu-slide">
              <div v-if="showCouchMenu" class="couch-menu" @click.stop>
                <div class="menu-title">Choose Play Type</div>
                <button class="menu-option" @click="selectPC">
                  <div class="option-icon">💻</div>
                  <div class="option-text">PC Only</div>
                </button>
                <button class="menu-option" @click="selectCouchOption">
                  <div class="option-icon">📱</div>
                  <div class="option-text">Phone-Couch</div>
                </button>
                <div class="menu-close" @click="showCouchMenu = false">
                  <div class="close-icon">▼</div>
                </div>
              </div>
            </transition>
          </div>
        </transition>
      </div>
      
      <div class="action-card" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 3 }" @click.stop="handleJoinMenuClick">
        <div class="card-image">
          <div class="card-icon">🔗</div>
        </div>
        <div class="card-info">
          <div class="ticket-details">
            <div class="ticket-time">8:00 PM</div>
            <div class="ticket-price">FREE</div>
          </div>
          <div class="action-title">Join Game</div>
          <div class="action-description">Enter room code</div>
        </div>
        
        <!-- Join Menu Overlay -->
        <transition name="menu-fade">
          <div v-if="showJoinMenu" class="join-menu-overlay" @click="showJoinMenu = false">
            <transition name="menu-slide">
              <div v-if="showJoinMenu" class="join-menu" @click.stop>
                <div class="menu-title">Join Game</div>
                <div class="input-section">
                  <input 
                    v-model="joinCode" 
                    class="menu-input" 
                    placeholder="Enter room code" 
                    @keyup.enter="submitJoin"
                    ref="joinInput"
                  />
                </div>
                <button class="menu-option join-option" @click="submitJoin">
                  <div class="option-icon">🔗</div>
                  <div class="option-text">Join Game</div>
                </button>
                <div class="menu-close" @click="showJoinMenu = false">
                  <div class="close-icon">▼</div>
                </div>
              </div>
            </transition>
          </div>
        </transition>
      </div>
      
      <div class="action-card" :class="{ 'tutorial-glow': showTutorial && (tutorialStep === 4 || tutorialStep === 5) }" @click.stop="handlePlaylistMenuClick">
        <div class="card-image">
          <div class="card-icon">📝</div>
        </div>
        <div class="card-info">
          <div class="ticket-details">
            <div class="ticket-time">8:30 PM</div>
            <div class="ticket-price">FREE</div>
          </div>
          <div class="action-title">Shows</div>
          <div class="action-description">Create or play shows with friends against or alone</div>
        </div>
        
        <!-- Shows Menu Overlay -->
        <transition name="menu-fade">
          <div v-if="showPlaylistMenu" class="playlist-menu-overlay" @click="showPlaylistMenu = false">
            <transition name="menu-slide">
              <div v-if="showPlaylistMenu" class="playlist-menu" @click.stop>
                <div class="menu-title">Shows Options</div>
                <button class="menu-option" @click="createPlaylist">
                  <div class="option-icon">➕</div>
                  <div class="option-text">Create Shows</div>
         </button>
                <button class="menu-option" @click="playPlaylist">
                  <div class="option-icon">▶️</div>
                  <div class="option-text">Play Shows</div>
          </button>
                <div class="menu-close" @click="showPlaylistMenu = false">
                  <div class="close-icon">▼</div>
                </div>
              </div>
            </transition>
          </div>
        </transition>
      </div>
      
      <!-- How to Play Ticket -->
      <div class="action-card how-to-play-ticket" @click="handleHowToPlay">
        <div class="card-image">
          <div class="card-icon">❓</div>
        </div>
        <div class="card-info">
          <div class="ticket-details">
            <div class="ticket-time">HELP</div>
            <div class="ticket-price">FREE</div>
          </div>
          <div class="action-title">How to Play</div>
          <div class="action-description">Learn the game</div>
        </div>
            </div>
    </div>

    <!-- Tutorial Tour Tooltips - positioned over each card -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 1" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">But what is The Connection Game?</div>
          <div class="tooltip-description">
            A movie and TV trivia game where you connect actors, movies, and shows through their relationships!
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>

    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 2" class="tutorial-tooltip tutorial-tooltip-play">
        <div class="tooltip-content">
          <div class="tooltip-title">Play Game</div>
          <div class="tooltip-description">
            This is the Play Game card. Click it to explore different ways to play - Solo, Multiplayer, and PvP modes. Multiplayer and PvP have sub-menus for PC Only or Phone-Couch options!
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
Next
          </button>
        </div>
      </div>
    </transition>

    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 3" class="tutorial-tooltip tutorial-tooltip-join">
        <div class="tooltip-content">
          <div class="tooltip-title">Join Game</div>
          <div class="tooltip-description">
            This is the Join Game card. Click it to enter a room code and join a friend's game.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>

    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 4" class="tutorial-tooltip tutorial-tooltip-playlist">
        <div class="tooltip-content">
          <div class="tooltip-title">Shows</div>
          <div class="tooltip-description">
            This is the Shows card. Click it to create new shows or play existing ones.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>

    <!-- Tutorial Tour Complete - Play Game and Playlist Glow -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 5" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Choose Your Own Adventure!</div>
          <div class="tooltip-description">
            This is your main menu! You've seen all three options. Now pick "Play Game" or "Shows" to continue with the tutorial and see how the game actually works.
          </div>
        </div>
      </div>
    </transition>

    <!-- You Picked Play Game -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 5.1" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">You picked Play Game!</div>
          <div class="tooltip-description">
            Great choice! Now let's see how phone-couch play works. Click "PvP" and then "Phone-Couch" to continue the tutorial.
          </div>
        </div>
      </div>
    </transition>

    <!-- You Picked Shows -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 5.2" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">You picked Shows!</div>
          <div class="tooltip-description">
            Excellent! Now let's see how to create custom challenges. Click the "Next" button below to continue the tutorial.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>



    <!-- Mode Selection Tutorial -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Mode Selection</div>
          <div class="tooltip-description">
            Here you can choose different game modes! Each mode has unique rules and challenges. Pick any mode to continue.
          </div>
        </div>
      </div>
    </transition>

    <!-- Waiting Room Tutorial -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 8" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Waiting Room</div>
          <div class="tooltip-description">
            This is the waiting room! Players join here before the game starts. You can see who's ready and start when everyone's in.
          </div>
        </div>
      </div>
    </transition>

    <!-- Game Board Tutorial -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 9" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Game Board</div>
          <div class="tooltip-description">
            This is the main game board! Here you'll see the items to connect and make your moves. Ready to see how shows work?
          </div>
        </div>
      </div>
    </transition>



    <!-- Tutorial Complete -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 11" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Tutorial Complete!</div>
          <div class="tooltip-description">
            You've learned how to use all the main features! Ready to start playing?
          </div>
        </div>
      </div>
    </transition>
  </div>
    </template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { StartScreenProps, StartScreenEmits } from '../types/game'
import UserMenu from './auth/UserMenu.vue'
import AuthModal from './auth/AuthModal.vue'
import { info, debug } from '../services/ui/log.ts'

const props = withDefaults(defineProps<StartScreenProps>(), {
  showTutorial: false,
  tutorialStep: 0,
  tutorialJustCompleted: false
})

const emit = defineEmits<StartScreenEmits>()

// Reactive data
const showPlayMenu = ref(false)
const showCouchMenu = ref(false)
const selectedPlayMode = ref('Multiplayer')
const showJoinMenu = ref(false)
const showPlaylistMenu = ref(false)
const joinCode = ref('')
const showAuthModal = ref(false)

// Auth callback
const onAuthenticated = () => {
  info('User authenticated successfully')
}

// Toggle play menu
const togglePlayMenu = () => {
  info( `Toggle play menu clicked, current state: ${showPlayMenu.value}`)
  showPlayMenu.value = !showPlayMenu.value
  info( `New menu state: ${showPlayMenu.value}`)
}

// Menu options
const selectSolo = () => {
  info( 'Solo selected')
  showPlayMenu.value = false
  if (props.showTutorial && (props.tutorialStep === 6 || props.tutorialStep === 5.1)) {
    // Tutorial step - go to mode screen and advance tutorial
    if (props.tutorialStep === 5.1) {
      emit('tutorial-step', 6)
    } else {
      nextTutorialStep()
    }
    emit('start-game', { action: 'create', mode: 'solo' })
  } else {
    emit('start-game', { action: 'create', mode: 'solo' })
  }
}

const selectMultiplayer = () => {
  info( 'Multiplayer selected - showing sub-menu')
  selectedPlayMode.value = 'Multiplayer'
  showPlayMenu.value = false
  showCouchMenu.value = true
}

const selectPvP = () => {
  info( 'PvP selected - showing sub-menu')
  selectedPlayMode.value = 'PvP'
  showPlayMenu.value = false
  showCouchMenu.value = true
}

const selectPC = () => {
  info( 'PC Only selected')
  showCouchMenu.value = false
  const mode = selectedPlayMode.value.toLowerCase()
  if (props.showTutorial && (props.tutorialStep === 6 || props.tutorialStep === 5.1)) {
    // Tutorial step - go to mode screen and advance tutorial
    if (props.tutorialStep === 5.1) {
      emit('tutorial-step', 6)
    } else {
      nextTutorialStep()
    }
    emit('start-game', { action: 'create', mode: mode })
  } else {
    emit('start-game', { action: 'create', mode: mode })
  }
}

const selectCouchOption = () => {
  info( `Phone-Couch ${selectedPlayMode.value} selected`)
  showCouchMenu.value = false
  const mode = selectedPlayMode.value === 'Multiplayer' ? 'couch-multiplayer' : 'couch-pvp'
  if (props.showTutorial && (props.tutorialStep === 6 || props.tutorialStep === 5.1)) {
    // Tutorial step - advance to mode selection
    emit('tutorial-step', 7)
    emit('start-game', { action: 'create', mode: mode })
  } else {
    emit('start-game', { action: 'create', mode: mode })
  }
}

const handleHowToPlay = () => {
  info( 'How to Play clicked - showing welcome')
  emit('tutorial-start')
}

const startTutorial = () => {
  info( 'Start tutorial button clicked')
  // Start with "But what is The Connection Game?" explanation
  emit('tutorial-next')
  info( 'Tutorial next emitted')
}

const closeCompletion = () => {
  info( 'Close completion popup clicked')
  // Emit event to parent to reset the flag and hide the popup
  emit('tutorial-completion-shown')
}

const nextTutorialStep = () => {
  // Close any open menus before advancing
  if (showPlayMenu.value) {
    showPlayMenu.value = false
  }
  if (showJoinMenu.value) {
    showJoinMenu.value = false
  }
  if (showPlaylistMenu.value) {
    showPlaylistMenu.value = false
  }
  emit('tutorial-next')
}

// Override the menu toggle functions to check for tutorial progression
const handlePlayMenuClick = () => {
  if (props.showTutorial) {
    if (props.tutorialStep === 2) {
      // Open the play menu during explanation
      togglePlayMenu()
    } else if (props.tutorialStep === 5) {
      // Show "You picked Play Game" message
      debug('Emitting tutorial-step 5.1')
      emit('tutorial-step', 5.1)
      togglePlayMenu()
    } else if (props.tutorialStep === 5.2) {
      // Switch from Shows to Play Game
      emit('tutorial-step', 5.1)
      showPlaylistMenu.value = false
      togglePlayMenu()
    }
    // Don't do anything for other tutorial steps
  } else {
    togglePlayMenu()
  }
}

const handleJoinMenuClick = () => {
  if (props.showTutorial) {
    if (props.tutorialStep === 3) {
      // Open the join menu during explanation
      toggleJoinMenu()
    } else if (props.tutorialStep === 5) {
      // Final step - end tutorial and open join menu
      // Note: Can't mutate props directly, this should emit an event
      toggleJoinMenu()
    }
    // Don't do anything for other tutorial steps
  } else {
    toggleJoinMenu()
  }
}

const handlePlaylistMenuClick = () => {
  if (props.showTutorial) {
    if (props.tutorialStep === 4) {
      // Open the shows menu during explanation
      togglePlaylistMenu()
    } else if (props.tutorialStep === 5) {
      // Show "You picked Shows" message
      debug('Emitting tutorial-step 5.2')
      emit('tutorial-step', 5.2)
      togglePlaylistMenu()
    } else if (props.tutorialStep === 5.1) {
      // Switch from Play Game to Shows
      emit('tutorial-step', 5.2)
      showPlayMenu.value = false
      togglePlaylistMenu()
    }
    // Don't do anything for other tutorial steps
  } else {
    togglePlaylistMenu()
  }
}

const toggleJoinMenu = () => {
  info( `Toggle join menu clicked, current state: ${showJoinMenu.value}`)
  showJoinMenu.value = !showJoinMenu.value
  info( `New join menu state: ${showJoinMenu.value}`)
  if (showJoinMenu.value) {
    // Focus input after animation
    setTimeout(() => {
      const input = document.querySelector('.menu-input') as HTMLInputElement
      if (input) input.focus()
    }, 300)
  }
}

const submitJoin = () => {
  const code = joinCode.value.trim()
  if (!code) return
  
  info( `Join game submitted with code: ${code}`)
  showJoinMenu.value = false
  joinCode.value = ''
  if (props.showTutorial && props.tutorialStep === 7) {
    // Tutorial step - advance to next step
    nextTutorialStep()
  } else {
    emit('start-game', { action: 'join', code })
  }
}

const togglePlaylistMenu = () => {
  info( `Toggle playlist menu clicked, current state: ${showPlaylistMenu.value}`)
  showPlaylistMenu.value = !showPlaylistMenu.value
  info( `New playlist menu state: ${showPlaylistMenu.value}`)
}

const createPlaylist = () => {
  info( 'Create show selected')
  showPlaylistMenu.value = false
  if (props.showTutorial && props.tutorialStep === 5.2) {
    // Tutorial step - advance to welcome step in creator AND navigate to custom mode
    emit('tutorial-next')
    emit('start-game', { action: 'create-playlist' })
  } else {
    emit('start-game', { action: 'create-playlist' })
  }
}

const playPlaylist = () => {
  info( 'Play show selected')
  showPlaylistMenu.value = false
  if (props.showTutorial && props.tutorialStep === 8) {
    // Tutorial step - don't advance, let user click Next button
    // Just close the menu to show the Next button
  } else {
    emit('start-game', { action: 'browse-shows' })
  }
}

// Lifecycle
onMounted(() => {
  info( 'StartScreen mounted')
})

// Watch for tutorial completion to show completion popup
watch(() => props.tutorialJustCompleted, (newVal) => {
  if (newVal) {
    // Don't reset the flag immediately - let the user interact with the popup first
  }
})

onUnmounted(() => {
  info( 'StartScreen unmounted')
})
</script>

<style scoped>
/* Import Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ========================================
   MAIN CONTAINER
   ======================================== */

.container {
    position: relative;
    width: 100%;
    height: 100vh;
    background: linear-gradient(145deg, #002a33, #2d3a2e);
    overflow: visible;
    font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
    z-index: 1;
}

/* Auth Corner */
.auth-corner {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 500;
}

@media (max-width: 768px) {
    .auth-corner {
        top: 16px;
        right: 16px;
    }
}

.container::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: transparent;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 182px;
    opacity: 0.12;
    pointer-events: none;
    z-index: 1000;
}

.container::after {
    content: '';
    position: absolute;
    top: -5000px;
    left: -5000px;
    right: -5000px;
    bottom: -5000px;
    width: 15000px;
    height: 15000px;
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.8;
    pointer-events: none;
    z-index: 2;
}

/* ========================================
   HEADER
   ======================================== */

.header {
    padding: 60px 0 40px 20px;
    position: relative;
    z-index: 10;
  text-align: center;
    margin-bottom: 0;
}

.title-wrap {
    display: inline-block;
    background: rgba(0, 0, 0, 0.35);
    border-radius: 24px;
    padding: 32px 64px;
    position: relative;
    z-index: 550;
}

.game-title {
    font-size: 6.5rem;
    font-weight: 900;
    font-family: 'Inter', 'Arial', sans-serif;
    margin: 0;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 3s ease-in-out infinite;
    display: inline-block;
    position: relative;
    z-index: 600;
}

/* ========================================
   MAIN ACTIONS
   ======================================== */

.main-actions {
    display: flex;
    gap: 40px;
    height: calc(100vh - 200px);
    min-height: 600px;
    align-items: center;
    justify-content: center;
    padding: 60px 80px;
    position: relative;
  z-index: 10;
    flex-wrap: wrap;
    max-width: 1200px;
    margin: 0 auto;
}

.action-card {
    width: 200px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: grab;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
    user-select: none;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.action-card::before {
    content: '';
  position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 2px solid transparent;
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    background: 
        linear-gradient(90deg, rgba(255, 255, 255, 0.3) 50%, transparent 50%),
        linear-gradient(0deg, rgba(255, 255, 255, 0.3) 50%, transparent 50%),
        linear-gradient(90deg, rgba(255, 255, 255, 0.3) 50%, transparent 50%),
        linear-gradient(0deg, rgba(255, 255, 255, 0.3) 50%, transparent 50%);
    background-size: 20px 2px, 2px 20px, 20px 2px, 2px 20px;
    background-position: 0 0, 100% 0, 100% 100%, 0 100%;
    background-repeat: repeat-x, repeat-y, repeat-x, repeat-y;
    animation: dash-move 2s linear infinite;
}

.action-card:hover::before {
    opacity: 1;
}


/* ========================================
   PLAY MENU OVERLAY
   ======================================== */

.play-menu-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
    z-index: 1000;
    border-radius: 8px;
}

.play-menu {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 12px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  width: 100%;
  height: 100%;
    text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.menu-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: white;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-bottom: 8px;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}

.menu-option {
    width: 100%;
    padding: 12px 6px;
    margin: 0;
    background: transparent;
  border: none;
  border-radius: 0;
    color: white;
  cursor: pointer;
    transition: background 0.25s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    font-weight: 600;
}

.solo-option {
    padding-top: 6px !important;
    padding-bottom: 12px !important;
    padding-left: 6px !important;
    padding-right: 6px !important;
}

.menu-option + .menu-option {
    border-top: 1px dashed rgba(255, 255, 255, 0.3);
}


.menu-option:last-child {
    margin-bottom: 0;
}

.option-icon {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
}

.option-text {
    flex: 1;
    text-align: left;
}

.menu-close {
  position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.close-icon {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
}

.card-image {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    margin-top: 0;
    position: relative;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}

.card-icon {
    font-size: 3.5rem;
    color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
    height: 100%;
}

.card-info {
    padding: 8px 12px;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
}

.ticket-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}

.ticket-time {
    font-size: 0.6rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.ticket-price {
    font-size: 0.6rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  text-transform: uppercase;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.action-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: white;
    margin-bottom: 4px;
  line-height: 1.2;
    text-align: left;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.action-description {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.7);
    text-align: left;
    line-height: 1.2;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 768px) {
    .game-title {
        font-size: 4rem;
    }
    
    .title-wrap {
        padding: 24px 48px;
    }
    
    .main-actions {
        flex-direction: column;
        gap: 20px;
        padding: 40px 20px;
        max-width: none;
    }
    
    .action-card {
        width: 200px;
        height: 300px;
    }
}

@media (max-width: 480px) {
    .game-title {
        font-size: 3rem;
    }
    
    .title-wrap {
        padding: 20px 32px;
    }
    
    .main-actions {
        padding: 20px 10px;
        max-width: none;
    }
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes dash-move {
    0% { 
        background-position: 0 0, 100% 0, 100% 100%, 0 100%;
    }
    100% { 
        background-position: 20px 0, 100% 20px, calc(100% - 20px) 100%, 0 calc(100% - 20px);
    }
}

/* ========================================
   MENU ANIMATIONS
   ======================================== */

.menu-fade-enter-active, .menu-fade-leave-active {
    transition: opacity 0.3s ease;
}

.menu-fade-enter-from, .menu-fade-leave-to {
  opacity: 0;
}

.menu-slide-enter-active, .menu-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-slide-enter-from {
    opacity: 0;
    transform: translateY(30px);
}

.menu-slide-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

/* Join Menu - matches play menu style */
.join-menu-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
    z-index: 1000;
    border-radius: 8px;
}

.join-menu {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 12px;
  backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    width: 100%;
    height: 100%;
    text-align: left;
  position: relative;
}

.menu-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: white;
    margin-bottom: 16px;
    text-align: center;
}

.input-section {
    margin-bottom: 16px;
}

.menu-input {
    width: 100%;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.3s ease;
}

.menu-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.menu-input:focus {
    border-color: rgba(255, 255, 255, 0.4);
}

.join-option {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 8px 12px;
    color: white;
    font-size: 0.9rem;
  cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.join-option:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

.option-icon {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
}

.option-text {
    flex: 1;
    text-align: left;
}

.join-menu .menu-close {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px;
    cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
    transition: all 0.2s ease;
}

.join-menu .close-icon {
  font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
}

/* Shows Menu - matches play menu style */
.playlist-menu-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border-radius: 8px;
}

.playlist-menu {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 12px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    width: 100%;
    height: 100%;
    text-align: left;
  position: relative;
}

.playlist-menu .menu-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: white;
    margin-bottom: 16px;
    text-align: center;
}

.playlist-menu .menu-option {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 8px 12px;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.playlist-menu .menu-option:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

.playlist-menu .option-icon {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
}

.playlist-menu .option-text {
    flex: 1;
    text-align: left;
}

.playlist-menu .menu-close {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px;
    cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
    transition: all 0.2s ease;
}

.playlist-menu .close-icon {
  font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
}

/* How to Play Ticket - inherits all styles from .action-card */

/* Tutorial Tooltip - Card Style */
.tutorial-tooltip {
    position: fixed !important;
    z-index: 999 !important;
    pointer-events: none;
    top: 270px;
    left: 50%;
    transform: translateX(-50%);
}

.tooltip-content {
    width: 300px;
    height: 200px;
    background: #2d3a2e;
    border: 2px solid rgba(78, 205, 196, 0.3);
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  position: relative;
    z-index: 1000;
}

.tooltip-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.tooltip-subtitle {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tooltip-description {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.4;
    margin-bottom: 20px;
    text-align: center;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tooltip-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
    z-index: 50001 !important;
    position: relative;
}

.tooltip-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}



/* Tutorial Glow Effect */
.tutorial-glow {
    box-shadow: 0 0 30px rgba(78, 205, 196, 0.6), 0 0 60px rgba(78, 205, 196, 0.3);
    border: 2px solid rgba(78, 205, 196, 0.8);
}

.tutorial-glow::before {
    opacity: 0 !important;
}

.tutorial-glow:hover::before {
    opacity: 1 !important;
}

.tutorial-complete {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 2000;
}

.complete-text {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 2rem;
    font-weight: 700;
    text-shadow: 0 0 20px rgba(78, 205, 196, 0.5);
    animation: completePulse 1s ease-in-out infinite;
}

/* Animations */
@keyframes tooltipSlideIn {
    from {
    opacity: 0;
        transform: translateX(-50%) translateY(-20px);
  }
    to {
    opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}

@keyframes cardGlow {
    0%, 100% {
        box-shadow: 0 0 20px rgba(78, 205, 196, 0.4), 0 0 40px rgba(78, 205, 196, 0.2);
    }
    50% {
        box-shadow: 0 0 30px rgba(78, 205, 196, 0.6), 0 0 60px rgba(78, 205, 196, 0.3);
    }
}

@keyframes completePulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

/* Transition Effects */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
    transition: all 0.3s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
}
/* Couch Sub-Menu Styles */
.couch-menu-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.couch-menu {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  width: 100%;
  height: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.option-arrow {
  margin-left: auto;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
}
</style>
