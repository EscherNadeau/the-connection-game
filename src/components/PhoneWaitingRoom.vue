<template>
  <div class="phone-waiting-room">
    <!-- Profile Setup Section -->
    <div v-if="!profileReady" class="profile-setup">
      <!-- Header -->
      <div class="phone-header">
        <h1>Join Game</h1>
        <div class="room-info">
          <div class="room-code">Room: {{ roomCode }}</div>
          <div class="game-mode">{{ gameModeLabel }}</div>
        </div>
      </div>
      <!-- Color Selection -->
      <div class="color-section">
        <h3>Pick Your Color</h3>
        <div class="color-grid">
          <div 
            v-for="color in availableColors" 
            :key="color.value"
            :class="['color-option', { selected: selectedColor === color.value, taken: color.taken }]"
            :style="{ backgroundColor: color.value }"
            @click="selectColor(color.value)"
          >
            <div v-if="color.taken" class="taken-indicator">✓</div>
          </div>
          
          <!-- Custom Color Picker Toggle -->
          <div class="color-option custom-picker" @click="showColorPicker = !showColorPicker">
            <div class="custom-gradient"></div>
            <div v-if="isCustomColor" class="custom-selected">✓</div>
          </div>
        </div>
        
        <!-- Interactive Color Picker -->
        <div v-if="showColorPicker" class="color-picker-modal">
          <div class="color-picker-content">
            <h4>Pick Your Color</h4>
            
            <!-- Hue Slider -->
            <div class="picker-section">
              <label>Hue</label>
              <input 
                type="range" 
                v-model="hue" 
                min="0" 
                max="360" 
                class="hue-slider"
                @input="updateColorFromHSL"
              />
            </div>
            
            <!-- Saturation Slider -->
            <div class="picker-section">
              <label>Saturation</label>
              <input 
                type="range" 
                v-model="saturation" 
                min="0" 
                max="100" 
                class="saturation-slider"
                @input="updateColorFromHSL"
              />
            </div>
            
            <!-- Lightness Slider -->
            <div class="picker-section">
              <label>Lightness</label>
              <input 
                type="range" 
                v-model="lightness" 
                min="0" 
                max="100" 
                class="lightness-slider"
                @input="updateColorFromHSL"
              />
            </div>
            
            <!-- Color Preview -->
            <div class="color-preview" :style="{ backgroundColor: previewColor }">
              <div class="preview-label">{{ previewColor }}</div>
            </div>
            
            <!-- Buttons -->
            <div class="picker-buttons">
              <button @click="applyCustomColor" class="apply-btn">Apply Color</button>
              <button @click="showColorPicker = false" class="cancel-picker-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Name Input -->
      <div class="name-section">
        <h3>Enter Your Name</h3>
        <input 
          v-model="playerName" 
          type="text" 
          placeholder="Your name..."
          class="name-input"
          maxlength="20"
        />
      </div>

      <!-- Question Section -->
      <div class="question-section">
        <h3>Answer This Question</h3>
        <div class="question-text">{{ currentQuestion }}</div>
        <div class="answer-input">
          <input 
            v-model="playerAnswer" 
            type="text" 
            placeholder="Your answer..."
            class="answer-field"
            @keyup.enter="submitAnswer"
            @input="onAnswerInput"
          />
          <button @click="submitAnswer" class="submit-btn" :disabled="!canSubmit">Submit</button>
        </div>
        
        <!-- Search Results Dropdown -->
        <div v-if="searchResults.length > 0" class="search-results">
          <div 
            v-for="result in searchResults" 
            :key="result.id"
            class="search-result-item"
            @click="selectSearchResult(result)"
          >
            <img 
              v-if="result.image" 
              :src="result.image" 
              :alt="result.title || result.name"
              class="result-image"
            />
            <div v-else class="result-placeholder">🎬</div>
            <div class="result-info">
              <div class="result-title">{{ result.title || result.name }}</div>
              <div class="result-year">{{ result.release_date || result.first_air_date || 'Unknown' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Continue Button -->
      <button 
        @click="finishProfile" 
        class="continue-btn"
        :disabled="!canContinue"
      >
        Ready to Play!
      </button>
    </div>

     <!-- Waiting Section -->
     <div v-else class="waiting-section">
       <!-- Simple Poster Wall Background -->
       <div class="poster-wall">
         <!-- Show empty message if no posters -->
         <div v-if="answerPosters.length === 0" class="empty-wall-message">
           <h3>Waiting for Players...</h3>
           <p>Players will appear here as they join and answer questions</p>
         </div>
         
         <!-- Player posters -->
         <div 
           v-for="poster in answerPosters" 
           :key="poster.id"
           class="wall-poster"
         >
           <img 
             v-if="poster.image" 
             :src="poster.image" 
             :alt="poster.title"
             class="wall-poster-image"
           />
           <div v-else class="wall-poster-placeholder">🎬</div>
           <div class="wall-poster-label">
             <div class="player-color-dot" :style="{ backgroundColor: poster.playerColor }"></div>
             {{ poster.playerName }}
           </div>
         </div>
         
         <!-- Empty slots for visual balance -->
         <div 
           v-for="n in Math.max(0, 8 - answerPosters.length)" 
           :key="`empty-${n}`"
           class="wall-poster empty-slot"
         >
           <div class="wall-poster-placeholder">🎬</div>
           <div class="wall-poster-label">Waiting...</div>
         </div>
       </div>

       <!-- Glass Box with Waiting Info -->
       <div class="waiting-glass-box">
         <div class="waiting-content">
           <h2>{{ isReady ? '✅ You\'re Ready!' : 'Ready to Play?' }}</h2>
           <div class="player-info">
             <div class="player-color" :style="{ backgroundColor: selectedColor }"></div>
             <span class="player-name">{{ playerName }}</span>
           </div>
           <div class="game-status">
             <div class="players-count">{{ playerCount }} player{{ playerCount > 1 ? 's' : '' }} in room ({{ readyCount }} ready)</div>
             <div class="status-text">{{ isHost ? (isReady ? 'Waiting for others...' : 'You\'re the host! Ready up to start.') : (isReady ? 'Waiting for host to start...' : 'Press ready when you\'re all set!') }}</div>
           </div>
           <button 
             v-if="isHost"
             @click="startGame" 
             :class="['start-btn', { disabled: readyCount < playerCount }]"
             :disabled="readyCount < playerCount"
           >
             {{ readyCount >= playerCount ? '▶️ Start Game' : `Waiting... (${readyCount}/${playerCount})` }}
           </button>
           <button 
             v-else
             @click="toggleReady" 
             :class="['ready-btn', { active: isReady }]"
           >
             {{ isReady ? '✅ Ready!' : '⏳ Ready Up' }}
           </button>
         </div>
       </div>
     </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
// @ts-ignore
import { useGameStateStore } from '@store/gameState.store.ts'
// @ts-ignore
import { multiplayerService } from '../services/MultiplayerService'
// @ts-ignore
import SearchService from '../services/game/SearchService.ts'
// @ts-ignore
import config from '@/config/env'
import type { PhoneWaitingRoomProps, PhoneWaitingRoomEmits } from '../types/game'

const props = defineProps<PhoneWaitingRoomProps>()
const emit = defineEmits<PhoneWaitingRoomEmits>()

const gameStateStore = useGameStateStore()

// Profile setup state
const selectedColor = ref('')
const playerName = ref('')
const playerAnswer = ref('')
const profileReady = ref(false)
const currentQuestion = ref('Loading question...')
const showColorPicker = ref(false)
const hue = ref(0)
const saturation = ref(100)
const lightness = ref(50)

// Game state
const roomCode = ref('')
const playerCount = ref(1)
const isConnected = ref(false)
const answerPosters = ref<any[]>([])
const searchResults = ref<any[]>([])
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const isReady = ref(false)
const readyCount = ref(0)

// Available colors - 7 nice clear preset colors
const availableColors = ref([
  { value: '#FF4757', name: 'Red', taken: false },      // Bright red
  { value: '#2ED573', name: 'Green', taken: false },    // Bright green  
  { value: '#3742FA', name: 'Blue', taken: false },     // Bright blue
  { value: '#FFA502', name: 'Orange', taken: false },   // Bright orange
  { value: '#FF6348', name: 'Coral', taken: false },     // Bright coral
  { value: '#5F27CD', name: 'Purple', taken: false },  // Bright purple
  { value: '#00D2D3', name: 'Cyan', taken: false },      // Bright cyan
])

const presetColors = ['#FF4757', '#2ED573', '#3742FA', '#FFA502', '#FF6348', '#5F27CD', '#00D2D3']

// Computed properties
const gameModeLabel = computed(() => {
  const playType = props.gameOptions?.playType || 'multi'
  return playType === 'couch-pvp' ? 'Couch PvP' : 'Couch Multiplayer'
})

const canSubmit = computed(() => {
  return playerAnswer.value.trim().length > 0
})

const canContinue = computed(() => {
  return selectedColor.value && 
         playerName.value.trim().length > 0 && 
         playerAnswer.value.trim().length > 0
})

const isCustomColor = computed(() => {
  return selectedColor.value && !presetColors.includes(selectedColor.value)
})

const isHost = computed(() => {
  // First player to join is the host
  return playerCount.value > 0 && gameStateStore.collabClientId && 
         gameStateStore.collabClientId === gameStateStore.hostId
})

const previewColor = computed(() => {
  return `hsl(${hue.value}, ${saturation.value}%, ${lightness.value}%)`
})

// Methods
const selectColor = (color: string) => {
  if (availableColors.value.find(c => c.value === color)?.taken) return
  selectedColor.value = color
}

const updateColorFromHSL = () => {
  // Convert HSL to hex for selectedColor
  const h = hue.value / 360
  const s = saturation.value / 100
  const l = lightness.value / 100
  
  let r, g, b
  
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  selectedColor.value = `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const applyCustomColor = () => {
  updateColorFromHSL()
  showColorPicker.value = false
  console.log('🎨 Custom color applied:', selectedColor.value)
}

const onAnswerInput = async () => {
  const query = playerAnswer.value.trim()
  
  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  if (query.length < 2) {
    searchResults.value = []
    return
  }
  
  // Debounce search
  searchTimeout.value = setTimeout(async () => {
    try {
      const searchResult = await SearchService.search(query, {
        mediaType: 'all',
        castFilter: 'mixed'
      })
      
      if (searchResult.success && searchResult.results) {
        searchResults.value = searchResult.results.slice(0, 5) // Show top 5 results
      } else {
        searchResults.value = []
      }
    } catch (error) {
      console.error('🔍 PhoneWaitingRoom: Search error:', error)
      searchResults.value = []
    }
  }, 300) // 300ms debounce
}

const selectSearchResult = (result: any) => {
  playerAnswer.value = result.title || result.name
  searchResults.value = [] // Clear search results
}

const submitAnswer = async () => {
  if (!canSubmit.value) return
  
  const answerText = playerAnswer.value.trim()
  
  try {
    // Search TMDB for the answer
    const searchResult = await SearchService.search(answerText, {
      mediaType: 'all',
      castFilter: 'mixed'
    })
    
    let answerData: any = {
      kind: 'answer',
      title: answerText,
      playerName: playerName.value.trim(),
      playerColor: selectedColor.value,
      image: null,
      tmdbId: null,
      mediaType: 'unknown'
    }
    
    if (searchResult.success && searchResult.results && searchResult.results.length > 0) {
      // Use the first result from TMDB
      const tmdbResult = searchResult.results[0]
      answerData.image = tmdbResult.image
      answerData.tmdbId = tmdbResult.id
      answerData.mediaType = tmdbResult.media_type
      answerData.title = tmdbResult.title || tmdbResult.name || answerText
      
      console.log('🔍 PhoneWaitingRoom: Found TMDB result:', tmdbResult)
    } else {
      console.log('🔍 PhoneWaitingRoom: No TMDB result found, using fallback')
      // Add a fallback image for testing
      answerData.image = 'https://image.tmdb.org/t/p/w500/placeholder.jpg'
    }
    
    // Send answer to server
    gameStateStore.sendCollab('action', answerData)
    
    // Add to local poster wall immediately - PREVENT DUPLICATES
    const posterData = {
      id: `answer-${answerData.playerName}-${answerData.playerColor}`, // Stable ID based on player name and color
      title: answerData.title,
      playerName: answerData.playerName,
      playerColor: answerData.playerColor,
      image: answerData.image,
      tmdbId: answerData.tmdbId,
      mediaType: answerData.mediaType
    }
    
    // Check if this player already has a poster (prevent duplicates)
    const existingPlayerIndex = answerPosters.value.findIndex(p => p.playerName === answerData.playerName)
    if (existingPlayerIndex !== -1) {
      // Replace existing poster instead of adding new one
      answerPosters.value[existingPlayerIndex] = posterData
      console.log('🔄 Updated existing player poster:', posterData)
    } else {
      // Add new player poster
      answerPosters.value.push(posterData)
      console.log('✅ Added new player poster:', posterData)
    }
    
    console.log('🔍 PhoneWaitingRoom: Image URL:', posterData.image)
    
    console.log('🔍 PhoneWaitingRoom: Submitted answer with TMDB data:', answerData)
  } catch (error) {
    console.error('🔍 PhoneWaitingRoom: Search error:', error)
    
    // Fallback: send answer without TMDB data
    gameStateStore.sendCollab('action', {
      kind: 'answer',
      title: answerText,
      playerName: playerName.value.trim(),
      playerColor: selectedColor.value,
      image: null,
      tmdbId: null,
      mediaType: 'unknown'
    })
    
    // Add to local poster wall - PREVENT DUPLICATES
    const fallbackPosterData = {
      id: `answer-${playerName.value.trim()}-${selectedColor.value}`, // Stable ID
      title: answerText,
      playerName: playerName.value.trim(),
      playerColor: selectedColor.value,
      image: null
    }
    
    // Check if this player already has a poster (prevent duplicates)
    const existingPlayerIndex = answerPosters.value.findIndex(p => p.playerName === playerName.value.trim())
    if (existingPlayerIndex !== -1) {
      // Replace existing poster instead of adding new one
      answerPosters.value[existingPlayerIndex] = fallbackPosterData
      console.log('🔄 Updated existing player poster (fallback):', fallbackPosterData)
    } else {
      // Add new player poster
      answerPosters.value.push(fallbackPosterData)
      console.log('✅ Added new player poster (fallback):', fallbackPosterData)
    }
  }
}

const finishProfile = () => {
  console.log('📱 finishProfile called, canContinue:', canContinue.value)
  
  if (!canContinue.value) {
    console.log('❌ Cannot continue - missing required fields')
    return
  }
  
  const profileData = {
    kind: 'profile',
    name: playerName.value.trim(),
    color: selectedColor.value,
    answer: playerAnswer.value.trim()
  }
  
  console.log('📤 Sending profile to server:', profileData)
  
  // Send profile to server
  gameStateStore.sendCollab('action', profileData)
  
  profileReady.value = true
  console.log('✅ Profile completed, profileReady:', profileReady.value)
}

const toggleReady = () => {
  isReady.value = !isReady.value
  
  // Send ready status to server
  gameStateStore.sendCollab('action', {
    kind: 'ready',
    isReady: isReady.value,
    playerName: playerName.value.trim()
  })
  
  console.log('🎮 PhoneWaitingRoom: Ready status:', isReady.value)
}

const startGame = () => {
  if (readyCount.value < playerCount.value) return
  
  // Host starts the game
  gameStateStore.sendCollab('action', {
    kind: 'game_started',
    isPvP: props.gameOptions?.playType === 'couch-pvp'
  })
  
  console.log('🎮 PhoneWaitingRoom: Host starting game')
}

// Removed addTestPoster function as it was unused

// Lifecycle
onMounted(() => {
  const roomCodeFromProps = props.gameOptions?.roomCode
  if (roomCodeFromProps) {
    roomCode.value = roomCodeFromProps
    gameStateStore.setRoomCode(roomCodeFromProps)
    
    // Set up collaboration handlers
    gameStateStore.setCollabHandlers({
      onState: (_payload: any) => {
        // Handle game state updates
      },
      onAction: (action: any) => {
        // Handle question from PC
        if (action.kind === 'prompt') {
          currentQuestion.value = action.text || 'Loading question...'
        }
        
        // Handle answer posters from other players
        if (action.kind === 'answer') {
          answerPosters.value.push({
            id: `answer-${Date.now()}-${Math.random()}`,
            title: action.title,
            playerName: action.playerName,
            image: action.image || null,
            tmdbId: action.tmdbId || null,
            mediaType: action.mediaType || 'unknown'
          })
        }
        
        // Handle game started
        if (action.kind === 'game_started') {
          console.log('🎮 PhoneWaitingRoom: Game started event received, transitioning to controller')
          // Transition to controller view
          gameStateStore.setCurrentView('controller')
        }
      },
      onPresence: (presence: any) => {
        playerCount.value = presence.count
      },
      onRoster: (roster: any) => {
        // Update taken colors based on roster
        availableColors.value.forEach(color => {
          color.taken = roster.players.some((p: any) => p.color === color.value)
        })
        
        // Update ready count
        if (roster.players) {
          readyCount.value = roster.players.filter((p: any) => p.ready === true).length
          playerCount.value = roster.players.length
          console.log('📋 PhoneWaitingRoom: Ready count:', readyCount.value, '/', playerCount.value)
        }
      }
    })
    
    // Connect to WebSocket
    gameStateStore.connectCollab(config.wsUrl)
    
    // Set connection status
    setTimeout(() => {
      isConnected.value = gameStateStore.collabConnected
    }, 1000)
  }
})

onUnmounted(() => {
  gameStateStore.disconnectCollab()
})
</script>

<style scoped>
.phone-waiting-room {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.phone-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.phone-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  color: #4fc3f7;
}

.room-info {
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: #ccc;
}

.profile-setup {
  position: relative;
  z-index: 10;
  max-width: 400px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
}

.color-section,
.name-section,
.question-section {
  margin-bottom: 2rem;
  position: relative;
}

.color-section h3,
.name-section h3,
.question-section h3 {
  margin: 0 0 1rem 0;
  color: #4fc3f7;
  font-size: 1.2rem;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.color-option {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.color-option:hover:not(.taken) {
  transform: scale(1.1);
  border-color: white;
}

.color-option.selected {
  border-color: white;
  box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.6);
}

.color-option.taken {
  opacity: 0.3;
  cursor: not-allowed;
}

.taken-indicator {
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

/* Custom Color Picker */
.custom-picker {
  position: relative;
  padding: 0;
  overflow: hidden;
  border: 3px solid #666 !important;
  cursor: pointer;
}

.custom-gradient {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ff0000, #ff00ff, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000);
}

.custom-picker:hover {
  border-color: #fff !important;
  transform: scale(1.1);
}

.custom-selected {
  position: absolute;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.8);
  z-index: 1;
  pointer-events: none;
}

/* Color Picker Modal */
.color-picker-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.color-picker-content {
  background: #1a1a1a;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  border: 2px solid #333;
}

.color-picker-content h4 {
  margin: 0 0 1.5rem 0;
  color: white;
  font-size: 1.3rem;
  text-align: center;
}

.picker-section {
  margin-bottom: 1.5rem;
}

.picker-section label {
  display: block;
  color: white;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.hue-slider, .saturation-slider, .lightness-slider {
  width: 100%;
  height: 30px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 15px;
  outline: none;
  cursor: pointer;
}

.hue-slider {
  background: linear-gradient(to right, #ff0000, #ff00ff, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000);
}

.saturation-slider {
  background: linear-gradient(to right, #808080, #ff0000);
}

.lightness-slider {
  background: linear-gradient(to right, #000000, #808080, #ffffff);
}

.hue-slider::-webkit-slider-thumb,
.saturation-slider::-webkit-slider-thumb,
.lightness-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: white;
  border: 3px solid #000;
  cursor: pointer;
}

.color-preview {
  height: 80px;
  border-radius: 12px;
  border: 3px solid #333;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-label {
  color: white;
  font-weight: bold;
  font-size: 1rem;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
}

.picker-buttons {
  display: flex;
  gap: 0.75rem;
}

.apply-btn, .cancel-picker-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.apply-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.apply-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.cancel-picker-btn {
  background: #333;
  color: white;
}

.cancel-picker-btn:hover {
  background: #444;
}


.name-input,
.answer-field {
  width: 100%;
  padding: 1rem;
  border: 2px solid #555;
  border-radius: 8px;
  background: #333;
  color: white;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.name-input:focus,
.answer-field:focus {
  outline: none;
  border-color: #4fc3f7;
}

.question-text {
  background: rgba(79, 195, 247, 0.1);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  text-align: center;
}

.answer-input {
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.answer-field {
  flex: 1;
  margin-bottom: 0;
}

.submit-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #45a049;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.continue-btn {
  width: 100%;
  background: linear-gradient(135deg, #4fc3f7, #29b6f6);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.continue-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.3);
}

.continue-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Search Results */
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #333;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 4px;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #333;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: rgba(79, 195, 247, 0.1);
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-image {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.result-placeholder {
  width: 40px;
  height: 60px;
  background: #555;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.result-info {
  flex: 1;
}

.result-title {
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.result-year {
  color: #ccc;
  font-size: 0.8rem;
}

/* Waiting Section - Simple Poster Wall */
.waiting-section {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  z-index: 1;
}

/* Simple Poster Wall */
.poster-wall {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
  align-content: start;
  overflow-y: auto;
  z-index: 1;
}

.empty-wall-message {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.empty-wall-message h3 {
  font-size: 2rem;
  margin: 0 0 1rem 0;
  font-weight: 300;
  color: #4fc3f7;
}

.empty-wall-message p {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.7;
}

.wall-poster {
  width: 120px;
  height: 180px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.wall-poster:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.wall-poster.empty-slot {
  opacity: 0.5;
  border-style: dashed;
}

.wall-poster-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.wall-poster-placeholder {
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, rgba(79, 195, 247, 0.3), rgba(33, 150, 243, 0.3));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.wall-poster-label {
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.player-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid white;
  flex-shrink: 0;
}

/* Glass Box */
.waiting-glass-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 300px;
  z-index: 10;
}

.waiting-content h2 {
  margin: 0 0 1.5rem 0;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.player-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.player-color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.5);
}

.player-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: white;
}

.game-status {
  color: rgba(255, 255, 255, 0.8);
}

.players-count {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #4fc3f7;
}

.status-text {
  font-size: 0.9rem;
}

/* Ready Button */
.ready-btn {
  width: 100%;
  background: linear-gradient(135deg, #4fc3f7, #29b6f6);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.ready-btn.active {
  background: linear-gradient(135deg, #4caf50, #45a049);
}

.ready-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.3);
}

.ready-btn.active:hover {
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

/* Start Button (for host) */
.start-btn {
  width: 100%;
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.start-btn:not(.disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.start-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, #999, #666);
}

</style>
