import { Player, PlayerMatchesResponse, PlayerStatsResponse } from '../../types/api';
import apiClient from './apiClient';

/** Normalize backend player response (DB columns: country, atp_points) to Player shape */
function normalizePlayer(data: Record<string, unknown>): Player {
    return {
        ...data,
        player_country: (data.player_country ?? data.country) as string | null,
        ranking_points: (data.ranking_points ?? data.atp_points ?? data.wta_points) as number | null,
    } as Player;
}

/**
 * Fetch player profile
 * @param playerKey - Player ID
 * @returns Promise with player data
 */
export const fetchPlayer = async (playerKey: number): Promise<Player> => {
    const response = await apiClient.get<Record<string, unknown>>(`/players/${playerKey}`);
    return normalizePlayer(response.data);
};

/**
 * Fetch player's recent matches
 * @param playerKey - Player ID
 * @param limit - Number of matches (1-100, default: 20)
 * @param surface - Filter by surface (Hard/Clay/Grass)
 * @returns Promise with player matches
 */
export const fetchPlayerMatches = async (
    playerKey: number,
    limit = 20,
    surface?: string
): Promise<PlayerMatchesResponse> => {
    const params: any = { limit };
    if (surface) params.surface = surface;

    const response = await apiClient.get<PlayerMatchesResponse>(
        `/players/${playerKey}/matches`,
        { params }
    );
    return response.data;
};

/**
 * Fetch player statistics
 * @param playerKey - Player ID
 * @param surface - Filter by surface
 * @param season - Filter by season
 * @returns Promise with player stats
 */
export const fetchPlayerStats = async (
    playerKey: number,
    surface?: string,
    season?: number
): Promise<PlayerStatsResponse> => {
    const params: any = {};
    if (surface) params.surface = surface;
    if (season) params.season = season;

    const response = await apiClient.get<PlayerStatsResponse>(
        `/players/${playerKey}/stats`,
        { params }
    );
    return response.data;
};
