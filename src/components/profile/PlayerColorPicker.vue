<template>
  <div class="color-picker">
    <div class="picker-header">
      <h3>🎨 Player Color</h3>
      <div class="current-color" :style="{ backgroundColor: currentColor }"></div>
    </div>

    <div class="color-grid">
      <button
        v-for="color in PLAYER_COLORS"
        :key="color.value"
        :class="['color-option', { selected: currentColor === color.value }]"
        :style="{ backgroundColor: color.value }"
        :title="color.name"
        @click="selectColor(color.value)"
      >
        <span v-if="currentColor === color.value" class="check">✓</span>
      </button>
    </div>

    <p class="hint">This color will identify you in multiplayer games.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserProfile, PLAYER_COLORS } from '../../composables/useUserProfile'

const { playerColor, setPlayerColor } = useUserProfile()

const currentColor = computed(() => playerColor.value)

async function selectColor(color: string) {
  await setPlayerColor(color)
}
</script>

<style scoped>
.color-picker {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.picker-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: white;
}

.current-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
}

.color-option {
  aspect-ratio: 1;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
}

.color-option:hover {
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.color-option.selected {
  border-color: white;
  transform: scale(1.1);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
}

.check {
  color: white;
  font-size: 1rem;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.hint {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

@media (max-width: 480px) {
  .color-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
  }
  
  .color-option {
    min-width: 32px;
    min-height: 32px;
  }
}
</style>

