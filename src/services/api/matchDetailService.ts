/**
 * Match Detail Service - Servicio para el detalle del partido
 * ===========================================================
 *
 * Llama al endpoint /matches/{id}/details (alias del endpoint v2)
 * que devuelve todos los datos del partido en una sola llamada.
 * Soporta ?live=false para primera carga rápida (sin enriquecimiento con API externa).
 */

import { MatchFullResponse } from '../../types/matchDetail';
import apiClient from './apiClient';
import { setCachedMatchDetail } from './matchDetailCache';

export interface FetchMatchFullOptions {
  /** Si false, el backend no llama a get_livescore (respuesta más rápida). Default true. */
  live?: boolean;
}

/**
 * Obtiene todos los datos del partido en una sola llamada.
 *
 * @param matchId - ID del partido
 * @param options - live: false para primera carga rápida (solo BD)
 * @returns Datos completos del partido
 */
export const fetchMatchFull = async (
  matchId: number,
  options: FetchMatchFullOptions = {}
): Promise<MatchFullResponse> => {
  const { live = true } = options;
  const response = await apiClient.get<MatchFullResponse>(`/matches/${matchId}/details`, {
    params: { live: live ? 'true' : 'false' },
  });
  return response.data;
};

/**
 * Prefetch del detalle de un partido (fire-and-forget).
 * Guarda el resultado en matchDetailCache para que al abrir la pantalla cargue al instante.
 *
 * Usa live=true: el backend ya cachea get_livescore/get_fixtures por 15s, así que
 * el prefetch aprovecha datos en directo sin coste extra en la API externa.
 */
export const prefetchMatchFull = (matchId: number): void => {
  if (__DEV__) {
    const label = `[prefetchMatchFull] match ${matchId}`;
    console.log(`${label} - start`);
    console.time(label);
  }
  fetchMatchFull(matchId, { live: true })
    .then((data) => {
      setCachedMatchDetail(matchId, data);
      if (__DEV__) {
        console.timeEnd(`[prefetchMatchFull] match ${matchId}`);
        console.log(`[prefetchMatchFull] match ${matchId} - cached, detail will open fast if user navigated`);
      }
    })
    .catch(() => {
      if (__DEV__) console.timeEnd(`[prefetchMatchFull] match ${matchId}`);
    });
};

/**
 * Tipo para las cuotas detalladas de bookmakers
 */
export interface DetailedOddsResponse {
    success: boolean;
    message?: string;
    player1_name: string;
    player2_name: string;
    best_odds_player1: number | null;
    best_odds_player2: number | null;
    bookmakers: {
        bookmaker: string;
        player1_odds: number | null;
        player2_odds: number | null;
    }[];
    total_bookmakers: number;
}

/**
 * Obtiene las cuotas detalladas de todas las casas de apuestas.
 *
 * @param matchId - ID del partido
 * @returns Cuotas ordenadas de mejor a peor
 */
export const fetchMatchOddsDetailed = async (matchId: number): Promise<DetailedOddsResponse> => {
    const response = await apiClient.get<DetailedOddsResponse>(`/matches/${matchId}/odds`);
    return response.data;
};

/** Fila de cuota por casa y lado (tabla match_odds del backend). */
export interface OddsBook {
    bookmaker: string;
    side: number; // 1 = jugador1, 2 = jugador2
    odds: number;
}

/** Respuesta de /matches/{id}/best-odds: cuotas multi-casa + mejor por lado. */
export interface MatchBestOddsResponse {
    match_id: number;
    books: OddsBook[];
    /** Mejor cuota por lado calculada en el servidor (claves "1"/"2"). El cliente recalcula por casas del usuario. */
    best: Record<string, { odds: number; bookmaker: string }>;
}

/**
 * Cuotas multi-casa del partido (tabla match_odds, poblada por el sync) para line-shopping.
 * El cliente filtra luego por las casas del usuario con bestOdds().
 */
export const fetchMatchBestOdds = async (matchId: number): Promise<MatchBestOddsResponse> => {
    const response = await apiClient.get<MatchBestOddsResponse>(`/matches/${matchId}/best-odds`);
    return response.data;
};
