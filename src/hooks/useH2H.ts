import { useEffect, useState } from 'react';
import { fetchH2H } from '../services/api/h2hService';
import { H2HResponse } from '../types/api';
import { fetchWithCache, h2hCache } from '../utils/cache';

/**
 * Hook to fetch head-to-head data between two players with caching
 * @param player1Key - First player ID
 * @param player2Key - Second player ID
 * @returns Object with H2H data, loading state, and error
 */
export function useH2H(
    player1Key: number | null,
    player2Key: number | null
) {
    const [data, setData] = useState<H2HResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!player1Key || !player2Key) {
            setData(null);
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                // Sort keys to ensure consistent cache key regardless of order
                const sortedKeys = [player1Key, player2Key].sort((a, b) => a - b);
                const cacheKey = `h2h-${sortedKeys[0]}-${sortedKeys[1]}`;

                const h2hData = await fetchWithCache(
                    cacheKey,
                    () => fetchH2H(player1Key, player2Key),
                    h2hCache
                );

                if (!cancelled) {
                    setData(h2hData);
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
    }, [player1Key, player2Key]);

    return { data, loading, error };
}
