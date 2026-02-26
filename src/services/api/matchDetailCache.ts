/**
 * Caché en memoria del detalle de partido por matchId.
 * Mejora la UX: al abrir un partido ya visitado o tras prefetch, se muestra al instante
 * y se revalida en segundo plano.
 */
import type { MatchFullResponse } from '../../types/matchDetail';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

interface CacheEntry {
  data: MatchFullResponse;
  ts: number;
}

const cache = new Map<number, CacheEntry>();

export function getCachedMatchDetail(matchId: number): MatchFullResponse | null {
  const entry = cache.get(matchId);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(matchId);
    return null;
  }
  return entry.data;
}

export function setCachedMatchDetail(matchId: number, data: MatchFullResponse): void {
  cache.set(matchId, { data, ts: Date.now() });
}

/** Limpia la caché (tests o al cerrar sesión). */
export function clearMatchDetailCache(): void {
  cache.clear();
}
