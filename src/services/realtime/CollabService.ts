// Minimal collaboration client using WebSocket. Rooms by code.

import { warn } from '../ui/log.ts'

export default class CollabService {
  constructor(serverUrl) {
    this.serverUrl = serverUrl
    this.ws = null
    this.room = null
    this.clientId = `c_${Math.random().toString(36).slice(2, 8)}`
    this.deviceId = this._getOrCreateDeviceId()
    this.handlers = new Map()
  }

  on(type, handler) {
    this.handlers.set(type, handler)
  }
  _emit(type, payload) {
    const h = this.handlers.get(type)
    if (typeof h === 'function') h(payload)
  }

  connect(roomCode) {
    this.room = String(roomCode)
    // Add mobile parameter for couch play detection
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768
    const mobileParam = isMobile ? '&mobile=true' : ''
    this.ws = new WebSocket(
      `${this.serverUrl}/ws?room=${encodeURIComponent(this.room)}&id=${this.clientId}&device=${encodeURIComponent(this.deviceId)}${mobileParam}`
    )
    // Heartbeat to keep connection alive
    this._hb = setInterval(() => {
      try {
        if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify({ type: 'ping' }))
      } catch (err) {
        // WebSocket send can fail if connection is closing, this is expected
        // No need to log as it's handled by onerror/onclose handlers
      }
    }, 20000)
    this.ws.onopen = () => {
      this._emit('open', { room: this.room, clientId: this.clientId, deviceId: this.deviceId })
    }
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.sender === this.clientId) return
        this._emit('message', msg)
      } catch (err) {
        // Invalid JSON in message - log but don't crash
        warn('CollabService: Failed to parse message', { error: err, data: ev.data })
      }
    }
    this.ws.onclose = () => { clearInterval(this._hb); this._emit('close') }
    this.ws.onerror = () => { clearInterval(this._hb); this._emit('error') }
  }

  send(type, payload) {
    if (!this.ws || this.ws.readyState !== 1) return
    const msg = { room: this.room, sender: this.clientId, type, payload, ts: Date.now() }
    this.ws.send(JSON.stringify(msg))
  }

  _getOrCreateDeviceId() {
    try {
      const KEY = 'device_id'
      // Prefer localStorage for persistence
      try {
        const existing = window.localStorage.getItem(KEY)
        if (existing && existing.length > 0) return existing
      } catch (err) {
        // localStorage may be unavailable in private browsing mode
        // Continue with generating new ID
      }
      const id = `d_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
      try { 
        window.localStorage.setItem(KEY, id) 
      } catch (err) {
        // localStorage may be unavailable - continue with non-persistent ID
      }
      return id
    } catch (err) {
      // Fallback (non-persistent)
      return `d_${Math.random().toString(36).slice(2, 10)}`
    }
  }
}
