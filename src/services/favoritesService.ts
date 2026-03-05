/**
 * Favorites Service - Híbrido Supabase + AsyncStorage
 * - Usuario logueado: Supabase (sincronizado en la nube)
 * - Usuario anónimo: AsyncStorage (local)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const FAVORITES_KEY = '@tennis_favorites';

/** Caché en memoria para favoritos de Supabase (evita llamadas repetidas al cambiar de pestaña). */
const CACHE_TTL_MS = 30_000; // 30 segundos
let favoritesCache: { userId: string; data: Favorite[]; ts: number } | null = null;

export function invalidateFavoritesCache(userId?: string | null): void {
  if (!userId) {
    favoritesCache = null;
    return;
  }
  if (favoritesCache?.userId === userId) favoritesCache = null;
}

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

/** Sanitiza mensaje de error (evitar loguear HTML de 502, etc.) */
function sanitizeSupabaseError(message: string | undefined, code: string | undefined): string {
  if (!message) return code ? `Error ${code}` : 'Error de servidor';
  if (message.length > 200 || message.includes('<!DOCTYPE') || message.includes('502')) {
    return 'Servidor temporalmente no disponible (502). Inténtalo en unos segundos.';
  }
  return message;
}

/** Obtener favoritos (Supabase si hay userId, sino AsyncStorage). Reintenta una vez si hay 502. Usa caché 30s si forceRefresh no es true. */
export async function getFavorites(
  userId?: string | null,
  options?: { forceRefresh?: boolean }
): Promise<Favorite[]> {
  const forceRefresh = options?.forceRefresh === true;

  if (userId && isSupabaseConfigured) {
    if (!forceRefresh && favoritesCache?.userId === userId && Date.now() - favoritesCache.ts < CACHE_TTL_MS) {
      return favoritesCache.data;
    }
    const attempt = async (): Promise<Favorite[]> => {
      const { data, error } = await supabase
        .from('favorites')
        .select('match_id, player1_name, player2_name, tournament, added_at')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapSupabaseToFavorite);
    };
    try {
      const data = await attempt();
      favoritesCache = { userId, data, ts: Date.now() };
      return data;
    } catch (e: any) {
      const isServerError =
        e?.message?.includes('502') ||
        e?.message?.includes('Bad gateway') ||
        e?.code === 'ECONNABORTED' ||
        (e?.message?.length > 200 && e?.message?.includes('<!'));
      if (isServerError) {
        await new Promise((r) => setTimeout(r, 1500));
        try {
          const data = await attempt();
          favoritesCache = { userId, data, ts: Date.now() };
          return data;
        } catch (retryErr: any) {
          console.warn('[Favorites] getFavorites (retry):', sanitizeSupabaseError(retryErr?.message, retryErr?.code));
          return favoritesCache?.userId === userId ? favoritesCache.data : [];
        }
      }
      console.warn('[Favorites] getFavorites:', sanitizeSupabaseError(e?.message, e?.code));
      return favoritesCache?.userId === userId ? favoritesCache.data : [];
    }
  }

  try {
    const json = await AsyncStorage.getItem(FAVORITES_KEY);
    const favs = json ? JSON.parse(json) : [];
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

/** Añadir favorito. Sin usuario no guardamos en local (requiere iniciar sesión). */
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
      if (error.code === '23505') return;
      console.error('[Favorites] Error Supabase addFavorite:', error.message, 'code:', error.code);
    } else {
      invalidateFavoritesCache(userId);
    }
    return;
  }

  // Sin sesión: no guardar en AsyncStorage; el usuario debe iniciar sesión para tener favoritos
  if (!userId && isSupabaseConfigured) return;

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

/** Limpiar favoritos locales (al iniciar sesión para mostrar solo los de la cuenta). */
export async function clearLocalFavorites(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error('[Favorites] Error clearLocalFavorites:', error);
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
    } else {
      invalidateFavoritesCache(userId);
    }
    return;
  }

  try {
    const favorites = await getFavorites(undefined);
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
  }
}
