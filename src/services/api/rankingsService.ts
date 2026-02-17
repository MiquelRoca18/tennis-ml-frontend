import { RankingsResponse } from '../../types/api';
import apiClient from './apiClient';

/**
 * Fetch ATP men's singles ranking from backend (cached in DB).
 * Esta app solo usa individual masculino (ATP).
 */
export const fetchRankings = async (limit = 200): Promise<RankingsResponse> => {
    const response = await apiClient.get<RankingsResponse>('/rankings/ATP', {
        params: { limit },
    });
    return response.data;
};
