import { Player, RankingsResponse } from '../../types/api';
import apiClient from './apiClient';

/**
 * Fetch ATP or WTA rankings
 * @param league - 'ATP' or 'WTA'
 * @param limit - Number of players (1-500, default: 100)
 * @returns Promise with rankings data
 */
export const fetchRankings = async (
    league: 'ATP' | 'WTA',
    limit = 100
): Promise<RankingsResponse> => {
    const response = await apiClient.get<RankingsResponse>(
        `/rankings/${league}`,
        { params: { limit } }
    );
    return response.data;
};

/**
 * Fetch ranking information for a specific player
 * @param playerKey - Player ID
 * @returns Promise with player ranking data
 */
export const fetchPlayerRanking = async (playerKey: number): Promise<Player> => {
    const response = await apiClient.get<Player>(`/rankings/player/${playerKey}`);
    return response.data;
};

/**
 * Sync rankings from API (admin only)
 * @returns Promise with sync result
 */
export const syncRankings = async (): Promise<{
    success: boolean;
    atp_synced: number;
    wta_synced: number;
    total_synced: number;
}> => {
    const response = await apiClient.post('/rankings/sync');
    return response.data;
};
