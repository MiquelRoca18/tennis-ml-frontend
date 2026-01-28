import { Tournament, TournamentMatchesResponse, TournamentsResponse } from '../../types/api';
import apiClient from './apiClient';

/**
 * Fetch list of tournaments
 * @param eventType - Filter by event type (optional)
 * @returns Promise with tournaments list
 */
export const fetchTournaments = async (eventType?: string): Promise<TournamentsResponse> => {
    const params = eventType ? { event_type: eventType } : {};
    const response = await apiClient.get<TournamentsResponse>('/tournaments', { params });
    return response.data;
};

/**
 * Fetch tournament details
 * @param tournamentKey - Tournament ID
 * @returns Promise with tournament data
 */
export const fetchTournament = async (tournamentKey: number): Promise<Tournament> => {
    const response = await apiClient.get<Tournament>(`/tournaments/${tournamentKey}`);
    return response.data;
};

/**
 * Fetch matches for a specific tournament
 * @param tournamentKey - Tournament ID
 * @param season - Filter by season (optional)
 * @returns Promise with tournament matches
 */
export const fetchTournamentMatches = async (
    tournamentKey: number,
    season?: number
): Promise<TournamentMatchesResponse> => {
    const params = season ? { season } : {};
    const response = await apiClient.get<TournamentMatchesResponse>(
        `/tournaments/${tournamentKey}/matches`,
        { params }
    );
    return response.data;
};

/**
 * Sync tournaments from API (admin only)
 * @returns Promise with sync result
 */
export const syncTournaments = async (): Promise<{
    success: boolean;
    total_synced: number;
}> => {
    const response = await apiClient.post('/tournaments/sync');
    return response.data;
};
