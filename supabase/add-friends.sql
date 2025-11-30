-- Add friends table for friend relationships
-- Run this in Supabase SQL Editor

-- Create friendship status enum
DO $$ BEGIN
  CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate friendships
  UNIQUE (requester_id, addressee_id),
  
  -- Prevent self-friending
  CHECK (requester_id != addressee_id)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_friends_requester ON friends(requester_id);
CREATE INDEX IF NOT EXISTS idx_friends_addressee ON friends(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view friendships they're part of
CREATE POLICY "Users can view own friendships" ON friends
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

-- Users can send friend requests
CREATE POLICY "Users can send friend requests" ON friends
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id
  );

-- Users can update friendships they're part of (accept/block)
CREATE POLICY "Users can update own friendships" ON friends
  FOR UPDATE USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

-- Users can delete friendships they're part of
CREATE POLICY "Users can delete own friendships" ON friends
  FOR DELETE USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_friends_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_friends_updated_at ON friends;
CREATE TRIGGER trigger_friends_updated_at
  BEFORE UPDATE ON friends
  FOR EACH ROW
  EXECUTE FUNCTION update_friends_updated_at();

