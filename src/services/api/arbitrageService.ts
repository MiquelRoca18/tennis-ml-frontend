/**
 * Arbitrage Service - oportunidades de arbitraje (apostar a los dos lados en casas distintas).
 * Lee GET /arbitrage del backend, que incluye metadatos de frescura (as_of/stale_minutes).
 */

import apiClient from './apiClient';

export interface ArbLeg {
  side: number; // 1 = jugador1, 2 = jugador2
  bookmaker: string;
  odds: number;
  stake: number;
}

export interface Arb {
  match_id: number;
  jugador1: string | null;
  jugador2: string | null;
  profit_pct: number;
  legs: ArbLeg[];
  odds_timestamp: string | null;
}

export interface ArbitrageResponse {
  /** Timestamp de las cuotas más frescas usadas (ISO) o null si no hay cuotas. */
  as_of: string | null;
  /** Minutos desde esas cuotas. Con captura cada ~2h puede ser alto → avisar. */
  stale_minutes: number | null;
  arbs: Arb[];
}

export const fetchArbitrage = async (bankroll = 100): Promise<ArbitrageResponse> => {
  // El bankroll no afecta a la detección (solo al reparto, que se recalcula en cliente).
  const response = await apiClient.get<ArbitrageResponse>('/arbitrage', {
    params: { bankroll },
  });
  return response.data;
};
