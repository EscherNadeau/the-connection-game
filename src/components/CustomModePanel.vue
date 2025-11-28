<template>
  <div class="custom-settings-screen">
    <!-- Background Image -->
    <div
      class="settings-background"
      :style="{ backgroundImage: `url(../movie_titles/${backgroundImage})` }"
    ></div>

    <!-- Content Container -->
    <div class="settings-content">
      <!-- Header -->
      <div class="custom-settings-header">
        <button class="back-button" @click="goBackFromCustomSettings">
          <span class="back-text">← BACK</span>
        </button>
        <h2 class="custom-title">Custom Mode</h2>
        <button class="import-button" @click="handleImport">
          <span class="import-text">IMPORT</span>
        </button>
      </div>

      <!-- Info Screen Overlay -->
      <div v-if="showInfo" class="info-overlay">
        <div class="info-content">
          <div class="info-header">
            <button class="info-back-button" @click="showInfo = false">
              <span class="info-back-text">← BACK</span>
            </button>
            <h2 class="info-title">Welcome to Custom Mode</h2>
          </div>
          <div class="info-text">
            <p>
              Welcome to the Custom Mode! Here you can create your own unique connection challenges.
            </p>

            <h3>How to Use:</h3>
            <ol>
              <li>
                <strong>Add Goals:</strong> Use the search bar to find movies, shows, or people to
                connect
              </li>
              <li><strong>Choose Game Type:</strong> Select from Goal, Knowledge, or Anti</li>
              <li>
                <strong>Configure Settings:</strong> Set time limits, knowledge targets, or cast
                filters
              </li>
              <li>
                <strong>Start Playing:</strong> Click START CUSTOM GAME to begin your challenge
              </li>
            </ol>

            <h3>Game Types:</h3>
            <ul>
              <li>
                <strong>Goal Mode:</strong> Connect from point A to B to C. Can be enhanced with
                Path Mode rules for harder challenges
              </li>

              <li><strong>Knowledge Mode:</strong> Answer questions about cast and filmography</li>
              <li><strong>Anti Mode:</strong> Avoid connections - first to connect loses!</li>
            </ul>

            <h3>Cast Filter Options:</h3>
            <ul>
              <li><strong>Mixed (Default):</strong> Connect to anyone - actors, directors, etc.</li>
              <li><strong>Actor Only:</strong> Only connect to male actors</li>
              <li><strong>Actress Only:</strong> Only connect to female actors</li>
            </ul>

            <h3>Tips:</h3>
            <ul>
              <li>Add multiple goals for extended gameplay</li>
              <li>Use custom time limits for your preferred pace</li>
              <li>Experiment with different mode combinations</li>
              <li>Share your custom games with the Import feature</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Goal Builder Section -->
      <div class="goal-builder">
        <h3 class="builder-title">Build Your Connection Chain</h3>
        <p class="builder-description">Search for movies, shows, or people to create your goals</p>

        <!-- Search Section -->
        <div class="search-section">
          <div class="search-bar">
            <input
              type="text"
              class="search-input"
              placeholder="Search for movies, shows, or people..."
              v-model="searchQuery"
              @input="handleSearch"
              @keypress="handleKeyPress"
            />
            <input
              type="number"
              class="random-goals-number"
              v-model="randomGoalsCount"
              min="1"
              max="20"
              placeholder="5"
              @input="validateRandomGoalsCount"
            />
            <button class="random-goals-button" @click="generateRandomGoals">🎲</button>
          </div>

          <!-- Search Results -->
          <div class="search-results" v-if="searchResults.length > 0">
            <div
              v-for="result in searchResults"
              :key="`${result.type}-${result.id}`"
              class="search-result-item"
              @click="addGoal(result)"
            >
              <div class="search-result-image">
                <img loading="lazy" decoding="async" v-if="result.image" :src="result.image" :alt="result.name" />
                <div v-else class="search-result-icon">
                  {{ getTypeIcon(result.type) }}
                </div>
              </div>
              <div class="search-result-info">
                <h5>{{ result.name }}</h5>
                <p>{{ result.type }} • {{ result.year || 'Unknown' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Goals List -->
        <div class="goals-section">
          <h4 class="goals-title">Your Goals (in order)</h4>
          <div class="goals-instruction">💡 Drag and drop goals to reorder them</div>
          <div class="goals-list">
            <div v-if="goals.length === 0" class="no-goals">
              No goals added yet. Start searching to build your chain!
            </div>
            <div
              v-for="(goal, index) in goals"
              :key="`goal-${index}`"
              class="goal-item"
              :class="{
                dragging: draggedGoal && draggedGoal.index === index,
                'drag-over': draggedOverIndex === index,
              }"
              draggable="true"
              @dragstart="startDrag($event, goal, index)"
              @dragover="onDragOver($event, index)"
              @dragleave="onDragLeave"
              @drop="onDrop($event, index)"
            >
              <div class="goal-number">{{ index + 1 }}</div>
              <div class="goal-info">
                <h5>{{ goal.name }}</h5>
                <p>{{ goal.type }} • {{ goal.year || 'Unknown' }}</p>
              </div>
              <div class="goal-actions">
                <button class="drag-handle" title="Drag to reorder">⋮⋮</button>
                <button class="remove-goal" @click="removeGoal(index)">×</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Settings Panels -->
        <div class="settings-panels">
          <!-- Game Type Settings Panel -->
          <div class="settings-panel">
            <h4 class="panel-title">Game Type Settings</h4>
            <div class="setting-item no-bottom-margin">
              <label class="setting-label">Game Type:</label>
              <div class="game-type-buttons">
                <button
                  v-for="type in gameTypes"
                  :key="type.id"
                  class="game-type-btn"
                  :class="{ active: selectedGameType === type.id }"
                  @click="selectGameType(type.id)"
                >
                  {{ type.name }}
                </button>
              </div>
            </div>
          </div>

          <!-- Advanced Settings Panel -->
          <div class="settings-panel">
            <h4 class="panel-title">Advanced Settings</h4>

            <!-- Cast Filter Setting (Available for all modes) -->
            <div class="setting-item">
              <label class="setting-label">Cast Filter:</label>
              <select class="setting-select" v-model="castFilter">
                <option value="mixed">Mixed (Anyone)</option>
                <option value="actorOnly">Actor Only (Male)</option>
                <option value="actressOnly">Actress Only (Female)</option>
              </select>
            </div>

            <!-- Timer Setting -->
            <div class="setting-item">
              <label class="setting-label">Timer (minutes):</label>
              <input
                type="number"
                class="setting-input"
                v-model="timerMinutes"
                min="0"
                max="60"
                placeholder="0 (no timer)"
              />
            </div>

            <!-- Knowledge Mode Settings -->
            <div v-if="selectedGameType === 'knowledge'" class="setting-item">
              <label class="setting-label">Knowledge Target:</label>
              <input
                type="number"
                class="setting-input"
                v-model="knowledgeTarget"
                min="1"
                max="20"
                placeholder="5"
              />
            </div>
          </div>
        </div>

        <!-- Start Game Button -->
        <div class="start-game-section">
          <button 
            class="start-custom-game-btn" 
            @click="startCustomGame"
            :disabled="goals.length === 0"
          >
            START CUSTOM GAME
          </button>
        </div>
      </div>
      </div>
      </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CustomModeSettingsProps, CustomModeSettingsEmits, CustomGoal, GameType, SearchResult } from '../types/game'

const props = defineProps<CustomModeSettingsProps>()
const emit = defineEmits<CustomModeSettingsEmits>()

// Reactive data
const showInfo = ref<boolean>(false)
const searchQuery = ref<string>('')
const searchResults = ref<SearchResult[]>([])
const goals = ref<CustomGoal[]>([])
const randomGoalsCount = ref<number>(5)
const selectedGameType = ref<string>('goal')
const castFilter = ref<string>('mixed')
const timerMinutes = ref<number>(0)
const knowledgeTarget = ref<number>(5)
const draggedGoal = ref<CustomGoal | null>(null)
const draggedOverIndex = ref<number>(-1)

// Game types
const gameTypes = ref<GameType[]>([
  { id: 'goal', name: 'Goal Mode', description: 'Connect from point A to B to C' },
  { id: 'knowledge', name: 'Knowledge Mode', description: 'Answer questions about cast and filmography' },
  { id: 'anti', name: 'Anti Mode', description: 'Avoid connections - first to connect loses!' },
])

// Computed properties
const backgroundImage = computed(() => props.backgroundImage)

// Methods
function goBackFromCustomSettings(): void {
      emit('back')
    }

function handleImport(): void {
  emit('import-game')
}

function handleSearch(): void {
  // Search logic would go here
  // For now, just clear results
  searchResults.value = []
}

function handleKeyPress(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    handleSearch()
  }
}

function validateRandomGoalsCount(): void {
  if (randomGoalsCount.value < 1) randomGoalsCount.value = 1
  if (randomGoalsCount.value > 20) randomGoalsCount.value = 20
}

function generateRandomGoals(): void {
  // Random goals generation logic would go here
}

function addGoal(result: SearchResult): void {
  const goal: CustomGoal = {
    id: result.id,
    name: result.name,
    type: result.type,
    year: result.year,
    image: result.image,
    index: goals.value.length,
  }
  goals.value.push(goal)
}

function removeGoal(index: number): void {
  goals.value.splice(index, 1)
  // Update indices
  goals.value.forEach((goal, i) => {
    goal.index = i
  })
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    movie: '🎬',
    tv: '📺',
    person: '🎭',
  }
  return icons[type] || '❓'
}

function startDrag(event: DragEvent, goal: CustomGoal, index: number): void {
  draggedGoal.value = { ...goal, index }
  event.dataTransfer?.setData('text/plain', index.toString())
}

function onDragOver(event: DragEvent, index: number): void {
  event.preventDefault()
  draggedOverIndex.value = index
}

function onDragLeave(): void {
  draggedOverIndex.value = -1
}

function onDrop(event: DragEvent, index: number): void {
  event.preventDefault()
  const dragIndex = parseInt(event.dataTransfer?.getData('text/plain') || '0')
  
  if (dragIndex !== index) {
    // Reorder goals
    const draggedItem = goals.value[dragIndex]
    if (draggedItem) {
      goals.value.splice(dragIndex, 1)
      goals.value.splice(index, 0, draggedItem)
      
      // Update indices
      goals.value.forEach((goal, i) => {
        goal.index = i
      })
    }
  }
  
  draggedOverIndex.value = -1
  draggedGoal.value = null
}

function selectGameType(typeId: string): void {
  selectedGameType.value = typeId
}

function startCustomGame(): void {
  if (goals.value.length === 0) return
  
  const gameData = {
    goals: goals.value,
    gameType: selectedGameType.value,
    castFilter: castFilter.value,
    timerMinutes: timerMinutes.value,
    knowledgeTarget: knowledgeTarget.value,
  }
  
  emit('start-custom-game', gameData)
}
</script>

<style scoped>
.custom-settings-screen {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
}

.settings-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.3;
  z-index: 1;
}

.settings-content {
  position: relative;
  z-index: 2;
  height: 100vh;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.custom-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(0, 0, 0, 0.9);
  border-bottom: 2px solid #4CAF50;
}

.back-button, .import-button {
  padding: 10px 20px;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4CAF50;
  border-radius: 6px;
  color: #4CAF50;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover, .import-button:hover {
  background: rgba(76, 175, 80, 0.3);
  transform: translateY(-1px);
}

.custom-title {
  font-size: 2rem;
  color: #4CAF50;
  margin: 0;
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.info-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-content {
  background: rgba(30, 30, 30, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(76, 175, 80, 0.3);
}

.info-title {
  font-size: 1.5rem;
  color: #4CAF50;
  margin: 0;
}

.info-text {
  padding: 20px;
  line-height: 1.6;
}

.info-text h3 {
  color: #4CAF50;
  margin-top: 20px;
  margin-bottom: 10px;
}

.info-text ul, .info-text ol {
  margin-left: 20px;
}

.info-text li {
  margin-bottom: 8px;
}

.goal-builder {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.builder-title {
  font-size: 1.8rem;
  color: #4CAF50;
  margin-bottom: 10px;
  text-align: center;
}

.builder-description {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.search-section {
  margin-bottom: 30px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 16px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.random-goals-number {
  width: 80px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  text-align: center;
}

.random-goals-button {
  padding: 12px 16px;
  background: rgba(255, 193, 7, 0.8);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.random-goals-button:hover {
  background: rgba(255, 193, 7, 1);
}

.search-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(76, 175, 80, 0.5);
  transform: translateY(-2px);
}

.search-result-image {
  width: 50px;
  height: 75px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.search-result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.search-result-icon {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.search-result-info h5 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result-info p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.goals-section {
  margin-bottom: 30px;
}

.goals-title {
  font-size: 1.3rem;
  color: #4CAF50;
  margin-bottom: 10px;
}

.goals-instruction {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 15px;
  font-size: 14px;
}

.goals-list {
  min-height: 100px;
}

.no-goals {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 10px;
  transition: all 0.2s ease;
}

.goal-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(76, 175, 80, 0.5);
}

.goal-item.dragging {
  opacity: 0.5;
}

.goal-item.drag-over {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.goal-number {
  width: 30px;
  height: 30px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.goal-info {
  flex: 1;
}

.goal-info h5 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.goal-info p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.goal-actions {
  display: flex;
  gap: 8px;
}

.drag-handle {
  padding: 8px;
  background: rgba(255, 193, 7, 0.8);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: grab;
  font-size: 12px;
}

.drag-handle:hover {
  background: rgba(255, 193, 7, 1);
}

.remove-goal {
  width: 30px;
  height: 30px;
  background: rgba(244, 67, 54, 0.8);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-goal:hover {
  background: rgba(244, 67, 54, 1);
}

.settings-panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.settings-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  font-size: 1.2rem;
  color: #4CAF50;
  margin-bottom: 20px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item.no-bottom-margin {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #4CAF50;
}

.game-type-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.game-type-btn {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.game-type-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(76, 175, 80, 0.5);
}

.game-type-btn.active {
  background: rgba(76, 175, 80, 0.2);
  border-color: #4CAF50;
  color: #4CAF50;
}

.setting-select, .setting-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
}

.setting-select option {
  background: #2a2a2a;
  color: white;
}

.start-game-section {
  text-align: center;
  margin-top: 40px;
}

.start-custom-game-btn {
  padding: 15px 40px;
  background: #4CAF50;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.start-custom-game-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.start-custom-game-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .custom-settings-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .goal-builder {
    padding: 20px;
  }
  
  .search-bar {
    flex-direction: column;
  }
  
  .search-results {
    grid-template-columns: 1fr;
  }
  
  .settings-panels {
    grid-template-columns: 1fr;
  }
  
  .game-type-buttons {
    flex-direction: column;
  }
  
  .goal-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .goal-actions {
    align-self: flex-end;
  }
}
</style>
