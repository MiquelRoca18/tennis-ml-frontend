import { BestOddsResponse, MultiOddsResponse, OddsComparisonResponse } from '../../types/api';
import apiClient from './apiClient';

/**
 * Fetch all bookmaker odds for a match
 * @param matchId - Match ID
 * @returns Promise with all bookmakers' odds
 */
export const fetchMultiOdds = async (matchId: number): Promise<MultiOddsResponse> => {
    const response = await apiClient.get<MultiOddsResponse>(`/matches/${matchId}/odds/multi`);
    return response.data;
};

/**
 * Fetch best odds available for a match
 * @param matchId - Match ID
 * @returns Promise with best odds for each player
 */
export const fetchBestOdds = async (matchId: number): Promise<BestOddsResponse> => {
    const response = await apiClient.get<BestOddsResponse>(`/matches/${matchId}/odds/best`);
    return response.data;
};

/**
 * Fetch odds comparison with EV calculations
 * @param matchId - Match ID
 * @returns Promise with odds comparison including EV
 */
export const fetchOddsComparison = async (matchId: number): Promise<OddsComparisonResponse> => {
    const response = await apiClient.get<OddsComparisonResponse>(`/matches/${matchId}/odds/comparison`);
    return response.data;
};
