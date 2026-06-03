import { useEffect, useState } from 'react';
import { fetchPlayer } from '../services/api/playerService';
import { PlayerProfile } from '../types/api';
import { fetchWithCache, playerCache } from '../utils/cache';

/**
 * Hook to fetch player data with caching
 * @param playerKey - Player ID
 * @returns Object with player data, loading state, and error
 */
export function usePlayer(playerKey: number | null) {
    const [player, setPlayer] = useState<PlayerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!playerKey) {
            setPlayer(null);
            setLoading(false);
            return;
        }
        const key: number = playerKey;

        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchWithCache(
                    `player-${key}`,
                    () => fetchPlayer(key),
                    playerCache
                );

                if (!cancelled) {
                    setPlayer(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err as Error);
                    setPlayer(null);
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
    }, [playerKey]);

    return { player, loading, error };
}
