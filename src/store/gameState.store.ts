import { defineStore } from 'pinia'
import CollabService from '@services/realtime/CollabService.ts'

export const useGameStateStore = defineStore('gameState', {
  state: () => ({
    gameItems: [],
    connections: [],
    gameOptions: {},
    currentGameMode: 'goal',
    gameStatus: 'idle',
    gameStartTime: null,
    gameEndTime: null,
    lastSaveTime: null,
    gameVersion: '1.0.0',
    // Centralized Timer State
    timerEnabled: false,
    timerRemaining: 0,
    _timerId: null,
    timerExpired: false,
    _onTimerExpired: null,
    // Collaboration State
    roomCode: null,
    collabConnected: false,
    collabWsUrl: null,
    collabClientId: null,
    hostId: null,
    _collabService: null,
    _collabHandlers: { onState: null, onAction: null, onPresence: null },
    playerCount: 1,
    roster: [],
  }),
  getters: {
    gameDuration(state) {
      if (!state.gameStartTime) return 0
      const endTime = state.gameEndTime || Date.now()
      return endTime - state.gameStartTime
    },
    gameDurationFormatted() {
      const duration = this.gameDuration
      const minutes = Math.floor(duration / 60000)
      const seconds = Math.floor((duration % 60000) / 1000)
      return `${minutes}:${String(seconds).padStart(2, '0')}`
    },
  },
  actions: {
    updateState(partial) {
      Object.assign(this, { ...partial, lastSaveTime: Date.now() })
    },
    updateGameItems(items) {
      this.updateState({ gameItems: [...(items || [])] })
    },
    updateConnections(conns) {
      this.updateState({ connections: [...(conns || [])] })
    },
    updateGameOptions(opts) {
      this.updateState({ gameOptions: { ...(opts || {}) } })
    },
    updateGameMode(mode) {
      this.updateState({ currentGameMode: mode })
    },
    updateGameStatus(status) {
      this.updateState({ gameStatus: status })
      if (status === 'playing' && !this.gameStartTime)
        this.updateState({ gameStartTime: Date.now() })
      else if (status === 'completed' || status === 'gameOver')
        this.updateState({ gameEndTime: Date.now() })
    },
    // Timer controls
    configureTimer(totalSeconds) {
      const seconds = Number.isFinite(parseInt(totalSeconds, 10)) ? parseInt(totalSeconds, 10) : 0
      this.timerEnabled = seconds > 0
      this.timerRemaining = seconds
      this.timerExpired = false
    },
    startTimer() {
      if (!this.timerEnabled || this._timerId) return
      this._timerId = setInterval(() => {
        if (this.timerRemaining > 0) {
          this.timerRemaining -= 1
        } else {
          clearInterval(this._timerId)
          this._timerId = null
          if (!this.timerExpired) {
            this.timerExpired = true
            this.timerEnabled = false
            try {
              if (typeof this._onTimerExpired === 'function') this._onTimerExpired()
            } catch (_) {}
          }
        }
      }, 1000)
    },
    stopTimer() {
      if (this._timerId) {
        clearInterval(this._timerId)
        this._timerId = null
      }
    },
    setTimerExpiredCallback(cb) {
      this._onTimerExpired = cb
    },
    // Collaboration controls
    setRoomCode(code) {
      this.roomCode = code || null
    },
    setRoomCodeFromHash() {
      try {
        const hash = window.location.hash || ''
        const m = hash.match(/room=([A-Za-z0-9_-]+)/)
        this.roomCode = m ? m[1] : null
      } catch (_) {
        this.roomCode = null
      }
    },
    setCollabHandlers(handlers) {
      this._collabHandlers = { ...this._collabHandlers, ...(handlers || {}) }
    },
    async connectCollab(wsUrl) {
      if (!this.roomCode) return
      this.collabWsUrl = wsUrl
      if (this._collabService) {
        try {
          this._collabService.close()
        } catch (_) {}
      }
      const svc = new CollabService(wsUrl)
      this._collabService = svc
      svc.on('open', (info) => {
        try { this.collabClientId = (info && info.clientId) || null } catch (_) { this.collabClientId = null }
        this.collabConnected = true
      })
      svc.on('close', () => {
        this.collabConnected = false
        this.collabClientId = null
      })
      svc.on('message', (msg) => {
        const h = this._collabHandlers || {}
        if (msg.type === 'state') {
          // Coalesce state updates to avoid jank
          if (typeof h.onState === 'function') {
            cancelAnimationFrame(this._stateRaf)
            this._stateRaf = requestAnimationFrame(() => h.onState(msg.payload))
          }
        } else if (msg.type === 'presence') {
          this.playerCount = Number(msg?.payload?.count || 0)
          if (typeof h.onPresence === 'function') {
            try { h.onPresence({ count: this.playerCount }) } catch (_) {}
          }
        } else if (msg.type === 'roster') {
          try { this.roster = Array.isArray(msg?.payload?.players) ? msg.payload.players : [] } catch (_) { this.roster = [] }
          
          // Set first player as host
          if (this.roster.length > 0 && !this.hostId) {
            this.hostId = this.roster[0].id
            console.log('🎮 Host set to first player:', this.hostId)
          }
          
          const onRoster = h.onRoster
          if (typeof onRoster === 'function') {
            try { onRoster({ players: this.roster }) } catch (_) {}
          }
        } else if (msg.type === 'action') {
          if (typeof h.onAction === 'function') {
            cancelAnimationFrame(this._actionRaf)
            this._actionRaf = requestAnimationFrame(() => h.onAction(msg.payload))
          }
        }
      })
      svc.connect(this.roomCode)
    },
    disconnectCollab() {
      if (this._collabService) {
        try {
          this._collabService.close()
        } catch (_) {}
      }
      this._collabService = null
      this.collabConnected = false
    },
    sendCollab(type, payload) {
      if (this._collabService) this._collabService.send(type, payload)
    },
    broadcastState() {
      this.sendCollab('state', { 
        items: this.gameItems, 
        connections: this.connections,
        gameOptions: this.gameOptions
      })
    },
    reset() {
      this.$reset()
      this.lastSaveTime = Date.now()
      if (this._timerId) {
        clearInterval(this._timerId)
        this._timerId = null
      }
      if (this._collabService) {
        try {
          this._collabService.close()
        } catch (_) {}
      }
    },
  },
})

export default useGameStateStore
