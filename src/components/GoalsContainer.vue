<template>
  <div class="goals-section">

    <!-- Goal Queue Status (only show when goals exist) -->
    <div v-if="goals.length > 0" class="goal-queue-status">
      <div class="status-info">
        <span class="status-label">Goal Queue:</span>
        <span class="status-value"
          >{{ goals.length }} goal{{ goals.length !== 1 ? 's' : '' }} ready</span
        >
      </div>
      <div class="queue-preview">
        <span class="preview-label">Order:</span>
        <div class="goal-order">
          <span
            v-for="(goal, index) in goals"
            :key="goal.id"
            class="goal-number"
            :class="{ 'first-goal': index === 0 }"
          >
            {{ index + 1 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Global vs Individual Settings Toggle (only for Knowledge mode) -->
    <div v-if="selectedType === 'knowledge'" class="settings-toggle">
      <div class="toggle-header">
        <span class="toggle-title">Global vs Individual Settings</span>
        <span class="toggle-info" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false"
          >ⓘ</span
        >
        <div v-if="showTooltip" class="tooltip">
          <strong>Global:</strong> All goals use the same settings below<br />
          <strong>Individual:</strong> Each goal can have its own custom settings
        </div>
      </div>
      <div class="toggle-section">
        <button
          @click="handleIndividualToggle"
          :class="['simple-toggle', { active: useIndividualSettings }]"
        >
          <span class="toggle-knob"></span>
        </button>
        <span class="toggle-text">{{
          useIndividualSettings ? 'Individual settings ON' : 'Individual settings OFF'
        }}</span>
      </div>

      <!-- Number inputs right next to toggle -->
      <div class="number-inputs">
        <div class="number-input-group">
          <label>Connections:</label>
          <input
            type="number"
            :value="globalKnowledgeFilms"
            @input="handleGlobalKnowledgeFilmsChange"
            placeholder="3"
            class="small-number-input"
            min="1"
            max="20"
          />
        </div>
      </div>
    </div>

    <!-- Search Bar (auto-search on input) -->
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="Search for movies, TV shows, or people..."
        class="search-input"
      />
    </div>

    <!-- Search Results -->
    <div v-if="results && results.length > 0" class="search-results">
      <h4>Search Results:</h4>
      <div class="results-container">
        <div
          v-for="result in results"
          :key="result.id"
          class="search-result-item"
          @click="addSearchResult(result)"
        >
          <div class="search-result-image">
            <img loading="lazy" decoding="async" v-if="result.image" :src="result.image" :alt="result.name" />
            <div v-else class="search-result-icon">
              {{ getResultIcon(result.type) }}
            </div>
          </div>
          <div class="search-result-info">
            <h5>{{ result.name }}</h5>
            <p>{{ getResultTypeName(result.type) }} • {{ result.year || 'Unknown' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Goals List -->
    <div class="goals-list">
      <h4>Your Goals ({{ goals.length }}) - Drag to reorder</h4>
      <div v-if="selectedType === 'hybrid'" class="hybrid-instructions">
        <span class="instruction-icon">💡</span>
        <span class="instruction-text">Drag a goal onto another to nest it as a sub-goal</span>
      </div>
      <!-- queue-info removed per request -->
      <div class="goals-container">
        <div v-if="goals.length === 0" class="empty-goals">
          <div class="empty-icon">🎯</div>
          <p>No goals added yet. Use the search above to add your first goal!</p>
        </div>
        <template v-for="(goal, index) in goals" :key="goal.id">
          <!-- Gap drop zone before each item -->
          <div
            class="gap-drop"
            @dragover.prevent
            @dragenter.prevent="gapDragOver($event)"
            @dragleave="gapDragLeave($event)"
            @drop.prevent="$emit('drop-gap', index)"
          ></div>
            <GoalItem
              :goal="goal"
              :index="index"
              :goal-number="index + 1"
              :is-hybrid-mode="selectedType === 'hybrid'"
              :is-knowledge-mode="selectedType === 'knowledge'"
              :use-individual-settings="useIndividualSettings"
              :is-dragging="!!(draggedGoal && draggedGoal.id === goal.id)"
              :is-drag-over="!!(draggedOverIndex === index && draggedGoal && draggedGoal.id !== goal.id)"
              :is-dragged-over="draggedOverIndex === index"
              @drag-start="handleDragStart"
              @drop="handleDrop"
              @drag-enter="handleDragEnter"
              @drag-leave="handleDragLeave"
              @remove="handleRemoveGoal"
              @promote-sub-goal="handlePromoteSubGoal"
              @remove-sub-goal="handleRemoveSubGoal"
              @drag-start-sub="$emit('drag-start-sub', $event)"
              @update-goal-settings="handleUpdateGoalSettings"
            />
        </template>
        <!-- Trailing gap at end for append -->
        <div
          v-if="goals.length > 0"
          class="gap-drop end"
          @dragover.prevent
          @dragenter.prevent="gapDragOver($event)"
          @dragleave="gapDragLeave($event)"
          @drop.prevent="$emit('drop-gap', goals.length)"
        ></div>
      </div>
    </div>

    
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import GoalItem from './GoalItem.vue'
import type { GoalsContainerProps, GoalsContainerEmits, GoalData, SearchResult } from '../types/game'

const props = defineProps<GoalsContainerProps>()
const emit = defineEmits<GoalsContainerEmits>()

// Reactive data
const searchQuery = ref<string>('')
const results = ref<SearchResult[]>([])
const showTooltip = ref<boolean>(false)
const draggedGoal = ref<GoalData | null>(null)
const draggedOverIndex = ref<number>(-1)

// Computed properties
const useIndividualSettings = computed(() => props.useIndividualSettings)

// Methods
function handleIndividualToggle(): void {
  // Toggle logic would go here
}

function handleGlobalKnowledgeFilmsChange(event: Event): void {
  const target = event.target as HTMLInputElement
  parseInt(target.value) || 3
  // Update logic would go here
}

function handleSearch(): void {
  // Search logic would go here
}

function addSearchResult(_result: SearchResult): void {
  // Add result logic would go here
}

function getResultIcon(type: string): string {
  const icons: Record<string, string> = {
    movie: '🎬',
    tv: '📺',
    person: '🎭',
  }
  return icons[type] || '❓'
}

function getResultTypeName(type: string): string {
  const types: Record<string, string> = {
    movie: 'Movie',
    tv: 'TV Show',
    person: 'Person',
  }
  return types[type] || 'Unknown'
}

function handleDragStart(_event: DragEvent, goal: GoalData, _index: number): void {
  draggedGoal.value = goal
}

function handleDrop(_event: DragEvent, _index: number): void {
  // Drop logic would go here
}

function handleDragEnter(_event: DragEvent, index: number): void {
  draggedOverIndex.value = index
}

function handleDragLeave(): void {
  draggedOverIndex.value = -1
}

function handleRemoveGoal(goal: GoalData): void {
  emit('remove-goal', goal)
}

function handlePromoteSubGoal(_data: any): void {
  // Promote logic would go here
}

function handleRemoveSubGoal(_data: any): void {
  // Remove sub-goal logic would go here
}

function handleUpdateGoalSettings(data: any): void {
  emit('update-goal-settings', data)
}

function gapDragOver(event: DragEvent): void {
  event.preventDefault()
}

function gapDragLeave(event: DragEvent): void {
  event.preventDefault()
}
</script>

<style scoped>
.goals-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.goal-queue-status {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-label {
  font-weight: 600;
  color: #4CAF50;
}

.status-value {
  color: #fff;
  font-weight: 500;
}

.queue-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.goal-order {
  display: flex;
  gap: 5px;
}

.goal-number {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.goal-number.first-goal {
  background: #4CAF50;
  color: white;
}

.settings-toggle {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.toggle-title {
  font-weight: 600;
  color: #fff;
}

.toggle-info {
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: help;
  position: relative;
}

.tooltip {
  position: absolute;
  top: 20px;
  left: 0;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
}

.toggle-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.simple-toggle {
  width: 40px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
}

.simple-toggle.active {
  background: #4CAF50;
}

.toggle-knob {
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
}

.simple-toggle.active .toggle-knob {
  transform: translateX(20px);
}

.toggle-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.number-inputs {
  display: flex;
  gap: 15px;
}

.number-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.number-input-group label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  min-width: 80px;
}

.small-number-input {
  width: 60px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 14px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 16px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-results {
  margin-bottom: 20px;
}

.search-results h4 {
  color: #fff;
  margin-bottom: 15px;
  font-size: 18px;
}

.results-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.search-result-image {
  width: 40px;
  height: 40px;
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
  font-size: 16px;
}

.search-result-info h5 {
  color: #fff;
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.search-result-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 12px;
}

.goals-list h4 {
  color: #fff;
  margin-bottom: 15px;
  font-size: 18px;
}

.hybrid-instructions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.instruction-icon {
  font-size: 16px;
}

.instruction-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.goals-container {
  position: relative;
}

.empty-goals {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.empty-goals p {
  margin: 0;
  font-size: 16px;
}

.gap-drop {
  height: 20px;
  margin: 5px 0;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.gap-drop:hover {
  background: rgba(76, 175, 80, 0.1);
}

.gap-drop.end {
  height: 40px;
  border: 2px dashed rgba(76, 175, 80, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(76, 175, 80, 0.7);
  font-size: 14px;
}

.gap-drop.end::before {
  content: "Drop here to add at end";
}
</style>
