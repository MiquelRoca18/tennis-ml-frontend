import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@tenly:bookmakers';

/**
 * Casas de apuestas seleccionadas por el usuario (line-shopping por usuario, SP2).
 *
 * Persistencia local en AsyncStorage. Un Set vacío significa "considerar TODAS las casas"
 * (comportamiento por defecto: mejor cuota global). El cálculo de la mejor cuota entre las
 * casas del usuario se hace en cliente con `bestOdds(books, bookmakers)`.
 *
 * TODO: sincronizar con Supabase user_settings (key 'bookmakers') como el bankroll, para
 * que las casas viajen entre dispositivos del mismo usuario.
 */
export function useBookmakerPrefs() {
  const [bookmakers, setBookmakers] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Carga inicial desde AsyncStorage.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setBookmakers(new Set(JSON.parse(raw) as string[]));
      } catch (e) {
        console.error('[BookmakerPrefs] load:', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Persistencia automática en cada cambio (tras la carga inicial).
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmakers])).catch((e) =>
      console.error('[BookmakerPrefs] save:', e)
    );
  }, [bookmakers, loaded]);

  const toggle = useCallback((bookmaker: string) => {
    setBookmakers((prev) => {
      const next = new Set(prev);
      if (next.has(bookmaker)) next.delete(bookmaker);
      else next.add(bookmaker);
      return next;
    });
  }, []);

  const clear = useCallback(() => setBookmakers(new Set()), []);

  return { bookmakers, loaded, toggle, clear };
}
