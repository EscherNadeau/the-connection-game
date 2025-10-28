<template>
  <div class="screen-wrapper">
    <!-- Border -->
    <div class="screen-border"></div>
    
    <!-- Inner gradient area -->
    <div class="screen-inner"></div>
    
    <!-- Grain overlay -->
    <div class="grain-overlay"></div>
    
    <!-- Content slot -->
    <div class="screen-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ScreenWrapperProps } from '../types/game'

const props = withDefaults(defineProps<ScreenWrapperProps>(), {
  innerGradient: 'linear-gradient(145deg, #003844, #3f4b41)',
  outerColor: '#795C5F'
})

// Make props available for template
const innerGradient = computed(() => props.innerGradient)
const outerColor = computed(() => props.outerColor)
</script>

<style scoped>
.screen-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: v-bind(outerColor);
  padding: 40px;
  box-sizing: border-box;
}

.screen-border {
  content: '';
  position: absolute;
  inset: 20px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  pointer-events: none;
  z-index: 1;
}

.screen-inner {
  content: '';
  position: absolute;
  inset: 23px;
  background: v-bind(innerGradient);
  border-radius: 5px;
  pointer-events: none;
  z-index: 0;
}

.grain-overlay {
  position: absolute;
  inset: 23px;
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 182px;
  opacity: 0.12;
  border-radius: 5px;
  pointer-events: none;
  z-index: 1;
}

.screen-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
}
</style>
