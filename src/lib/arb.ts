/**
 * Reparto de stake y ganancia de un arbitraje, calculado EN CLIENTE para cualquier bankroll.
 *
 * La detección del arb (que exista) la hace el backend; el reparto para el dinero que elige el
 * usuario se recalcula aquí en vivo (sin llamar al servidor), así el input responde al instante.
 *
 *   inv           = Σ 1/odds_i
 *   stake_i       = bankroll * (1/odds_i) / inv      → los dos stakes suman el bankroll
 *   retorno       = bankroll / inv                   → igual gane quien gane
 *   ganancia      = retorno - bankroll
 */

export interface ArbSplitLeg {
  side: number;
  bookmaker: string;
  odds: number;
  stake: number;
}

export interface ArbSplit {
  legs: ArbSplitLeg[];
  /** Ganancia garantizada en € para el bankroll dado. */
  profit: number;
  /** Lo que recuperas gane quien gane (bankroll + ganancia). */
  guaranteedReturn: number;
  /** ROI garantizado en % (independiente del bankroll). */
  profitPct: number;
}

export function computeArbSplit(
  legs: { side: number; bookmaker: string; odds: number }[],
  bankroll: number,
): ArbSplit {
  const inv = legs.reduce((sum, l) => sum + (l.odds > 0 ? 1 / l.odds : 0), 0);
  if (inv <= 0) {
    return {
      legs: legs.map((l) => ({ ...l, stake: 0 })),
      profit: 0,
      guaranteedReturn: 0,
      profitPct: 0,
    };
  }
  const guaranteedReturn = bankroll / inv;
  return {
    legs: legs.map((l) => ({ ...l, stake: (bankroll * (1 / l.odds)) / inv })),
    profit: guaranteedReturn - bankroll,
    guaranteedReturn,
    profitPct: (1 / inv - 1) * 100,
  };
}
