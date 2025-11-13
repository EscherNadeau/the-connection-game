<template>
  <div class="controller-screen">
    <div class="top-bar">
      <div class="room">Room: {{ roomCode || '—' }}</div>
      <div class="connection-status" :class="{ connected: collabConnected }">
        {{ collabConnected ? (gameStarted || gameAlreadyRunning ? 'Connected/Running' : 'Connected') : 'Disconnected' }}
      </div>
      <div class="status" v-if="statusMsg">{{ statusMsg }}</div>
    </div>

    <div v-if="!profileReady" class="profile-setup">
      <div class="card">
        <h2 class="title">Join as…</h2>
        <label class="label">Name</label>
        <input class="input" v-model="profileName" maxlength="20" placeholder="Your name" />

        <label class="label">Color</label>
        <div class="colors">
          <button
            v-for="c in colors"
            :key="c"
            class="color"
            :class="{ 
              selected: c === profileColor, 
              taken: usedColors.includes(c) && c !== profileColor,
              available: !usedColors.includes(c) || c === profileColor
            }"
            :style="{ 
              background: c, 
              outline: (c===profileColor?'2px solid #fff':'none'),
              opacity: usedColors.includes(c) && c !== profileColor ? 0.3 : 1
            }"
            :disabled="usedColors.includes(c) && c !== profileColor"
            @click="selectColor(c)"
          >
            <span v-if="usedColors.includes(c) && c !== profileColor" class="taken-indicator">✗</span>
          </button>
        </div>

        <button class="go" :disabled="!profileName || !profileColor" @click="saveProfile">Continue</button>
      </div>
    </div>

    <div v-else class="content">
      <div class="prompt" v-if="prompt">{{ prompt }}</div>
      
      <!-- Waiting state when user has answered but game hasn't started -->
      <div v-if="hasAnswered && !gameStarted && !gameAlreadyRunning" class="waiting-state">
        <div class="waiting-message">Please wait...</div>
        <div class="waiting-subtitle">Waiting for game to start</div>
        <button class="start-game-btn" @click="startGame" :disabled="!canStartGame">
          Start Game
        </button>
      </div>
      
      <!-- Mobile Game Stats -->
      <GameStats 
        v-if="gameStarted || gameAlreadyRunning"
        :game-mode="currentGameMode" 
        :is-mobile="true"
      />
      
      <!-- Search panel when game is running or no answer given -->
      <SearchPanel
        v-if="!hasAnswered || gameStarted || gameAlreadyRunning"
        v-model="searchQuery"
        :results="searchResults"
        :disabled="false"
        :placeholder="searchPlaceholder"
        :getType="getDisplayType"
        @input-keyup="handleSearchInput"
        @select="selectSearchResult"
        @clear="clearSearch"
        @image-error="handleImageError"
      />
      
      <!-- Mobile controller - no popups needed -->
    </div>
  </div>
</template>

<script>
import SearchService from '../services/game/SearchService.ts'
import { normalizeMediaType } from '../utils/constants.ts'
import SearchPanel from '../components/SearchPanel.vue'
import { useFiltersStore } from '@store/filters.store.ts'
import { useGameStateStore } from '@store/gameState.store.ts'
import { getRandomQuestion } from '../services/game/questions.ts'
import config from '@/config/env'
import { debug, warn, error as logError } from '../services/ui/log.ts'

export default {
  name: 'ControllerView',
  components: { SearchPanel },
  emits: ['game-started'],
  data() {
    return {
      profileReady: false,
      profileName: '',
      profileColor: '',
      colors: ['#FF5252','#FFA726','#7E57C2','#66BB6A','#42A5F5','#AB47BC','#EC407A','#26C6DA','#8D6E63','#78909C'],
      prompt: '',
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      searchTimeout: null,
      roomCode: null,
      statusMsg: '',
      hasAnswered: false,
      canStartGame: false,
      gameAlreadyRunning: false,
      usedColors: [],
      hasAddedItem: false,
      gameStarted: false, // Local flag for game state
      currentGameMode: 'goal', // Default game mode
    }
  },
  computed: {
    gameState() {
      try {
        const gs = useGameStateStore()
        return gs.gameStatus
      } catch (err) {
        debug('Failed to get game status', { error: err })
        return 'idle'
      }
    },
    collabConnected() {
      try {
        const gs = useGameStateStore()
        return gs.collabConnected
      } catch (err) {
        debug('Failed to get collab connection status', { error: err })
        return false
      }
    },
    searchPlaceholder() {
      if (this.gameStarted || this.gameAlreadyRunning) {
        return 'Search and add items to the board'
      }
      return 'Search for your answer...'
    }
  },
  watch: {
    gameState(newStatus) {
      // Clear prompt when game status changes to playing
      if (newStatus === 'playing') {
        this.prompt = ''
        // Force immediate update
        this.$forceUpdate()
      }
    }
  },
  methods: {
    getResultImage(result) {
      if (result && result.image) return result.image
      try {
        const od = result && result.originalData ? result.originalData : {}
        const path = od.poster_path || od.profile_path || od.backdrop_path || ''
        if (path) return `https://image.tmdb.org/t/p/original${path}`
      } catch (err) {
        // Failed to extract image path - return empty string
        debug('Failed to get result image', { error: err })
      }
      return ''
    },
    saveProfile() {
      if (!this.profileName || !this.profileColor) return
      try {
        const gs = useGameStateStore()
        if (gs.collabConnected) {
          gs.sendCollab('action', { kind: 'profile', name: String(this.profileName || '').trim(), color: String(this.profileColor || '').trim() })
        }
      } catch (err) {
        warn('Failed to send profile to collab', { error: err })
      }
      try { 
        localStorage.setItem('controllerProfile', JSON.stringify({ name: this.profileName, color: this.profileColor })) 
      } catch (err) {
        // localStorage may be unavailable - continue without persistence
      }
      this.profileReady = true
      this.setStatus('Joined')
      // Request prompt only; host will publish
      try {
        const gs = useGameStateStore()
        if (gs.collabConnected) gs.sendCollab('action', { kind: 'prompt_request' })
      } catch (err) {
        debug('Failed to request prompt', { error: err })
      }
      
      // Clear prompt after 10 seconds as fallback (game should start by then)
      setTimeout(() => {
        if (this.prompt) {
          this.prompt = ''
        }
      }, 10000)
      
      // Also check periodically if game has started (items on board)
      this._gameCheckInterval = setInterval(() => {
        try {
          const gs = useGameStateStore()
          if (gs.gameItems && gs.gameItems.length > 0 && this.prompt) {
            this.prompt = ''
          }
        } catch (err) {
          // Game state check failed - non-critical
          debug('Failed to check game state', { error: err })
        }
      }, 500) // Check every 500ms for faster response
    },
    setStatus(msg) {
      this.statusMsg = msg
      clearTimeout(this._st)
      this._st = setTimeout(() => (this.statusMsg = ''), 2000)
    },
    getDisplayType(result) {
      const t = normalizeMediaType(result.type)
      if (t === 'movie') return 'Movie'
      if (t === 'tv') return 'TV Show'
      if (t === 'person') return 'Person'
      return 'Unknown'
    },
    handleSearchInput() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout)
      if (this.searchQuery.trim().length < 2) {
        this.searchResults = []
        return
      }
      // Don't clear results immediately - let the new search replace them
      this.searchTimeout = setTimeout(() => {
        this.performSearch()
      }, 300)
    },
    async performSearch() {
      if (!this.searchQuery.trim()) {
        this.searchResults = []
        return
      }
      this.isSearching = true
      try {
        const filtersStore = useFiltersStore()
        const castFilter = filtersStore.cast || 'mixed'
        filtersStore.setMediaType('all')
        const searchResult = await SearchService.search(this.searchQuery, {
          castFilter,
          mediaType: 'all',
        })
        this.searchResults = searchResult.success ? searchResult.results.slice(0, 8) : []
        debug('Search completed', { 
          query: this.searchQuery, 
          resultCount: this.searchResults.length 
        })
      } catch (err) {
        logError('Search error', { error: err, query: this.searchQuery })
        this.searchResults = []
      } finally {
        this.isSearching = false
      }
    },
    clearSearch() {
      this.searchResults = []
      this.searchQuery = ''
    },
    selectColor(color) {
      // Only allow selection of available colors
      if (!this.usedColors.includes(color) || color === this.profileColor) {
        this.profileColor = color
      }
    },
    handleImageError(event) {
      event.target.style.display = 'none'
    },
    selectSearchResult(result) {
      try {
        const gs = useGameStateStore()
        // Build gameItem like host would
        const gameItem = {
          id: `search-${Date.now()}`,
          title: result.title || result.name,
          type: result.type,
          image: result.image,
          year: result.year,
          tmdbData: result.originalData,
        }
        
        // Log player submission details
        debug('Phone submit', {
          playerName: this.profileName,
          answer: result.title || result.name,
          colorHex: this.profileColor
        })
        
        if (gs.collabConnected) {
          // Attach the user's chosen color and name to the item for board styling
          if (this.profileColor) gameItem.accentColor = this.profileColor
          if (this.profileName) gameItem.addedBy = this.profileName
          
          // Log what's being sent
          debug('Sending to PC', {
            kind: 'add',
            itemTitle: gameItem.title,
            addedBy: gameItem.addedBy,
            accentColor: gameItem.accentColor
          })
          
          gs.sendCollab('action', { kind: 'add', item: gameItem })
          // Only send answer for waiting room display if game hasn't started yet
          if (!this.gameStarted && !this.gameAlreadyRunning) {
            const title = result.title || result.name || ''
            const image = this.getResultImage(result)
            gs.sendCollab('action', { kind: 'answer', title, image })
            // Mark as answered for waiting room
            this.hasAnswered = true
            // Enable start game button after a short delay
            setTimeout(() => {
              this.canStartGame = true
            }, 1000)
          } else {
            // Game is running, mark as added item
            this.hasAddedItem = true
            this.gameStarted = true
          }
          this.setStatus('Sent • Add')
          // Clear prompt immediately when we add an item
          this.prompt = ''
        } else {
          this.setStatus('Not connected')
        }
      } catch (err) {
        logError('Error selecting search result', { error: err })
        this.setStatus('Error')
      }
      this.clearSearch()
    },
    startGame() {
      try {
        const gs = useGameStateStore()
        if (gs.collabConnected) {
          gs.sendCollab('action', { kind: 'start_game' })
          this.setStatus('Game started!')
          this.canStartGame = false
          this.hasAnswered = false
          this.hasAddedItem = false
          this.gameStarted = true
        } else {
          this.setStatus('Not connected')
        }
      } catch (err) {
        logError('Error starting game', { error: err })
        this.setStatus('Error starting game')
      }
    },
  },
  mounted() {
    try {
      const gs = useGameStateStore()
      gs.setRoomCodeFromHash()
      this.roomCode = gs.roomCode
      if (this.roomCode) {
        debug('Controller: Connecting to room', { roomCode: this.roomCode })
        gs.connectCollab(config.wsUrl)
      } else {
        warn('Controller: No room code found')
        this.setStatus('No room code')
      }
      // Clear the prompt when the host starts the game and broadcasts state
      try { gs.setCollabHandlers({ 
        onState: (state) => { 
          debug('Controller: Received state', { 
            itemCount: state?.items?.length || 0,
            connectionCount: state?.connections?.length || 0
          })
          // Check if game has already started (has items)
          if (state && state.items && state.items.length > 0) {
            this.prompt = ''
            // Skip waiting state if game is already running
            this.hasAnswered = false
            this.canStartGame = false
            this.hasAddedItem = false
            this.gameAlreadyRunning = true
            this.gameStarted = true
            this.setStatus('Game already running')
            // Force immediate update
            this.$forceUpdate()
          }
        },
        onRoster: (payload) => {
          // Update used colors from roster
          if (payload && payload.players) {
            this.usedColors = payload.players.map(p => p.color).filter(c => c)
          }
        }, 
        onAction: (payload) => {
          debug('Controller: Received action', { kind: payload?.kind })
          if (payload && payload.kind === 'prompt' && typeof payload.text === 'string') {
            this.prompt = payload.text
          }
          // Clear prompt when game starts (when items are added to the board)
          if (payload && payload.kind === 'add') {
            this.prompt = ''
            // Also clear immediately when any item is added
            this.$nextTick(() => {
              this.prompt = ''
            })
          }
          // Clear prompt when game state changes (game starts)
          if (payload && payload.kind === 'game_start') {
            this.prompt = ''
          }
          // Handle game started event from server
          if (payload && payload.kind === 'game_started') {
            this.prompt = ''
            this.hasAnswered = false
            this.canStartGame = false
            this.hasAddedItem = false
            this.gameStarted = true
            this.setStatus('Game started!')
            // Don't emit game-started - phone should stay on controller screen
            // this.$emit('game-started')
          }
          // Handle color assignment from server
          if (payload && payload.kind === 'color_assigned') {
            this.profileColor = payload.assignedColor
            this.usedColors = payload.usedColors || []
            this.setStatus(`Color changed to ${payload.assignedColor}`)
          }
          // Handle game ended from server
          if (payload && payload.kind === 'game_ended') {
            this.setStatus('Game ended')
            // Reset all game state
            this.gameStarted = false
            this.gameAlreadyRunning = false
            this.hasAnswered = false
            this.canStartGame = false
            this.hasAddedItem = false
            this.prompt = ''
            // Clean up URL - remove room code from hash
            try {
              if (window.location.hash) {
                window.location.hash = ''
              }
            } catch (err) {
              // Failed to clear hash - non-critical
              debug('Failed to clear location hash', { error: err })
            }
            // Force update to show the reset UI
            // Game ended - no popup needed on mobile
          }
          // Handle connection events from PC - no popups needed on mobile
          // Handle win/lose events from PC - no popups needed on mobile
        }
      }) } catch (err) {
        warn('Failed to set collab handlers', { error: err })
      }
      // Do not auto-skip the profile screen; only prefill fields
      try {
        const p = JSON.parse(localStorage.getItem('controllerProfile') || 'null')
        if (p && p.name && p.color) {
          this.profileName = p.name
          this.profileColor = p.color
        }
      } catch (err) {
        // Failed to load saved profile - continue without it
        debug('Failed to load saved profile', { error: err })
      }
    } catch (err) {
      logError('Error in Controller mounted', { error: err })
    }
  },
  beforeUnmount() {
    // Clean up interval
    if (this._gameCheckInterval) {
      clearInterval(this._gameCheckInterval)
      this._gameCheckInterval = null
    }
  },
}
</script>

<style scoped>
.controller-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #192D38;
  color: #fff;
  position: relative;
}
.profile-setup { padding: 16px; display: flex; justify-content: center; }
.card { width: 100%; max-width: 480px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 16px; }
.title { margin: 0 0 12px 0; font-size: 1.2rem; }
.label { display: block; margin: 12px 0 6px; opacity: 0.85; }
.input { width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.25); background: rgba(0,0,0,0.35); color: #fff; border-radius: 8px; }
.colors { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 6px; }
.color { 
  width: 100%; 
  height: 36px; 
  border-radius: 8px; 
  border: 1px solid rgba(255,255,255,0.35); 
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}
.color:disabled {
  cursor: not-allowed;
}
.color.taken {
  border-color: rgba(255, 0, 0, 0.5);
}
.color.available:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
}
.taken-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff0000;
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
}
.go { margin-top: 14px; width: 100%; padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.35); background: rgba(0,0,0,0.35); color: #fff; font-weight: 700; }
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255, 170, 90, 0.08);
  border-bottom: 1px solid rgba(255, 200, 140, 0.25);
}
.room { font-family: 'Fascinate', cursive; font-size: 0.95rem; letter-spacing: 0.06em; opacity: 0.95; }
.connection-status { 
  font-size: 0.85rem; 
  opacity: 0.7;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 0, 0, 0.2);
  color: #ff6b6b;
}
.connection-status.connected {
  background: rgba(0, 255, 0, 0.2);
  color: #4ecdc4;
}
.status { font-size: 0.85rem; opacity: 0.85; }
.content { padding: 12px; }
.prompt { padding: 8px 10px; margin: 8px 0 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 0.95rem; }
/* Ensure SearchPanel results drop below on mobile controller */
:deep(.search-container) { position: relative; }
:deep(.search-results) { top: 100%; bottom: auto; }
/* Warmer accents for inputs */
:deep(.search-input) { background: rgba(255, 200, 140, 0.08); border-color: rgba(255, 200, 140, 0.3); }
:deep(.search-result-item:hover) { background: rgba(255, 200, 140, 0.12); }

/* Waiting state styles */
.waiting-state {
  text-align: center;
  padding: 40px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 20px 0;
}

.waiting-message {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
  animation: pulse 2s ease-in-out infinite;
}

.waiting-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24px;
}

.start-game-btn {
  background: linear-gradient(135deg, #3c4640, #303b35);
  border: 1px solid rgba(46, 204, 113, 0.3);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.start-game-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4a5a52, #3c4640);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
  transform: translateY(-2px);
}

.start-game-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

</style>


