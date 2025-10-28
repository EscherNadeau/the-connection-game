<template>
  <div class="custom-mode-panel-container">
    <div class="custom-header">
      <h2>🎯 Custom Mode</h2>
      <button class="close-btn" @click="exitCustomMode">×</button>
    </div>

    <div class="custom-content">
      <div class="info-box">
        <h3>Coming Soon</h3>
        <p>Custom Mode is under development. Create your own challenge with:</p>
        <ul>
          <li>Custom starting points</li>
          <li>Time limits</li>
          <li>Connection rules</li>
          <li>Goal customization</li>
        </ul>
      </div>

      <div class="placeholder-actions">
        <button class="action-btn primary" @click="tryBasicMode">
          🎲 Use Zen Mode Instead
        </button>
        <button class="action-btn" @click="exitCustomMode">
          ← Back to Modes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CustomModePanelProps, CustomModePanelEmits } from '../types/game'

defineProps<CustomModePanelProps>()
const emit = defineEmits<CustomModePanelEmits>()

function exitCustomMode(): void {
  emit('back')
}

function tryBasicMode(): void {
  // Suggest trying Zen mode instead
  emit('back')
  // Could emit a mode selection event here if needed
}
</script>

<style scoped>
.custom-mode-panel-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.custom-header h2 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
}

.close-btn {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.custom-content {
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.info-box {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  text-align: center;
}

.info-box h3 {
  color: white;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.info-box p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.info-box ul {
  text-align: left;
  color: rgba(255, 255, 255, 0.7);
  display: inline-block;
  list-style: none;
  padding: 0;
}

.info-box li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.info-box li:before {
  content: "→";
  position: absolute;
  left: 0;
  color: rgba(255, 255, 255, 0.5);
}

.placeholder-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #5568d3 0%, #654896 100%);
}

/* Responsive */
@media (max-width: 768px) {
  .custom-header {
    padding: 1.5rem;
  }

  .custom-content {
    padding: 2rem 1.5rem;
  }

  .placeholder-actions {
    flex-direction: column;
    width: 100%;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
