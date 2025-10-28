<template>
  <div class="custom-builder">
    <!-- Header -->
    <div class="header">
      <div class="header-left"></div>
      <h1>🎮 Custom Game Builder</h1>
      <div class="controls">
        <button class="play-btn" @click="playGame">▶️ Play Game</button>
        <button class="clear-btn" @click="clearGame">🗑️ Clear All</button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Sidebar -->
      <div class="sidebar">
        <h3>Game Modes</h3>
        <div class="mode-grid">
          <div 
            v-for="mode in gameModes" 
            :key="mode.id"
            class="mode-card"
            draggable="true"
            @dragstart="onModeDragStart(mode)"
          >
            <div class="mode-icon">{{ mode.icon }}</div>
            <div class="mode-name">{{ mode.name }}</div>
          </div>
        </div>

        <h3>Settings</h3>
        <div class="settings-grid">
          <div 
            v-for="setting in gameSettings" 
            :key="setting.id"
            class="setting-card"
            draggable="true"
            @dragstart="onSettingDragStart(setting)"
          >
            <div class="setting-icon">{{ setting.icon }}</div>
            <div class="setting-name">{{ setting.name }}</div>
          </div>
        </div>
      </div>

      <!-- Canvas Area -->
      <div class="canvas-area">
        <div 
          class="canvas"
          @dragover.prevent
          @drop="onCanvasDrop"
        >
          <div 
            v-for="element in gameElements" 
            :key="element.id"
            class="game-element"
            :style="{ left: element.x + 'px', top: element.y + 'px' }"
            @mousedown="startElementDrag($event, element)"
          >
            <div class="element-header">
              <span class="element-icon">{{ element.icon }}</span>
              <span class="element-name">{{ element.name }}</span>
              <button class="remove-btn" @click="removeElement(element.id)">×</button>
            </div>
            <div class="element-content">
              <div v-if="element.content && element.content.length > 0" class="content-list">
                <div 
                  v-for="(item, index) in element.content" 
                  :key="index"
                  class="content-item"
                >
                  {{ item }}
                  <button @click="removeContentItem(element.id, index)">×</button>
                </div>
              </div>
              <div v-else class="empty-content">
                Drag items here or click to edit
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Element Editor Modal -->
    <div v-if="editingElement" class="modal-overlay" @click="closeElementBuilder">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit {{ editingElement.name }}</h3>
          <button class="close-btn" @click="closeElementBuilder">×</button>
        </div>
        <div class="modal-body">
          <div class="search-section">
            <SearchPanel @add-item="addContentItem" />
          </div>
          <div class="content-section">
            <h4>Current Content:</h4>
            <div class="content-list">
              <div 
                v-for="(item, index) in editingElement.content" 
                :key="index"
                class="content-item"
              >
                {{ item }}
                <button @click="removeContentItem(editingElement.id, index)">×</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="save-btn" @click="saveElement">Save Changes</button>
          <button class="cancel-btn" @click="closeElementBuilder">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchPanel from './SearchPanel.vue'

export default {
  name: 'CustomModeFlow',
  components: {
    SearchPanel
  },
  data() {
    return {
      gameModes: [
        { id: 'goal', name: 'Goal Mode', icon: '🎯', description: 'Complete specific objectives' },
        { id: 'knowledge', name: 'Knowledge Mode', icon: '🧠', description: 'Answer questions and learn' },
        { id: 'hybrid', name: 'Hybrid Mode', icon: '⚡', description: 'Combination of goal and knowledge' }
      ],
      gameSettings: [
        { id: 'time-limit', name: 'Time Limit', icon: '⏱️' },
        { id: 'difficulty', name: 'Difficulty', icon: '📊' },
        { id: 'powerups', name: 'Powerups', icon: '💫' },
        { id: 'multiplayer', name: 'Multiplayer', icon: '👥' }
      ],
      gameElements: [],
      draggingElement: null,
      editingElement: null,
      dragState: {
        isDragging: false,
        startX: 0,
        startY: 0,
        elementStartX: 0,
        elementStartY: 0
      }
    }
  },
  methods: {
    onModeDragStart(mode) {
      this.draggingElement = { ...mode, type: 'mode' }
    },
    onSettingDragStart(setting) {
      this.draggingElement = { ...setting, type: 'setting' }
    },
    onCanvasDrop(event) {
      event.preventDefault()
      if (!this.draggingElement) return

      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const newElement = {
        id: Date.now().toString(),
        ...this.draggingElement,
        x: x - 50, // Center the element
        y: y - 25,
        content: []
      }

      this.gameElements.push(newElement)
      this.draggingElement = null
    },
    startElementDrag(event, element) {
      this.dragState.isDragging = true
      this.dragState.startX = event.clientX
      this.dragState.startY = event.clientY
      this.dragState.elementStartX = element.x
      this.dragState.elementStartY = element.y
      this.draggingElement = element

      document.addEventListener('mousemove', this.onElementDrag)
      document.addEventListener('mouseup', this.onElementDragEnd)
    },
    onElementDrag(event) {
      if (!this.dragState.isDragging) return

      const deltaX = event.clientX - this.dragState.startX
      const deltaY = event.clientY - this.dragState.startY

      this.draggingElement.x = this.dragState.elementStartX + deltaX
      this.draggingElement.y = this.dragState.elementStartY + deltaY
    },
    onElementDragEnd() {
      this.dragState.isDragging = false
      this.draggingElement = null
      document.removeEventListener('mousemove', this.onElementDrag)
      document.removeEventListener('mouseup', this.onElementDragEnd)
    },
    removeElement(elementId) {
      this.gameElements = this.gameElements.filter(el => el.id !== elementId)
    },
    clearGame() {
      this.gameElements = []
    },
    editElement(element) {
      this.editingElement = { ...element }
    },
    closeElementBuilder() {
      this.editingElement = null
    },
    addContentItem(item) {
      if (this.editingElement) {
        this.editingElement.content.push(item)
      }
    },
    removeContentItem(elementId, itemIndex) {
      if (this.editingElement && this.editingElement.id === elementId) {
        this.editingElement.content.splice(itemIndex, 1)
      } else {
        const element = this.gameElements.find(el => el.id === elementId)
        if (element) {
          element.content.splice(itemIndex, 1)
        }
      }
    },
    saveElement() {
      const index = this.gameElements.findIndex(el => el.id === this.editingElement.id)
      if (index !== -1) {
        this.gameElements[index] = { ...this.editingElement }
      }
      this.closeElementBuilder()
    },
    playGame() {
      if (this.gameElements.length === 0) {
        alert('Please add some game elements first!')
        return
      }
      console.log('Playing game with elements:', this.gameElements)
      // TODO: Implement actual game play logic
    }
  }
}
</script>

<style scoped>
.custom-builder {
  height: 100vh;
  background: linear-gradient(145deg, #002a33, #2d3a2e);
  color: white;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
  padding-left: 150px; /* Space for back button (30px + 120px for button width) */
}

.header-left {
  width: 120px; /* Space for back button */
}

.header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  text-align: center;
  flex: 1;
}

.controls {
  display: flex;
  gap: 15px;
}

.play-btn, .clear-btn {
  padding: 10px 20px;
  background: rgba(0, 255, 0, 0.2);
  color: white;
  border: 2px solid rgba(0, 255, 0, 0.4);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.clear-btn {
  background: rgba(255, 0, 0, 0.2);
  border-color: rgba(255, 0, 0, 0.4);
}

.play-btn:hover, .clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Main Content */
.main-content {
  display: flex;
  height: calc(100vh - 80px);
}

/* Sidebar */
.sidebar {
  width: 300px;
  background: rgba(0, 0, 0, 0.4);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  overflow-y: auto;
}

.sidebar h3 {
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 15px 0;
  color: #00ff88;
}

.mode-grid, .settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 30px;
}

.mode-card, .setting-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 15px;
  text-align: center;
  cursor: grab;
  transition: all 0.2s ease;
}

.mode-card:hover, .setting-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.mode-icon, .setting-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.mode-name, .setting-name {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Canvas Area */
.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.canvas {
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20px 20px, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(145deg, #001a1f, #1a2a1f);
  background-size: 40px 40px;
  position: relative;
}

/* Game Elements */
.game-element {
  position: absolute;
  width: 200px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: move;
  z-index: 100;
}

.game-element:hover {
  border-color: rgba(0, 255, 136, 0.6);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.element-header {
  display: flex;
  align-items: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.element-icon {
  font-size: 1.2rem;
  margin-right: 8px;
}

.element-name {
  flex: 1;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.remove-btn {
  background: rgba(255, 0, 0, 0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.element-content {
  padding: 10px;
  min-height: 60px;
}

.content-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.content-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 5px 8px;
  border-radius: 2px;
  font-size: 0.8rem;
}

.content-item button {
  background: rgba(255, 0, 0, 0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  cursor: pointer;
  font-size: 0.6rem;
}

.empty-content {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  text-align: center;
  padding: 20px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(145deg, #002a33, #2d3a2e);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.close-btn {
  background: rgba(255, 0, 0, 0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.content-section h4 {
  margin: 0 0 10px 0;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #00ff88;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.save-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.save-btn {
  background: rgba(0, 255, 0, 0.3);
  color: white;
  border: 2px solid rgba(0, 255, 0, 0.4);
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.save-btn:hover, .cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>

