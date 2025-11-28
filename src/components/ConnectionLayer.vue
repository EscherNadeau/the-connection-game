<template>
  <svg 
    v-if="hasValidConnections" 
    class="connections-layer" 
    style="overflow: visible"
  >
    <!-- Connection lines - simplified for performance -->
    <line
      v-for="connection in connections"
      :key="connection.id"
      :x1="connection.fromItem ? connection.fromItem.x : 0"
      :y1="connection.fromItem ? connection.fromItem.y : 0"
      :x2="connection.toItem ? connection.toItem.x : 0"
      :y2="connection.toItem ? connection.toItem.y : 0"
      :stroke="getConnectionColor(connection)"
      :stroke-width="isOnPath(connection) ? 4 : 2.5"
      :opacity="getConnectionOpacity(connection)"
      stroke-linecap="round"
      class="connection-line"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConnectionLayerProps, Connection } from '../types/game'

const props = defineProps<ConnectionLayerProps>()

// Computed properties
const hasValidConnections = computed(() => {
  return props.connections && props.connections.length > 0 && 
         props.connections.some(conn => conn.fromItem && conn.toItem)
})

// Check if connection is on highlighted path
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
  return '#4CAF50' // Default green
}

function getConnectionOpacity(connection: Connection): number {
  const ids = props.highlightPathIds || []
  const hasPathHighlight = Array.isArray(ids) && ids.length > 0
  
  if (isOnPath(connection)) return 1
  if (hasPathHighlight) return 0.15
  return 0.5
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
  contain: layout style;
}

.connection-line {
  /* No transitions or animations for performance */
}
</style>
