/**
 * Mejor cuota por lado entre casas (line-shopping). Port TS de best_odds (backend).
 *
 * Recupera el margen de la casa cogiendo, para cada jugador (side 1|2), la cuota más
 * alta disponible. Con `casas` se filtra a las casas del usuario (SP2). Ignora cuotas <= 1.
 */

export interface OddsRow {
  bookmaker: string;
  side: number; // 1 = jugador1, 2 = jugador2
  odds: number;
}

export interface BestOdd {
  odds: number;
  bookmaker: string;
}

export function bestOdds(rows: OddsRow[], casas?: Set<string>): Record<number, BestOdd> {
  const best: Record<number, BestOdd> = {};
  for (const row of rows) {
    const { odds, bookmaker, side } = row;
    if (odds == null || odds <= 1) continue;
    if (casas && !casas.has(bookmaker)) continue;
    if (side !== 1 && side !== 2) continue;
    const current = best[side];
    if (!current || odds > current.odds) {
      best[side] = { odds, bookmaker };
    }
  }
  return best;
}
