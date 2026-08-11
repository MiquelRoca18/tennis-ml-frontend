import { useMemo } from 'react';
import { bookmakersFor } from '../lib/bookmakers';
import { useBookmakerPrefs } from './useBookmakerPrefs';
import { useUserCountry } from './useUserCountry';

/**
 * Casas contra las que se compara de verdad: las que el usuario ha elegido o, si no ha
 * elegido ninguna, las accesibles desde su país.
 *
 * Es el único concepto que deben consumir las pantallas. Evita que cada una decida por su
 * cuenta qué significa "sin selección" — antes significaba "todas las casas", y por eso se
 * llegaba a recomendar la mejor cuota en una casa donde el usuario no puede apostar.
 */
export function useEffectiveBookmakers(): Set<string> {
  const { bookmakers } = useBookmakerPrefs();
  const country = useUserCountry();

  return useMemo(
    () => (bookmakers.size > 0 ? bookmakers : bookmakersFor(country)),
    [bookmakers, country]
  );
}
