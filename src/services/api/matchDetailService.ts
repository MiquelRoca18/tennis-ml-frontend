/**
 * Match Detail Service - Servicio para el detalle del partido
 * ===========================================================
 * 
 * Llama al nuevo endpoint v2/matches/{id}/full que devuelve
 * todos los datos del partido en una sola llamada.
 */

import { MatchFullResponse, MatchTimeline, PointByPointData } from '../../types/matchDetail';
import apiClient from './apiClient';

/**
 * Obtiene todos los datos del partido en una sola llamada.
 * 
 * @param matchId - ID del partido
 * @returns Datos completos del partido
 */
export const fetchMatchFull = async (matchId: number): Promise<MatchFullResponse> => {
    const response = await apiClient.get<MatchFullResponse>(`/v2/matches/${matchId}/full`);
    return response.data;
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
