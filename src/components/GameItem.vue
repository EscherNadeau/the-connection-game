<template>
  <div
    class="game-item"
    :style="itemStyle"
    :class="{ 
      'starting-item': item.isStartingItem, 
      'dragging': item.isDragging, 
      'dimmed': isDimmed,
      'completed': itemState === 'completed',
      'current': itemState === 'current',
      'upcoming': itemState === 'upcoming',
      'locked': isLocked,
    }"
    @mousedown="handleMouseDown"
    @mouseup="$emit('mouseup', $event, item, index)"
    @mousemove="$emit('mousemove', $event, item, index)"
  >
    <!-- Hint Button (per-item) -->
    <button
      v-if="hintsEnabled"
      class="hint-btn"
      @mousedown.stop.prevent
      @mouseup.stop
      @click.stop.prevent="$emit('hint-click', item)"
      title="Hint"
    >
      💡
    </button>
    <div class="item-image">
      <img v-if="item.image" :src="item.image" :alt="item.title || item.name" @error="handleImageError" />
      <div v-else class="item-icon">{{ getItemIcon(item.type) }}</div>
    </div>
    <div class="item-info">
      <div class="item-title">{{ item.title }}</div>
      <div class="item-type" :class="{ 'actor-type': isActorType(item) }">
        {{ getDisplayType(item) }}{{ item.year ? ` • ${item.year}` : '' }}
      </div>
      <!-- Player Attribution for Multiplayer -->
      <div v-if="item.addedBy" class="player-attribution" :style="{ color: item.accentColor }">
        Added by {{ item.addedBy }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore
import { getGenderDisplayLabel } from '@/utils/constants.ts'
import type { GameItem, GameItemProps, GameItemEmits } from '../types/game'

const props = defineProps<GameItemProps>()
const emit = defineEmits<GameItemEmits>()

// Computed properties
const itemStyle = computed(() => {
  // Item.x/y are world-space centers; viewport transform handles pan/zoom
  const style: Record<string, string> = {
    position: 'absolute',
    left: `${props.item.x}px`,
    top: `${props.item.y}px`,
    transform: 'translate(-50%, -50%)',
  }
  if (props.item.accentColor) {
    style.border = `2px solid ${props.item.accentColor}`
    style.boxShadow = `0 0 12px ${props.item.accentColor}66`
  }
  return style
})

const isDimmed = computed(() => {
  const ids = props.highlightPathIds || []
  if (!Array.isArray(ids) || ids.length === 0) return false
  return !ids.includes(props.item.id)
})

const isLocked = computed(() => {
  return props.isQueueMode && (props.itemState === 'completed' || props.itemState === 'upcoming')
})

// Methods
function handleMouseDown(event: MouseEvent): void {
  // Prevent interaction with locked items
  if (isLocked.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('mousedown', event, props.item, props.index)
}

function getItemIcon(type: string): string {
  const icons: Record<string, string> = {
    movie: '🎬',
    tv: '📺',
    person: '🎭',
    goal: '🎯',
    knowledge: '🧠',
    anti: '🚫',
    hybrid: '🔗',
    zen: '🧘',
  }
  return icons[type] || '❓'
}

function getDisplayType(item: GameItem): string {
  const type = (item?.type || item?.tmdbData?.media_type || '').toString().toLowerCase()
  if (type === 'person') {
    const gender = item?.tmdbData?.gender
    return getGenderDisplayLabel(gender)
  }
  if (type === 'movie' || type === 'film') return 'Movie'
  if (type === 'tv' || type === 'tv show' || type === 'tv-show') return 'TV Show'
  if (type === 'goal') return 'Goal'
  if (type === 'knowledge') return 'Knowledge'
  if (type === 'anti') return 'Anti Goal'
  if (type === 'hybrid') return 'Hybrid Goal'
  if (type === 'zen') return 'Zen Mode'
  return type || 'Unknown'
}

function isActorType(item: GameItem): boolean {
  const type = (item?.type || item?.tmdbData?.media_type || '').toString().toLowerCase()
  return type === 'person'
}

// Handle image loading errors
function handleImageError(event: Event): void {
  const target = event.target as HTMLImageElement
  // Hide the broken image and show the icon instead
  target.style.display = 'none'
  const iconDiv = target.nextElementSibling as HTMLElement
  if (iconDiv && iconDiv.classList.contains('item-icon')) {
    iconDiv.style.display = 'flex'
  }
}
</script>

<style scoped>
.game-item {
  width: 140px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: grab;
  transition: box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  user-select: none;
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  will-change: transform, left, top;
}

.game-item.dimmed {
  opacity: 0.35;
  filter: grayscale(0.7) brightness(0.9);
}

.hint-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background 0.2s ease;
}

.hint-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.game-item:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.game-item.starting-item {
  border-color: rgba(255, 215, 0, 0.8);
  background: rgba(255, 215, 0, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.game-item.starting-item:hover {
  border-color: rgba(255, 215, 0, 1);
  background: rgba(255, 215, 0, 0.15);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.game-item.dragging {
  cursor: grabbing !important;
  transform: translate(-50%, -50%) scale(1.1) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5) !important;
  z-index: 100 !important;
  border-color: rgba(255, 215, 0, 1) !important;
  background: rgba(255, 215, 0, 0.2) !important;
  transition: none !important;
}

.item-image {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-icon {
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.item-info {
  padding: 4px;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.item-title {
  font-size: 0.65rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1px;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.item-type {
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: left;
  line-height: 1.1;
}

.item-type.actor-type {
  color: #4caf50;
}

.player-attribution {
  font-size: 0.5rem;
  font-weight: 600;
  margin-top: 2px;
  text-align: left;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.9;
}

/* Queue Mode Item States */
.game-item.completed {
  opacity: 0.4;
  filter: grayscale(60%);
  cursor: not-allowed;
  pointer-events: none;
}

.game-item.current {
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
  border-color: #4CAF50;
  animation: current-pulse 2s ease-in-out infinite;
}

.game-item.upcoming {
  display: none;
}

.game-item.locked {
  cursor: not-allowed;
  pointer-events: none;
}

@keyframes current-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.6); }
  50% { box-shadow: 0 0 30px rgba(76, 175, 80, 0.8); }
}
</style>
