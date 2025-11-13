<template>
  <div class="waiting-room">

    <!-- Tutorial Tooltips -->
    <div v-if="showTutorial && tutorialStep === 19" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Welcome to the Waiting Room!</div>
        <div class="tooltip-description">
          In here is where you will queue up with friends for {{ isPvPMode ? 'competitive PvP matches' : 'collaborative couch play' }}.
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 19.1" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Two Main Sections</div>
        <div class="tooltip-description">
          There are 2 main sections to this screen. First is the players section where the players will be placed and the answers to the pregame question will appear.
          </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 19.2" class="tutorial-tooltip tutorial-tooltip-left">
      <div class="tooltip-content">
        <div class="tooltip-title">Info Screen</div>
        <div class="tooltip-description">
          Here is the info screen where we have a QR code and a text code you can use to join game. Please take out your phone and scan the QR code.
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 19.3" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Phone Menu</div>
        <div class="tooltip-description">
          On your phone pick a color and name - put anything your friends are cool with.
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 19.4" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Game Screen</div>
        <div class="tooltip-description">
          On this screen you will see code, connected text, prompt and search box. This search box uses real data from TMDB.
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 19.5" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Try Searching</div>
        <div class="tooltip-description">
          Now why don't you try searching something? It can be anything but how about we answer the question?
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 19.55" class="tutorial-tooltip">
      <div class="tooltip-content">
        <div class="tooltip-title">Player Tickets</div>
        <div class="tooltip-description">
          As you can see your name and answer will fill up the respective box below.
        </div>
        <button class="tooltip-button" @click="$emit('tutorial-next')">Next</button>
      </div>
    </div>

    <div v-if="showTutorial && tutorialStep === 19.6" class="tutorial-tooltip tutorial-tooltip-left">
      <div class="tooltip-content">
        <div class="tooltip-title">Almost Done!</div>
        <div class="tooltip-description">
          Great! We are almost done now - the real fun begins! Press start on phone or PC to begin.
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="header">
      <button class="back-button" @click="$emit('back')">
        <span class="button-text">← Back</span>
      </button>
    </div>

    <!-- Main content -->
    <div class="main-content">
      <!-- Room Code Ticket -->
      <div class="room-ticket" :class="{ 'tutorial-glow': showTutorial && tutorialStep === 19.2 }">
        <div class="ticket-top">
          <div class="ticket-time">8:00 PM</div>
          <!-- Game Mode Indicator -->
          <div class="game-mode-indicator" :class="{ 'pvp-mode': isPvPMode }">
            <div class="mode-header">
              <div class="mode-icon">{{ isPvPMode ? '⚔️' : '👥' }}</div>
              <div class="mode-text">{{ gameModeInfo.title }} - {{ gameModeLabel }}</div>
            </div>
            <div class="mode-desc">
              {{ isPvPMode ? 'Players compete on separate instances. First to complete wins!' : isPCMultiplayer ? 'PC host controls the board. Phones can join to help search!' : 'Players collaborate on the same board together. Work as a team!' }}
            </div>
          </div>
          <div class="ticket-free">FREE</div>
        </div>
        
        <div class="ticket-middle">
          <div class="qr-section">
            <div class="qr-container">
              <img v-if="qrDataUrl" :src="qrDataUrl" alt="Join QR" class="qr-code" />
            </div>
          </div>
          
          <div class="room-info">
            <div class="room-eyebrow">JOIN ON YOUR PHONE</div>
            <div class="room-code">{{ roomCode || '— — — —' }}</div>
            <div class="room-meta">
              <span class="players">Players: {{ isPCMultiplayer ? Math.max(1, playerCount) : playerCount }}</span>
            </div>
            </div>
          </div>
        
        <div class="ticket-bottom">
          <div class="action-buttons">
            <button class="copy-btn" @click="copy(roomCode)" :disabled="!roomCode">
              <span class="btn-text">Copy Code</span>
            </button>
            <button class="start-btn" @click="handleStartGame" :class="{ 'ready-btn': isPvPMode && isReady }">
              <span class="btn-text">
                <span v-if="isPvPMode">
                  {{ isReady ? '✅ Ready!' : '⏳ Ready Up' }} ({{ readyCount }}/{{ totalPlayers }})
                </span>
                <span v-else>Start Game</span>
              </span>
            </button>
      </div>
            </div>
          </div>

      <!-- PvP Pre-Game Section -->
      <div v-if="isPvPMode && !hasAnsweredPvP" class="pvp-pregame-section">
        <div class="pvp-pregame-card">
          <!-- Profile Setup -->
          <div v-if="!pvpProfileReady" class="pvp-profile-setup">
            <div class="pvp-pregame-header">
              <div class="pvp-pregame-icon">⚔️</div>
              <div class="pvp-pregame-title">Join PvP Match</div>
              <div class="pvp-pregame-subtitle">Set up your profile to compete!</div>
        </div>
            
            <div class="pvp-profile-form">
              <div class="pvp-form-group">
                <label class="pvp-label">Name</label>
                <input 
                  v-model="pvpPlayerName" 
                  class="pvp-input" 
                  maxlength="20" 
                  placeholder="Your name" 
                />
              </div>
              
              <div class="pvp-form-group">
                <label class="pvp-label">Color</label>
                <div class="pvp-colors">
                  <button
                    v-for="c in pvpColors"
                    :key="c"
                    class="pvp-color"
                    :class="{ 
                      selected: c === pvpPlayerColor, 
                      taken: pvpUsedColors.includes(c) && c !== pvpPlayerColor,
                      available: !pvpUsedColors.includes(c) || c === pvpPlayerColor
                    }"
                    :style="{ 
                      background: c, 
                      outline: (c===pvpPlayerColor?'2px solid #fff':'none'),
                      opacity: pvpUsedColors.includes(c) && c !== pvpPlayerColor ? 0.3 : 1
                    }"
                    :disabled="pvpUsedColors.includes(c) && c !== pvpPlayerColor"
                    @click="selectPvPColor(c)"
                  >
                    <span v-if="pvpUsedColors.includes(c) && c !== pvpPlayerColor" class="pvp-taken-indicator">✗</span>
                  </button>
                </div>
              </div>
              
              <button 
                class="pvp-continue-btn" 
                :disabled="!pvpPlayerName || !pvpPlayerColor" 
                @click="savePvPProfile"
              >
                Continue
              </button>
            </div>
          </div>
          
          <!-- Question Answering -->
          <div v-else class="pvp-question-section">
            <div class="pvp-pregame-header">
              <div class="pvp-pregame-icon">⚔️</div>
              <div class="pvp-pregame-title">Answer the Question</div>
              <div class="pvp-pregame-subtitle">Choose your answer to compete in PvP!</div>
            </div>
            
            <div class="pvp-pregame-question">
              <div class="question-text">{{ prompt || 'Loading question...' }}</div>
            </div>
            
            <div class="pvp-pregame-search">
              <input 
                v-model="pvpSearchQuery" 
                class="pvp-search-input" 
                placeholder="Search for your answer..." 
                @keyup.enter="searchPvPAnswer"
                @input="handlePvPSearch"
              />
              <button class="pvp-search-btn" @click="searchPvPAnswer" :disabled="!pvpSearchQuery.trim()">
                Search
              </button>
            </div>
            
            <div v-if="pvpSearchResults.length > 0" class="pvp-search-results">
              <div 
                v-for="result in pvpSearchResults.slice(0, 5)" 
                :key="result.id" 
                class="pvp-result-item"
                @click="selectPvPAnswer(result)"
              >
                <div class="pvp-result-image">
                  <img v-if="result.image" :src="result.image" :alt="result.title || result.name" />
                  <div v-else class="pvp-result-placeholder">🎬</div>
                </div>
                <div class="pvp-result-info">
                  <div class="pvp-result-title">{{ result.title || result.name }}</div>
                  <div class="pvp-result-type">{{ getDisplayType(result) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Countdown Overlay -->
      <div v-if="showCountdown" class="countdown-overlay">
        <div class="countdown-content">
          <div class="countdown-number">{{ countdown }}</div>
          <div class="countdown-text">Game Starting...</div>
        </div>
      </div>

      <!-- Player Posters Section -->
      <div class="posters-section">
        <div class="section-title">{{ categoryLabel }}</div>
        <div class="goal-posters">
          <div class="goal-poster" v-for="p in displayPosters" :key="p.id || p.label" :style="frameStyle(p)" :class="{ 'tutorial-glow': showTutorial && (tutorialStep === 19.1 || tutorialStep === 19.55) }">
            <div class="card-image">
              <div v-if="p.image" class="card-icon">
                <img :src="p.image" :alt="p.label" />
              </div>
              <div v-else class="card-icon">🎬</div>
            </div>
            <div class="card-info">
              <div class="ticket-details">
                <div class="ticket-time">8:00 PM</div>
                <div class="ticket-price">FREE</div>
              </div>
              <div class="goal-text">
                <div class="goal-name">{{ p.label || 'Item' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useGameStateStore } from '@store/gameState.store.ts'
import { getRandomQuestion } from '../services/game/questions.ts'
import SearchService from '../services/game/SearchService.ts'
import config from '@/config/env'
import { debug, warn, error as logError } from '../services/ui/log.ts'

export default {
  name: 'WaitingRoom',
  components: {},
  props: {
    showTutorial: {
      type: Boolean,
      default: false
    },
    tutorialStep: {
      type: Number,
      default: 0
    },
    gameMode: {
      type: Object,
      default: () => null
    },
    gameOptions: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['back', 'start-game', 'tutorial-next'],
  data() {
    return {
      roomCode: null,
      playerCount: 1,
      qrDataUrl: '',
      joinUrl: '',
      selectedHost: '',
      roster: [],
      prompt: '',
      // PvP Pre-game data
      hasAnsweredPvP: false,
      pvpSearchQuery: '',
      pvpSearchResults: [],
      pvpAnswer: null,
      // PvP Profile data
      pvpProfileReady: false,
      pvpPlayerName: '',
      pvpPlayerColor: '',
      pvpUsedColors: [],
      pvpColors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'],
      // Local game type detection
      detectedPlayType: null,
      // PvP Ready system
      isReady: false,
      readyPlayers: [],
      readyCount: 0,
      totalPlayers: 0,
      countdown: null,
      showCountdown: false
    }
  },
  computed: {
    posters() {
      const gs = useGameStateStore && typeof useGameStateStore === 'function' ? useGameStateStore() : null
      const selfId = gs && gs.collabClientId ? gs.collabClientId : null
      const list = Array.isArray(this.roster) ? this.roster : []
      
      // For PvP mode, show all players including self
      // For couch play, hide self (mobile multiplayer behavior)
      let filtered
      if (this.isPvPMode) {
        filtered = list // Show all players in PvP
      } else {
        filtered = list.filter(p => !selfId || String(p.id) !== String(selfId)) // Hide self in couch play
      }
      
      const withImages = filtered.filter(p => !!p.image)
      debug('Posters computed', { 
        rosterCount: list.length, 
        selfId, 
        isPvPMode: this.isPvPMode,
        filteredCount: filtered.length, 
        withImagesCount: withImages.length
      })
      return withImages
    },
    categoryLabel() {
      return this.prompt && this.prompt.trim().length ? this.prompt : 'Featured'
    },
    displayPosters() {
      const arr = this.posters
      if (!arr || arr.length === 0) {
        // show placeholders so you always see "spots"
        return Array.from({ length: 8 }, (_, i) => ({ id: `ph-${i}`, image: '' }))
      }
      return arr
    },
    isPvPMode() {
      const playType = this.gameOptions?.playType || this.detectedPlayType
      return playType === 'pvp'
    },
    gameModeLabel() {
      if (this.isPvPMode) return 'PvP Mode'
      if (this.isPCMultiplayer) return 'PC Multiplayer'
      return 'Couch Play'
    },
    gameModeInfo() {
      if (!this.gameMode) return { name: 'Unknown Mode', title: 'Unknown Mode' }
      return {
        name: this.gameMode.name || this.gameMode.title || 'Unknown Mode',
        title: this.gameMode.title || this.gameMode.name || 'Unknown Mode',
        id: this.gameMode.id
      }
    },
    isPCMultiplayer() {
      const playType = this.gameOptions?.playType || this.detectedPlayType
      return playType === 'multi' || playType === 'pvp'
    },
  },
  methods: {
    async generateQr(text) {
      try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=2&data=${encodeURIComponent(text)}&color=FFFFFF&bgcolor=000000&format=png`
        // Just set the URL directly; browser will fetch
        this.qrDataUrl = url
      } catch (err) {
        warn('Failed to generate QR code URL', { error: err })
        this.qrDataUrl = ''
      }
    },
    copy(text) {
      try { 
        navigator.clipboard.writeText(String(text || '')) 
      } catch (err) {
        // Clipboard API may be unavailable - non-critical
        debug('Failed to copy to clipboard', { error: err })
      }
    },
    baseUrlFromHost(host) {
      const port = location.port || '3000'
      return `${location.protocol}//${host}${port ? `:${port}` : ''}`
    },
    async buildJoinUrl(code, overrideHost) {
      try {
        if (overrideHost) {
          try { 
            localStorage.setItem('preferredHostIp', overrideHost) 
          } catch (err) {
            // localStorage may be unavailable - continue without persistence
          }
          const base = this.baseUrlFromHost(overrideHost)
          return `${base}/#room=${encodeURIComponent(code)}`
        }
        const resp = await fetch(`http://${location.hostname}:3011/api/hostinfo`, { cache: 'no-store' })
        const info = resp.ok ? await resp.json() : { ips: [], preferred: null }
        this.ips = Array.isArray(info.ips) ? info.ips : []
        if (info && info.preferred) { 
          try { 
            localStorage.setItem('preferredHostIp', info.preferred) 
          } catch (err) {
            // localStorage may be unavailable - continue without persistence
          }
        }
        const fallback = (() => { 
          try { 
            return localStorage.getItem('preferredHostIp') 
          } catch (err) { 
            return null 
          } 
        })()
        const host = info.preferred || fallback || location.hostname
        this.selectedHost = host
        const base = this.baseUrlFromHost(host)
        return `${base}/#room=${encodeURIComponent(code)}`
      } catch (err) {
        warn('Failed to build join URL, using fallback', { error: err, code })
        const host = (() => { 
          try { 
            return localStorage.getItem('preferredHostIp') || location.hostname 
          } catch (err) { 
            return location.hostname 
          } 
        })()
        this.selectedHost = host
        const base = this.baseUrlFromHost(host)
        return `${base}/#room=${encodeURIComponent(code)}`
      }
    },
    async rebuildUrl() {
      const code = this.roomCode || ''
      const url = await this.buildJoinUrl(code, this.selectedHost)
      this.joinUrl = url
      this.generateQr(this.joinUrl)
    },
    async fetchHostInfo() {
      try {
        const tryFetch = async (host) => {
          try {
            const r = await fetch(`http://${host}:3011/api/hostinfo`, { cache: 'no-store' })
            if (r.ok) return await r.json()
          } catch (err) {
            // Host info fetch failed for this host - try next one
            debug('Failed to fetch host info from host', { host, error: err })
          }
          return null
        }
        let info = await tryFetch(location.hostname)
        if (!info) info = await tryFetch('127.0.0.1')
        if (!info) info = await tryFetch('localhost')
        if (!info) throw new Error('hostinfo unavailable')
        // pick preferred and persist
        const stored = (() => { 
          try { 
            return localStorage.getItem('preferredHostIp') 
          } catch (err) { 
            return null 
          } 
        })()
        const host = info.preferred || stored || location.hostname
        this.selectedHost = host
        if (info && info.preferred) { 
          try { 
            localStorage.setItem('preferredHostIp', info.preferred) 
          } catch (err) {
            // localStorage may be unavailable - continue without persistence
          }
        }
      } catch (err) {
        warn('Failed to fetch host info, using fallback', { error: err })
        const stored = (() => { 
          try { 
            return localStorage.getItem('preferredHostIp') 
          } catch (err) { 
            return null 
          } 
        })()
        this.selectedHost = stored || location.hostname
      }
    },
    isCenterCell(i) {
      // 3 rows x 9 cols; hide the middle 3 columns (4..6) across all rows
      const col = ((i - 1) % 9) + 1
      return col >= 4 && col <= 6
    },
    occupantForIndex(i) {
      // Map roster sequentially into visible cells (left band then right band)
      const col = ((i - 1) % 9) + 1
      if (col >= 4 && col <= 6) return null
      if (!Array.isArray(this.roster) || this.roster.length === 0) return null
      // Build list of visible cell indexes (1..27) once per render
      const visible = []
      for (let k = 1; k <= 27; k++) {
        const c = ((k - 1) % 9) + 1
        if (c < 4 || c > 6) visible.push(k)
      }
      const pos = visible.indexOf(i)
      if (pos < 0) return null
      const gs = useGameStateStore && typeof useGameStateStore === 'function' ? useGameStateStore() : null
      const selfId = gs && gs.collabClientId ? gs.collabClientId : null
      // Filter out self from roster if present
      const filtered = (this.roster || []).filter(p => !selfId || String(p.id) !== String(selfId))
      return filtered[pos] || null
    },
    styleForCell(i) {
      const occ = this.occupantForIndex(i)
      if (!occ) return {}
      const c = occ.color || 'rgba(255,255,255,0.5)'
      return { borderColor: c }
    },
    frameStyle(player) {
      const c = player && player.color ? player.color : 'rgba(255,255,255,0.18)'
      const glow = player && player.color ? `${player.color}55` : 'transparent'
      return {
        borderColor: c,
        boxShadow: `inset 0 0 18px ${glow}, 0 0 14px ${glow}`,
      }
    },
    nameStyle(player) {
      return { color: (player && player.color) ? player.color : '#fff' }
    },
    slotIndex(side, i) {
      const base = side === 'left' ? 0 : 5
      return base + (Number(i) - 1)
    },
    slotPlayer(side, i) {
      const idx = this.slotIndex(side, i)
      if (!Array.isArray(this.roster)) return null
      return this.roster[idx] || null
    },
    posterPos(side, i) {
      // Anchor around center column; stagger rows so they don't align across
      const mid = 50
      const offsets = [-24, -12, 0, 12, 24]
      let y = mid + offsets[(Number(i) - 1) % offsets.length]
      if (side === 'right') y += 6
      return { position: 'absolute', top: `${y}%`, transform: 'translateY(-50%)', [side]: '16px' }
    },
    posterStyle(side, i) {
      const idx = Number(i) - 1
      const baseTop = [12, 28, 46, 66, 88] // strong separation
      let t = baseTop[idx % baseTop.length]
      // Right column further offset to avoid any line-up
      if (side === 'right') t = t + 6
      // Zig-zag horizontally within column to avoid vertical straightness feel
      const x = (idx % 2 === 0) ? 6 : 24
      if (side === 'left') return { position: 'absolute', top: `${t}%`, left: `${x}px`, transform: 'translateY(-50%)' }
      return { position: 'absolute', top: `${t}%`, right: `${x}px`, transform: 'translateY(-50%)' }
    },
    // Start game handler
    handleStartGame() {
      if (this.isPvPMode) {
        // PvP Ready-up system
        this.toggleReady()
      } else if (this.isPCMultiplayer) {
        // PC Multiplayer - PC is the only player, start immediately
        debug('PC Multiplayer - starting game immediately')
        this.$emit('start-game')
      } else {
        // Couch play - start immediately
        this.$emit('start-game')
      }
    },
    toggleReady() {
      const gs = useGameStateStore()
      if (gs.collabConnected) {
        this.isReady = !this.isReady
        const readyData = {
          kind: 'ready',
          isReady: this.isReady
        }
        debug('Sending ready data', { readyData, collabConnected: gs.collabConnected, clientId: gs.collabClientId })
        gs.sendCollab('action', readyData)
        debug('PvP Ready status updated', { isReady: this.isReady })
      } else {
        warn('Collab not connected - cannot send ready status')
      }
    },
    // Countdown methods
    startCountdown() {
      this.showCountdown = true
      this.countdown = 5
      
      const countdownInterval = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(countdownInterval)
          this.showCountdown = false
          this.$emit('start')
        }
      }, 1000)
    },
    // PvP Profile methods
    selectPvPColor(color) {
      this.pvpPlayerColor = color
    },
    async savePvPProfile() {
      if (!this.pvpPlayerName || !this.pvpPlayerColor) return
      
      const gs = useGameStateStore()
      if (gs.collabConnected) {
        const profileData = {
          kind: 'profile',
          name: this.pvpPlayerName.trim(),
          color: this.pvpPlayerColor
        }
        gs.sendCollab('action', profileData)
      }
      
      this.pvpProfileReady = true
    },
    // PvP Pre-game methods
    async handlePvPSearch() {
      if (!this.pvpSearchQuery.trim()) {
        this.pvpSearchResults = []
        return
      }
      
      try {
        // Use the singleton search service instance
        const result = await SearchService.search(this.pvpSearchQuery.trim())
        this.pvpSearchResults = result.results || []
      } catch (error) {
        logError('PvP search error', { error })
        this.pvpSearchResults = []
      }
    },
    
    async searchPvPAnswer() {
      await this.handlePvPSearch()
    },
    
    selectPvPAnswer(result) {
      debug('PvP: Selecting answer', { 
        title: result.title || result.name,
        tmdbId: result.id,
        mediaType: result.media_type
      })
      this.pvpAnswer = result
      this.hasAnsweredPvP = true
      
      // Send answer to server
      const gs = useGameStateStore()
      if (gs.collabConnected) {
        // First ensure profile is set (in case it wasn't sent properly)
        const profileData = {
          kind: 'profile',
          name: this.pvpPlayerName.trim(),
          color: this.pvpPlayerColor
        }
        debug('PvP: Sending profile', { name: profileData.name, color: profileData.color })
        gs.sendCollab('action', profileData)
        
        // Then send the answer
        const answerData = {
          kind: 'answer',
          title: result.title || result.name,
          image: result.image || '',
          tmdbId: result.id,
          mediaType: result.media_type || (result.title ? 'movie' : 'tv')
        }
        debug('PvP: Sending answer', { title: answerData.title, tmdbId: answerData.tmdbId })
        gs.sendCollab('action', answerData)
      }
      
      // Clear search
      this.pvpSearchQuery = ''
      this.pvpSearchResults = []
    },
    
    getDisplayType(result) {
      if (result.media_type === 'movie') return 'Movie'
      if (result.media_type === 'tv') return 'TV Show'
      if (result.media_type === 'person') return 'Person'
      if (result.title) return 'Movie'
      if (result.name) return 'TV Show'
      return 'Unknown'
    },
  },
  mounted() {
    const gs = useGameStateStore()
    gs.setRoomCodeFromHash()
    this.roomCode = gs.roomCode
    this.playerCount = gs.playerCount || 1
    
    // Debug PvP mode detection
    debug('WaitingRoom mounted', {
      gameMode: this.gameMode?.id,
      isPvPMode: this.isPvPMode,
      hasAnsweredPvP: this.hasAnsweredPvP,
      pvpProfileReady: this.pvpProfileReady,
      roomCode: this.roomCode
    })
    gs.setCollabHandlers({
      onPresence: ({ count }) => { this.playerCount = count },
      onRoster: ({ players }) => { 
        debug('WaitingRoom: Received roster update', { playerCount: players?.length })
        
        // Check for players who just completed their profile (have name AND weren't in previous roster with name)
        const oldPlayersMap = new Map(this.roster.map(p => [p.id, p]))
        
        (players || []).forEach(player => {
          const oldPlayer = oldPlayersMap.get(player.id)
          const justCompletedProfile = player.label && (!oldPlayer || !oldPlayer.label)
          
          if (justCompletedProfile) {
            debug('Player submitted profile', {
              name: player.label,
              color: player.color,
              answer: player.answerTitle || 'No answer provided',
              ready: player.ready
            })
          }
        })
        
        this.roster = players || []
        this.totalPlayers = players ? players.length : 0
        
        // Count ready players
        this.readyCount = players ? players.filter(p => p.ready === true).length : 0
        debug('WaitingRoom: Ready status', { 
          readyCount: this.readyCount, 
          totalPlayers: this.totalPlayers 
        })
        
        // Auto-detect PvP mode if roster has players with profiles but no game type set
        if (players && players.length > 0) {
          const hasPlayersWithProfiles = players.some(p => p.label && p.label.trim())
          if (hasPlayersWithProfiles && !this.gameOptions.playType && !this.detectedPlayType) {
            debug('Auto-detecting PvP mode from roster with profiles')
            this.detectedPlayType = 'pvp'
          }
        }
      },
      onAction: (payload) => {
        if (payload && payload.kind === 'prompt' && typeof payload.text === 'string') {
          this.prompt = payload.text
        }
        // Handle answer from mobile users
        if (payload && payload.kind === 'answer') {
          const title = payload.title || ''
          const image = payload.image || ''
          if (title && image) {
            // Add to display posters
            this.displayPosters.push({
              id: `answer-${Date.now()}`,
              label: title,
              image: image
            })
          }
        }
        // Handle game type information
        if (payload && payload.kind === 'game_type') {
          debug('Received game type', { playType: payload.playType })
          // Set detected play type instead of modifying props
          this.detectedPlayType = payload.playType
        }
        
        // Auto-detect PvP mode if roster has players with profiles but no game type received
        if (payload && payload.kind === 'roster' && payload.players) {
          const hasPlayersWithProfiles = payload.players.some(p => p.label && p.label.trim())
          if (hasPlayersWithProfiles && !this.gameOptions.playType && !this.detectedPlayType) {
            debug('Auto-detecting PvP mode from roster with profiles')
            this.detectedPlayType = 'pvp'
          }
        }
        // Handle game started event
        if (payload && payload.kind === 'game_started') {
          debug('Game started event received from phone host', { isPvP: payload.isPvP })
          if (payload.isPvP) {
            debug('PvP game starting with countdown')
            this.startCountdown()
          } else {
            debug('Couch multiplayer game starting immediately')
            this.$emit('start-game')
          }
        }
        // Handle ready status updates
        if (payload && payload.kind === 'ready') {
          debug('Received ready status update', { payload })
          // Update ready players list if needed
        }
      },
    })
    debug('WaitingRoom: Attempting to connect', { wsUrl: config.wsUrl, roomCode: this.roomCode })
    if (this.roomCode) {
      gs.connectCollab(config.wsUrl)
      debug('WaitingRoom: Connection initiated')
    } else {
      debug('WaitingRoom: No room code, skipping connection')
    }
    // Request the current shared prompt for category display, then host-pick if none
    setTimeout(() => {
      debug('WaitingRoom: Connection status after 1s', { connected: gs.collabConnected })
      try { 
        if (gs.collabConnected) gs.sendCollab('action', { kind: 'prompt_request' }) 
      } catch (err) {
        debug('Failed to send prompt request', { error: err })
      }
    }, 1000)
    setTimeout(() => {
      try {
        if (!this.prompt) {
          const q = getRandomQuestion()
          const text = q && q.text ? q.text : ''
          if (text && gs.collabConnected) {
            gs.sendCollab('action', { kind: 'prompt', text })
            this.prompt = text
          }
        }
      } catch (err) {
        debug('Failed to set default prompt', { error: err })
      }
    }, 700)
    // Generate join URL + QR
    this.fetchHostInfo().then(() => {
      this.buildJoinUrl(this.roomCode || '').then((url) => { this.joinUrl = url; this.generateQr(this.joinUrl) })
    })
  },
}
</script>

<style scoped>
/* Main container */
.waiting-room {
  position: relative;
  width: 100%;
  height: 100vh;
}

/* Game Mode Indicator */
.game-mode-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  text-align: center;
  margin: 8px 0;
}

.game-mode-indicator.pvp-mode {
  background: rgba(255, 87, 87, 0.2);
  border-color: rgba(255, 87, 87, 0.4);
  box-shadow: 0 0 20px rgba(255, 87, 87, 0.3);
}

.mode-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-icon {
  font-size: 18px;
}

.mode-text {
  color: white;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mode-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  line-height: 1.2;
  margin-top: 2px;
}

/* PvP Pre-game Section */
.pvp-pregame-section {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
  width: 90%;
  max-width: 600px;
}

.pvp-pregame-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(var(--glass-blur));
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.pvp-pregame-header {
  text-align: center;
  margin-bottom: 20px;
}

.pvp-pregame-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.pvp-pregame-title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.pvp-pregame-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.pvp-pregame-question {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.question-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.pvp-pregame-search {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.pvp-search-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
}

.pvp-search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.pvp-search-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.15);
}

.pvp-search-btn {
  background: rgba(255, 87, 87, 0.8);
  border: 1px solid rgba(255, 87, 87, 1);
  border-radius: 8px;
  padding: 12px 20px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pvp-search-btn:hover:not(:disabled) {
  background: rgba(255, 87, 87, 1);
  transform: translateY(-1px);
}

.pvp-search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pvp-search-results {
  max-height: 300px;
  overflow-y: auto;
}

.pvp-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pvp-result-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.pvp-result-image {
  width: 40px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.pvp-result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pvp-result-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.pvp-result-info {
  flex: 1;
}

.pvp-result-title {
  color: white;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.pvp-result-type {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}


.waiting-room {
  background: linear-gradient(145deg, #002a33, #2d3a2e);
  overflow: visible;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  z-index: 1;
  display: flex;
  flex-direction: column;
  color: #fff;
}

/* Tutorial tooltip */
.tutorial-tooltip {
  position: fixed !important;
  z-index: 999 !important;
  pointer-events: none;
  top: 270px;
  left: 50%;
  transform: translateX(-50%);
}

.tutorial-tooltip-left {
  left: 20% !important;
  transform: translateX(-50%);
}

.tooltip-content {
  width: 300px;
  height: 200px;
  background: #2d3a2e;
  border: 2px solid rgba(78, 205, 196, 0.3);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  position: relative;
  z-index: 1000;
}

.tooltip-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.tooltip-description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  margin-bottom: 16px;
}

.tooltip-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
}

.tooltip-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.waiting-room::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 182px;
  opacity: 0.12;
  pointer-events: none;
  z-index: 1000;
}

.waiting-room::after {
  content: '';
  position: absolute;
  top: -5000px;
  left: -5000px;
  width: 15000px;
  height: 15000px;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.8;
  pointer-events: none;
  z-index: 2;
}

/* Header */
.header {
  position: relative;
  z-index: 10;
  padding: 20px;
}

.back-button {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(78, 205, 196, 0.3);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(78, 205, 196, 0.5);
}

/* Main content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 20px;
  position: relative;
  z-index: 5;
}

/* Room ticket */
.room-ticket {
  width: 100%;
  max-width: 600px;
  background: linear-gradient(135deg, #2d3a2e 0%, #1a2520 100%);
  border: 2px solid rgba(78, 205, 196, 0.3);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.ticket-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 2px dotted rgba(78, 205, 196, 0.3);
  background: rgba(78, 205, 196, 0.05);
}

.ticket-time {
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 1.1rem;
  font-weight: bold;
  color: #4ecdc4;
}

.ticket-free {
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.9rem;
  font-weight: bold;
  color: #4ecdc4;
  background: rgba(78, 205, 196, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
}

.ticket-middle {
  display: flex;
  gap: 20px;
  padding: 20px;
  align-items: center;
}

.qr-section {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 2px solid transparent !important;
  border-radius: 8px !important;
  padding: 12px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
}

.room-ticket.tutorial-glow {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3) !important;
  border: 2px solid rgba(78, 205, 196, 0.8) !important;
  position: relative !important;
  z-index: 10 !important;
}

.goal-poster.tutorial-glow {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.6), 0 0 40px rgba(78, 205, 196, 0.3) !important;
  border: 2px solid rgba(78, 205, 196, 0.8) !important;
  position: relative !important;
  z-index: 10 !important;
}


.qr-container {
  width: 120px;
  height: 120px;
  border: 2px solid rgba(78, 205, 196, 0.3);
  border-radius: 8px;
  overflow: hidden;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.qr-code {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: transparent;
  filter: brightness(1.2) contrast(1.1);
}

.room-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.room-eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: #ffffff !important;
  text-transform: uppercase;
  font-weight: bold;
}

.room-code {
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 2rem;
  letter-spacing: 0.25em;
  color: #fff !important;
  font-weight: bold;
}

.room-meta {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8) !important;
}

.ticket-bottom {
  padding: 16px 20px;
  border-top: 2px dotted rgba(78, 205, 196, 0.3);
  background: rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.copy-btn, .start-btn {
  padding: 10px 20px;
  border: 1px solid rgba(78, 205, 196, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.copy-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(78, 205, 196, 0.5);
}

.start-btn {
  background: rgba(78, 205, 196, 0.2);
  color: #4ecdc4;
}

.start-btn:hover {
  background: rgba(78, 205, 196, 0.3);
  border-color: rgba(78, 205, 196, 0.6);
}

/* Posters section */
.posters-section {
  width: 100%;
  overflow-x: auto;
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.goal-posters {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: nowrap;
  padding: 0 20px;
  min-width: fit-content;
  width: max-content;
  margin: 0 auto;
}

.goal-poster {
  width: 200px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: default;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  user-select: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.goal-poster:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(78, 205, 196, 0.2);
  border-color: rgba(78, 205, 196, 0.6);
}

.card-image {
  height: 200px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px 8px 0 0;
  margin-top: 0;
  position: relative;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  overflow: hidden;
}

.card-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: rgba(78, 205, 196, 0.3);
}

.card-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-info {
  padding: 8px 12px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  text-align: left;
}

.ticket-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.3);
}

.ticket-time {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.ticket-price {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  text-transform: uppercase;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.goal-text {
  text-align: left;
}

.goal-name {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive design */
@media (max-width: 768px) {
  .ticket-middle {
    flex-direction: column;
    text-align: center;
  }
  
  .qr-container {
    width: 100px;
    height: 100px;
  }
  
  .room-code {
    font-size: 1.5rem;
  }
  
  .goal-posters {
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    padding: 0 20px;
  }
  
  .goal-poster {
    flex-shrink: 0;
    width: 180px;
    height: 270px;
  }
}

/* PvP Profile Form Styles */
.pvp-profile-form {
  padding: 20px;
}

.pvp-form-group {
  margin-bottom: 20px;
}

.pvp-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.pvp-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 16px;
  backdrop-filter: blur(10px);
  box-sizing: border-box;
}

.pvp-input:focus {
  outline: none;
  border-color: rgba(78, 205, 196, 0.6);
  background: rgba(255, 255, 255, 0.08);
}

.pvp-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.pvp-colors {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.pvp-color {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pvp-color:hover {
  transform: scale(1.05);
}

.pvp-color.selected {
  border-color: white;
  box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.6);
}

.pvp-color.taken {
  opacity: 0.3;
  cursor: not-allowed;
}

.pvp-taken-indicator {
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.pvp-continue-btn {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.8), rgba(78, 205, 196, 0.6));
  border: 1px solid rgba(78, 205, 196, 0.4);
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  margin-top: 20px;
}

.pvp-continue-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(78, 205, 196, 1), rgba(78, 205, 196, 0.8));
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(78, 205, 196, 0.3);
}

.pvp-continue-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Ready button styling */
.ready-btn {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.8), rgba(76, 175, 80, 0.6)) !important;
  border-color: rgba(76, 175, 80, 0.4) !important;
}

.ready-btn:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 1), rgba(76, 175, 80, 0.8)) !important;
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3) !important;
}

/* Countdown Overlay */
.countdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.countdown-content {
  text-align: center;
  color: white;
}

.countdown-number {
  font-size: 8rem;
  font-weight: bold;
  color: #4ecdc4;
  text-shadow: 0 0 20px rgba(78, 205, 196, 0.5);
  margin-bottom: 1rem;
  animation: pulse 1s ease-in-out infinite;
}

.countdown-text {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

</style>

