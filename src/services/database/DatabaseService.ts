/**
 * Database Service
 * Handles all database operations using Supabase
 */

import { getSupabaseClient, isSupabaseConfigured } from '../../config/supabase'
import { debug, warn, error as logError } from '../ui/log'
import type {
  Database,
  GameMode,
  PlayType,
  GameStatus,
  RoomStatus,
  GameResult,
  UserRow,
  UserUpdate,
  GameRow,
  GameInsert,
  GameUpdate,
  GamePlayerRow,
  GamePlayerInsert,
  RoomRow,
  RoomInsert,
  RoomUpdate,
  LeaderboardRow,
  LeaderboardInsert,
  GameHistoryRow,
  GameHistoryInsert,
  GameData,
  RoomSettings,
} from '../../types/database'

export interface QueryResult<T> {
  data: T | null
  error: string | null
}

export interface ListResult<T> {
  data: T[]
  error: string | null
  count?: number
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  score: number
  timeMs: number
  mode: GameMode
  achievedAt: string
}

class DatabaseService {
  /**
   * Check if database is available
   */
  isAvailable(): boolean {
    return isSupabaseConfigured()
  }

  // ==================== USER OPERATIONS ====================

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<QueryResult<UserRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        warn('DatabaseService: Failed to get user', { error, userId })
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Get user error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<QueryResult<UserRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null } // Not found
        }
        warn('DatabaseService: Failed to get user by username', { error, username })
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Get user by username error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: UserUpdate): Promise<QueryResult<UserRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        warn('DatabaseService: Failed to update user', { error, userId })
        return { data: null, error: error.message }
      }

      debug('DatabaseService: User updated', { userId })
      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Update user error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update user game statistics
   */
  async updateUserStats(
    userId: string,
    stats: {
      gamesPlayed?: number
      wins?: number
      timePlayed?: number
    }
  ): Promise<QueryResult<UserRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      // Get current stats
      const { data: currentUser, error: fetchError } = await client
        .from('users')
        .select('total_games_played, total_wins, total_time_played')
        .eq('id', userId)
        .single()

      if (fetchError) {
        warn('DatabaseService: Failed to fetch user stats', { error: fetchError })
        return { data: null, error: fetchError.message }
      }

      // Update with incremented values
      const { data, error } = await client
        .from('users')
        .update({
          total_games_played: (currentUser?.total_games_played || 0) + (stats.gamesPlayed || 0),
          total_wins: (currentUser?.total_wins || 0) + (stats.wins || 0),
          total_time_played: (currentUser?.total_time_played || 0) + (stats.timePlayed || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        warn('DatabaseService: Failed to update user stats', { error })
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Update user stats error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  // ==================== GAME OPERATIONS ====================

  /**
   * Create a new game
   */
  async createGame(game: GameInsert): Promise<QueryResult<GameRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('games')
        .insert(game)
        .select()
        .single()

      if (error) {
        warn('DatabaseService: Failed to create game', { error })
        return { data: null, error: error.message }
      }

      debug('DatabaseService: Game created', { gameId: data.id })
      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Create game error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get game by ID
   */
  async getGame(gameId: string): Promise<QueryResult<GameRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

      if (error) {
        warn('DatabaseService: Failed to get game', { error, gameId })
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Get game error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update game
   */
  async updateGame(gameId: string, updates: GameUpdate): Promise<QueryResult<GameRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('games')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', gameId)
        .select()
        .single()

      if (error) {
        warn('DatabaseService: Failed to update game', { error, gameId })
        return { data: null, error: error.message }
      }

      debug('DatabaseService: Game updated', { gameId })
      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Update game error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Start a game (set status to playing, record start time)
   */
  async startGame(gameId: string): Promise<QueryResult<GameRow>> {
    return this.updateGame(gameId, {
      status: 'playing',
      started_at: new Date().toISOString(),
    })
  }

  /**
   * End a game (set status, record end time and duration)
   */
  async endGame(
    gameId: string,
    result: { winnerId?: string; status: GameStatus }
  ): Promise<QueryResult<GameRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      // Get current game to calculate duration
      const { data: currentGame } = await client
        .from('games')
        .select('started_at')
        .eq('id', gameId)
        .single()

      const endedAt = new Date().toISOString()
      let durationMs: number | null = null

      if (currentGame?.started_at) {
        durationMs = new Date(endedAt).getTime() - new Date(currentGame.started_at).getTime()
      }

      return this.updateGame(gameId, {
        status: result.status,
        ended_at: endedAt,
        duration_ms: durationMs,
        winner_id: result.winnerId || null,
      })
    } catch (err) {
      logError('DatabaseService: End game error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Save game state (items, connections, etc.)
   */
  async saveGameState(gameId: string, gameData: GameData): Promise<QueryResult<GameRow>> {
    return this.updateGame(gameId, { game_data: gameData })
  }

  // ==================== GAME PLAYERS OPERATIONS ====================

  /**
   * Add player to a game
   */
  async addGamePlayer(player: GamePlayerInsert): Promise<QueryResult<GamePlayerRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('game_players')
        .insert(player)
        .select()
        .single()

      if (error) {
        warn('DatabaseService: Failed to add game player', { error })
        return { data: null, error: error.message }
      }

      debug('DatabaseService: Player added to game', { gameId: player.game_id })
      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Add game player error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get players in a game
   */
  async getGamePlayers(gameId: string): Promise<ListResult<GamePlayerRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: [], error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('game_players')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true })

      if (error) {
        warn('DatabaseService: Failed to get game players', { error })
        return { data: [], error: error.message }
      }

      return { data: data || [], error: null }
    } catch (err) {
      logError('DatabaseService: Get game players error', { error: err })
      return { data: [], error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update player score/stats in a game
   */
  async updateGamePlayer(
    gameId: string,
    playerId: string,
    updates: Partial<GamePlayerRow>
  ): Promise<QueryResult<GamePlayerRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('game_players')
        .update(updates)
        .eq('game_id', gameId)
        .eq('id', playerId)
        .select()
        .single()

      if (error) {
        warn('DatabaseService: Failed to update game player', { error })
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Update game player error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  // ==================== ROOM OPERATIONS ====================

  /**
   * Create a new room
   */
  async createRoom(room: RoomInsert): Promise<QueryResult<RoomRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      // Set expiration (1 hour from now)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

      const { data, error } = await client
        .from('rooms')
        .insert({ ...room, expires_at: expiresAt })
        .select()
        .single()

      if (error) {
        warn('DatabaseService: Failed to create room', { error })
        return { data: null, error: error.message }
      }

      debug('DatabaseService: Room created', { roomCode: room.code })
      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Create room error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get room by code
   */
  async getRoomByCode(code: string): Promise<QueryResult<RoomRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null } // Not found
        }
        warn('DatabaseService: Failed to get room', { error, code })
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Get room error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update room
   */
  async updateRoom(roomId: string, updates: RoomUpdate): Promise<QueryResult<RoomRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('rooms')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', roomId)
        .select()
        .single()

      if (error) {
        warn('DatabaseService: Failed to update room', { error })
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Update room error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update room player count
   */
  async updateRoomPlayerCount(roomCode: string, delta: number): Promise<QueryResult<RoomRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      // Get current count
      const { data: room, error: fetchError } = await client
        .from('rooms')
        .select('id, current_players')
        .eq('code', roomCode.toUpperCase())
        .single()

      if (fetchError || !room) {
        return { data: null, error: 'Room not found' }
      }

      const newCount = Math.max(0, (room.current_players || 0) + delta)

      return this.updateRoom(room.id, { current_players: newCount })
    } catch (err) {
      logError('DatabaseService: Update room player count error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Close a room
   */
  async closeRoom(roomId: string): Promise<QueryResult<RoomRow>> {
    return this.updateRoom(roomId, { status: 'closed' })
  }

  /**
   * Clean up expired rooms
   */
  async cleanupExpiredRooms(): Promise<{ deleted: number; error: string | null }> {
    const client = getSupabaseClient()
    if (!client) {
      return { deleted: 0, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('rooms')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id')

      if (error) {
        warn('DatabaseService: Failed to cleanup rooms', { error })
        return { deleted: 0, error: error.message }
      }

      const deletedCount = data?.length || 0
      if (deletedCount > 0) {
        debug('DatabaseService: Cleaned up expired rooms', { count: deletedCount })
      }

      return { deleted: deletedCount, error: null }
    } catch (err) {
      logError('DatabaseService: Cleanup rooms error', { error: err })
      return { deleted: 0, error: 'An unexpected error occurred' }
    }
  }

  // ==================== LEADERBOARD OPERATIONS ====================

  /**
   * Add entry to leaderboard
   */
  async addLeaderboardEntry(entry: LeaderboardInsert): Promise<QueryResult<LeaderboardRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('leaderboard')
        .insert(entry)
        .select()
        .single()

      if (error) {
        warn('DatabaseService: Failed to add leaderboard entry', { error })
        return { data: null, error: error.message }
      }

      debug('DatabaseService: Leaderboard entry added')
      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Add leaderboard entry error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get top leaderboard entries
   */
  async getLeaderboard(
    mode: GameMode,
    playType?: PlayType,
    limit = 100
  ): Promise<ListResult<LeaderboardEntry>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: [], error: 'Database not available' }
    }

    try {
      let query = client
        .from('leaderboard')
        .select(`
          id,
          user_id,
          score,
          time_ms,
          mode,
          achieved_at,
          users!inner (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('mode', mode)
        .order('score', { ascending: false })
        .order('time_ms', { ascending: true })
        .limit(limit)

      if (playType) {
        query = query.eq('play_type', playType)
      }

      const { data, error } = await query

      if (error) {
        warn('DatabaseService: Failed to get leaderboard', { error })
        return { data: [], error: error.message }
      }

      // Map to LeaderboardEntry with rank
      const entries: LeaderboardEntry[] = (data || []).map((row: Record<string, unknown>, index: number) => ({
        rank: index + 1,
        userId: row.user_id as string,
        username: (row.users as Record<string, unknown>)?.username as string | null,
        displayName: (row.users as Record<string, unknown>)?.display_name as string | null,
        avatarUrl: (row.users as Record<string, unknown>)?.avatar_url as string | null,
        score: row.score as number,
        timeMs: row.time_ms as number,
        mode: row.mode as GameMode,
        achievedAt: row.achieved_at as string,
      }))

      return { data: entries, error: null }
    } catch (err) {
      logError('DatabaseService: Get leaderboard error', { error: err })
      return { data: [], error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get user's best scores
   */
  async getUserBestScores(userId: string): Promise<ListResult<LeaderboardRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: [], error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('leaderboard')
        .select('*')
        .eq('user_id', userId)
        .order('mode')
        .order('score', { ascending: false })

      if (error) {
        warn('DatabaseService: Failed to get user best scores', { error })
        return { data: [], error: error.message }
      }

      return { data: data || [], error: null }
    } catch (err) {
      logError('DatabaseService: Get user best scores error', { error: err })
      return { data: [], error: 'An unexpected error occurred' }
    }
  }

  // ==================== GAME HISTORY OPERATIONS ====================

  /**
   * Add game to user's history
   */
  async addGameHistory(entry: GameHistoryInsert): Promise<QueryResult<GameHistoryRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('game_history')
        .insert(entry)
        .select()
        .single()

      if (error) {
        warn('DatabaseService: Failed to add game history', { error })
        return { data: null, error: error.message }
      }

      debug('DatabaseService: Game history entry added')
      return { data, error: null }
    } catch (err) {
      logError('DatabaseService: Add game history error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get user's game history
   */
  async getUserGameHistory(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<ListResult<GameHistoryRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: [], error: 'Database not available' }
    }

    try {
      const { data, error, count } = await client
        .from('game_history')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        warn('DatabaseService: Failed to get game history', { error })
        return { data: [], error: error.message }
      }

      return { data: data || [], error: null, count: count || 0 }
    } catch (err) {
      logError('DatabaseService: Get game history error', { error: err })
      return { data: [], error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get user's game statistics
   */
  async getUserGameStats(userId: string): Promise<QueryResult<{
    totalGames: number
    totalWins: number
    winRate: number
    totalTimePlayed: number
    favoriteMode: GameMode | null
    averageScore: number
  }>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data: history, error } = await client
        .from('game_history')
        .select('mode, result, score, duration_ms')
        .eq('user_id', userId)

      if (error) {
        warn('DatabaseService: Failed to get user stats', { error })
        return { data: null, error: error.message }
      }

      const games = history || []
      const totalGames = games.length
      const totalWins = games.filter(g => g.result === 'win').length
      const totalTimePlayed = games.reduce((sum, g) => sum + (g.duration_ms || 0), 0)
      const totalScore = games.reduce((sum, g) => sum + (g.score || 0), 0)

      // Find favorite mode
      const modeCounts: Record<string, number> = {}
      games.forEach(g => {
        modeCounts[g.mode] = (modeCounts[g.mode] || 0) + 1
      })
      const favoriteMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as GameMode || null

      return {
        data: {
          totalGames,
          totalWins,
          winRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 0,
          totalTimePlayed,
          favoriteMode,
          averageScore: totalGames > 0 ? totalScore / totalGames : 0,
        },
        error: null,
      }
    } catch (err) {
      logError('DatabaseService: Get user game stats error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  // ==================== GLOBAL LEADERBOARD OPERATIONS ====================

  /**
   * Get top players by games won
   */
  async getTopPlayersByWins(limit = 10): Promise<ListResult<{
    userId: string
    username: string | null
    displayName: string | null
    avatarUrl: string | null
    totalWins: number
    totalGamesPlayed: number
  }>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: [], error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('users')
        .select('id, username, display_name, avatar_url, total_wins, total_games_played')
        .gt('total_wins', 0)
        .order('total_wins', { ascending: false })
        .limit(limit)

      if (error) {
        warn('DatabaseService: Failed to get top players by wins', { error })
        return { data: [], error: error.message }
      }

      const entries = (data || []).map((row: Record<string, unknown>) => ({
        userId: row.id as string,
        username: row.username as string | null,
        displayName: row.display_name as string | null,
        avatarUrl: row.avatar_url as string | null,
        totalWins: row.total_wins as number,
        totalGamesPlayed: row.total_games_played as number,
      }))

      return { data: entries, error: null }
    } catch (err) {
      logError('DatabaseService: Get top players by wins error', { error: err })
      return { data: [], error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get top players by games played
   */
  async getTopPlayersByGamesPlayed(limit = 10): Promise<ListResult<{
    userId: string
    username: string | null
    displayName: string | null
    avatarUrl: string | null
    totalGamesPlayed: number
    totalWins: number
  }>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: [], error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('users')
        .select('id, username, display_name, avatar_url, total_games_played, total_wins')
        .gt('total_games_played', 0)
        .order('total_games_played', { ascending: false })
        .limit(limit)

      if (error) {
        warn('DatabaseService: Failed to get top players by games', { error })
        return { data: [], error: error.message }
      }

      const entries = (data || []).map((row: Record<string, unknown>) => ({
        userId: row.id as string,
        username: row.username as string | null,
        displayName: row.display_name as string | null,
        avatarUrl: row.avatar_url as string | null,
        totalGamesPlayed: row.total_games_played as number,
        totalWins: row.total_wins as number,
      }))

      return { data: entries, error: null }
    } catch (err) {
      logError('DatabaseService: Get top players by games error', { error: err })
      return { data: [], error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get top players by total connections made
   */
  async getTopPlayersByConnections(limit = 10): Promise<ListResult<{
    userId: string
    username: string | null
    displayName: string | null
    avatarUrl: string | null
    totalConnections: number
  }>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: [], error: 'Database not available' }
    }

    try {
      // Sum connections from game_history for each user
      const { data, error } = await client
        .from('game_history')
        .select('user_id, connections_made, users!inner(username, display_name, avatar_url)')
        
      if (error) {
        warn('DatabaseService: Failed to get connections data', { error })
        return { data: [], error: error.message }
      }

      // Aggregate by user
      const userConnections: Record<string, {
        userId: string
        username: string | null
        displayName: string | null
        avatarUrl: string | null
        totalConnections: number
      }> = {}

      for (const row of (data || [])) {
        const userId = row.user_id as string
        const connections = (row.connections_made as number) || 0
        const users = row.users as Record<string, unknown>

        if (!userConnections[userId]) {
          userConnections[userId] = {
            userId,
            username: users?.username as string | null,
            displayName: users?.display_name as string | null,
            avatarUrl: users?.avatar_url as string | null,
            totalConnections: 0,
          }
        }
        userConnections[userId].totalConnections += connections
      }

      // Sort and limit
      const entries = Object.values(userConnections)
        .sort((a, b) => b.totalConnections - a.totalConnections)
        .slice(0, limit)

      return { data: entries, error: null }
    } catch (err) {
      logError('DatabaseService: Get top players by connections error', { error: err })
      return { data: [], error: 'An unexpected error occurred' }
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()
export default databaseService

