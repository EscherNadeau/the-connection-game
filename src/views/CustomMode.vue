<template>
  <div class="custom-mode-screen">
    <div class="custom-mode-header">
      <button class="back-btn" @click="$emit('back')">←</button>
      <h2>Custom Mode</h2>
    </div>

    <div class="custom-mode-content">
      <p>Build your own connection chain</p>

      <!-- Simple form for now -->
      <div class="form-group">
        <label>Starting Point:</label>
        <select v-model="config.startType">
          <option>Random Movie</option>
          <option>Random Show</option>
          <option>Random Actor</option>
        </select>
      </div>

      <div class="form-group">
        <label>Time Limit:</label>
        <select v-model="config.timeLimit">
          <option :value="0">No limit</option>
          <option :value="60">1 minute</option>
          <option :value="300">5 minutes</option>
          <option :value="600">10 minutes</option>
        </select>
      </div>

      <button class="start-btn" @click="startGame">Start Custom Game</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomModeScreen',
  data() {
    return {
      config: {
        startType: 'Random Movie',
        timeLimit: 300,
      },
    }
  },
  emits: ['back', 'start-game'],
  methods: {
    startGame() {
      this.$emit('start-game', this.config)
    },
  },
}
</script>

<style scoped>
.custom-mode-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #191a1f;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.custom-mode-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: none;
  color: #4caf50;
  font-size: 2rem;
  cursor: pointer;
  margin-right: 1rem;
  padding: 0.5rem;
}

.custom-mode-header h2 {
  font-size: 2rem;
  color: #ffffff;
}

.custom-mode-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.custom-mode-content p {
  font-size: 1.2rem;
  color: #cccccc;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
  width: 100%;
  max-width: 300px;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.form-group select {
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2b30;
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  color: #ffffff;
  font-size: 1rem;
}

.start-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.start-btn:hover {
  background-color: #45a049;
}
</style>
