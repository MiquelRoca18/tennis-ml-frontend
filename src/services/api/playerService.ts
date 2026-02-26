import { Player, PlayerMatchesResponse, PlayerStatsResponse, PlayerUpcomingResponse } from '../../types/api';
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
 * Resolve player_key by name (for opening profile from match card when key is missing).
 * @param name - Player name (e.g. "Alcaraz", "Rafael Nadal")
 * @returns player_key if found, null otherwise
 */
export const fetchPlayerLookup = async (name: string): Promise<number | null> => {
    if (!name || !name.trim()) return null;
    try {
        const response = await apiClient.get<{ player_key: number }>('/players/lookup', {
            params: { name: name.trim() },
        });
        return response.data?.player_key ?? null;
    } catch {
        return null;
    }
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

    try {
        const response = await apiClient.get<PlayerMatchesResponse>(
            `/players/${playerKey}/matches`,
            { params }
        );
        return response.data;
    } catch {
        // 500 u otro error: no romper el perfil, devolver lista vacía
        return { matches: [], total_matches: 0 };
    }
};

/**
 * Fetch player's upcoming matches (fixtures from API-Tennis by player_key).
 * @param playerKey - Player ID
 * @param days - Next N days (1-31, default 14)
 */
export const fetchPlayerUpcoming = async (
    playerKey: number,
    days = 14
): Promise<PlayerUpcomingResponse> => {
    try {
        const response = await apiClient.get<PlayerUpcomingResponse>(
            `/players/${playerKey}/upcoming`,
            { params: { days } }
        );
        return response.data;
    } catch {
        return { player_key: playerKey, upcoming: [] };
    }
};

/**
 * Fetch player statistics
 * @param playerKey - Player ID
 * @param surface - Filter by surface
 * @param season - Filter by season
 * @returns Promise with player stats, or null if 404 (jugador sin estadísticas)
 */
export const fetchPlayerStats = async (
    playerKey: number,
    surface?: string,
    season?: number
): Promise<PlayerStatsResponse | null> => {
    const params: any = {};
    if (surface) params.surface = surface;
    if (season) params.season = season;

    try {
        const response = await apiClient.get<PlayerStatsResponse>(
            `/players/${playerKey}/stats`,
            { params }
        );
        return response.data;
    } catch {
        // 404 = sin estadísticas; 500 = error en backend. No romper el perfil.
        return null;
    }
};
