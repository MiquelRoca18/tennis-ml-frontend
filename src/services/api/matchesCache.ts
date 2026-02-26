/**
 * Caché en memoria de partidos por fecha (YYYY-MM-DD).
 * Mejora la UX al cambiar de día: si esa fecha ya se cargó, se muestra al instante
 * y se revalida en segundo plano.
 */
import type { MatchesResponse } from '../../types/api';

const cache = new Map<string, MatchesResponse>();

export function getCachedMatches(date: string): MatchesResponse | null {
  return cache.get(date) ?? null;
}

export function setCachedMatches(date: string, data: MatchesResponse): void {
  cache.set(date, data);
}

/** Limpia la caché (útil en tests o al cerrar sesión si se quisiera). */
export function clearMatchesCache(): void {
  cache.clear();
}
