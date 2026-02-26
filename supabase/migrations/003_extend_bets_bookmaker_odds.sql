-- Tennis ML - Extend bets table: bookmaker, odds, picked player, status, potential win
-- Ejecuta en Supabase SQL Editor después de 002_create_bets.sql
-- Las filas existentes quedan con valores por defecto; el frontend las trata como 'activa'.

-- Columnas nuevas (nullable para no romper filas existentes)
ALTER TABLE bets
  ADD COLUMN IF NOT EXISTS bookmaker TEXT,
  ADD COLUMN IF NOT EXISTS odds REAL,
  ADD COLUMN IF NOT EXISTS picked_player TEXT,
  ADD COLUMN IF NOT EXISTS potential_win REAL,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'activa';

-- Constraint de status solo para valores permitidos (sin NOT NULL para permitir filas viejas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bets_status_check'
  ) THEN
    ALTER TABLE bets ADD CONSTRAINT bets_status_check
      CHECK (status IS NULL OR status IN ('activa', 'cancelada', 'completada'));
  END IF;
END $$;

-- Índice para filtrar apuestas activas
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(user_id, status) WHERE status = 'activa';

-- Comentarios para documentación
COMMENT ON COLUMN bets.bookmaker IS 'Nombre de la casa de apuestas';
COMMENT ON COLUMN bets.odds IS 'Cuota a la que se apostó';
COMMENT ON COLUMN bets.picked_player IS 'Nombre del jugador al que se apostó';
COMMENT ON COLUMN bets.potential_win IS 'Ganancia potencial (stake_eur * odds) si gana la apuesta';
COMMENT ON COLUMN bets.status IS 'activa | cancelada | completada';
