<template>
  <Teleport to="body">
    <div v-if="isOpen" class="help-overlay" @click.self="close">
      <div class="help-modal">
        <div class="help-header">
          <h2>📺 Show Builder</h2>
        </div>
        
        <div class="help-content">
          <p class="intro">Create themed challenges to share with friends!</p>
          
          <div class="step">
            <span class="step-num">1</span>
            <span class="step-text">Create <strong>Episodes</strong> - each is a puzzle challenge</span>
          </div>
          
          <div class="step">
            <span class="step-num">2</span>
            <span class="step-text">Set goals, starting items, and rules for each episode</span>
          </div>
          
          <div class="step">
            <span class="step-num">3</span>
            <span class="step-text">Arrange episodes into a <strong>Show</strong></span>
          </div>
          
          <div class="step">
            <span class="step-num">4</span>
            <span class="step-text"><strong>Share the code</strong> - friends try to beat your score!</span>
          </div>
        </div>
        
        <button class="help-button" @click="close">
          Let's Create!
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const close = () => emit('close')
</script>

<style scoped>
.help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.help-modal {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid rgba(99, 102, 241, 0.5);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.2);
}

.help-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.help-header h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.help-content {
  margin-bottom: 1.5rem;
}

.intro {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
}

.step-num {
  width: 28px;
  height: 28px;
  background: rgba(99, 102, 241, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: #a5b4fc;
  flex-shrink: 0;
}

.step-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  line-height: 1.4;
}

.step-text strong {
  color: #a5b4fc;
}

.help-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  border-radius: 0.5rem;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.help-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(99, 102, 241, 0.4);
}
</style>
