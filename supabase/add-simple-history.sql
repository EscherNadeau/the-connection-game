-- Simple Game History Table Fix
-- Run this in Supabase SQL Editor

-- Option 1: Alter existing table to make game_id nullable
ALTER TABLE game_history 
  ALTER COLUMN game_id DROP NOT NULL,
  ALTER COLUMN play_type DROP NOT NULL,
  ALTER COLUMN items_used SET DEFAULT 0;

-- Option 2: If table doesn't exist or you want to recreate it:
-- DROP TABLE IF EXISTS game_history;
-- 
-- CREATE TABLE game_history (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   game_id UUID REFERENCES games(id) ON DELETE SET NULL,  -- Now nullable
--   mode game_mode NOT NULL,
--   play_type play_type,  -- Now nullable
--   result game_result NOT NULL,
--   score INTEGER DEFAULT 0 NOT NULL,
--   duration_ms BIGINT DEFAULT 0 NOT NULL,
--   connections_made INTEGER DEFAULT 0 NOT NULL,
--   items_used INTEGER DEFAULT 0 NOT NULL,
--   played_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
-- );
-- 
-- -- Indexes
-- CREATE INDEX idx_game_history_user_id ON game_history(user_id);
-- CREATE INDEX idx_game_history_played_at ON game_history(played_at DESC);
-- CREATE INDEX idx_game_history_mode ON game_history(mode);
-- 
-- -- RLS
-- ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own history" ON game_history FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can add own history" ON game_history FOR INSERT WITH CHECK (auth.uid() = user_id);

