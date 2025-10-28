// Minimal collaboration client using WebSocket. Rooms by code.

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
      } catch (_) {}
    }, 20000)
    this.ws.onopen = () => {
      this._emit('open', { room: this.room, clientId: this.clientId, deviceId: this.deviceId })
    }
    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.sender === this.clientId) return
        this._emit('message', msg)
      } catch (_) {}
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
      } catch (_) {}
      const id = `d_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
      try { window.localStorage.setItem(KEY, id) } catch (_) {}
      return id
    } catch (_) {
      // Fallback (non-persistent)
      return `d_${Math.random().toString(36).slice(2, 10)}`
    }
  }
}
