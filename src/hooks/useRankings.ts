import { useEffect, useState } from 'react';
import { fetchRankings } from '../services/api/rankingsService';
import { RankingsResponse } from '../types/api';
import { fetchWithCache, rankingsCache } from '../utils/cache';

/**
 * Hook to fetch ATP or WTA rankings with caching
 * @param league - 'ATP' or 'WTA'
 * @param limit - Number of players to fetch
 * @returns Object with rankings data, loading state, and error
 */
export function useRankings(league: 'ATP' | 'WTA', limit = 100) {
    const [data, setData] = useState<RankingsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const cacheKey = `rankings-${league}-${limit}`;
                const rankingsData = await fetchWithCache(
                    cacheKey,
                    () => fetchRankings(league, limit),
                    rankingsCache
                );

                if (!cancelled) {
                    setData(rankingsData);
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
    }, [league, limit]);

    return { data, loading, error };
}
