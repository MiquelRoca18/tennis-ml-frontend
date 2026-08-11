import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bookmakersFor, type CountryCode } from '../lib/bookmakers';

const STORAGE_KEY = '@tenly:bookmakers';
const INITIALIZED_KEY = '@tenly:bookmakers:initialized';

// La precarga no usa useUserCountry() para no acoplar la persistencia a React: ocurre una
// sola vez y España es el único país soportado hoy.
const DEFAULT_COUNTRY: CountryCode = 'ES';

/**
 * Casas de apuestas seleccionadas por el usuario (line-shopping por usuario, SP2).
 *
 * Persistencia local en AsyncStorage. En el primer arranque se precargan las casas
 * accesibles desde su país, para que no parta de cero; a partir de ahí manda su selección,
 * incluso si la deja vacía. Quien necesite saber contra qué casas comparar debe usar
 * `useEffectiveBookmakers()`, no este hook directamente.
 *
 * TODO: sincronizar con Supabase user_settings (key 'bookmakers') como el bankroll, para
 * que las casas viajen entre dispositivos del mismo usuario.
 */
export function useBookmakerPrefs() {
  const [bookmakers, setBookmakers] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Carga inicial desde AsyncStorage, con precarga del país la primera vez.
  useEffect(() => {
    (async () => {
      try {
        const [raw, initialized] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(INITIALIZED_KEY),
        ]);
        if (raw) {
          setBookmakers(new Set(JSON.parse(raw) as string[]));
        } else if (!initialized) {
          setBookmakers(bookmakersFor(DEFAULT_COUNTRY));
        }
        // El flag distingue "usuario nuevo" de "vació la lista a propósito": sin él, un Set
        // vacío volvería a rellenarse en cada arranque ignorando su decisión.
        if (!initialized) await AsyncStorage.setItem(INITIALIZED_KEY, '1');
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
