// Unified game server: snapshots API + WebSocket realtime hub
// Run: node server/game-server.js (uses port 3010)

const http = require('http')
const express = require('express')
const cors = require('cors')
const os = require('os')
const { WebSocketServer } = require('ws')
const { 
  RateLimiter, 
  validateMessage, 
  validateSnapshotData,
  isValidRoomCode,
  sanitizeString 
} = require('./security')

const PORT = process.env.PORT || 3011

// Initialize rate limiter: 100 messages per minute per client
const rateLimiter = new RateLimiter({ 
  windowMs: 60000, 
  maxRequests: 100 
})

// Clean up rate limiter every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000).unref()

// Express app for snapshot API
const app = express()
app.use(cors())
app.use(express.json({ limit: '3mb' }))

// In-memory snapshot storage (short codes) and room state
const snapshots = new Map() // code -> { ts, data }
const roomState = new Map() // room -> { ts, items, connections }
const roomPrompts = new Map() // room -> { ts, text }
const roomGameTypes = new Map() // room -> playType ('pvp', 'multi', 'solo')
const pvpGames = new Map() // room -> { ts, gameData, players: Map(playerId -> { score, startTime, completed }) }
const ROOM_TTL_MS = 60 * 60 * 1000 // 1h
const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000 // 24h

function cleanup() {
  const now = Date.now()
  for (const [c, v] of snapshots.entries()) if (now - v.ts > SNAPSHOT_TTL_MS) snapshots.delete(c)
  for (const [r, v] of roomState.entries()) if (now - v.ts > ROOM_TTL_MS) roomState.delete(r)
  for (const [r, v] of roomPrompts.entries()) if (now - v.ts > ROOM_TTL_MS) roomPrompts.delete(r)
  for (const [r, v] of roomGameTypes.entries()) if (now - v.ts > ROOM_TTL_MS) roomGameTypes.delete(r)
  for (const [r, v] of pvpGames.entries()) if (now - v.ts > ROOM_TTL_MS) pvpGames.delete(r)
}
setInterval(cleanup, 30 * 60 * 1000).unref()

function genCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return code
}

// isValidRoomCode is now imported from security.js

// Snapshot endpoints
app.post('/api/snapshots', (req, res) => {
  try {
    const data = req.body && req.body.data
    if (!data) return res.status(400).json({ error: 'Missing data' })
    
    // Validate snapshot data
    const validation = validateSnapshotData(data)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error })
    }
    
    let code = genCode(), safety = 0
    while (snapshots.has(code) && safety++ < 10) code = genCode()
    snapshots.set(code, { ts: Date.now(), data })
    res.json({ code })
  } catch (e) {
    console.error('[snapshot] Error:', e.message)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/snapshots/:code', (req, res) => {
  const code = String(req.params.code || '').toUpperCase()
  const entry = snapshots.get(code)
  if (!entry) return res.status(404).json({ error: 'Not found' })
  res.json(entry.data)
})

// Host info: return local IPv4 addresses for QR building
app.get('/api/hostinfo', (req, res) => {
  try {
    const nets = os.networkInterfaces()
    const candidates = []
    for (const name of Object.keys(nets)) {
      for (const ni of nets[name] || []) {
        if (ni.family === 'IPv4' && !ni.internal && ni.address) {
          candidates.push({ name, address: ni.address })
        }
      }
    }
    const score = (c) => {
      const n = String(c.name || '').toLowerCase()
      const a = String(c.address || '')
      let s = 0
      // Strongly prefer Wi‑Fi/WLAN wireless adapters
      if (/wi-?fi|wlan|wireless/.test(n)) s += 100
      // Deprioritize virtual/adapters
      if (/vmware|virtual|vbox|veth|vethernet|hyper|npcap|bluetooth/.test(n)) s -= 50
      // Prefer private ranges: 172.16-31 > 192.168 > 10
      if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(a)) s += 15
      else if (/^192\.168\./.test(a)) s += 12
      else if (/^10\./.test(a)) s += 10
      // Small tie-breaker for non .1 host (often gateways/adapters)
      if (!/\.1$/.test(a)) s += 1
      return s
    }
    candidates.sort((a, b) => score(b) - score(a))
    const ips = candidates.map((c) => c.address)
    const preferred = candidates.length ? candidates[0].address : null
    res.json({ ips, preferred })
  } catch (e) {
    res.json({ ips: [], preferred: null })
  }
})

// Create HTTP server and attach WS
const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

// Track room members
const roomToClients = new Map() // room -> Set(ws)
const COLOR_PALETTE = ['#FF5252','#FFA726','#FFEB3B','#66BB6A','#42A5F5','#AB47BC','#EC407A','#26C6DA','#8D6E63','#78909C']

function broadcast(roomKey, obj, exclude) {
  const peers = roomToClients.get(roomKey) || new Set()
  const data = JSON.stringify(obj)
  for (const c of peers) {
    if (exclude && c === exclude) continue
    if (c.readyState === 1) { try { c.send(data) } catch {} }
  }
}

function broadcastPresence(roomKey) {
  const peers = roomToClients.get(roomKey) || new Set()
  // Simple rule: only count clients that are marked as mobile (phones)
  // PC hosts don't have mobile=true, so they don't count as players
  const playerCount = Array.from(peers).filter(p => p.__isMobile).length
  
  broadcast(roomKey, { type: 'presence', payload: { count: playerCount } })
}

function broadcastRoster(roomKey) {
  const peers = roomToClients.get(roomKey) || new Set()
  const players = []
  for (const p of peers) {
    // Only include mobile clients in roster for couch games
    // PC hosts should not appear in the roster
    if (p.__isMobile) {
      const playerData = { 
        id: p.__id, 
        color: p.__color || '#888', 
        label: p.__label || '', 
        image: p.__image || '', 
        answerTitle: p.__answerTitle || '',
        ready: p.__ready || false
      }
      console.log(`[roster] Adding player to broadcast:`, playerData)
      players.push(playerData)
    }
  }
  console.log(`[roster] Broadcasting ${players.length} players to room ${roomKey}`)
  broadcast(roomKey, { type: 'roster', payload: { players } })
}

function getQueryParams(url) {
  try {
    const u = new URL(url, `http://localhost:${PORT}`)
    return Object.fromEntries(u.searchParams.entries())
  } catch {
    return {}
  }
}

wss.on('connection', (ws, req) => {
  const { room = '', id = '', device = '', mobile = '' } = getQueryParams(req.url || '')
  const roomKey = String(room || '').toUpperCase()
  
  // Validate room code
  if (!isValidRoomCode(roomKey)) {
    console.log(`❌ Invalid room code attempted: ${roomKey}`)
    ws.close(1008, 'Invalid room code')
    return
  }
  
  ws.__room = roomKey
  ws.__id = id || `c_${Math.random().toString(36).slice(2, 8)}`
  ws.__device = String(device || '')
  ws.__isMobile = mobile === 'true' // Detect mobile clients from URL parameter


  // Register client, de-duplicate by device id if present
  if (!roomToClients.has(roomKey)) roomToClients.set(roomKey, new Set())
  const peers = roomToClients.get(roomKey)
  if (ws.__device) {
    for (const p of peers) {
      if (p.__device && p.__device === ws.__device) {
        try { p.close(1000, 'Replaced by same device') } catch {}
        peers.delete(p)
        break
      }
    }
  }
  peers.add(ws)
  // Defer identity until client submits profile
  ws.__ready = false
  
  console.log(`✅ Client connected to room: ${roomKey}`)

  // Broadcast presence + roster
  try { broadcastPresence(roomKey) } catch {}
  try { broadcastRoster(roomKey) } catch {}

  // Send last known state to the newcomer
  const st = roomState.get(roomKey)
  if (st && st.items && st.connections) {
    try { ws.send(JSON.stringify({ type: 'state', payload: { items: st.items, connections: st.connections } })) } catch {}
  }
  
  // Send game type information to the newcomer
  const gameType = roomGameTypes.get(roomKey)
  const hasProfiles = Array.from(peers).some(p => p.__ready && p.__label)
  
  console.log(`[game_type] Newcomer joining room ${roomKey}, existingGameType: ${gameType}, peers: ${peers.size}, hasProfiles: ${hasProfiles}`)
  
  if (gameType) {
    console.log(`[game_type] Sending existing game type ${gameType} to newcomer`)
    try { ws.send(JSON.stringify({ type: 'action', payload: { kind: 'game_type', playType: gameType } })) } catch {}
  } else if (hasProfiles) {
    // If there are players with profiles, assume PvP mode
    console.log(`[game_type] Assuming PvP mode for room with profiles`)
    try { ws.send(JSON.stringify({ type: 'action', payload: { kind: 'game_type', playType: 'pvp' } })) } catch {}
  } else {
    console.log(`[game_type] No game type determined for room ${roomKey}`)
  }
  
  // Send last known prompt to the newcomer
  const rp = roomPrompts.get(roomKey)
  if (rp && rp.text) {
    try { ws.send(JSON.stringify({ type: 'action', payload: { kind: 'prompt', text: rp.text } })) } catch {}
  }

  ws.on('message', (rawData) => {
    // Rate limiting check
    const rateCheck = rateLimiter.check(ws.__id)
    if (!rateCheck.allowed) {
      console.log(`⚠️ Rate limited client ${ws.__id} in room ${roomKey}`)
      try {
        ws.send(JSON.stringify({ 
          type: 'error', 
          payload: { 
            message: 'Too many messages. Please slow down.',
            retryAfter: Math.ceil(rateCheck.resetIn / 1000)
          }
        }))
      } catch {}
      return
    }

    // Validate and sanitize message
    const validation = validateMessage(String(rawData))
    if (!validation.valid) {
      console.log(`❌ Invalid message from ${ws.__id}: ${validation.error}`)
      return
    }

    const msg = validation.message
    try {
      if (msg && msg.type === 'ping') {
        return
      }
      // Handle client profile updates (name/color claim)
      if (msg && msg.type === 'action' && msg.payload && msg.payload.kind === 'profile') {
        console.log(`[profile] recv`, { room: roomKey, from: ws.__id, payload: msg.payload })
        const rawName = (msg.payload && msg.payload.name) ? String(msg.payload.name) : ''
        const label = sanitizeString(rawName, 20)
        const reqColor = (msg.payload && msg.payload.color) ? String(msg.payload.color) : ''
        let color = reqColor
        // enforce unique color within room; if taken, pick next available
        const peers = roomToClients.get(roomKey) || new Set()
        const usedColors = new Set()
        for (const p of peers) if (p.__ready && p.__color) usedColors.add(p.__color)
        if (color && usedColors.has(color)) {
          const alt = COLOR_PALETTE.find((c) => !usedColors.has(c))
          color = alt || color
        }
        if (label) ws.__label = label
        if (color) ws.__color = color
        if (msg.payload.answer) ws.__answerTitle = sanitizeString(msg.payload.answer, 60)
        ws.__ready = true
        console.log(`[profile] applied`, { room: roomKey, id: ws.__id, name: ws.__label || '', answer: ws.__answerTitle || '', requestedColor: reqColor, assignedColor: ws.__color, usedColors: Array.from(usedColors) })
        
        // If this is the first profile in the room, assume it's PvP mode
        console.log(`[game_type] Checking room ${roomKey}, hasGameType: ${roomGameTypes.has(roomKey)}`)
        if (!roomGameTypes.has(roomKey)) {
          roomGameTypes.set(roomKey, 'pvp')
          console.log(`[game_type] Set room ${roomKey} to PvP mode`)
          
          // Broadcast game type to all players in the room
          const gameTypeMsg = { type: 'action', payload: { kind: 'game_type', playType: 'pvp' } }
          console.log(`[game_type] Broadcasting game type to room ${roomKey}:`, gameTypeMsg)
          try { broadcast(roomKey, gameTypeMsg) } catch (e) { console.error(`[game_type] Broadcast failed:`, e) }
        } else {
          console.log(`[game_type] Room ${roomKey} already has game type: ${roomGameTypes.get(roomKey)}`)
        }
        
        // Send color assignment back to the client
        if (reqColor && reqColor !== color) {
          try { ws.send(JSON.stringify({ type: 'action', payload: { kind: 'color_assigned', requestedColor: reqColor, assignedColor: color, usedColors: Array.from(usedColors) } })) } catch {}
        }
        
        try { broadcastRoster(roomKey) } catch {}
        return
      }
      // Handle PvP ready status
      if (msg && msg.type === 'action' && msg.payload && msg.payload.kind === 'ready') {
        console.log(`[ready] recv`, { room: roomKey, from: ws.__id, isReady: msg.payload.isReady })
        ws.__ready = msg.payload.isReady
        
        // Check if all players are ready for PvP
        const peers = roomToClients.get(roomKey) || new Set()
        const allReady = Array.from(peers).every(p => p.__ready === true)
        console.log(`[ready] All players ready: ${allReady}, total players: ${peers.size}`)
        console.log(`[ready] Player ready status:`, Array.from(peers).map(p => ({ id: p.__id, ready: p.__ready })))
        
        if (allReady && peers.size > 1) {
          console.log(`[ready] Starting PvP game for room ${roomKey}`)
          // Broadcast game start to all players
          const startMsg = { type: 'action', payload: { kind: 'game_started', isPvP: true } }
          try { broadcast(roomKey, startMsg) } catch {}
        }
        
        try { broadcastRoster(roomKey) } catch {}
        return
      }
      if (msg && msg.type === 'state' && msg.payload) {
        // Update room snapshot
        roomState.set(roomKey, { ts: Date.now(), items: msg.payload.items || [], connections: msg.payload.connections || [] })
      }
      // Handle prompt coordination
      if (msg && msg.type === 'action' && msg.payload && msg.payload.kind === 'prompt') {
        try {
          const text = typeof msg.payload.text === 'string' ? msg.payload.text : ''
          if (text) {
            roomPrompts.set(roomKey, { ts: Date.now(), text })
          }
        } catch {}
        // Broadcast as usual
        broadcast(roomKey, msg, ws)
        return
      }
      if (msg && msg.type === 'action' && msg.payload && msg.payload.kind === 'prompt_request') {
        try {
          const rp = roomPrompts.get(roomKey)
          if (rp && rp.text && ws.readyState === 1) {
            ws.send(JSON.stringify({ type: 'action', payload: { kind: 'prompt', text: rp.text } }))
          }
        } catch {}
        return
      }
      // Handle controller answer (set image/title for waiting room display)
      if (msg && msg.type === 'action' && msg.payload && msg.payload.kind === 'answer') {
        try {
          const image = typeof msg.payload.image === 'string' ? sanitizeString(msg.payload.image, 500) : ''
          const title = typeof msg.payload.title === 'string' ? sanitizeString(msg.payload.title, 60) : ''
          if (image) ws.__image = image
          if (title) ws.__answerTitle = title
          ws.__ready = true
          broadcastRoster(roomKey)
        } catch {}
        return
      }
      // Handle start game request from mobile
      if (msg && msg.type === 'action' && msg.payload && msg.payload.kind === 'start_game') {
        console.log(`[start_game] recv`, { room: roomKey, from: ws.__id })
        
        // Check if this is a PvP game
        const gameOptions = msg.payload.gameOptions || {}
        const isPvP = gameOptions.playType === 'pvp'
        
        // Store the game type for this room
        roomGameTypes.set(roomKey, gameOptions.playType || 'multi')
        
        if (isPvP) {
          // Initialize PvP game instance
          const gameData = {
            items: msg.payload.items || [],
            connections: msg.payload.connections || [],
            gameOptions: gameOptions,
            mode: msg.payload.mode || 'goal'
          }
          
          pvpGames.set(roomKey, {
            ts: Date.now(),
            gameData: gameData,
            players: new Map()
          })
          
          console.log(`[pvp_game] initialized for room: ${roomKey}`)
        }
        
        // Broadcast start game event to all clients in the room
        try {
          const startMsg = { 
            type: 'action', 
            payload: { 
              kind: 'game_started',
              isPvP: isPvP,
              gameData: isPvP ? gameData : null
            } 
          }
          broadcast(roomKey, startMsg, ws)
        } catch {}
        return
      }
      
      // Handle PvP player completion
      if (msg && msg.type === 'action' && msg.payload && msg.payload.kind === 'pvp_complete') {
        console.log(`[pvp_complete] recv`, { room: roomKey, from: ws.__id })
        const pvpGame = pvpGames.get(roomKey)
        if (pvpGame) {
          const playerData = {
            score: msg.payload.score || 0,
            time: msg.payload.time || 0,
            completed: true,
            completedAt: Date.now()
          }
          pvpGame.players.set(ws.__id, playerData)
          
          // Check if all players are done
          const peers = roomToClients.get(roomKey) || new Set()
          const allPlayersDone = Array.from(peers).every(peer => 
            pvpGame.players.has(peer.__id) && pvpGame.players.get(peer.__id).completed
          )
          
          if (allPlayersDone) {
            // Broadcast final results
            const results = Array.from(pvpGame.players.entries()).map(([id, data]) => ({
              playerId: id,
              score: data.score,
              time: data.time
            }))
            
            try {
              const resultsMsg = { 
                type: 'action', 
                payload: { 
                  kind: 'pvp_results',
                  results: results
                } 
              }
              broadcast(roomKey, resultsMsg)
            } catch {}
          }
        }
        return
      }
      
      // Handle end game request
      if (msg && msg.type === 'action' && msg.payload && msg.payload.kind === 'end_game') {
        console.log(`[end_game] recv`, { room: roomKey, from: ws.__id })
        // Clear room state
        roomState.delete(roomKey)
        roomPrompts.delete(roomKey)
        pvpGames.delete(roomKey)
        // Notify all clients
        try {
          const endMsg = { type: 'action', payload: { kind: 'game_ended' } }
          broadcast(roomKey, endMsg, ws)
        } catch {}
        // Close all connections in this room
        const peers = roomToClients.get(roomKey) || new Set()
        for (const client of peers) {
          if (client.readyState === 1) {
            try { client.close(1000, 'Game ended') } catch {}
          }
        }
        roomToClients.delete(roomKey)
        return
      }
      // Broadcast to peers in the same room
      broadcast(roomKey, msg, ws)
    } catch {}
  })

  ws.on('close', () => {
    // Clean up rate limiter for this client
    rateLimiter.reset(ws.__id)
    
    const peers = roomToClients.get(roomKey)
    if (peers) {
      peers.delete(ws)
      if (peers.size === 0) {
        // keep last state in memory until TTL cleanup
        roomToClients.delete(roomKey)
      }
      try { broadcastPresence(roomKey) } catch {}
      try { broadcastRoster(roomKey) } catch {}
    }
  })
})

server.listen(PORT, () => console.log(`[game-server] listening on ${PORT}`))


