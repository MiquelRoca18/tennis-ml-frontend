/**
 * useMatchOdds - Cuotas multi-casa de un partido (line-shopping, SP2)
 * ===================================================================
 *
 * Carga las cuotas de todas las casas (tabla match_odds del backend) para que el cliente
 * calcule la mejor cuota entre las casas del usuario con bestOdds(). Patrón simple
 * (useState + fetch), como useMatchDetail. Pasar `undefined` desactiva la carga (p. ej.
 * cuando no hay recomendación de apuesta y no merece la pena pedir cuotas).
 */

import { useCallback, useEffect, useState } from 'react';
import {
  fetchMatchBestOdds,
  type MatchBestOddsResponse,
} from '../services/api/matchDetailService';

export function useMatchOdds(matchId: number | undefined) {
  const [data, setData] = useState<MatchBestOddsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!matchId) {
      setData(null);
      return;
    }
    try {
      setLoading(true);
      setData(await fetchMatchBestOdds(matchId));
    } catch (e) {
      // Nunca romper la pantalla por las cuotas: si falla, no se muestra el best-odds.
      console.error('[useMatchOdds]', e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, refresh: load };
}
