import { useEffect, useState } from 'react';
import { Favorite, getFavorites, isFavorite, toggleFavorite } from '../services/favoritesService';

/**
 * Hook to manage favorites
 */
export function useFavorites() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = async () => {
        setLoading(true);
        const favs = await getFavorites();
        setFavorites(favs);
        setLoading(false);
    };

    useEffect(() => {
        loadFavorites();
    }, []);

    const refresh = () => {
        loadFavorites();
    };

    return {
        favorites,
        loading,
        refresh,
    };
}

/**
 * Hook to check if a match is favorited
 */
export function useIsFavorite(matchId: number | null) {
    const [favorited, setFavorited] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkFavorite = async () => {
        if (!matchId) {
            setFavorited(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        const isFav = await isFavorite(matchId);
        setFavorited(isFav);
        setLoading(false);
    };

    useEffect(() => {
        checkFavorite();
    }, [matchId]);

    const toggle = async (matchData: { player1Name: string; player2Name: string; tournament: string }) => {
        if (!matchId) return;

        const newStatus = await toggleFavorite(matchId, matchData);
        setFavorited(newStatus);
    };

    return {
        favorited,
        loading,
        toggle,
        refresh: checkFavorite,
    };
}
