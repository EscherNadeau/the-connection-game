<template>
  <div class="cast-filter-section">
    <select v-model="castFilter" class="cast-filter-select" @change="handleCastFilterChange">
      <option value="mixed">Mixed (Default)</option>
      <option value="male">Male Actors Only</option>
      <option value="female">Female Actresses Only</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CastFilterProps, CastFilterEmits } from '../types/game'

const props = defineProps<CastFilterProps>()
const emit = defineEmits<CastFilterEmits>()

// Reactive data
const castFilter = ref<string>(props.modelValue)

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  castFilter.value = newValue
})

// Methods
function handleCastFilterChange(): void {
  emit('update:modelValue', castFilter.value)
}
</script>

<style scoped>
.cast-filter-section {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cast-filter-section h3 {
  font-size: 1.2rem;
  margin: 0 0 15px 0;
  color: #ffffff;
  text-align: center;
}

.cast-filter-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 10px 15px;
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: none;
  margin: 0;
}

.cast-filter-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.cast-filter-select option {
  background: #2a2a2a;
  color: #ffffff;
}

/* Responsive design */
@media (max-width: 768px) {
  .cast-filter-select { max-width: 100%; }
}
</style>
