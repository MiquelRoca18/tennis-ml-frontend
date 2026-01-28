import { useEffect, useState } from 'react';
import { fetchPlayerMatches } from '../services/api/playerService';
import { PlayerMatchesResponse } from '../types/api';
import { fetchWithCache, playerCache } from '../utils/cache';

/**
 * Hook to fetch player's recent matches with caching
 * @param playerKey - Player ID
 * @param limit - Number of matches to fetch
 * @param surface - Filter by surface (optional)
 * @returns Object with matches data, loading state, and error
 */
export function usePlayerMatches(
    playerKey: number | null,
    limit = 20,
    surface?: string
) {
    const [data, setData] = useState<PlayerMatchesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!playerKey) {
            setData(null);
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const cacheKey = `player-matches-${playerKey}-${limit}-${surface || 'all'}`;
                const matchesData = await fetchWithCache(
                    cacheKey,
                    () => fetchPlayerMatches(playerKey, limit, surface),
                    playerCache
                );

                if (!cancelled) {
                    setData(matchesData);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err as Error);
                    setData(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [playerKey, limit, surface]);

    return { data, loading, error };
}
