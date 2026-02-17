import {
    MatchesResponse,
    MatchHistoryResponse,
    PredictMatchRequest,
    PredictMatchResponse,
    UpdateResultRequest,
    UpdateResultResponse,
    BettingSettingsResponse,
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
 * Fetch betting settings (bankroll and limits)
 */
export const fetchBettingSettings = async (): Promise<BettingSettingsResponse> => {
    const response = await apiClient.get<BettingSettingsResponse>('/settings/betting');
    return response.data;
};

/**
 * Update bankroll. Stakes shown per match are recalculated with this value.
 * @param bankroll - New bankroll in euros
 */
export const updateBettingBankroll = async (bankroll: number): Promise<BettingSettingsResponse> => {
    const response = await apiClient.patch<BettingSettingsResponse>('/settings/betting', { bankroll });
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

/**
 * Fetch match details (basic and advanced stats)
 * @param matchId - Match ID
 * @returns Promise with match details
 */
export const fetchMatchDetails = async (
    matchId: number
): Promise<any> => {
    const response = await apiClient.get<any>(
        `/matches/${matchId}/details`
    );
    return response.data;
};

/**
 * Fetch match analysis (details + timeline + momentum + key points)
 * @param matchId - Match ID
 * @returns Promise with match analysis
 */
export const fetchMatchAnalysis = async (
    matchId: number
): Promise<any> => {
    const response = await apiClient.get<any>(
        `/matches/${matchId}/analysis`
    );
    return response.data;
};

/**
 * Fetch match stats summary
 * @param matchId - Match ID
 * @returns Promise with stats summary
 */
export const fetchMatchStatsSummary = async (
    matchId: number
): Promise<any> => {
    const response = await apiClient.get<any>(
        `/matches/${matchId}/stats/summary`
    );
    return response.data;
};

/**
 * Fetch match stats detailed
 * @param matchId - Match ID
 * @returns Promise with detailed stats
 */
export const fetchMatchStatsDetailed = async (
    matchId: number
): Promise<any> => {
    const response = await apiClient.get<any>(
        `/matches/${matchId}/stats/detailed`
    );
    return response.data;
};

/**
 * Fetch break points stats
 * @param matchId - Match ID
 * @returns Promise with break points stats
 */
export const fetchBreakPointsStats = async (
    matchId: number
): Promise<any> => {
    const response = await apiClient.get<any>(
        `/matches/${matchId}/breakpoints`
    );
    return response.data;
};

/**
 * Fetch match games (timeline)
 * @param matchId - Match ID
 * @returns Promise with games data
 */
export const fetchMatchGames = async (
    matchId: number
): Promise<any> => {
    const response = await apiClient.get<any>(
        `/matches/${matchId}/games`
    );
    return response.data;
};

/**
 * Fetch point by point data
 * @param matchId - Match ID
 * @param setNumber - Optional set number filter
 * @returns Promise with point by point data
 */
export const fetchPointByPoint = async (
    matchId: number,
    setNumber?: number
): Promise<any> => {
    const params = setNumber ? { set_number: setNumber } : {};
    const response = await apiClient.get<any>(
        `/matches/${matchId}/pointbypoint`,
        { params }
    );
    return response.data;
};
