/**
 * Simplified Game Server
 * Only handles snapshot API for Show Builder sharing
 * Run: node server/game-server.js
 */

const express = require('express')
const cors = require('cors')

const PORT = process.env.PORT || 3011

const app = express()
app.use(cors())
app.use(express.json({ limit: '3mb' }))

// In-memory snapshot storage
const snapshots = new Map() // code -> { ts, data }
const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Cleanup old snapshots
function cleanup() {
  const now = Date.now()
  for (const [code, entry] of snapshots.entries()) {
    if (now - entry.ts > SNAPSHOT_TTL_MS) {
      snapshots.delete(code)
    }
  }
}
setInterval(cleanup, 30 * 60 * 1000).unref() // Every 30 min

// Generate 4-character code
function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', snapshots: snapshots.size })
})

// Create snapshot (for sharing Show Builder challenges)
app.post('/api/snapshots', (req, res) => {
  try {
    const data = req.body?.data
    if (!data) {
      return res.status(400).json({ error: 'Missing data' })
    }

    // Generate unique code
    let code = genCode()
    let attempts = 0
    while (snapshots.has(code) && attempts < 10) {
      code = genCode()
      attempts++
    }

    snapshots.set(code, { ts: Date.now(), data })
    console.log(`[snapshot] Created: ${code}`)
    res.json({ code })
  } catch (err) {
    console.error('[snapshot] Error creating:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get snapshot
app.get('/api/snapshots/:code', (req, res) => {
  const code = String(req.params.code || '').toUpperCase()
  const entry = snapshots.get(code)
  
  if (!entry) {
    return res.status(404).json({ error: 'Snapshot not found' })
  }

  console.log(`[snapshot] Retrieved: ${code}`)
  res.json(entry.data)
})

// Start server
app.listen(PORT, () => {
  console.log(`[game-server] Snapshot API running on port ${PORT}`)
})
