<template>
  <svg 
    v-if="hasValidConnections" 
    class="connections-layer" 
    style="overflow: visible"
  >
    <!-- SVG Filters for shadows and glows -->
    <defs>
      <filter id="shadow-filter" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="rgba(0,0,0,0.3)" flood-opacity="0.6"/>
      </filter>
      <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="rgba(255,235,59,0.8)" flood-opacity="1"/>
        <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="rgba(255,235,59,0.4)" flood-opacity="1"/>
      </filter>
    </defs>
    
    <!-- Connection lines with improved styling -->
    <line
      v-for="connection in connections"
      :key="connection.id"
      :x1="connection.fromItem ? getItemCenter(connection.fromItem).x : 0"
      :y1="connection.fromItem ? getItemCenter(connection.fromItem).y : 0"
      :x2="connection.toItem ? getItemCenter(connection.toItem).x : 0"
      :y2="connection.toItem ? getItemCenter(connection.toItem).y : 0"
      :stroke="getConnectionColor(connection)"
      :stroke-width="getConnectionWidth(connection)"
      :opacity="getConnectionOpacity(connection)"
      :stroke-dasharray="getConnectionDashArray(connection)"
      :stroke-linecap="'round'"
      :stroke-linejoin="'round'"
      :filter="getConnectionFilter(connection)"
      class="connection-line"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GameItem, ConnectionLayerProps, Connection } from '../types/game'

const props = defineProps<ConnectionLayerProps>()

// Computed properties
const hasValidConnections = computed(() => {
  return props.connections && props.connections.length > 0 && 
         props.connections.some(conn => conn.fromItem && conn.toItem)
})

// Methods
function getItemCenter(item: GameItem): { x: number, y: number } {
  // Item.x/y are world coords; SVG is absolute in the same transformed viewport
  return { x: item.x, y: item.y }
}

function isOnPath(conn: Connection): boolean {
  const ids = props.highlightPathIds || []
  if (!Array.isArray(ids) || ids.length < 2) return false
  const a = conn.fromItem?.id
  const b = conn.toItem?.id
  for (let i = 0; i < ids.length - 1; i++) {
    const u = ids[i]
    const v = ids[i + 1]
    if ((a === u && b === v) || (a === v && b === u)) return true
  }
  return false
}

function getConnectionColor(connection: Connection): string {
  if (isOnPath(connection)) {
    return '#ffeb3b' // Bright yellow for highlighted path
  }
  
  // Different colors based on connection type
  switch (connection.type) {
    case 'cast':
      return '#4CAF50' // Green for cast connections
    case 'crew':
      return '#2196F3' // Blue for crew connections
    case 'genre':
      return '#FF9800' // Orange for genre connections
    case 'year':
      return '#9C27B0' // Purple for year connections
    case 'studio':
      return '#F44336' // Red for studio connections
    case 'custom':
      return '#607D8B' // Blue-grey for custom connections
    default:
      return '#4CAF50' // Default green
  }
}

function getConnectionWidth(connection: Connection): number {
  if (isOnPath(connection)) {
    return 4 // Thicker for highlighted path
  }
  return 2.5 // Normal thickness
}

function getConnectionOpacity(connection: Connection): number {
  const ids = props.highlightPathIds || []
  const hasPathHighlight = Array.isArray(ids) && ids.length > 0
  
  if (isOnPath(connection)) {
    return 1 // Full opacity for highlighted path
  }
  
  // If we're showing a path, make non-path connections very dim
  if (hasPathHighlight) {
    return 0.15 // Very dim for non-path connections when path is shown
  }
  
  return 0.4 // Normal opacity when no path is highlighted
}

function getConnectionDashArray(connection: Connection): string {
  if (isOnPath(connection)) {
    return '0' // Solid line for highlighted path
  }
  
  // Different dash patterns based on connection type
  switch (connection.type) {
    case 'cast':
      return '0' // Solid line
    case 'crew':
      return '5,5' // Dashed line
    case 'genre':
      return '10,5' // Longer dashes
    case 'year':
      return '3,3' // Short dashes
    case 'studio':
      return '8,4,2,4' // Complex pattern
    case 'custom':
      return '0' // Solid line
    default:
      return '0' // Solid line
  }
}

function getConnectionFilter(connection: Connection): string {
  if (isOnPath(connection)) {
    return 'url(#glow-filter)' // Use SVG filter for better compatibility
  }
  return 'url(#shadow-filter)' // Use SVG filter for better compatibility
}
</script>

<style scoped>
.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.connection-line {
  transition: all 0.3s ease;
  animation: connectionPulse 2s ease-in-out infinite alternate;
}

@keyframes connectionPulse {
  0% {
    opacity: 0.4;
  }
  100% {
    opacity: 0.6;
  }
}

/* Enhanced glow effects */
.connection-line[stroke="#ffeb3b"] {
  animation: highlightPulse 1s ease-in-out infinite alternate;
}

@keyframes highlightPulse {
  0% {
    opacity: 0.8;
    stroke-width: 4;
  }
  100% {
    opacity: 1;
    stroke-width: 5;
  }
}
</style>
