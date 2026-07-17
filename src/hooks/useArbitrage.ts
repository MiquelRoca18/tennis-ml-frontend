/**
 * useArbitrage - oportunidades de arbitraje con auto-refresh corto (SP3).
 *
 * Las cuotas cambian, así que refrescamos cada 60s. Patrón useState (como useMatchDetail).
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchArbitrage, type ArbitrageResponse } from '../services/api/arbitrageService';

const REFRESH_MS = 60_000;

export function useArbitrage() {
  const [data, setData] = useState<ArbitrageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await fetchArbitrage());
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando arbitrajes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Refresco periódico: el arbitraje caduca rápido.
  useEffect(() => {
    const id = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return { data, loading, error, refresh: load };
}
