import { H2HData, H2HResponse } from '../../types/api';
import apiClient from './apiClient';

/**
 * Fetch head-to-head data between two players
 * @param player1Key - First player ID
 * @param player2Key - Second player ID
 * @returns Promise with H2H data including recent form
 */
export const fetchH2H = async (
    player1Key: number,
    player2Key: number
): Promise<H2HResponse> => {
    const response = await apiClient.get<H2HResponse>(
        `/h2h/${player1Key}/${player2Key}`
    );
    return response.data;
};

/**
 * Fetch head-to-head data for a specific match
 * @param matchId - Match ID
 * @returns Promise with H2H data
 */
export const fetchMatchH2H = async (matchId: number): Promise<H2HData> => {
    const response = await apiClient.get<H2HData>(`/h2h/match/${matchId}`);
    return response.data;
};
