-- Cinema Connection Game Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ENUMS
-- ===========================================

CREATE TYPE game_mode AS ENUM ('goal', 'hybrid', 'knowledge', 'anti', 'zen', 'custom');
CREATE TYPE play_type AS ENUM ('solo', 'pc_multi', 'pc_pvp', 'couch_multi', 'couch_pvp');
CREATE TYPE game_status AS ENUM ('waiting', 'starting', 'playing', 'paused', 'completed', 'cancelled');
CREATE TYPE room_status AS ENUM ('waiting', 'in_game', 'closed');
CREATE TYPE game_result AS ENUM ('win', 'lose', 'draw', 'incomplete');

-- ===========================================
-- USERS TABLE
-- ===========================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ,
  total_games_played INTEGER DEFAULT 0 NOT NULL,
  total_wins INTEGER DEFAULT 0 NOT NULL,
  total_time_played BIGINT DEFAULT 0 NOT NULL, -- in milliseconds
  favorite_mode game_mode,
  settings JSONB DEFAULT '{}' NOT NULL
);

-- Index for username lookups
CREATE INDEX idx_users_username ON users(username);

-- ===========================================
-- GAMES TABLE
-- ===========================================

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code TEXT,
  host_id UUID REFERENCES users(id) ON DELETE SET NULL,
  mode game_mode NOT NULL,
  play_type play_type NOT NULL,
  status game_status DEFAULT 'waiting' NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_ms BIGINT,
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  game_data JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_games_room_code ON games(room_code);
CREATE INDEX idx_games_host_id ON games(host_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_at ON games(created_at DESC);

-- ===========================================
-- GAME PLAYERS TABLE
-- ===========================================

CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_name TEXT, -- For unauthenticated players
  player_color TEXT,
  score INTEGER DEFAULT 0 NOT NULL,
  connections_made INTEGER DEFAULT 0 NOT NULL,
  items_placed INTEGER DEFAULT 0 NOT NULL,
  is_winner BOOLEAN DEFAULT FALSE NOT NULL,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for lookups
CREATE INDEX idx_game_players_game_id ON game_players(game_id);
CREATE INDEX idx_game_players_user_id ON game_players(user_id);

-- Prevent duplicate user in same game
CREATE UNIQUE INDEX idx_game_players_unique_user ON game_players(game_id, user_id) WHERE user_id IS NOT NULL;

-- ===========================================
-- ROOMS TABLE
-- ===========================================

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status room_status DEFAULT 'waiting' NOT NULL,
  play_type play_type NOT NULL,
  max_players INTEGER DEFAULT 8 NOT NULL,
  current_players INTEGER DEFAULT 0 NOT NULL,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_expires_at ON rooms(expires_at);

-- ===========================================
-- LEADERBOARD TABLE
-- ===========================================

CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode game_mode NOT NULL,
  play_type play_type NOT NULL,
  score INTEGER NOT NULL,
  time_ms BIGINT NOT NULL,
  connections_count INTEGER DEFAULT 0 NOT NULL,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  achieved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for leaderboard queries
CREATE INDEX idx_leaderboard_mode_score ON leaderboard(mode, score DESC);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX idx_leaderboard_achieved_at ON leaderboard(achieved_at DESC);

-- ===========================================
-- GAME HISTORY TABLE
-- ===========================================

CREATE TABLE game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  mode game_mode NOT NULL,
  play_type play_type NOT NULL,
  result game_result NOT NULL,
  score INTEGER DEFAULT 0 NOT NULL,
  duration_ms BIGINT DEFAULT 0 NOT NULL,
  connections_made INTEGER DEFAULT 0 NOT NULL,
  items_used INTEGER DEFAULT 0 NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for history queries
CREATE INDEX idx_game_history_user_id ON game_history(user_id);
CREATE INDEX idx_game_history_played_at ON game_history(played_at DESC);
CREATE INDEX idx_game_history_mode ON game_history(mode);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

-- Users: Users can read any profile, but only update their own
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Games: Anyone can view, authenticated users can create
CREATE POLICY "Anyone can view games" ON games FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create games" ON games FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Host can update game" ON games FOR UPDATE USING (auth.uid() = host_id);

-- Game Players: Anyone can view, authenticated users can join
CREATE POLICY "Anyone can view game players" ON game_players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join games" ON game_players FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Players can update own entry" ON game_players FOR UPDATE USING (auth.uid() = user_id);

-- Rooms: Anyone can view, authenticated users can create
CREATE POLICY "Anyone can view rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rooms" ON rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Host can update room" ON rooms FOR UPDATE USING (auth.uid() = host_id);

-- Leaderboard: Anyone can view, system inserts entries
CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add entries" ON leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Game History: Users can only view their own history
CREATE POLICY "Users can view own history" ON game_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add own history" ON game_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- FUNCTIONS & TRIGGERS
-- ===========================================

-- Function to automatically create user profile on sign up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to clean up expired rooms (call periodically via Supabase Edge Function)
CREATE OR REPLACE FUNCTION cleanup_expired_rooms()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM rooms WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- SAMPLE DATA VIEWS
-- ===========================================

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.username,
  u.display_name,
  u.total_games_played,
  u.total_wins,
  CASE WHEN u.total_games_played > 0 
    THEN ROUND((u.total_wins::DECIMAL / u.total_games_played) * 100, 1)
    ELSE 0 
  END as win_rate,
  u.total_time_played,
  u.favorite_mode
FROM users u;

-- View for top players per mode
CREATE OR REPLACE VIEW top_players_by_mode AS
SELECT DISTINCT ON (l.mode, l.user_id)
  l.mode,
  l.user_id,
  u.username,
  u.display_name,
  u.avatar_url,
  l.score,
  l.time_ms,
  l.achieved_at
FROM leaderboard l
JOIN users u ON l.user_id = u.id
ORDER BY l.mode, l.user_id, l.score DESC, l.time_ms ASC;

