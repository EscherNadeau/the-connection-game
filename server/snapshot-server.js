// Simple in-memory snapshot server for short join codes
// Usage: node server/snapshot-server.js
// Access: http://<host>:3001/api/snapshots

const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const store = new Map()
const TTL_MS = 24 * 60 * 60 * 1000 // 24h

function genCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return code
}

function cleanup() {
  const now = Date.now()
  for (const [k, v] of store.entries()) {
    if (now - v.ts > TTL_MS) store.delete(k)
  }
}
setInterval(cleanup, 30 * 60 * 1000).unref()

app.post('/api/snapshots', (req, res) => {
  try {
    const data = req.body && req.body.data
    if (!data) return res.status(400).json({ error: 'Missing data' })
    let code = genCode()
    let safety = 0
    while (store.has(code) && safety++ < 10) code = genCode()
    store.set(code, { ts: Date.now(), data })
    res.json({ code })
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/snapshots/:code', (req, res) => {
  const code = String(req.params.code || '').toUpperCase()
  const entry = store.get(code)
  if (!entry) return res.status(404).json({ error: 'Not found' })
  res.json(entry.data)
})

const port = process.env.PORT || 3010
app.listen(port, () => console.log(`[snapshot-server] listening on ${port}`))


