<template>
  <div class="timer-toggle-section">
    <div class="timer-controls">
      <select v-model="timerSetting" class="timer-dropdown" @change="handleTimerChange">
        <option value="none">None</option>
        <option value="60">1 min</option>
        <option value="300">5 min</option>
        <option value="600">10 min</option>
        <option value="custom">Custom</option>
      </select>
      <div v-if="timerSetting === 'custom'" class="custom-timer-inputs">
        <input
          type="number"
          v-model="customTimerMinutes"
          placeholder="0"
          min="0"
          max="60"
          class="custom-timer-input"
          @input="handleCustomTimerChange"
        />
        <span class="timer-label">min</span>
        <input
          type="number"
          v-model="customTimerSeconds"
          placeholder="30"
          min="0"
          max="59"
          class="custom-timer-input"
          @input="handleCustomTimerChange"
        />
        <span class="timer-label">sec</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TimerSettingsProps, TimerSettingsEmits } from '../types/game'

const props = defineProps<TimerSettingsProps>()
const emit = defineEmits<TimerSettingsEmits>()

// Reactive data
const timerSetting = ref(props.modelValue.timerSetting || 'none')
const customTimerMinutes = ref(props.modelValue.customTimerMinutes || 0)
const customTimerSeconds = ref(props.modelValue.customTimerSeconds || 30)

// Watchers
watch(() => props.modelValue, (newValue) => {
  timerSetting.value = newValue.timerSetting || 'none'
  customTimerMinutes.value = newValue.customTimerMinutes || 0
  customTimerSeconds.value = newValue.customTimerSeconds || 30
}, { deep: true })

// Methods
const handleTimerChange = () => {
  emitUpdate()
}

const handleCustomTimerChange = () => {
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', {
    timerSetting: timerSetting.value,
    customTimerMinutes: customTimerMinutes.value,
    customTimerSeconds: customTimerSeconds.value,
  })
}
</script>

<style scoped>
.timer-toggle-section {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.timer-toggle-section h3 {
  font-size: 1.2rem;
  margin: 0 0 15px 0;
  color: #ffffff;
  text-align: center;
}

.timer-controls { display: flex; flex-direction: column; gap: 10px; align-items: stretch; }

.timer-dropdown {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 10px 15px;
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
  backdrop-filter: blur(10px);
  width: 100%;
}

.timer-dropdown:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.timer-dropdown option {
  background: #2a2a2a;
  color: #ffffff;
}

.custom-timer-inputs { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-start; }

.custom-timer-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 1rem;
  width: 60px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.custom-timer-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}

.timer-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 768px) {
  .custom-timer-inputs {
    flex-direction: column;
    gap: 8px;
  }

  .custom-timer-input {
    width: 80px;
  }
}
</style>
