/**
 * useMatchDetail - Hook para el detalle del partido
 * =================================================
 *
 * Maneja la carga de datos del partido y el auto-refresh
 * para partidos en vivo. Usa caché y primera carga rápida (live=false).
 */

import { useCallback, useEffect, useState } from 'react';
import { MatchFullResponse } from '../types/matchDetail';
import { fetchMatchFull } from '../services/api/matchDetailService';
import { getCachedMatchDetail, setCachedMatchDetail } from '../services/api/matchDetailCache';

interface UseMatchDetailResult {
    data: MatchFullResponse | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    isLive: boolean;
}

interface UseMatchDetailOptions {
    /** Auto-refresh para partidos en vivo (ms). Default: 10000 (10 s) para reducir retraso respecto al resultado real */
    liveRefreshInterval?: number;
    /** Habilitar auto-refresh */
    enableAutoRefresh?: boolean;
}

/**
 * Hook para cargar y gestionar los datos del detalle del partido.
 * - Primera carga rápida: pide con live=false (solo BD en backend).
 * - Si hay caché: muestra al instante y revalida en segundo plano.
 * - Prefetch desde el feed (al pulsar la card) rellena la caché para apertura instantánea.
 */
export function useMatchDetail(
    matchId: number | undefined,
    options: UseMatchDetailOptions = {}
): UseMatchDetailResult {
    const {
        liveRefreshInterval = 10000,
        enableAutoRefresh = true,
    } = options;

    const [data, setData] = useState<MatchFullResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isLive = data?.match.status === 'en_juego';

    const loadData = useCallback(async (opts: { live?: boolean } = {}) => {
        if (!matchId) {
            setLoading(false);
            return;
        }

        const useLive = opts.live ?? true;
        const label = `[useMatchDetail] match ${matchId} (live=${useLive})`;
        if (__DEV__) {
            console.log(`${label} - fetch start`);
            console.time(label);
        }

        try {
            setError(null);
            const response = await fetchMatchFull(matchId, { live: useLive });
            if (__DEV__) {
                console.timeEnd(label);
                console.log(`${label} - done | stats: ${!!response.stats} timeline: ${!!response.timeline} sets: ${response.timeline?.sets?.length ?? 0}`);
            }
            setCachedMatchDetail(matchId, response);
            setData(response);
        } catch (err: any) {
            if (__DEV__) console.timeEnd(label);
            console.error('Error loading match detail:', err);
            setError(err.message || 'Error cargando datos del partido');
        } finally {
            setLoading(false);
        }
    }, [matchId]);

    const refresh = useCallback(async () => {
        setLoading(true);
        await loadData({ live: true });
    }, [loadData]);

    // Carga inicial: caché primero (instantáneo), luego red con live=false (rápido) o revalidar con live=true
    useEffect(() => {
        if (!matchId) {
            setLoading(false);
            return;
        }

        const cached = getCachedMatchDetail(matchId);
        if (cached) {
            if (__DEV__) {
                console.log(`[useMatchDetail] match ${matchId} - CACHE HIT, showing immediately (revalidate in background)`);
            }
            setData(cached);
            setLoading(false);
            setError(null);
            // Revalidar en segundo plano con datos en vivo
            loadData({ live: true });
            return;
        }

        if (__DEV__) {
            console.log(`[useMatchDetail] match ${matchId} - no cache, first load (live=false for speed)`);
        }
        setLoading(true);
        // Primera carga sin caché: pedir con live=false para respuesta rápida
        loadData({ live: false });
    }, [matchId, loadData]);

    // Auto-refresh para partidos en vivo (ya tenemos data)
    useEffect(() => {
        if (!enableAutoRefresh || !isLive || !matchId) {
            return;
        }

        const interval = setInterval(() => {
            loadData({ live: true });
        }, liveRefreshInterval);

        return () => clearInterval(interval);
    }, [enableAutoRefresh, isLive, matchId, liveRefreshInterval, loadData]);

    return {
        data,
        loading,
        error,
        refresh,
        isLive,
    };
}

export default useMatchDetail;
