import {
    BreakPointsResponse,
    DetailedStatsResponse,
    GamesResponse,
    PointByPointResponse,
    StatsSummaryResponse,
} from '../../types/api';
import apiClient from './apiClient';

/**
 * Fetch match statistics summary
 * @param matchId - Match ID
 * @returns Promise with statistics summary
 */
export const fetchMatchStatsSummary = async (matchId: number): Promise<StatsSummaryResponse> => {
    const response = await apiClient.get<StatsSummaryResponse>(`/matches/${matchId}/stats/summary`);
    return response.data;
};

/**
 * Fetch detailed match statistics
 * @param matchId - Match ID
 * @returns Promise with detailed statistics including sets breakdown
 */
export const fetchMatchDetailedStats = async (matchId: number): Promise<DetailedStatsResponse> => {
    const response = await apiClient.get<DetailedStatsResponse>(`/matches/${matchId}/stats/detailed`);
    return response.data;
};

/**
 * Fetch point by point data
 * @param matchId - Match ID
 * @param setNumber - Optional set number filter (e.g., "Set 1")
 * @returns Promise with point by point data
 */
export const fetchMatchPointByPoint = async (
    matchId: number,
    setNumber?: string
): Promise<PointByPointResponse> => {
    const params = setNumber ? { set_number: setNumber } : {};
    const response = await apiClient.get<PointByPointResponse>(`/matches/${matchId}/pointbypoint`, {
        params,
    });
    return response.data;
};

/**
 * Fetch all games from a match
 * @param matchId - Match ID
 * @returns Promise with games data
 */
export const fetchMatchGames = async (matchId: number): Promise<GamesResponse> => {
    const response = await apiClient.get<GamesResponse>(`/matches/${matchId}/games`);
    return response.data;
};

/**
 * Fetch break points statistics
 * @param matchId - Match ID
 * @returns Promise with break points data
 */
export const fetchMatchBreakPoints = async (matchId: number): Promise<BreakPointsResponse> => {
    const response = await apiClient.get<BreakPointsResponse>(`/matches/${matchId}/breakpoints`);
    return response.data;
};
