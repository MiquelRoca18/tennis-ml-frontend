import apiClient from './apiClient';
import type { BettingSettingsResponse, MatchesResponse } from '../../types/api';

/**
 * Fetch matches for a specific date.
 * On timeout/network error, retries once automatically.
 * @param date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @param options - live=false omite enriquecimiento live/fixtures en el backend (respuesta más rápida)
 * @returns Promise with matches response
 */
export const fetchMatches = async (
  date?: string,
  options?: { live?: boolean }
): Promise<MatchesResponse> => {
  const params: Record<string, string | boolean> = date ? { date } : {};
  if (options?.live === false) params.live = false;
  const doRequest = () => apiClient.get<MatchesResponse>('/matches', { params });
    let lastError: any;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const response = await doRequest();
            return response.data;
        } catch (err: any) {
            lastError = err;
            const isTimeout = err?.message?.includes('tardando') || err?.code === 'ECONNABORTED';
            const isNetwork = err?.message?.includes('conexión');
            if (attempt === 0 && (isTimeout || isNetwork)) {
                continue;
            }
            throw err;
        }
    }
    throw lastError;
};

/** Respuesta de status-batch: por match_id, status, winner y opcionalmente fecha/hora del partido */
export type MatchStatusBatchResponse = Record<
  string,
  { status: string; winner: number | null; match_date?: string; match_time?: string }
>;

/**
 * Fuerza en el backend la actualización de resultados (estado, ganador) para una lista de partidos.
 * Llamar antes de status-batch al abrir Mis apuestas para que la liquidación use datos actualizados.
 */
export const fetchRefreshResultsBatch = async (matchIds: number[]): Promise<{ updated_count: number; errors: number }> => {
  if (matchIds.length === 0) return { updated_count: 0, errors: 0 };
  const response = await apiClient.post<{ updated_count: number; errors: number }>('/matches/refresh-results-batch', {
    match_ids: matchIds,
  });
  return response.data;
};

/**
 * Obtiene estado y ganador de varios partidos en una sola llamada (para liquidar apuestas).
 */
export const fetchMatchesStatusBatch = async (
    matchIds: number[]
): Promise<MatchStatusBatchResponse> => {
    if (matchIds.length === 0) return {};
    const response = await apiClient.post<MatchStatusBatchResponse>('/matches/status-batch', {
        match_ids: matchIds,
    });
    return response.data;
};

/**
 * Fetch betting settings (bankroll and limits)
 */
export const fetchBettingSettings = async (): Promise<BettingSettingsResponse> => {
    const response = await apiClient.get<BettingSettingsResponse>('/settings/betting');
    return response.data;
};

/**
 * Update bankroll. Stakes shown per match are recalculated with this value.
 * @param bankroll - New bankroll in euros
 */
export const updateBettingBankroll = async (bankroll: number): Promise<BettingSettingsResponse> => {
    const response = await apiClient.patch<BettingSettingsResponse>('/settings/betting', { bankroll });
    return response.data;
};
