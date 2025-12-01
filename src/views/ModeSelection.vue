<template>
  <div class="mode-selection">
    <button class="back-button" @click="emit('back-to-start')">← Back</button>
    
    <div class="mode-header">
      <h1>Choose Your Mode</h1>
      <p>Pick how you want to play</p>
    </div>

    <!-- Main Modes -->
    <div class="modes-grid">
      <div 
        v-for="mode in mainModes" 
        :key="mode.id"
        class="mode-card"
        @click="selectMode(mode)"
      >
        <div class="mode-icon">{{ mode.icon }}</div>
        <div class="mode-name">{{ mode.name }}</div>
        <div class="mode-desc">{{ mode.description }}</div>
      </div>
    </div>

    <!-- Oddities Button -->
    <button class="oddities-button" @click="toggleOddities">
      🎲 Oddities
      <span class="arrow">{{ showOddities ? '▲' : '▼' }}</span>
    </button>

    <!-- Oddities Modes -->
    <transition name="slide">
      <div v-if="showOddities" class="oddities-grid">
        <div 
          v-for="mode in oddityModes" 
          :key="mode.id"
          class="mode-card oddity"
          @click="selectMode(mode)"
        >
          <div class="mode-icon">{{ mode.icon }}</div>
          <div class="mode-name">{{ mode.name }}</div>
          <div class="mode-desc">{{ mode.description }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface GameMode {
  id: string
  name: string
  description: string
  icon: string
}

const emit = defineEmits<{
  (e: 'back-to-start'): void
  (e: 'mode-selected', mode: GameMode): void
}>()

const showOddities = ref(false)

const mainModes: GameMode[] = [
  { id: 'goal', name: 'Goal Mode', description: 'Connect A to B', icon: '🎯' },
  { id: 'zen', name: 'Zen Mode', description: 'Free exploration', icon: '🧘' }
]

const oddityModes: GameMode[] = [
  { id: 'knowledge', name: 'Knowledge', description: 'Name everything they\'ve been in', icon: '🧠' },
  { id: 'anti', name: 'Anti Mode', description: 'Find unconnected items', icon: '🚫' }
]

const toggleOddities = () => {
  showOddities.value = !showOddities.value
}

const selectMode = (mode: GameMode) => {
  emit('mode-selected', mode)
}
</script>

<style scoped>
.mode-selection {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.back-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.mode-header {
  text-align: center;
  margin: 3rem 0 2rem;
}

.mode-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.mode-header p {
  color: rgba(255, 255, 255, 0.6);
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 300px));
  gap: 1.5rem;
  justify-content: center;
  max-width: 800px;
  width: 100%;
}

.mode-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.mode-card:hover {
  transform: translateY(-4px);
  border-color: rgba(233, 69, 96, 0.5);
  box-shadow: 0 10px 40px rgba(233, 69, 96, 0.2);
}

.mode-card.oddity {
  border-color: rgba(99, 102, 241, 0.3);
}

.mode-card.oddity:hover {
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.2);
}

.mode-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.mode-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.mode-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.oddities-button {
  margin-top: 2rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 0.75rem 2rem;
  border-radius: 2rem;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.oddities-button:hover {
  background: rgba(99, 102, 241, 0.2);
}

.arrow {
  font-size: 0.8rem;
}

.oddities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 300px));
  gap: 1.5rem;
  justify-content: center;
  max-width: 800px;
  width: 100%;
  margin-top: 1.5rem;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
