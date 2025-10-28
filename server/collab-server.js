// Minimal WebSocket relay server with room support
// Usage: node server/collab-server.js (PORT defaults to 3001)

/* eslint-disable no-console */
const http = require('http')
const url = require('url')
const WebSocket = require('ws')

const PORT = process.env.PORT || 3001

const server = http.createServer()
const wss = new WebSocket.Server({ server })

// room -> Set<WebSocket>
const rooms = new Map()

function joinRoom(room, ws) {
  if (!rooms.has(room)) rooms.set(room, new Set())
  rooms.get(room).add(ws)
  ws._room = room
}

function leaveRoom(ws) {
  const room = ws._room
  if (!room) return
  const set = rooms.get(room)
  if (set) {
    set.delete(ws)
    if (set.size === 0) rooms.delete(room)
  }
  ws._room = null
}

function broadcast(room, data, except) {
  const set = rooms.get(room)
  if (!set) return
  for (const client of set) {
    if (client !== except && client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  }
}

wss.on('connection', (ws, req) => {
  const { query } = url.parse(req.url, true)
  const room = String(query.room || 'default')
  const id = String(query.id || `anon_${Math.random().toString(36).slice(2, 8)}`)
  ws._id = id
  joinRoom(room, ws)
  console.log(`client ${id} joined room ${room}`)

  ws.on('message', (data) => {
    // Relay raw message; clients handle JSON
    try {
      broadcast(ws._room, data, ws)
    } catch (err) {
      console.error('broadcast error', err.message)
    }
  })

  ws.on('close', () => {
    leaveRoom(ws)
    console.log(`client ${id} disconnected from room ${room}`)
  })
})

server.listen(PORT, () => {
  console.log(`Collab WS server listening on ws://localhost:${PORT}/ws`)
})
