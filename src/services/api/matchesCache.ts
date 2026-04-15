/**
 * Caché en memoria de partidos por fecha (YYYY-MM-DD) con TTL + LRU.
 *
 * - TTL: 5 minutos. Pasado ese tiempo el registro se considera expirado y se
 *   devuelve null para forzar revalidación fresca. Evita mostrar datos rancios
 *   cuando el usuario vuelve a la app después de un rato.
 * - LRU: máximo 20 fechas en memoria. Al exceder el límite se descarta la más
 *   antigua (primera del Map). Protege contra memory leaks en sesiones largas.
 */
import type { MatchesResponse } from '../../types/api';

interface Entry {
  data: MatchesResponse;
  timestamp: number;
}

const TTL_MS = 5 * 60 * 1000; // 5 minutos
const MAX_ENTRIES = 20;

const cache = new Map<string, Entry>();

export function getCachedMatches(date: string): MatchesResponse | null {
  const entry = cache.get(date);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(date);
    return null;
  }
  // LRU touch: re-insert para mover al final
  cache.delete(date);
  cache.set(date, entry);
  return entry.data;
}

export function setCachedMatches(date: string, data: MatchesResponse): void {
  if (cache.has(date)) {
    cache.delete(date);
  } else if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(date, { data, timestamp: Date.now() });
}

/** Limpia la caché (útil en tests o al cerrar sesión si se quisiera). */
export function clearMatchesCache(): void {
  cache.clear();
}
