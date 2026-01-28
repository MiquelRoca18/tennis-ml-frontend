/**
 * useMatchDetail - Hook para el detalle del partido
 * =================================================
 * 
 * Maneja la carga de datos del partido y el auto-refresh
 * para partidos en vivo.
 */

import { useCallback, useEffect, useState } from 'react';
import { MatchFullResponse } from '../types/matchDetail';
import { fetchMatchFull } from '../services/api/matchDetailService';

interface UseMatchDetailResult {
    data: MatchFullResponse | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    isLive: boolean;
}

interface UseMatchDetailOptions {
    /** Auto-refresh para partidos en vivo (ms). Default: 60000 (1 min) */
    liveRefreshInterval?: number;
    /** Habilitar auto-refresh */
    enableAutoRefresh?: boolean;
}

/**
 * Hook para cargar y gestionar los datos del detalle del partido.
 * 
 * @param matchId - ID del partido
 * @param options - Opciones de configuración
 * @returns Datos, estado y funciones de control
 */
export function useMatchDetail(
    matchId: number | undefined,
    options: UseMatchDetailOptions = {}
): UseMatchDetailResult {
    const {
        liveRefreshInterval = 60000,
        enableAutoRefresh = true,
    } = options;

    const [data, setData] = useState<MatchFullResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isLive = data?.match.status === 'en_juego';

    const loadData = useCallback(async () => {
        if (!matchId) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const response = await fetchMatchFull(matchId);
            setData(response);
        } catch (err: any) {
            console.error('Error loading match detail:', err);
            setError(err.message || 'Error cargando datos del partido');
        } finally {
            setLoading(false);
        }
    }, [matchId]);

    const refresh = useCallback(async () => {
        setLoading(true);
        await loadData();
    }, [loadData]);

    // Carga inicial
    useEffect(() => {
        setLoading(true);
        loadData();
    }, [loadData]);

    // Auto-refresh para partidos en vivo
    useEffect(() => {
        if (!enableAutoRefresh || !isLive) {
            return;
        }

        const interval = setInterval(() => {
            loadData();
        }, liveRefreshInterval);

        return () => clearInterval(interval);
    }, [enableAutoRefresh, isLive, liveRefreshInterval, loadData]);

    return {
        data,
        loading,
        error,
        refresh,
        isLive,
    };
}

export default useMatchDetail;
