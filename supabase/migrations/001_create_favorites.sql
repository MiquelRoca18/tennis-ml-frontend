-- Tennis ML - Favorites table for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Table: favorites (user's favorite matches)
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id INTEGER NOT NULL,
  event_key TEXT,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  tournament TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Index for listing favorites by user
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running (optional)
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
