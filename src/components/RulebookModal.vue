<template>
  <Teleport to="body">
    <div v-if="isOpen" class="rulebook-overlay" @click.self="close">
      <div class="rulebook-modal">
        <div class="rulebook-header">
          <h2>How to Play</h2>
        </div>
        
        <div class="rulebook-content">
          <div class="rule-section">
            <div class="rule-icon">🔍</div>
            <div class="rule-text">
              <strong>Search</strong> for movies, TV shows, or actors
            </div>
          </div>
          
          <div class="rule-section">
            <div class="rule-icon">➕</div>
            <div class="rule-text">
              <strong>Click</strong> to add them to the board
            </div>
          </div>
          
          <div class="rule-section">
            <div class="rule-icon">🔗</div>
            <div class="rule-text">
              <strong>Connected</strong> items show lines automatically
            </div>
          </div>
          
          <div class="rule-divider"></div>
          
          <div class="modes-section">
            <h3>Game Modes</h3>
            <div class="mode-item">
              <span class="mode-icon">🎯</span>
              <span class="mode-name">Goal</span>
              <span class="mode-desc">Connect A to B</span>
            </div>
            <div class="mode-item">
              <span class="mode-icon">🧘</span>
              <span class="mode-name">Zen</span>
              <span class="mode-desc">Explore freely, no pressure</span>
            </div>
            <div class="mode-item">
              <span class="mode-icon">🎲</span>
              <span class="mode-name">Oddities</span>
              <span class="mode-desc">Special challenge modes</span>
            </div>
          </div>
        </div>
        
        <button class="rulebook-button" @click="close">
          Got It!
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
.rulebook-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.rulebook-modal {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid rgba(233, 69, 96, 0.5);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(233, 69, 96, 0.2);
}

.rulebook-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.rulebook-header h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.rulebook-content {
  margin-bottom: 1.5rem;
}

.rule-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
}

.rule-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.rule-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1.4;
}

.rule-text strong {
  color: #fff;
}

.rule-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 1rem 0;
}

.modes-section h3 {
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.mode-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.mode-icon {
  font-size: 1.25rem;
  width: 30px;
  text-align: center;
}

.mode-name {
  font-weight: 700;
  color: #fff;
  min-width: 70px;
}

.mode-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.rulebook-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #e94560, #c23a51);
  border: none;
  border-radius: 0.5rem;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.rulebook-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(233, 69, 96, 0.4);
}

@media (max-width: 480px) {
  .rulebook-modal {
    padding: 1.5rem;
  }
  
  .rulebook-header h2 {
    font-size: 1.5rem;
  }
}
</style>
