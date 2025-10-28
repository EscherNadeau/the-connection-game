<template>
  <div class="container">
    <!-- Back button -->
    <div class="back-button" @click="goBack">← Back</div>

    <!-- Main content -->
    <div class="main-content">
        <div class="mode-grid">
          <div
            v-for="mode in gameModes"
            :key="mode.id"
            class="mode-card"
          :class="{ 
            'tutorial-glow': showTutorial && (
              (tutorialStep === 7.1 && mode.id === 'goal') ||
              (tutorialStep === 7.2 && mode.id === 'knowledge') ||
              (tutorialStep === 7.3 && mode.id === 'hybrid') ||
              (tutorialStep === 7.4 && mode.id === 'anti') ||
              (tutorialStep === 7.5 && mode.id === 'zen') ||
              (tutorialStep === 7.6 && mode.id === 'goal')
            )
          }"
            @click="selectMode(mode)"
        >
          <div class="card-image">
            <div class="card-icon">{{ mode.icon }}</div>
          </div>
          <div class="card-info">
            <div class="ticket-details">
              <div class="ticket-time">8:00 PM</div>
              <div class="ticket-price">FREE</div>
            </div>
            <div class="mode-title">{{ mode.name }}</div>
            <div class="mode-description">{{ mode.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tutorial Tooltips -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Mode Selection</div>
          <div class="tooltip-description">
            Here you can choose different game modes! Each mode has unique rules and challenges. Let's explore each one.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>

    <!-- Goal Mode Explanation -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7.1" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Goal Mode</div>
          <div class="tooltip-description">
            Connect items to reach a specific goal. You'll be given a starting point and an ending point, and need to find the path between them.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>

    <!-- Knowledge Mode Explanation -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7.2" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Knowledge Mode</div>
          <div class="tooltip-description">
            Start with one item and uncover all its connections—list a movie's full cast or every film a person has been in!
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>

    <!-- Hybrid Mode Explanation -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7.3" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Hybrid Mode</div>
          <div class="tooltip-description">
            Start with one item and reach specific goals! Like starting with Jack Black and reaching Cars. Name things Jack is in, then work toward your goals!
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>


    <!-- Anti Mode Explanation -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7.4" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Anti Mode</div>
          <div class="tooltip-description">
            Try NOT to make connections! Stay alive as long as possible by avoiding obvious links. The longer you last, the better you do!
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>

    <!-- Zen Mode Explanation -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7.5" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Zen Mode</div>
          <div class="tooltip-description">
            Do whatever you want! No rules, no pressure. Just explore connections and have fun at your own pace.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>

    <!-- Click Goal Mode to Continue -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7.6" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Ready to Continue!</div>
          <div class="tooltip-description">
            Now click Goal Mode to go to the settings page and configure your game!
          </div>
        </div>
      </div>
    </transition>

    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 8" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Waiting Room</div>
          <div class="tooltip-description">
            This is the waiting room! Players join here before the game starts. You can see who's ready and start when everyone's in.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>

    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 9" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Game Board</div>
          <div class="tooltip-description">
            This is the main game board! Here you'll see the items to connect and make your moves. Ready to see how shows work?
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">
            Next
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { log } from '../services/ui/log.ts'

export default {
  name: 'ModeSelectionScreen',
  props: {
    showTutorial: {
      type: Boolean,
      default: false
    },
    tutorialStep: {
      type: Number,
      default: 0
    }
  },
  emits: ['back-to-start', 'mode-selected', 'tutorial-next'],
  setup(props, { emit }) {

    // Game modes
    const gameModes = ref([
      {
        id: 'goal',
        name: 'Goal Mode',
        title: 'Goal Mode',
        description:
          'Connect items to reach a specific goal. Can be enhanced with Path Mode rules for harder challenges',
        icon: '🎯',
      },

      {
        id: 'knowledge',
        name: 'Knowledge Mode',
        title: 'Knowledge Mode',
        description: 'Start with one item and find all its connections!',
        icon: '🧠',
      },
      {
        id: 'hybrid',
        name: 'Hybrid Mode',
        title: 'Hybrid Mode',
        description: 'Multiple end goals from one starting point',
        icon: '🔗',
      },
      {
        id: 'anti',
        name: 'Anti Mode',
        title: 'Anti Mode',
        description: 'Avoid connections, think differently',
        icon: '🚫',
      },
      {
        id: 'zen',
        name: 'Zen Mode',
        title: 'Zen Mode',
        description: 'Relaxed gameplay with no time pressure',
        icon: '🧘',
      },
    ])

    // Go back to start screen
    const goBack = () => {
      log('info', 'Back button clicked')
      emit('back-to-start')
    }

    // Select game mode
    const selectMode = (mode) => {
      log('info', `Mode selected: ${mode.name}`)
      // Capture play type from URL hash (set by PlayType)
      try {
        const hash = window.location.hash || ''
        const m = hash.match(/play=(solo|multi|pvp)/)
        const playType = m ? m[1] : null
        if (playType) {
          mode = { ...mode, gameOptions: { ...(mode.gameOptions || {}), playType } }
        }
      } catch (_) {}
      
      if (props.showTutorial && props.tutorialStep === 7.6 && mode.id === 'goal') {
        // Tutorial step - click Goal Mode to continue
        nextTutorialStep()
      } else if (props.showTutorial && props.tutorialStep !== 7.6) {
        // Other tutorial steps - just advance
        nextTutorialStep()
      } else {
      emit('mode-selected', mode)
    }
    }

    const nextTutorialStep = () => {
      emit('tutorial-next')
    }

    // Lifecycle
    onMounted(() => {
      log('info', 'ModeSelectionScreen mounted')
    })

    onUnmounted(() => {
      log('info', 'ModeSelectionScreen unmounted')
    })

    return {
      gameModes,
      goBack,
      selectMode,
      nextTutorialStep,
    }
  },
}
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
    overflow: hidden;
    font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
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
   BACK BUTTON
   ======================================== */

.back-button {
    position: absolute;
    top: 30px;
    left: 30px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    cursor: pointer;
  font-size: 0.9rem;
    font-weight: 600;
    z-index: 600;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* ========================================
   MAIN CONTENT
   ======================================== */

.main-content {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 100vh;
    padding: 40px 40px 120px 40px;
    position: relative;
  z-index: 10;
}

.mode-grid {
    display: flex;
    flex-wrap: nowrap;
    gap: 20px;
    max-width: 100%;
    width: 100%;
    overflow-x: auto;
    padding: 20px 0;
    justify-content: center;
}

.mode-card {
    width: 200px;
    height: 300px;
    min-width: 200px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
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

/* Animated dashed border */
.mode-card::before {
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

.mode-card:hover::before {
    opacity: 1;
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

.mode-title {
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

.mode-description {
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
  .mode-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
  }

  .mode-card {
        width: 180px;
        height: 280px;
    }
    
    .main-content {
        padding: 20px;
    }
}

@media (max-width: 480px) {
  .mode-grid {
        grid-template-columns: 1fr;
    gap: 15px;
  }

  .mode-card {
        width: 100%;
        max-width: 200px;
        height: 300px;
    }
    
    .main-content {
        padding: 10px;
    }
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
   TUTORIAL TOOLTIPS
   ======================================== */

.tutorial-tooltip {
    position: fixed !important;
    top: 250px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999 !important;
    pointer-events: auto;
}

.tutorial-tooltip-center {
    position: fixed !important;
    top: 250px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999 !important;
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
}

.tooltip-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
}

.tooltip-description {
    font-size: 0.9rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.4;
    margin-bottom: 16px;
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
    margin-top: 8px;
}

.tooltip-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
    transition: opacity 0.3s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
    opacity: 0;
}

/* ========================================
   TUTORIAL GLOW EFFECT
   ======================================== */

.mode-card.tutorial-glow {
    box-shadow: 0 0 30px rgba(78, 205, 196, 0.6), 0 0 60px rgba(78, 205, 196, 0.3) !important;
    z-index: 10 !important;
    position: relative !important;
    border: 2px solid rgba(78, 205, 196, 0.8) !important;
}

.mode-card.tutorial-glow::before {
    opacity: 0 !important;
}

.mode-card.tutorial-glow:hover::before {
    opacity: 1 !important;
}

@keyframes cardGlow {
    0%, 100% {
        box-shadow: 0 0 30px rgba(78, 205, 196, 0.6), 0 0 60px rgba(78, 205, 196, 0.3) !important;
    }
    50% {
        box-shadow: 0 0 40px rgba(78, 205, 196, 0.8), 0 0 80px rgba(78, 205, 196, 0.5) !important;
    }
}
</style>
