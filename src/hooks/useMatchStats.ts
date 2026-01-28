import { useEffect, useState } from 'react';
import { fetchMatchDetailedStats, fetchMatchStatsSummary } from '../services/api/matchStatsService';
import { DetailedStatsResponse, StatsSummaryResponse } from '../types/api';

interface UseMatchStatsReturn {
    summary: StatsSummaryResponse | null;
    detailed: DetailedStatsResponse | null;
    loading: boolean;
    hasData: boolean;
    error: string | null;
}

/**
 * Custom hook to fetch match statistics
 * @param matchId - Match ID
 * @returns Match statistics data, loading state, and error
 */
export function useMatchStats(matchId: number | null): UseMatchStatsReturn {
    const [summary, setSummary] = useState<StatsSummaryResponse | null>(null);
    const [detailed, setDetailed] = useState<DetailedStatsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasData, setHasData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!matchId) {
            setSummary(null);
            setDetailed(null);
            setHasData(false);
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch both summary and detailed stats
                const [summaryData, detailedData] = await Promise.all([
                    fetchMatchStatsSummary(matchId),
                    fetchMatchDetailedStats(matchId),
                ]);

                setSummary(summaryData);
                setDetailed(detailedData);
                setHasData(summaryData.has_data && detailedData.has_data);
            } catch (err: any) {
                console.error('Error fetching match stats:', err);
                setError(err.message || 'Error al cargar estadísticas');
                setHasData(false);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [matchId]);

    return {
        summary,
        detailed,
        loading,
        hasData,
        error,
    };
}
