/**
 * Favorites Service - Híbrido Supabase + AsyncStorage
 * - Usuario logueado: Supabase (sincronizado en la nube)
 * - Usuario anónimo: AsyncStorage (local)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const FAVORITES_KEY = '@tennis_favorites';

export interface Favorite {
  matchId: number;
  player1Name: string;
  player2Name: string;
  tournament: string;
  addedAt: string;
}

type FavoriteInput = Omit<Favorite, 'addedAt'>;

function mapSupabaseToFavorite(row: {
  match_id: number;
  player1_name: string;
  player2_name: string;
  tournament: string | null;
  added_at: string;
}): Favorite {
  return {
    matchId: row.match_id,
    player1Name: row.player1_name,
    player2Name: row.player2_name,
    tournament: row.tournament ?? '',
    addedAt: row.added_at,
  };
}

/** Obtener favoritos (Supabase si hay userId, sino AsyncStorage) */
export async function getFavorites(userId?: string | null): Promise<Favorite[]> {
  if (userId && isSupabaseConfigured) {
    if (__DEV__) console.log('[Favorites] getFavorites desde Supabase, userId:', userId.slice(0, 8) + '...');
    const { data, error } = await supabase
      .from('favorites')
      .select('match_id, player1_name, player2_name, tournament, added_at')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('[Favorites] Error Supabase getFavorites:', error.message, 'code:', error.code);
      return [];
    }
    if (__DEV__) console.log('[Favorites] Supabase devolvió', (data ?? []).length, 'favoritos');
    return (data ?? []).map(mapSupabaseToFavorite);
  }

  try {
    const json = await AsyncStorage.getItem(FAVORITES_KEY);
    const favs = json ? JSON.parse(json) : [];
    if (__DEV__) console.log('[Favorites] AsyncStorage devolvió', favs.length, 'favoritos');
    return favs;
  } catch (error) {
    console.error('[Favorites] Error AsyncStorage getFavorites:', error);
    return [];
  }
}

/** Comprobar si un partido es favorito */
export async function isFavorite(matchId: number, userId?: string | null): Promise<boolean> {
  const favorites = await getFavorites(userId);
  return favorites.some((fav) => fav.matchId === matchId);
}

/** Añadir favorito */
export async function addFavorite(
  favorite: FavoriteInput,
  userId?: string | null,
  eventKey?: string | null
): Promise<void> {
  if (userId && isSupabaseConfigured) {
    const { error } = await supabase.from('favorites').insert({
      user_id: userId,
      match_id: favorite.matchId,
      event_key: eventKey ?? null,
      player1_name: favorite.player1Name,
      player2_name: favorite.player2Name,
      tournament: favorite.tournament ?? null,
    });

    if (error) {
      if (error.code === '23505') {
        if (__DEV__) console.log('[Favorites] addFavorite: ya existe (23505)');
        return;
      }
      console.error('[Favorites] Error Supabase addFavorite:', error.message, 'code:', error.code);
    } else if (__DEV__) {
      console.log('[Favorites] addFavorite OK, matchId:', favorite.matchId);
    }
    return;
  }

  try {
    const favorites = await getFavorites();
    const newFavorite: Favorite = { ...favorite, addedAt: new Date().toISOString() };
    if (favorites.some((fav) => fav.matchId === favorite.matchId)) return;
    favorites.push(newFavorite);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('[Favorites] Error AsyncStorage addFavorite:', error);
  }
}

/** Eliminar favorito */
export async function removeFavorite(matchId: number, userId?: string | null): Promise<void> {
  if (userId && isSupabaseConfigured) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('match_id', matchId);

    if (error) {
      console.error('[Favorites] Error Supabase removeFavorite:', error.message, 'code:', error.code);
    } else if (__DEV__) {
      console.log('[Favorites] removeFavorite OK, matchId:', matchId);
    }
    return;
  }

  try {
    const favorites = await getFavorites();
    const filtered = favorites.filter((fav) => fav.matchId !== matchId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[Favorites] Error AsyncStorage removeFavorite:', error);
  }
}

/** Toggle favorito */
export async function toggleFavorite(
  matchId: number,
  matchData: Omit<Favorite, 'matchId' | 'addedAt'>,
  userId?: string | null,
  eventKey?: string | null
): Promise<boolean> {
  const isFav = await isFavorite(matchId, userId);
  if (isFav) {
    await removeFavorite(matchId, userId);
    return false;
  }
  await addFavorite({ matchId, ...matchData }, userId, eventKey);
  return true;
}

/** Migrar favoritos locales a Supabase al hacer login */
export async function migrateLocalFavoritesToSupabase(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const localFavorites = await getFavorites(); // Sin userId = AsyncStorage
    if (localFavorites.length === 0) return;

    for (const fav of localFavorites) {
      await addFavorite(
        {
          matchId: fav.matchId,
          player1Name: fav.player1Name,
          player2Name: fav.player2Name,
          tournament: fav.tournament,
        },
        userId
      );
    }

    await AsyncStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('[Favorites] Error migrateLocalFavoritesToSupabase:', error);
  } finally {
    if (__DEV__) console.log('[Favorites] Migración completada');
  }
}
