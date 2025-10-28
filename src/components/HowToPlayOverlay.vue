<template>
  <div v-if="isVisible" class="how-to-play-overlay">
    <!-- Backdrop -->
    <div class="overlay-backdrop" @click="closeOverlay"></div>
    
    <!-- Overlay Content -->
    <div class="overlay-content">
      <!-- Close Button -->
      <button class="close-button" @click="closeOverlay">×</button>
      
      <!-- Tutorial Steps -->
      <div class="tutorial-container">
        <div class="tutorial-header">
          <h2>🎮 How to Play</h2>
          <p>Learn the basics of The Connection Game</p>
        </div>
        
        <div class="tutorial-steps">
          <!-- Step 1: Mode Selection -->
          <div class="tutorial-step" :class="{ 'active': currentStep === 1 }">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Choose Your Mode</h3>
              <p>Select from different game modes like Goal Mode, Knowledge Mode, Hybrid Mode, or Anti Mode. Each mode has unique rules and objectives.</p>
              <div class="step-arrow" data-target="mode-selection"></div>
            </div>
          </div>
          
          <!-- Step 2: Play Types -->
          <div class="tutorial-step" :class="{ 'active': currentStep === 2 }">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Choose How to Play</h3>
              <p><strong>🎮 Solo:</strong> Play by yourself on PC<br>
              <strong>⚔️ PvP:</strong> Competitive PC vs PC<br>
              <strong>👥 Multiplayer:</strong> Collaborative PC play<br>
              <strong>🛋️ Couch:</strong> PC (TV) + phones (controllers)</p>
              <div class="step-arrow" data-target="play-menu"></div>
              <button class="interactive-button" @click="clickPlayGame">Click Play Game to Continue</button>
            </div>
          </div>
          
          <!-- Step 3: Settings -->
          <div class="tutorial-step" :class="{ 'active': currentStep === 3 }">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Configure Settings</h3>
              <p>Adjust game settings like timer, cast filter, and hints. Use the random buttons to quickly select starting items.</p>
              <div class="step-arrow" data-target="settings-panel"></div>
            </div>
          </div>
          
          <!-- Step 4: Game Board -->
          <div class="tutorial-step" :class="{ 'active': currentStep === 4 }">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>Make Connections</h3>
              <p>Drag and drop items to create connections. Find the path between your starting and ending goals!</p>
              <div class="step-arrow" data-target="game-board"></div>
            </div>
          </div>
          
          <!-- Step 5: Scoring -->
          <div class="tutorial-step" :class="{ 'active': currentStep === 5 }">
            <div class="step-number">5</div>
            <div class="step-content">
              <h3>Score Points</h3>
              <p>Earn points for each successful connection. The fewer connections you use, the higher your score!</p>
              <div class="step-arrow" data-target="score-display"></div>
            </div>
          </div>
        </div>
        
        <!-- Navigation -->
        <div class="tutorial-navigation">
          <button 
            class="nav-button prev" 
            @click="previousStep"
            :disabled="currentStep === 1"
          >
            ← Previous
          </button>
          
          <div class="step-indicators">
            <span 
              v-for="step in 5" 
              :key="step"
              class="step-dot"
              :class="{ 'active': step === currentStep }"
              @click="goToStep(step)"
            ></span>
          </div>
          
          <button 
            class="nav-button next" 
            @click="nextStep"
            :disabled="currentStep === 5"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
    
    <!-- Arrow Pointers -->
    <div class="arrow-pointers">
      <div 
        v-for="arrow in activeArrows" 
        :key="arrow.id"
        class="arrow-pointer"
        :style="arrow.style"
        :class="arrow.class"
      >
        <div class="arrow-line"></div>
        <div class="arrow-head"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'HowToPlayOverlay',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'start-tutorial'],
  setup(props, { emit }) {
    const currentStep = ref(1)
    
    const closeOverlay = () => {
      emit('close')
    }
    
    const nextStep = () => {
      if (currentStep.value < 5) {
        currentStep.value++
      }
    }
    
    const previousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }
    
    const goToStep = (step) => {
      currentStep.value = step
    }
    
    const clickPlayGame = () => {
      emit('close')
      emit('start-tutorial')
    }
    
    // Arrow positioning logic
    const activeArrows = computed(() => {
      const arrows = []
      
      if (currentStep.value === 1) {
        // Point to mode selection
        arrows.push({
          id: 'mode-selection',
          style: {
            top: '50%',
            left: '20%',
            transform: 'rotate(-45deg)'
          },
          class: 'arrow-left'
        })
      } else if (currentStep.value === 2) {
        // Point to play menu
        arrows.push({
          id: 'play-menu',
          style: {
            top: '40%',
            left: '50%',
            transform: 'rotate(0deg)'
          },
          class: 'arrow-center'
        })
      } else if (currentStep.value === 3) {
        // Point to settings panel
        arrows.push({
          id: 'settings-panel',
          style: {
            top: '30%',
            right: '15%',
            transform: 'rotate(45deg)'
          },
          class: 'arrow-right'
        })
      } else if (currentStep.value === 4) {
        // Point to game board
        arrows.push({
          id: 'game-board',
          style: {
            top: '60%',
            left: '50%',
            transform: 'rotate(0deg)'
          },
          class: 'arrow-center'
        })
      } else if (currentStep.value === 5) {
        // Point to score display
        arrows.push({
          id: 'score-display',
          style: {
            top: '20%',
            right: '10%',
            transform: 'rotate(30deg)'
          },
          class: 'arrow-right'
        })
      }
      
      return arrows
    })
    
    // Keyboard navigation
    const handleKeydown = (event) => {
      if (!props.isVisible) return
      
      if (event.key === 'Escape') {
        closeOverlay()
      } else if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        nextStep()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        previousStep()
      }
    }
    
    onMounted(() => {
      document.addEventListener('keydown', handleKeydown)
    })
    
    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
    })
    
    return {
      currentStep,
      closeOverlay,
      nextStep,
      previousStep,
      goToStep,
      clickPlayGame,
      activeArrows
    }
  }
}
</script>

<style scoped>
.how-to-play-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.overlay-content {
  position: relative;
  background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.tutorial-header {
  text-align: center;
  margin-bottom: 40px;
}

.tutorial-header h2 {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #00ff88, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}

.tutorial-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

.tutorial-steps {
  margin-bottom: 40px;
}

.tutorial-step {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.tutorial-step.active {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.3);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
}

.step-number {
  background: linear-gradient(45deg, #00ff88, #00ccff);
  color: #000;
  font-weight: bold;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  color: white;
  font-size: 1.3rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.step-content p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 15px;
}

.step-arrow {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid rgba(0, 255, 136, 0.6);
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: translateY(-50%) scale(1); }
  50% { opacity: 1; transform: translateY(-50%) scale(1.2); }
}

.tutorial-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.nav-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-indicators {
  display: flex;
  gap: 10px;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.step-dot.active {
  background: linear-gradient(45deg, #00ff88, #00ccff);
  transform: scale(1.2);
}

.step-dot:hover {
  background: rgba(255, 255, 255, 0.6);
}

/* Arrow Pointers */
.arrow-pointers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10000;
}

.arrow-pointer {
  position: absolute;
  animation: bounce 2s infinite;
}

.arrow-line {
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, #00ff88, #00ccff);
  border-radius: 2px;
  position: relative;
}

.arrow-head {
  position: absolute;
  right: -8px;
  top: -6px;
  width: 0;
  height: 0;
  border-left: 16px solid #00ccff;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
}

.arrow-pointer.arrow-left .arrow-line {
  transform: rotate(180deg);
}

.arrow-pointer.arrow-left .arrow-head {
  right: auto;
  left: -8px;
  border-left: none;
  border-right: 16px solid #00ff88;
}

.arrow-pointer.arrow-center .arrow-line {
  width: 80px;
}

.arrow-pointer.arrow-right .arrow-line {
  width: 120px;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .overlay-content {
    padding: 20px;
    margin: 20px;
  }
  
  .tutorial-header h2 {
    font-size: 2rem;
  }
  
  .tutorial-step {
    padding: 15px;
  }
  
  .step-number {
    width: 35px;
    height: 35px;
    font-size: 1rem;
    margin-right: 15px;
  }
  
  .step-content h3 {
    font-size: 1.1rem;
  }
  
  .nav-button {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}
.interactive-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #4fc3f7, #29b6f6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 195, 247, 0.3);
}

.interactive-button:hover {
  background: linear-gradient(135deg, #29b6f6, #0288d1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 195, 247, 0.4);
}

.interactive-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(79, 195, 247, 0.3);
}
</style>
