<template>
  <div class="mode-card" @click="handleCardClick">
    <!-- Card Content -->
    <div class="card-content">
      <div class="card-title">{{ mode.title }}</div>
      <div class="title-line"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModeCardProps, ModeCardEmits } from '../types/game'

const props = defineProps<ModeCardProps>()
const emit = defineEmits<ModeCardEmits>()

const handleCardClick = () => {
  emit('select', props.mode)
}
</script>

<style scoped>
/* ========================================
   SIMPLE GREY CARD STYLES
   ======================================== */

.mode-card {
  width: 220px;
  height: 320px;
  cursor: pointer;
  background: rgba(128, 128, 128, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.mode-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.6);
}

/* Card Content */
.card-content {
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 15px;
  justify-content: space-between;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 400;
  color: #ffffff;
  font-family: 'Fascinate', cursive;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  margin-bottom: 12px;
}

.title-line {
  width: 75%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  margin: 0 auto;
  border-radius: 2px;
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 768px) {
  .mode-card {
    width: 280px;
    height: 380px;
  }

  .card-title {
    font-size: 1.8rem;
    margin-bottom: 12px;
  }

  .title-line {
    width: 75%;
    height: 2px;
  }

  .card-content {
    padding: 25px 20px;
  }
}

@media (max-width: 480px) {
  .mode-card {
    width: 240px;
    height: 320px;
  }

  .card-title {
    font-size: 1.6rem;
    margin-bottom: 10px;
  }

  .title-line {
    width: 70%;
    height: 2px;
  }

  .card-content {
    padding: 20px 15px;
  }
}
</style>
