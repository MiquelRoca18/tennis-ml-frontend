import { useEffect, useState } from 'react';
import { fetchMatchPointByPoint } from '../services/api/matchStatsService';
import { PointByPointResponse } from '../types/api';

interface UsePointByPointReturn {
    data: PointByPointResponse | null;
    loading: boolean;
    error: string | null;
    hasData: boolean;
}

/**
 * Custom hook to fetch point-by-point data for a match
 * @param matchId - Match ID
 * @param setNumber - Optional set number filter
 * @returns Point-by-point data, loading state, and error
 */
export function usePointByPoint(
    matchId: number | null,
    setNumber?: string
): UsePointByPointReturn {
    const [data, setData] = useState<PointByPointResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        if (!matchId) {
            setData(null);
            setHasData(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetchMatchPointByPoint(matchId, setNumber);
                setData(response);
                setHasData(response.total_points > 0);
            } catch (err: any) {
                console.error('Error fetching point by point:', err);
                setError(err.message || 'Error al cargar punto por punto');
                setHasData(false);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [matchId, setNumber]);

    return {
        data,
        loading,
        error,
        hasData,
    };
}
