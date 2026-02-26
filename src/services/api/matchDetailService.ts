/**
 * Match Detail Service - Servicio para el detalle del partido
 * ===========================================================
 *
 * Llama al nuevo endpoint v2/matches/{id}/full que devuelve
 * todos los datos del partido en una sola llamada.
 * Soporta ?live=false para primera carga rápida (sin enriquecimiento con API externa).
 */

import { MatchFullResponse, MatchTimeline, PointByPointData } from '../../types/matchDetail';
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
  const response = await apiClient.get<MatchFullResponse>(`/v2/matches/${matchId}/full`, {
    params: { live: live ? 'true' : 'false' },
  });
  return response.data;
};

/**
 * Prefetch del detalle de un partido (fire-and-forget).
 * Guarda el resultado en matchDetailCache para que al abrir la pantalla cargue al instante.
 */
export const prefetchMatchFull = (matchId: number): void => {
  if (__DEV__) {
    const label = `[prefetchMatchFull] match ${matchId}`;
    console.log(`${label} - start`);
    console.time(label);
  }
  fetchMatchFull(matchId, { live: false })
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
 * Obtiene el timeline de juegos del partido.
 * 
 * @param matchId - ID del partido
 * @returns Timeline con juegos agrupados por set
 */
export const fetchMatchTimeline = async (matchId: number): Promise<MatchTimeline> => {
    const response = await apiClient.get<MatchTimeline>(`/v2/matches/${matchId}/timeline`);
    return response.data;
};

/**
 * Obtiene los datos punto por punto.
 * 
 * @param matchId - ID del partido
 * @param setNumber - Filtrar por número de set (opcional)
 * @returns Datos punto por punto
 */
export const fetchMatchPointByPoint = async (
    matchId: number,
    setNumber?: number
): Promise<PointByPointData> => {
    const params = setNumber ? { set_number: setNumber } : {};
    const response = await apiClient.get<PointByPointData>(`/v2/matches/${matchId}/pbp`, { params });
    return response.data;
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
    const response = await apiClient.get<DetailedOddsResponse>(`/v2/matches/${matchId}/odds`);
    return response.data;
};

export default {
    fetchMatchFull,
    fetchMatchTimeline,
    fetchMatchPointByPoint,
    fetchMatchOddsDetailed,
};
