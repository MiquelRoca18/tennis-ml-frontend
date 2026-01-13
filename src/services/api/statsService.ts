import {
    StatsDailyResponse,
    StatsPeriod,
    StatsSummaryResponse,
} from '../../types/api';
import apiClient from './apiClient';

/**
 * Fetch stats summary
 * @param period - Time period ('7d', '30d', or 'all')
 * @returns Promise with stats summary
 */
export const fetchStatsSummary = async (
    period: StatsPeriod = '7d'
): Promise<StatsSummaryResponse> => {
    const response = await apiClient.get<StatsSummaryResponse>('/stats/summary', {
        params: { period },
    });
    return response.data;
};

/**
 * Fetch daily stats
 * @param days - Number of days to fetch (1-365)
 * @returns Promise with daily stats
 */
export const fetchDailyStats = async (days: number = 30): Promise<StatsDailyResponse> => {
    const response = await apiClient.get<StatsDailyResponse>('/stats/daily', {
        params: { days },
    });
    return response.data;
};
