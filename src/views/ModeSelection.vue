<template>
  <div class="container">
    <!-- Back button -->
    <div class="back-button" @click="goBack">← Back</div>

    <!-- Main content -->
    <div class="main-content">
      <!-- Main Modes Section -->
      <div class="modes-section">
        <div class="mode-grid main-modes">
          <div
            v-for="mode in mainModes"
            :key="mode.id"
            class="mode-card"
            :class="{ 
              'tutorial-glow': showTutorial && (
                (tutorialStep === 7.1 && mode.id === 'goal') ||
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

        <!-- Oddities Button -->
        <div class="oddities-section">
          <button 
            class="oddities-button" 
            :class="{ 
              'active': showOddities,
              'tutorial-glow-button': showTutorial && tutorialStep === 7.7
            }"
            @click="handleOdditiesClick"
          >
            <span class="oddities-icon">🎲</span>
            <span class="oddities-text">{{ showOddities ? 'Hide Oddities' : 'Oddities' }}</span>
          </button>
        </div>

        <!-- Oddities Modes (expandable) -->
        <transition name="slide-fade">
          <div v-if="showOddities" class="mode-grid oddity-modes">
            <div
              v-for="mode in oddityModes"
              :key="mode.id"
              class="mode-card oddity-card"
              :class="{ 
                'tutorial-glow': showTutorial && (
                  (tutorialStep === 7.8 && mode.id === 'knowledge') ||
                  (tutorialStep === 7.9 && mode.id === 'anti')
                )
              }"
              @click="selectMode(mode)"
            >
              <div class="card-image">
                <div class="card-icon">{{ mode.icon }}</div>
              </div>
              <div class="card-info">
                <div class="ticket-details">
                  <div class="ticket-time">SPECIAL</div>
                  <div class="ticket-price">FREE</div>
                </div>
                <div class="mode-title">{{ mode.name }}</div>
                <div class="mode-description">{{ mode.description }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Tutorial Tooltips -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Mode Selection</div>
          <div class="tooltip-description">
            Choose your game mode! Goal Mode is the main game. Zen Mode is for relaxed exploration. Show Builder lets you create custom challenges.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">Next</button>
        </div>
      </div>
    </transition>

    <!-- Goal Mode Explanation -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7.1" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">🎯 Goal Mode</div>
          <div class="tooltip-description">
            The main game! Connect a starting item to an ending item. Find the path through movies, shows, and actors.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">Next</button>
        </div>
      </div>
    </transition>

    <!-- Zen Mode Explanation -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7.5" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">🧘 Zen Mode</div>
          <div class="tooltip-description">
            Relax and explore! No timer, no goals. Just discover connections at your own pace.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">Next</button>
        </div>
      </div>
    </transition>

    <!-- Click Goal Mode to Continue -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7.6" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">Ready to Play!</div>
          <div class="tooltip-description">
            Click Goal Mode to continue to settings and start your game!
          </div>
        </div>
      </div>
    </transition>

    <!-- Oddities Button Tutorial -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7.7" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">🎲 Oddities</div>
          <div class="tooltip-description">
            Click the Oddities button to reveal special game modes with unique twists!
          </div>
        </div>
      </div>
    </transition>

    <!-- Knowledge Mode Explanation -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7.8" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">🧠 Knowledge Mode</div>
          <div class="tooltip-description">
            Pick an actor and name every movie they're in! Or pick a movie and name the entire cast! Test how much you really know.
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">Next</button>
        </div>
      </div>
    </transition>

    <!-- Anti Mode Explanation -->
    <transition name="tooltip-fade">
      <div v-if="showTutorial && tutorialStep === 7.9" class="tutorial-tooltip tutorial-tooltip-center">
        <div class="tooltip-content">
          <div class="tooltip-title">🚫 Anti Mode</div>
          <div class="tooltip-description">
            The opposite challenge! Find the most obscure items that DON'T connect to each other. Think outside the box!
          </div>
          <button class="tooltip-button" @click="nextTutorialStep">Next</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { info, debug } from '../services/ui/log'
import { getMainModes, getOddityModes } from '../modes/gameModes'

export default {
  name: 'ModeSelectionScreen',
  props: {
    showTutorial: { type: Boolean, default: false },
    tutorialStep: { type: Number, default: 0 }
  },
  emits: ['back-to-start', 'mode-selected', 'tutorial-next'],
  setup(props, { emit }) {
    const showOddities = ref(false)
    const mainModes = ref(getMainModes())
    const oddityModes = ref(getOddityModes())

    const toggleOddities = () => {
      showOddities.value = !showOddities.value
    }

    const handleOdditiesClick = () => {
      toggleOddities()
      // If in tutorial and waiting for oddities click, advance
      if (props.showTutorial && props.tutorialStep === 7.7) {
        emit('tutorial-next')
      }
    }

    const goBack = () => {
      info('Back button clicked')
      emit('back-to-start')
    }

    const selectMode = (mode) => {
      info(`Mode selected: ${mode.name}`)
      try {
        const hash = window.location.hash || ''
        const m = hash.match(/play=(solo|multi|pvp)/)
        const playType = m ? m[1] : null
        if (playType) {
          mode = { ...mode, gameOptions: { ...(mode.gameOptions || {}), playType } }
        }
      } catch (err) {
        debug('Failed to parse play type from hash', { error: err })
      }
      
      if (props.showTutorial && props.tutorialStep === 7.6 && mode.id === 'goal') {
        nextTutorialStep()
      } else if (props.showTutorial && props.tutorialStep !== 7.6) {
        // Don't select mode during tutorial unless it's the right step
        return
      } else {
        emit('mode-selected', mode)
      }
    }

    const nextTutorialStep = () => {
      emit('tutorial-next')
    }

    onMounted(() => {
      info('ModeSelectionScreen mounted')
      // Auto-open oddities if tutorial needs it
      if (props.showTutorial && props.tutorialStep >= 7.8) {
        showOddities.value = true
      }
    })

    onUnmounted(() => {
      info('ModeSelectionScreen unmounted')
    })

    return {
      mainModes,
      oddityModes,
      showOddities,
      toggleOddities,
      handleOdditiesClick,
      goBack,
      selectMode,
      nextTutorialStep,
    }
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

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
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");
    background-size: 182px;
    opacity: 0.12;
    pointer-events: none;
    z-index: 1000;
}

.container::after {
    content: '';
    position: absolute;
    top: -5000px; left: -5000px; right: -5000px; bottom: -5000px;
    width: 15000px; height: 15000px;
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
    background-size: 40px 40px;
    opacity: 0.8;
    pointer-events: none;
    z-index: 2;
}

.back-button {
    position: absolute;
    top: 30px; left: 30px;
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
    text-transform: uppercase;
}

.back-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.main-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 40px;
    position: relative;
    z-index: 10;
}

.modes-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
}

.mode-grid {
    display: flex;
    flex-wrap: nowrap;
    gap: 20px;
    padding: 20px 0;
    justify-content: center;
}

.mode-card {
    width: 200px; height: 300px; min-width: 200px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
}

.mode-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.oddity-card {
    width: 180px; height: 270px; min-width: 180px;
    border: 2px dashed rgba(255, 255, 255, 0.3);
}

.oddity-card:hover {
    border-color: rgba(255, 200, 100, 0.6);
}

.card-image {
    width: 100%; height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px 8px 0 0;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}

.oddity-card .card-image { height: 170px; }

.card-icon {
    font-size: 3.5rem;
    color: rgba(255, 255, 255, 0.8);
}

.oddity-card .card-icon { font-size: 3rem; }

.card-info {
    padding: 8px 12px;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.ticket-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}

.ticket-time, .ticket-price {
    font-size: 0.6rem;
    color: rgba(255, 255, 255, 0.7);
}

.mode-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: white;
    margin-bottom: 4px;
}

.oddity-card .mode-title { font-size: 0.8rem; }

.mode-description {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.2;
}

.oddity-card .mode-description { font-size: 0.65rem; }

/* Oddities Button */
.oddities-section { margin-top: 10px; }

.oddities-button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background: rgba(255, 200, 100, 0.1);
    border: 2px dashed rgba(255, 200, 100, 0.4);
    border-radius: 30px;
    color: rgba(255, 200, 100, 0.9);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.oddities-button:hover {
    background: rgba(255, 200, 100, 0.2);
    border-color: rgba(255, 200, 100, 0.6);
    transform: scale(1.05);
}

.oddities-button.active {
    background: rgba(255, 200, 100, 0.2);
    border-style: solid;
}

.oddities-icon { font-size: 1.2rem; }

/* Tutorial glow for button */
.oddities-button.tutorial-glow-button {
    box-shadow: 0 0 30px rgba(255, 200, 100, 0.6), 0 0 60px rgba(255, 200, 100, 0.3) !important;
    border-color: rgba(255, 200, 100, 0.8) !important;
    animation: buttonGlow 2s ease-in-out infinite;
}

@keyframes buttonGlow {
    0%, 100% { box-shadow: 0 0 30px rgba(255, 200, 100, 0.6), 0 0 60px rgba(255, 200, 100, 0.3); }
    50% { box-shadow: 0 0 40px rgba(255, 200, 100, 0.8), 0 0 80px rgba(255, 200, 100, 0.5); }
}

/* Transitions */
.slide-fade-enter-active { transition: all 0.4s ease-out; }
.slide-fade-leave-active { transition: all 0.3s ease-in; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateY(-20px); }

/* Tutorial Tooltips */
.tutorial-tooltip {
    position: fixed !important;
    top: 120px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999 !important;
}

.tooltip-content {
    width: 320px;
    background: #2d3a2e;
    border: 2px solid rgba(78, 205, 196, 0.3);
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.tooltip-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.tooltip-description {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.5;
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
    font-family: inherit;
}

.tooltip-button:hover {
    background: rgba(255, 255, 255, 0.2);
}

.tooltip-fade-enter-active, .tooltip-fade-leave-active { transition: opacity 0.3s ease; }
.tooltip-fade-enter-from, .tooltip-fade-leave-to { opacity: 0; }

/* Tutorial Glow for Cards */
.mode-card.tutorial-glow {
    box-shadow: 0 0 30px rgba(78, 205, 196, 0.6), 0 0 60px rgba(78, 205, 196, 0.3) !important;
    border: 2px solid rgba(78, 205, 196, 0.8) !important;
    animation: cardGlow 2s ease-in-out infinite;
}

@keyframes cardGlow {
    0%, 100% { box-shadow: 0 0 30px rgba(78, 205, 196, 0.6), 0 0 60px rgba(78, 205, 196, 0.3); }
    50% { box-shadow: 0 0 40px rgba(78, 205, 196, 0.8), 0 0 80px rgba(78, 205, 196, 0.5); }
}

/* Responsive */
@media (max-width: 768px) {
    .mode-grid { flex-wrap: wrap; gap: 15px; }
    .mode-card { width: 160px; height: 260px; min-width: 160px; }
    .oddity-card { width: 140px; height: 230px; min-width: 140px; }
    .main-content { padding: 20px; }
}

@media (max-width: 480px) {
    .mode-card { width: 140px; height: 240px; min-width: 140px; }
    .oddity-card { width: 120px; height: 200px; min-width: 120px; }
    .oddities-button { padding: 10px 18px; font-size: 0.8rem; }
}
</style>
