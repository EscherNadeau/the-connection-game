<template>
  <div class="board-shell" :style="boardStyle">
    <div class="glass-overlay"></div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BoardShellProps } from '../types/game'

const props = defineProps<BoardShellProps>()

// Computed property to use props
const boardStyle = computed(() => props.boardStyle)
</script>

<style scoped>
.board-shell {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--glass-bg);
  backdrop-filter: blur(10px);
  min-height: 0;
  position: relative;
  border: none;
}
.glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  pointer-events: none;
  z-index: 0;
  border: none;
}
</style>
