<template>
  <div
    class="goal-item"
    :class="{
      dragging: isDragging,
      'drag-over': isDragOver,
      'has-sub-goals': hasSubGoals,
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragover.prevent
    @drop="handleDrop"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @mouseenter="onItemEnter"
    @mouseleave="onItemLeave"
    :data-index="index"
  >
    <div class="goal-image">
      <div class="goal-number">{{ goalNumber }}</div>
      <img v-if="goal.image" :src="goal.image" :alt="goal.title || goal.description" loading="lazy" decoding="async" />
      <div v-else class="goal-icon">
        {{
          getResultIcon(goal.type === 'item' ? 'person' : goal.type === 'connection' ? 'movie' : 'tv')
        }}
      </div>
      <div class="goal-overlay">
        <div class="goal-title">{{ goal.title }}</div>
        <div class="goal-type">{{ goal.type }}{{ goal.year ? ` • ${goal.year}` : '' }}</div>
      </div>

      <!-- Sub-goals indicator for Hybrid Mode (top-right icon removed to reduce clutter) -->
      <div v-if="false" class="sub-goals-indicator"></div>

      <!-- Drop Zone Indicator for Hybrid Mode -->
      <div
        v-if="isHybridMode && isDragOver"
        class="drop-zone-indicator"
        :class="{ active: isDragOver }"
      >
        <div class="drop-zone-text">
          <span class="drop-icon">🔗</span>
          <span class="drop-text">Drop to nest</span>
        </div>
      </div>
    </div>

    <!-- Individual Settings for Knowledge Mode -->
    <div v-if="isKnowledgeMode && useIndividualSettings" class="individual-settings">
      <div class="settings-label">Connections:</div>
      <input
        type="number"
        :value="goal.knowledgeCount || 3"
        @input="updateKnowledgeCount"
        class="knowledge-count-input"
        min="1"
        max="20"
        placeholder="3"
      />
    </div>

    <!-- Sub-goals summary below poster, and hover popover with list -->
    <div v-if="isHybridMode" class="sub-goals-summary">
      <template v-if="hasSubGoals">📋 Sub-goals ({{ goal.subGoals?.length || 0 }})</template>
      <template v-else>🔗 No sub-goals</template>
    </div>
    <Teleport to="body">
      <div
        v-if="isHybridMode && hasSubGoals && showPopover"
        class="sub-goals-popover visible"
        :style="popoverStyle"
        @mouseenter="keepPopover"
        @mouseleave="hidePopover"
      >
        <div class="sub-goals-header">
          <span class="sub-goals-title">Sub-Goals ({{ goal.subGoals?.length || 0 }})</span>
        </div>
        <div class="sub-goals-list">
          <div
            v-for="(subGoal, subIndex) in goal.subGoals"
            :key="`sub-${subIndex}`"
            class="sub-goal-item"
          >
            <div class="sub-goal-text" draggable="true" @dragstart.stop="onStartDragSub(subGoal, $event)" @click.stop="handlePromoteSubGoal(subGoal, subIndex)">
              <span class="sub-goal-title">{{ subGoal.title }}</span>
              <span class="sub-goal-type">{{ subGoal.type }}{{ subGoal.year ? ` • ${subGoal.year}` : '' }}</span>
            </div>
            <div class="sub-goal-actions">
              <span class="promote-indicator" title="Click to move back to main goals">⬆️</span>
              <button @click="handleRemoveSubGoal(subIndex)" class="remove-sub-btn">×</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <button @click="handleRemove" class="remove-btn">×</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GoalItemProps, GoalItemEmits, GoalData } from '../types/game'

const props = defineProps<GoalItemProps>()
const emit = defineEmits<GoalItemEmits>()

// Reactive data
const showPopover = ref<boolean>(false)
const popoverX = ref<number>(0)
const popoverY = ref<number>(0)

// Computed properties
const hasSubGoals = computed(() => {
  return props.goal.subGoals && props.goal.subGoals.length > 0
})

const popoverStyle = computed(() => {
  return {
    position: 'fixed' as const,
    top: `${popoverY.value}px`,
    left: `${popoverX.value}px`,
  }
})

// Methods
function getResultIcon(type: string): string {
  const icons: Record<string, string> = {
    movie: '🎬',
    tv: '📺',
    person: '👤',
  }
  return icons[type] || '🎯'
}

function handleDragStart(event: DragEvent): void {
  emit('drag-start', event, props.goal, props.index)
}

function handleDrop(event: DragEvent): void {
  emit('drop', event, props.index)
}

function handleDragEnter(event: DragEvent): void {
  emit('drag-enter', event, props.index)
}

function handleDragLeave(event: DragEvent): void {
  emit('drag-leave', event)
}

function handleRemove(): void {
  emit('remove', props.goal)
}

function handlePromoteSubGoal(subGoal: GoalData, subIndex: number): void {
  emit('promote-sub-goal', subGoal, subIndex)
}

function handleRemoveSubGoal(subIndex: number): void {
  emit('remove-sub-goal', subIndex)
}

function onStartDragSub(subGoal: GoalData, event: DragEvent): void {
  emit('drag-start-sub', subGoal, event)
}

function updateKnowledgeCount(event: Event): void {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value) || 3
  emit('update-goal-settings', {
    goal: props.goal,
    knowledgeCount: value,
  })
}

function onItemEnter(event: MouseEvent): void {
  if (props.isHybridMode && hasSubGoals.value) {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    popoverX.value = rect.right + 10
    popoverY.value = rect.top
    showPopover.value = true
  }
}

function onItemLeave(): void {
  setTimeout(() => {
    if (!showPopover.value) return
    showPopover.value = false
  }, 100)
}

function keepPopover(): void {
  // Keep popover visible
}

function hidePopover(): void {
  showPopover.value = false
}
</script>

<style scoped>
.goal-item {
  position: relative;
  width: 120px;
  height: 180px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.goal-item:hover {
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.goal-item.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.goal-item.drag-over {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.goal-item.has-sub-goals {
  border-color: #FF9800;
}

.goal-image {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.goal-number {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
}

.goal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goal-icon {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.goal-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 8px;
  color: white;
}

.goal-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-type {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.drop-zone-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(76, 175, 80, 0.2);
  border: 2px dashed #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.drop-zone-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #4CAF50;
  font-weight: 600;
}

.drop-icon {
  font-size: 24px;
}

.drop-text {
  font-size: 12px;
}

.individual-settings {
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.knowledge-count-input {
  width: 100%;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 12px;
}

.sub-goals-summary {
  padding: 4px 8px;
  background: rgba(255, 152, 0, 0.1);
  border-top: 1px solid rgba(255, 152, 0, 0.2);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.sub-goals-popover {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  min-width: 200px;
  max-width: 300px;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.sub-goals-header {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.sub-goals-title {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.sub-goals-list {
  max-height: 200px;
  overflow-y: auto;
}

.sub-goal-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sub-goal-item:last-child {
  border-bottom: none;
}

.sub-goal-text {
  flex: 1;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.sub-goal-text:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sub-goal-title {
  display: block;
  color: white;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 2px;
}

.sub-goal-type {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
}

.sub-goal-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.promote-indicator {
  font-size: 12px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.promote-indicator:hover {
  opacity: 1;
}

.remove-sub-btn {
  width: 16px;
  height: 16px;
  background: rgba(244, 67, 54, 0.8);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.remove-sub-btn:hover {
  background: rgba(244, 67, 54, 1);
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(244, 67, 54, 0.8);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  transition: background 0.2s ease;
}

.remove-btn:hover {
  background: rgba(244, 67, 54, 1);
}
</style>
