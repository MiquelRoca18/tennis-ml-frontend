import { Match, Tournament, TournamentMatchesResponse, TournamentsResponse } from '../../types/api';
import apiClient from './apiClient';

/** Formato plano que devuelve el backend (SELECT * FROM matches) */
interface TournamentMatchRaw {
    id: number;
    event_key?: string;
    jugador1_key?: string | number | null;
    jugador2_key?: string | number | null;
    tournament_key?: string;
    fecha_partido?: string;
    hora_inicio?: string | null;
    torneo?: string | null;
    tournament_season?: string;
    ronda?: string | null;
    superficie?: string;
    jugador1_nombre?: string;
    jugador2_nombre?: string;
    jugador1_ranking?: number | null;
    jugador2_ranking?: number | null;
    jugador1_logo?: string | null;
    jugador2_logo?: string | null;
    jugador1_cuota?: number | null;
    jugador2_cuota?: number | null;
    estado?: string;
    resultado_ganador?: string | null;
    resultado_marcador?: string | null;
    event_status?: string | null;
    [key: string]: unknown;
}

function normalizeTournamentMatch(raw: TournamentMatchRaw): Match {
    const key1 = raw.jugador1_key != null ? String(raw.jugador1_key) : '';
    const key2 = raw.jugador2_key != null ? String(raw.jugador2_key) : '';
    return {
        id: raw.id,
        event_key: raw.event_key ?? '',
        estado: (raw.estado as Match['estado']) ?? 'pendiente',
        is_live: false,
        is_qualification: false,
        fecha_partido: raw.fecha_partido ?? '',
        hora_inicio: raw.hora_inicio ?? null,
        torneo: raw.torneo ?? null,
        tournament_key: raw.tournament_key ?? '',
        tournament_season: raw.tournament_season ?? '',
        ronda: raw.ronda ?? null,
        superficie: (raw.superficie as Match['superficie']) ?? 'Hard',
        jugador1: {
            nombre: raw.jugador1_nombre ?? 'Jugador 1',
            key: key1,
            ranking: raw.jugador1_ranking ?? null,
            cuota: Number(raw.jugador1_cuota) || 0,
            logo: raw.jugador1_logo ?? '',
        },
        jugador2: {
            nombre: raw.jugador2_nombre ?? 'Jugador 2',
            key: key2,
            ranking: raw.jugador2_ranking ?? null,
            cuota: Number(raw.jugador2_cuota) || 0,
            logo: raw.jugador2_logo ?? '',
        },
        cuotas_top3: {
            top3_player1: [],
            top3_player2: [],
        },
        prediccion: null,
        resultado: raw.resultado_ganador != null || raw.resultado_marcador != null
            ? {
                ganador: raw.resultado_ganador ?? undefined,
                marcador: raw.resultado_marcador ?? undefined,
                scores: null,
            }
            : null,
        event_status: raw.event_status ?? null,
    };
}

/**
 * Fetch list of tournaments (la BD solo tiene ATP; el sync usa api_tennis_client.get_tournaments que ya filtra).
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
 * El backend puede devolver matches en formato enriquecido (jugador1/jugador2/prediccion anidados)
 * o en formato plano; normalizamos solo si es plano.
 * @param tournamentKey - Tournament ID
 * @param season - Filter by season (optional)
 * @returns Promise with tournament matches
 */
export const fetchTournamentMatches = async (
    tournamentKey: number,
    season?: number
): Promise<TournamentMatchesResponse> => {
    const params = season ? { season } : {};
    const response = await apiClient.get<{
        tournament_key: number;
        season: number | null;
        total_matches: number;
        matches: (TournamentMatchRaw | Match)[];
    }>(`/tournaments/${tournamentKey}/matches`, { params });
    const raw = response.data;
    const matches: Match[] = Array.isArray(raw.matches)
        ? raw.matches[0] != null && raw.matches[0].jugador1 != null && typeof (raw.matches[0].jugador1 as any) === 'object'
            ? (raw.matches as Match[]).map((m) => ({
                ...m,
                cuotas_top3: m.cuotas_top3 ?? { top3_player1: [], top3_player2: [] },
              }))
            : raw.matches.map((m) => normalizeTournamentMatch(m as TournamentMatchRaw))
        : [];
    return {
        tournament_key: raw.tournament_key,
        season: raw.season ?? null,
        total_matches: raw.total_matches ?? matches.length,
        matches,
    };
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
