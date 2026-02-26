/**
 * Contexto que carga la lista de favoritos UNA sola vez y la expone a toda la app.
 * Evita N llamadas a getFavorites (una por MatchCard) y mejora el rendimiento del feed.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Favorite } from '../services/favoritesService';
import { getFavorites, toggleFavorite } from '../services/favoritesService';
import { useAuth } from './AuthContext';
import { useFavoritesRefresh } from './FavoritesRefreshContext';

interface FavoritesContextValue {
  favorites: Favorite[];
  favoriteMatchIds: Set<number>;
  loading: boolean;
  refresh: () => Promise<void>;
  toggle: (
    matchId: number,
    matchData: { player1Name: string; player2Name: string; tournament: string; eventKey?: string }
  ) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { refreshTrigger } = useFavoritesRefresh();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);

  const loadFavorites = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    const list = await getFavorites(user?.id);
    hasLoadedOnce.current = true;
    setFavorites(list);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites, refreshTrigger]);

  const refresh = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  const toggle = useCallback(
    async (
      matchId: number,
      matchData: { player1Name: string; player2Name: string; tournament: string; eventKey?: string }
    ): Promise<boolean> => {
      const newStatus = await toggleFavorite(
        matchId,
        matchData,
        user?.id,
        matchData.eventKey ?? null
      );
      await loadFavorites();
      return newStatus;
    },
    [user?.id, loadFavorites]
  );

  const favoriteMatchIds = useMemo(
    () => new Set(favorites.map((f) => f.matchId)),
    [favorites]
  );

  const value: FavoritesContextValue = useMemo(
    () => ({
      favorites,
      favoriteMatchIds,
      loading,
      refresh,
      toggle,
    }),
    [favorites, favoriteMatchIds, loading, refresh, toggle]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext(): FavoritesContextValue | null {
  return useContext(FavoritesContext);
}
