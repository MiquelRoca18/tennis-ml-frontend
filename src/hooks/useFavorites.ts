import { useCallback, useEffect, useState } from 'react';
import type { Favorite } from '../services/favoritesService';
import { getFavorites, isFavorite, toggleFavorite } from '../services/favoritesService';
import { useAuth } from '../contexts/AuthContext';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { useFavoritesRefresh } from '../contexts/FavoritesRefreshContext';

/**
 * Hook para gestionar la lista de favoritos.
 * Si existe FavoritesProvider, usa el contexto (una sola carga). Si no, carga con getFavorites.
 */
export function useFavorites() {
  const ctx = useFavoritesContext();
  const { user } = useAuth();
  const [localFavorites, setLocalFavorites] = useState<Favorite[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setLocalLoading(true);
    const favs = await getFavorites(user?.id);
    setLocalFavorites(favs);
    setLocalLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (ctx) return;
    loadFavorites();
  }, [ctx, loadFavorites]);

  const refresh = useCallback(async () => {
    if (ctx) {
      await ctx.refresh();
      return;
    }
    await loadFavorites();
  }, [ctx, loadFavorites]);

  if (ctx) {
    return { favorites: ctx.favorites, loading: ctx.loading, refresh };
  }
  return { favorites: localFavorites, loading: localLoading, refresh };
}

/**
 * Hook para comprobar si un partido es favorito y hacer toggle.
 * Con FavoritesProvider: usa el Set del contexto (0 llamadas extra por card).
 * Sin contexto: una llamada isFavorite (getFavorites) por card.
 */
export function useIsFavorite(matchId: number | null) {
  const ctx = useFavoritesContext();
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
    if (!ctx) {
      checkFavorite();
    }
  }, [ctx, matchId, refreshTrigger, checkFavorite]);

  const toggle = useCallback(
    async (matchData: {
      player1Name: string;
      player2Name: string;
      tournament: string;
      eventKey?: string;
    }): Promise<boolean> => {
      if (!matchId) return false;
      if (ctx) {
        const newStatus = await ctx.toggle(matchId, matchData);
        return newStatus;
      }
      const newStatus = await toggleFavorite(
        matchId,
        matchData,
        user?.id,
        matchData.eventKey
      );
      setFavorited(newStatus);
      return newStatus;
    },
    [matchId, ctx, user?.id]
  );

  if (ctx) {
    return {
      favorited: matchId != null ? ctx.favoriteMatchIds.has(matchId) : false,
      loading: ctx.loading,
      toggle,
      refresh: ctx.refresh,
    };
  }
  return { favorited, loading, toggle, refresh: checkFavorite };
}
