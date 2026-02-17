-- Tennis ML - Bets table for Supabase (apuestas registradas por el usuario)
-- Ejecuta en Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- Igual que favorites: cada usuario ve solo sus apuestas.

CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id INTEGER NOT NULL,
  stake_eur REAL NOT NULL CHECK (stake_eur > 0),
  player1_name TEXT,
  player2_name TEXT,
  tournament TEXT,
  event_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_created_at ON bets(created_at DESC);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bets" ON bets;
DROP POLICY IF EXISTS "Users can insert own bets" ON bets;
DROP POLICY IF EXISTS "Users can delete own bets" ON bets;

CREATE POLICY "Users can view own bets"
  ON bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bets"
  ON bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bets"
  ON bets FOR DELETE
  USING (auth.uid() = user_id);
