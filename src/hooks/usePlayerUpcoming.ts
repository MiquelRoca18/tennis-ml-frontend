import { useEffect, useState } from 'react';
import { fetchPlayerUpcoming } from '../services/api/playerService';
import { PlayerUpcomingResponse } from '../types/api';
import { fetchWithCache, upcomingCache } from '../utils/cache';

/**
 * Hook to fetch player's upcoming matches (fixtures) with caching
 * @param playerKey - Player ID
 * @param days - Next N days (1-31, default 14)
 */
export function usePlayerUpcoming(playerKey: number | null, days = 14) {
    const [data, setData] = useState<PlayerUpcomingResponse | null>(null);
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

                const cacheKey = `player-upcoming-${playerKey}-${days}`;
                const upcomingData = await fetchWithCache(
                    cacheKey,
                    () => fetchPlayerUpcoming(playerKey, days),
                    upcomingCache
                );

                if (!cancelled) {
                    setData(upcomingData);
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
    }, [playerKey, days]);

    return { data, loading, error };
}
