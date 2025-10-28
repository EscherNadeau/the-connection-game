<template>
  <div class="controller-view">
    <div class="controller-header">
      <h1>{{ modeTitle }} Controller</h1>
      <div class="connection-info">
        <div class="room-code">Room: {{ roomCode }}</div>
        <div class="player-name">Player: {{ playerName }}</div>
        <div class="debug-info">
          <div>Mobile: {{ isMobile }}</div>
          <div>PlayType: {{ playType }}</div>
          <div>Mode: {{ modeTitle }}</div>
          <div>Room: {{ roomCode }}</div>
          <div>URL: {{ currentUrl }}</div>
        </div>
      </div>
    </div>

    <div class="controller-content">
      <!-- Multi Mode Controller -->
      <div v-if="playType === 'couch-multiplayer'" class="multi-controller">
        <div class="controller-info">
          <h3>🎮 Collaborative Controller</h3>
          <p>Add items to the shared game board on the TV</p>
        </div>

        <div class="search-section">
          <div class="search-header">
            <h4>Search & Add Items</h4>
            <div class="search-stats">
              Items added: {{ itemsAdded }}/{{ maxItems }}
            </div>
          </div>
          
          <div class="search-input">
            <input 
              v-model="searchQuery" 
              @input="onSearchInput"
              placeholder="Search for movies, shows, or people..."
              class="search-field"
            />
            <button @click="clearSearch" class="clear-btn">Clear</button>
          </div>

          <div v-if="searchResults.length > 0" class="search-results">
            <div 
              v-for="item in searchResults" 
              :key="item.id"
              @click="addItem(item)"
              class="search-result-item"
            >
              <div class="item-poster">
                <img 
                  v-if="item.image" 
                  :src="item.image"
                  :alt="item.title || item.name"
                />
                <div v-else class="no-poster">No Image</div>
              </div>
              <div class="item-info">
                <div class="item-title">{{ item.title || item.name }}</div>
                <div class="item-year">{{ getItemYear(item) }}</div>
                <div class="item-type">{{ getItemType(item) }}</div>
              </div>
              <div class="add-btn">+</div>
            </div>
          </div>

          <div v-if="searchQuery && searchResults.length === 0" class="no-results">
            No results found for "{{ searchQuery }}"
          </div>
        </div>

        <div class="recent-items">
          <h4>Recently Added</h4>
          <div v-if="recentItems.length > 0" class="recent-list">
            <div 
              v-for="item in recentItems" 
              :key="item.id"
              class="recent-item"
            >
              <div class="item-poster">
                <img 
                  v-if="item.image" 
                  :src="item.image"
                  :alt="item.title || item.name"
                />
                <div v-else class="no-poster">No Image</div>
              </div>
              <div class="item-info">
                <div class="item-title">{{ item.title || item.name }}</div>
                <div class="item-year">{{ getItemYear(item) }}</div>
              </div>
            </div>
          </div>
          <div v-else class="no-recent">
            No items added yet
          </div>
        </div>
      </div>

      <!-- PVP Couch Controller -->
      <div v-else-if="playType === 'couch-pvp'" class="pvp-controller">
        <div class="controller-info">
          <h3>⚔️ PVP Controller</h3>
          <p>Your turn to play! Add items to your board</p>
        </div>

        <div class="turn-info">
          <div class="current-turn">
            <span class="turn-label">Current Turn:</span>
            <span class="turn-player">{{ currentTurnPlayer }}</span>
          </div>
          <div class="turn-timer" v-if="turnTimeLeft > 0">
            Time Left: {{ formatTime(turnTimeLeft) }}
          </div>
        </div>

        <div class="search-section">
          <div class="search-header">
            <h4>Search & Add Items</h4>
            <div class="search-stats">
              Your items: {{ playerItems }}/{{ maxItems }}
            </div>
          </div>
          
          <div class="search-input">
            <input 
              v-model="searchQuery" 
              @input="onSearchInput"
              placeholder="Search for movies, shows, or people..."
              class="search-field"
              :disabled="!isMyTurn"
            />
            <button @click="clearSearch" class="clear-btn">Clear</button>
          </div>

          <div v-if="!isMyTurn" class="waiting-turn">
            <div class="waiting-message">
              Waiting for {{ currentTurnPlayer }}'s turn...
            </div>
          </div>

          <div v-else-if="searchResults.length > 0" class="search-results">
            <div 
              v-for="item in searchResults" 
              :key="item.id"
              @click="addItem(item)"
              class="search-result-item"
            >
              <div class="item-poster">
                <img 
                  v-if="item.image" 
                  :src="item.image"
                  :alt="item.title || item.name"
                />
                <div v-else class="no-poster">No Image</div>
              </div>
              <div class="item-info">
                <div class="item-title">{{ item.title || item.name }}</div>
                <div class="item-year">{{ getItemYear(item) }}</div>
                <div class="item-type">{{ getItemType(item) }}</div>
              </div>
              <div class="add-btn">+</div>
            </div>
          </div>

          <div v-else-if="searchQuery && searchResults.length === 0" class="no-results">
            No results found for "{{ searchQuery }}"
          </div>
        </div>

        <div class="player-board">
          <h4>Your Board</h4>
          <div v-if="playerItems > 0" class="board-items">
            <div 
              v-for="item in playerBoardItems" 
              :key="item.id"
              class="board-item"
            >
              <div class="item-poster">
                <img 
                  v-if="item.image" 
                  :src="item.image"
                  :alt="item.title || item.name"
                />
                <div v-else class="no-poster">No Image</div>
              </div>
              <div class="item-info">
                <div class="item-title">{{ item.title || item.name }}</div>
                <div class="item-year">{{ getItemYear(item) }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty-board">
            No items on your board yet
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ControllerViewProps, ControllerViewEmits, SearchResult } from '../types/game'

const props = defineProps<ControllerViewProps>()
const emit = defineEmits<ControllerViewEmits>()

// Reactive data
const searchQuery = ref<string>('')

// Computed properties to use props
const modeTitle = computed(() => props.modeTitle)
const roomCode = computed(() => props.roomCode)
const playerName = computed(() => props.playerName)
const isMobile = computed(() => props.isMobile)
const playType = computed(() => props.playType)
const currentUrl = computed(() => props.currentUrl)
const itemsAdded = computed(() => props.itemsAdded)
const maxItems = computed(() => props.maxItems)
const searchResults = computed(() => props.searchResults)
const recentItems = computed(() => props.recentItems)
const currentTurnPlayer = computed(() => props.currentTurnPlayer)
const turnTimeLeft = computed(() => props.turnTimeLeft)
const playerItems = computed(() => props.playerItems)
const isMyTurn = computed(() => props.isMyTurn)
const playerBoardItems = computed(() => props.playerBoardItems)

// Methods
function onSearchInput(): void {
  emit('search-input', searchQuery.value)
}

function addItem(item: SearchResult): void {
  emit('add-item', item)
}

function clearSearch(): void {
  searchQuery.value = ''
  emit('clear-search')
}

function getItemYear(item: SearchResult): string {
  return item.year ? item.year.toString() : 'Unknown'
}

function getItemType(item: SearchResult): string {
  const types: Record<string, string> = {
    movie: 'Movie',
    tv: 'TV Show',
    person: 'Person',
  }
  return types[item.type] || 'Unknown'
}

function formatTime(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.controller-view {
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  min-height: 100vh;
}

.controller-header {
  text-align: center;
  margin-bottom: 30px;
}

.controller-header h1 {
  font-size: 2rem;
  margin-bottom: 15px;
  color: #4CAF50;
}

.connection-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.room-code, .player-name {
  font-size: 1.1rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.debug-info {
  margin-top: 15px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.debug-info div {
  margin-bottom: 4px;
}

.controller-content {
  max-width: 800px;
  margin: 0 auto;
}

.controller-info {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.controller-info h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #4CAF50;
}

.controller-info p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.search-section {
  margin-bottom: 30px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.search-header h4 {
  font-size: 1.3rem;
  color: #4CAF50;
}

.search-stats {
  background: rgba(76, 175, 80, 0.2);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #4CAF50;
}

.search-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-field {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.search-field::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  padding: 12px 20px;
  background: rgba(244, 67, 54, 0.8);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.clear-btn:hover {
  background: rgba(244, 67, 54, 1);
}

.search-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
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

.item-poster {
  width: 50px;
  height: 75px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-poster {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-year {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2px;
}

.item-type {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.add-btn {
  width: 30px;
  height: 30px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.recent-items {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.recent-items h4 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #4CAF50;
}

.recent-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.recent-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.recent-item .item-poster {
  width: 40px;
  height: 60px;
  margin-bottom: 8px;
}

.recent-item .item-title {
  font-size: 12px;
  text-align: center;
  margin-bottom: 4px;
}

.recent-item .item-year {
  font-size: 10px;
  text-align: center;
}

.no-recent {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.turn-info {
  background: rgba(255, 193, 7, 0.1);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(255, 193, 7, 0.3);
  margin-bottom: 20px;
}

.current-turn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.turn-label {
  font-weight: 600;
  color: #FFC107;
}

.turn-player {
  font-size: 1.1rem;
  font-weight: bold;
  color: #FFC107;
}

.turn-timer {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #FFC107;
}

.waiting-turn {
  text-align: center;
  padding: 40px 20px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.waiting-message {
  font-size: 1.1rem;
  color: #FFC107;
  font-weight: 600;
}

.player-board {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.player-board h4 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #4CAF50;
}

.board-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.board-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.board-item .item-poster {
  width: 50px;
  height: 75px;
  margin-bottom: 8px;
}

.board-item .item-title {
  font-size: 12px;
  text-align: center;
  margin-bottom: 4px;
}

.board-item .item-year {
  font-size: 10px;
  text-align: center;
}

.empty-board {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* Responsive design */
@media (max-width: 768px) {
  .controller-view {
    padding: 15px;
  }
  
  .controller-header h1 {
    font-size: 1.5rem;
  }
  
  .search-results {
    grid-template-columns: 1fr;
  }
  
  .recent-list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .board-items {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
