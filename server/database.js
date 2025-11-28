/**
 * Database Service for Game Server
 * Provides Supabase database integration with fallback to in-memory storage
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '' // Use service key for server-side
const USE_DATABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY)

// Initialize Supabase client
let supabase = null
if (USE_DATABASE) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  console.log('[database] Supabase client initialized')
} else {
  console.log('[database] Running in memory-only mode (no Supabase credentials)')
}

// In-memory fallback storage
const memoryStorage = {
  rooms: new Map(),
  games: new Map(),
  gamePlayers: new Map(),
  snapshots: new Map(),
}

// TTL constants
const ROOM_TTL_MS = 60 * 60 * 1000 // 1 hour
const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Clean up expired in-memory entries
 */
function cleanupMemory() {
  const now = Date.now()
  
  for (const [key, value] of memoryStorage.rooms.entries()) {
    if (now - value.createdAt > ROOM_TTL_MS) {
      memoryStorage.rooms.delete(key)
    }
  }
  
  for (const [key, value] of memoryStorage.snapshots.entries()) {
    if (now - value.ts > SNAPSHOT_TTL_MS) {
      memoryStorage.snapshots.delete(key)
    }
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupMemory, 30 * 60 * 1000)

// ==================== ROOM OPERATIONS ====================

/**
 * Create a new room
 */
async function createRoom(roomData) {
  const { code, hostId, playType, settings } = roomData
  
  if (USE_DATABASE) {
    try {
      const expiresAt = new Date(Date.now() + ROOM_TTL_MS).toISOString()
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          code: code.toUpperCase(),
          host_id: hostId || null,
          play_type: playType || 'couch_multi',
          settings: settings || {},
          expires_at: expiresAt,
        })
        .select()
        .single()

      if (error) {
        console.error('[database] Failed to create room:', error)
        // Fallback to memory
        return createRoomInMemory(roomData)
      }

      console.log(`[database] Room created: ${code}`)
      return { data, error: null }
    } catch (err) {
      console.error('[database] Error creating room:', err)
      return createRoomInMemory(roomData)
    }
  }
  
  return createRoomInMemory(roomData)
}

function createRoomInMemory(roomData) {
  const room = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    code: roomData.code.toUpperCase(),
    host_id: roomData.hostId || null,
    play_type: roomData.playType || 'couch_multi',
    status: 'waiting',
    current_players: 0,
    settings: roomData.settings || {},
    createdAt: Date.now(),
  }
  memoryStorage.rooms.set(room.code, room)
  console.log(`[database] Room created in memory: ${room.code}`)
  return { data: room, error: null }
}

/**
 * Get room by code
 */
async function getRoomByCode(code) {
  const normalizedCode = code.toUpperCase()
  
  if (USE_DATABASE) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', normalizedCode)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('[database] Failed to get room:', error)
      }

      return { data, error: error?.code === 'PGRST116' ? null : error }
    } catch (err) {
      console.error('[database] Error getting room:', err)
    }
  }
  
  const room = memoryStorage.rooms.get(normalizedCode)
  return { data: room || null, error: null }
}

/**
 * Update room
 */
async function updateRoom(code, updates) {
  const normalizedCode = code.toUpperCase()
  
  if (USE_DATABASE) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('code', normalizedCode)
        .select()
        .single()

      if (error) {
        console.error('[database] Failed to update room:', error)
      }

      return { data, error }
    } catch (err) {
      console.error('[database] Error updating room:', err)
    }
  }
  
  const room = memoryStorage.rooms.get(normalizedCode)
  if (room) {
    Object.assign(room, updates)
    return { data: room, error: null }
  }
  return { data: null, error: 'Room not found' }
}

/**
 * Delete room
 */
async function deleteRoom(code) {
  const normalizedCode = code.toUpperCase()
  
  if (USE_DATABASE) {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('code', normalizedCode)

      if (error) {
        console.error('[database] Failed to delete room:', error)
      }

      return { error }
    } catch (err) {
      console.error('[database] Error deleting room:', err)
    }
  }
  
  memoryStorage.rooms.delete(normalizedCode)
  return { error: null }
}

// ==================== GAME OPERATIONS ====================

/**
 * Create a new game
 */
async function createGame(gameData) {
  if (USE_DATABASE) {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert({
          room_code: gameData.roomCode || null,
          host_id: gameData.hostId || null,
          mode: gameData.mode || 'goal',
          play_type: gameData.playType || 'solo',
          status: 'waiting',
          game_data: gameData.gameData || {},
        })
        .select()
        .single()

      if (error) {
        console.error('[database] Failed to create game:', error)
        return createGameInMemory(gameData)
      }

      console.log(`[database] Game created: ${data.id}`)
      return { data, error: null }
    } catch (err) {
      console.error('[database] Error creating game:', err)
      return createGameInMemory(gameData)
    }
  }
  
  return createGameInMemory(gameData)
}

function createGameInMemory(gameData) {
  const game = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    room_code: gameData.roomCode || null,
    host_id: gameData.hostId || null,
    mode: gameData.mode || 'goal',
    play_type: gameData.playType || 'solo',
    status: 'waiting',
    game_data: gameData.gameData || {},
    created_at: new Date().toISOString(),
  }
  memoryStorage.games.set(game.id, game)
  return { data: game, error: null }
}

/**
 * Update game
 */
async function updateGame(gameId, updates) {
  if (USE_DATABASE) {
    try {
      const { data, error } = await supabase
        .from('games')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', gameId)
        .select()
        .single()

      if (error) {
        console.error('[database] Failed to update game:', error)
      }

      return { data, error }
    } catch (err) {
      console.error('[database] Error updating game:', err)
    }
  }
  
  const game = memoryStorage.games.get(gameId)
  if (game) {
    Object.assign(game, updates)
    return { data: game, error: null }
  }
  return { data: null, error: 'Game not found' }
}

/**
 * Start a game
 */
async function startGame(gameId) {
  return updateGame(gameId, {
    status: 'playing',
    started_at: new Date().toISOString(),
  })
}

/**
 * End a game
 */
async function endGame(gameId, result) {
  const endedAt = new Date().toISOString()
  
  // Get game to calculate duration
  let durationMs = null
  if (USE_DATABASE) {
    const { data: game } = await supabase
      .from('games')
      .select('started_at')
      .eq('id', gameId)
      .single()
    
    if (game?.started_at) {
      durationMs = new Date(endedAt).getTime() - new Date(game.started_at).getTime()
    }
  } else {
    const game = memoryStorage.games.get(gameId)
    if (game?.started_at) {
      durationMs = new Date(endedAt).getTime() - new Date(game.started_at).getTime()
    }
  }

  return updateGame(gameId, {
    status: result.status || 'completed',
    ended_at: endedAt,
    duration_ms: durationMs,
    winner_id: result.winnerId || null,
  })
}

// ==================== GAME PLAYER OPERATIONS ====================

/**
 * Add player to game
 */
async function addGamePlayer(playerData) {
  if (USE_DATABASE) {
    try {
      const { data, error } = await supabase
        .from('game_players')
        .insert({
          game_id: playerData.gameId,
          user_id: playerData.userId || null,
          guest_name: playerData.guestName || null,
          player_color: playerData.color || null,
        })
        .select()
        .single()

      if (error) {
        console.error('[database] Failed to add game player:', error)
        return addGamePlayerInMemory(playerData)
      }

      return { data, error: null }
    } catch (err) {
      console.error('[database] Error adding game player:', err)
      return addGamePlayerInMemory(playerData)
    }
  }
  
  return addGamePlayerInMemory(playerData)
}

function addGamePlayerInMemory(playerData) {
  const player = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    game_id: playerData.gameId,
    user_id: playerData.userId || null,
    guest_name: playerData.guestName || null,
    player_color: playerData.color || null,
    score: 0,
    connections_made: 0,
    items_placed: 0,
    is_winner: false,
  }
  
  const key = `${playerData.gameId}_${player.id}`
  memoryStorage.gamePlayers.set(key, player)
  return { data: player, error: null }
}

/**
 * Update player in game
 */
async function updateGamePlayer(gameId, playerId, updates) {
  if (USE_DATABASE) {
    try {
      const { data, error } = await supabase
        .from('game_players')
        .update(updates)
        .eq('game_id', gameId)
        .eq('id', playerId)
        .select()
        .single()

      if (error) {
        console.error('[database] Failed to update game player:', error)
      }

      return { data, error }
    } catch (err) {
      console.error('[database] Error updating game player:', err)
    }
  }
  
  const key = `${gameId}_${playerId}`
  const player = memoryStorage.gamePlayers.get(key)
  if (player) {
    Object.assign(player, updates)
    return { data: player, error: null }
  }
  return { data: null, error: 'Player not found' }
}

// ==================== LEADERBOARD OPERATIONS ====================

/**
 * Add leaderboard entry
 */
async function addLeaderboardEntry(entry) {
  if (!USE_DATABASE) {
    // Leaderboard requires database
    console.log('[database] Leaderboard requires database connection')
    return { data: null, error: 'Database not available' }
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert({
        user_id: entry.userId,
        mode: entry.mode,
        play_type: entry.playType,
        score: entry.score,
        time_ms: entry.timeMs,
        connections_count: entry.connectionsCount || 0,
        game_id: entry.gameId,
      })
      .select()
      .single()

    if (error) {
      console.error('[database] Failed to add leaderboard entry:', error)
    }

    return { data, error }
  } catch (err) {
    console.error('[database] Error adding leaderboard entry:', err)
    return { data: null, error: err.message }
  }
}

/**
 * Get leaderboard
 */
async function getLeaderboard(mode, limit = 100) {
  if (!USE_DATABASE) {
    return { data: [], error: 'Database not available' }
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select(`
        id,
        user_id,
        score,
        time_ms,
        achieved_at,
        users (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('mode', mode)
      .order('score', { ascending: false })
      .order('time_ms', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('[database] Failed to get leaderboard:', error)
    }

    return { data: data || [], error }
  } catch (err) {
    console.error('[database] Error getting leaderboard:', err)
    return { data: [], error: err.message }
  }
}

// ==================== SNAPSHOT OPERATIONS ====================

/**
 * Save snapshot (for share codes)
 */
async function saveSnapshot(code, data) {
  // Snapshots are kept in memory for speed (short-lived)
  memoryStorage.snapshots.set(code, { ts: Date.now(), data })
  return { code, error: null }
}

/**
 * Get snapshot
 */
async function getSnapshot(code) {
  const snapshot = memoryStorage.snapshots.get(code)
  return { data: snapshot?.data || null, error: snapshot ? null : 'Not found' }
}

// ==================== EXPORTS ====================

module.exports = {
  // Configuration
  USE_DATABASE,
  
  // Room operations
  createRoom,
  getRoomByCode,
  updateRoom,
  deleteRoom,
  
  // Game operations
  createGame,
  updateGame,
  startGame,
  endGame,
  
  // Player operations
  addGamePlayer,
  updateGamePlayer,
  
  // Leaderboard operations
  addLeaderboardEntry,
  getLeaderboard,
  
  // Snapshot operations
  saveSnapshot,
  getSnapshot,
  
  // Memory storage (for direct access if needed)
  memoryStorage,
  
  // Cleanup
  cleanupMemory,
}

