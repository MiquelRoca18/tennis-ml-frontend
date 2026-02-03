import { useCallback, useEffect, useState } from 'react';
import {
  Favorite,
  getFavorites,
  isFavorite,
  toggleFavorite,
} from '../services/favoritesService';
import { useAuth } from '../contexts/AuthContext';
import { useFavoritesRefresh } from '../contexts/FavoritesRefreshContext';

/**
 * Hook para gestionar la lista de favoritos
 * Usa Supabase si hay usuario, AsyncStorage si no
 */
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    const favs = await getFavorites(user?.id);
    setFavorites(favs);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const refresh = useCallback(() => loadFavorites(), [loadFavorites]);

  return { favorites, loading, refresh };
}

/**
 * Hook para comprobar si un partido es favorito y hacer toggle
 */
export function useIsFavorite(matchId: number | null) {
  const { user } = useAuth();
  const { refreshTrigger } = useFavoritesRefresh();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkFavorite = useCallback(async () => {
    if (!matchId) {
      setFavorited(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const isFav = await isFavorite(matchId, user?.id);
    setFavorited(isFav);
    setLoading(false);
  }, [matchId, user?.id]);

  useEffect(() => {
    checkFavorite();
  }, [checkFavorite, refreshTrigger]);

  const toggle = async (matchData: {
    player1Name: string;
    player2Name: string;
    tournament: string;
    eventKey?: string;
  }): Promise<boolean> => {
    if (!matchId) return false;
    const newStatus = await toggleFavorite(
      matchId,
      matchData,
      user?.id,
      matchData.eventKey
    );
    setFavorited(newStatus);
    return newStatus;
  };

  return { favorited, loading, toggle, refresh: checkFavorite };
}
