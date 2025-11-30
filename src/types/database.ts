/**
 * Database Types
 * TypeScript definitions for the Supabase database schema
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          last_login_at: string | null
          total_games_played: number
          total_wins: number
          total_time_played: number
          favorite_mode: string | null
          settings: UserSettings | null
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          total_games_played?: number
          total_wins?: number
          total_time_played?: number
          favorite_mode?: string | null
          settings?: UserSettings | null
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          total_games_played?: number
          total_wins?: number
          total_time_played?: number
          favorite_mode?: string | null
          settings?: UserSettings | null
        }
      }
      games: {
        Row: {
          id: string
          room_code: string | null
          host_id: string | null
          mode: GameMode
          play_type: PlayType
          status: GameStatus
          started_at: string | null
          ended_at: string | null
          duration_ms: number | null
          winner_id: string | null
          game_data: GameData | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_code?: string | null
          host_id?: string | null
          mode: GameMode
          play_type: PlayType
          status?: GameStatus
          started_at?: string | null
          ended_at?: string | null
          duration_ms?: number | null
          winner_id?: string | null
          game_data?: GameData | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_code?: string | null
          host_id?: string | null
          mode?: GameMode
          play_type?: PlayType
          status?: GameStatus
          started_at?: string | null
          ended_at?: string | null
          duration_ms?: number | null
          winner_id?: string | null
          game_data?: GameData | null
          created_at?: string
          updated_at?: string
        }
      }
      game_players: {
        Row: {
          id: string
          game_id: string
          user_id: string | null
          guest_name: string | null
          player_color: string | null
          score: number
          connections_made: number
          items_placed: number
          is_winner: boolean
          finished_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          user_id?: string | null
          guest_name?: string | null
          player_color?: string | null
          score?: number
          connections_made?: number
          items_placed?: number
          is_winner?: boolean
          finished_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          user_id?: string | null
          guest_name?: string | null
          player_color?: string | null
          score?: number
          connections_made?: number
          items_placed?: number
          is_winner?: boolean
          finished_at?: string | null
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          code: string
          host_id: string | null
          status: RoomStatus
          play_type: PlayType
          max_players: number
          current_players: number
          game_id: string | null
          settings: RoomSettings | null
          created_at: string
          updated_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          code: string
          host_id?: string | null
          status?: RoomStatus
          play_type: PlayType
          max_players?: number
          current_players?: number
          game_id?: string | null
          settings?: RoomSettings | null
          created_at?: string
          updated_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          code?: string
          host_id?: string | null
          status?: RoomStatus
          play_type?: PlayType
          max_players?: number
          current_players?: number
          game_id?: string | null
          settings?: RoomSettings | null
          created_at?: string
          updated_at?: string
          expires_at?: string
        }
      }
      leaderboard: {
        Row: {
          id: string
          user_id: string
          mode: GameMode
          play_type: PlayType
          score: number
          time_ms: number
          connections_count: number
          game_id: string
          achieved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mode: GameMode
          play_type: PlayType
          score: number
          time_ms: number
          connections_count: number
          game_id: string
          achieved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mode?: GameMode
          play_type?: PlayType
          score?: number
          time_ms?: number
          connections_count?: number
          game_id?: string
          achieved_at?: string
        }
      }
      game_history: {
        Row: {
          id: string
          user_id: string
          game_id: string | null
          mode: GameMode
          play_type: PlayType | null
          result: GameResult
          score: number
          duration_ms: number
          connections_made: number
          items_used: number
          played_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id?: string | null
          mode: GameMode
          play_type?: PlayType | null
          result: GameResult
          score?: number
          duration_ms?: number
          connections_made?: number
          items_used?: number
          played_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          mode?: GameMode
          play_type?: PlayType
          result?: GameResult
          score?: number
          duration_ms?: number
          connections_made?: number
          items_used?: number
          played_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      game_mode: GameMode
      play_type: PlayType
      game_status: GameStatus
      room_status: RoomStatus
      game_result: GameResult
    }
  }
}

// Enum types
export type GameMode = 'goal' | 'hybrid' | 'knowledge' | 'anti' | 'zen' | 'custom'
export type PlayType = 'solo' | 'pc_multi' | 'pc_pvp' | 'couch_multi' | 'couch_pvp'
export type GameStatus = 'waiting' | 'starting' | 'playing' | 'paused' | 'completed' | 'cancelled'
export type RoomStatus = 'waiting' | 'in_game' | 'closed'
export type GameResult = 'win' | 'lose' | 'draw' | 'incomplete'

// JSON field types
export interface UserSettings {
  theme?: 'light' | 'dark' | 'system'
  soundEnabled?: boolean
  animationsEnabled?: boolean
  language?: string
  notifications?: boolean
}

export interface GameData {
  items?: GameItem[]
  connections?: Connection[]
  goals?: Goal[]
  startItem?: GameItem | null
  endItem?: GameItem | null
  timerSeconds?: number
}

export interface RoomSettings {
  mode?: GameMode
  timerEnabled?: boolean
  timerSeconds?: number
  maxItems?: number
  castFilter?: 'mixed' | 'actors_only' | 'movies_only'
}

export interface GameItem {
  id: number
  type: 'movie' | 'person'
  name: string
  image?: string
  x?: number
  y?: number
}

export interface Connection {
  from: number
  to: number
  type?: string
}

export interface Goal {
  id: string
  startId: number
  endId: number
  completed: boolean
}

// Helper types for database operations
export type Tables = Database['public']['Tables']
export type UserRow = Tables['users']['Row']
export type UserInsert = Tables['users']['Insert']
export type UserUpdate = Tables['users']['Update']
export type GameRow = Tables['games']['Row']
export type GameInsert = Tables['games']['Insert']
export type GameUpdate = Tables['games']['Update']
export type GamePlayerRow = Tables['game_players']['Row']
export type GamePlayerInsert = Tables['game_players']['Insert']
export type RoomRow = Tables['rooms']['Row']
export type RoomInsert = Tables['rooms']['Insert']
export type RoomUpdate = Tables['rooms']['Update']
export type LeaderboardRow = Tables['leaderboard']['Row']
export type LeaderboardInsert = Tables['leaderboard']['Insert']
export type GameHistoryRow = Tables['game_history']['Row']
export type GameHistoryInsert = Tables['game_history']['Insert']

// Friendship types
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'

export interface FriendRow {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
}

export interface FriendInsert {
  requester_id: string
  addressee_id: string
  status?: FriendshipStatus
}

export interface FriendWithUser extends FriendRow {
  friend: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  }
}

