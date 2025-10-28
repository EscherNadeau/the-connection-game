<template>
  <div class="container">
    <!-- Back button -->
    <div class="back-button" @click="exitCustomMode">← Back</div>

    <!-- Main content -->
    <div class="main-content">
      <!-- Custom Mode Interface - Simplified version -->
      <div class="custom-mode-interface">
        <h2>Custom Mode</h2>
        <p>Custom mode configuration is temporarily unavailable.</p>
        <button @click="exitCustomMode" class="back-button">Return to Settings</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CustomModePanelProps, CustomModePanelEmits } from '../types/game'

defineProps<CustomModePanelProps>()
const emit = defineEmits<CustomModePanelEmits>()

// Methods
function exitCustomMode(): void {
  emit('back')
}
</script>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(145deg, #002a33, #2d3a2e);
  overflow: visible;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  z-index: 1;
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
  z-index: 1000;
  pointer-events: none;
}

/* Header section removed */

.back-button {
  position: absolute;
  top: 20px;
  left: 30px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  z-index: 10;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.button-text {
  font-size: 0.9rem;
  font-weight: 600;
}

.main-content {
  position: relative;
  z-index: 2;
  flex: 1;
  padding: 0;
  overflow: hidden;
  height: 100vh;
  margin-top: 0;
  padding-top: 0;
}
</style>
