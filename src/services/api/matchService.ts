import {
    MatchesResponse,
    MatchHistoryResponse,
    PredictMatchRequest,
    PredictMatchResponse,
    UpdateResultRequest,
    UpdateResultResponse,
} from '../../types/api';
import apiClient from './apiClient';

/**
 * Fetch matches for a specific date
 * @param date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @returns Promise with matches response
 */
export const fetchMatches = async (date?: string): Promise<MatchesResponse> => {
    const params = date ? { date } : {};
    const response = await apiClient.get<MatchesResponse>('/matches', { params });
    return response.data;
};

/**
 * Create a new match and generate prediction
 * @param data - Match data
 * @returns Promise with prediction response
 */
export const predictMatch = async (
    data: PredictMatchRequest
): Promise<PredictMatchResponse> => {
    const response = await apiClient.post<PredictMatchResponse>('/matches/predict', data);
    return response.data;
};

/**
 * Update match result
 * @param matchId - Match ID
 * @param data - Result data (winner and score)
 * @returns Promise with update response
 */
export const updateMatchResult = async (
    matchId: number,
    data: UpdateResultRequest
): Promise<UpdateResultResponse> => {
    const response = await apiClient.put<UpdateResultResponse>(
        `/matches/${matchId}/result`,
        data
    );
    return response.data;
};

/**
 * Refresh odds and regenerate prediction
 * @param matchId - Match ID
 * @param jugador1Cuota - New odds for player 1
 * @param jugador2Cuota - New odds for player 2
 * @returns Promise with refresh response
 */
export const refreshOdds = async (
    matchId: number,
    jugador1Cuota: number,
    jugador2Cuota: number
): Promise<any> => {
    const response = await apiClient.post(
        `/matches/${matchId}/refresh`,
        null,
        {
            params: {
                jugador1_cuota: jugador1Cuota,
                jugador2_cuota: jugador2Cuota,
            },
        }
    );
    return response.data;
};

/**
 * Get prediction history for a match
 * @param matchId - Match ID
 * @returns Promise with history response
 */
export const fetchMatchHistory = async (
    matchId: number
): Promise<MatchHistoryResponse> => {
    const response = await apiClient.get<MatchHistoryResponse>(
        `/matches/${matchId}/history`
    );
    return response.data;
};
