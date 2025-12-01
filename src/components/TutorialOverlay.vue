<template>
  <div>
    <!-- Tutorial Tooltips -->
    <div v-if="showTutorial && tutorialStep === 20" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Welcome to the Gameboard!</div>
        <div class="tooltip-description">
          This is a lot here to look at so let's go through it. Should not take long now.
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 21" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Search</div>
        <div class="tooltip-description">
          This is the search box - the main way to find and add items to your game. Type anything to search for actors, movies, or TV shows.
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 22" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Items</div>
        <div class="tooltip-description">
          These are the items on your board. Items will connect if they have a relationship. Try and add an item!
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 23" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Physics System</div>
        <div class="tooltip-description">
          This is the game board with a fancy physics system. Click and drag items to move them around. Items push away when on top of each other. Try it!
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 24" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Zoom and Pan</div>
        <div class="tooltip-description">
          Use your mouse wheel to zoom in and out, or drag with right-click to pan around the board. This helps you see everything clearly.
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 25" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Zoom and Pan Resets</div>
        <div class="tooltip-description">
          If you get lost and want to recenter, use the reset zoom and pan buttons.
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 26" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Hints</div>
        <div class="tooltip-description">
          When you're stuck, use the hints button. It will open the search window with results that connect to the item you clicked on.
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 26.5" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Try the Hint Button</div>
        <div class="tooltip-description">
          It will always be in the top right of a poster unless hints are disabled. Do whatever is needed to see the glowing hint button and press it and try and add an item.
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 26.6" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Connections</div>
        <div class="tooltip-description">
          See how the hint made a connection? Items connect when they have a relationship. The goal is to create a path between your start and end goals!
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 27" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Top Stats Menu</div>
        <div class="tooltip-description">
          The stats menu shows actors, movies, and shows on your board, plus other stats depending on the mode like connection amount for goal mode.
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 28 && !resultModalVisible" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Almost Done!</div>
        <div class="tooltip-description">
          Let's look at the win menu for the very last step. Now normally you would have to win but for now I'm going to cheat.
        </div>
        <button class="tooltip-button" @click="$emit('open-win-modal')">Next</button>
      </div>
    </div>

    <!-- Win Screen Tutorial -->
    <div v-if="showTutorial && tutorialStep === 29 && resultModalVisible" class="tutorial-tooltip tutorial-tooltip-center">
      <div class="tooltip-content">
        <div class="tooltip-title">This is the Win Screen!</div>
        <div class="tooltip-description">
          It has 3 options - New Game (obv), Show Path (shows your winning path), and Free Play (continues with no rules).
        </div>
        <button class="tooltip-button" @click="$emit('return-to-start')">Got it!</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TutorialProps, TutorialEmits } from '@/types/game'

defineProps<TutorialProps>()
defineEmits<TutorialEmits>()
</script>

<style scoped>
/* Tutorial tooltip */
.tutorial-tooltip {
  position: fixed !important;
  z-index: 5000 !important;
  pointer-events: none;
  top: 270px;
  left: 50%;
  transform: translateX(-50%);
}

.tutorial-tooltip-center {
  top: 25% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
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
  z-index: 1;
}

.tooltip-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.tooltip-description {
  font-size: 0.8rem;
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
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
}

.tooltip-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}
</style>
