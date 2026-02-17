/**
 * Tipos para el Detalle de Partido - Marcador Profesional
 * ========================================================
 * 
 * Corresponden a los modelos Pydantic del backend.
 * Se usan para el nuevo endpoint /v2/matches/{id}/full
 */

// ============================================================
// ENUMS
// ============================================================

export type MatchStatus = 'pendiente' | 'en_juego' | 'completado' | 'suspendido' | 'cancelado';

export type Surface = 'Hard' | 'Clay' | 'Grass' | 'Carpet' | 'Indoor';

// ============================================================
// PLAYER INFO
// ============================================================

export interface PlayerInfo {
    name: string;
    country?: string | null;
    ranking?: number | null;
    logo_url?: string | null;
}

// ============================================================
// SCORES
// ============================================================

export interface SetScore {
    set_number: number;
    player1_games: number;
    player2_games: number;
    tiebreak_score?: string | null;
    winner?: 1 | 2 | null;
}

export interface LiveScore {
    current_game: string;
    current_server: 1 | 2;
    current_set: number;
    is_tiebreak: boolean;
}

export interface MatchScores {
    sets_won: [number, number];
    sets: SetScore[];
    live?: LiveScore | null;
}

// ============================================================
// STATISTICS
// ============================================================

export interface ServeStats {
    aces: number;
    double_faults: number;
    first_serve_pct: number;
    first_serve_won_pct: number;
    second_serve_won_pct: number;
    service_games_won: number;
    service_games_total: number;
    /** Velocidad media 1er saque en km/h */
    avg_first_serve_speed_kmh?: number | null;
    /** Velocidad media 2do saque en km/h */
    avg_second_serve_speed_kmh?: number | null;
    service_points_won?: number;
    service_points_total?: number;
}

export interface ReturnStats {
    return_points_won: number;
    return_points_total: number;
    return_games_won: number;
    return_games_total: number;
    /** % puntos ganados al 1er resto */
    first_return_points_won_pct?: number | null;
    /** % puntos ganados al 2do resto */
    second_return_points_won_pct?: number | null;
}

export interface BreakPointStats {
    break_points_won: number;
    break_points_total: number;
    break_points_saved: number;
    break_points_faced: number;
}

export interface PlayerStats {
    serve: ServeStats;
    return: ReturnStats;
    break_points: BreakPointStats;
    total_points_won: number;
    total_games_won: number;
    winners: number;
    unforced_errors: number;
    /** Puntos ganados en la red */
    net_points_won?: number | null;
    net_points_total?: number | null;
    /** Puntos ganados en los últimos 10 (momentum) */
    last_10_balls?: number | null;
    /** Match points salvados */
    match_points_saved?: number | null;
}

export interface MatchStats {
    player1: PlayerStats;
    player2: PlayerStats;
    total_games: number;
    total_points: number;
    duration_minutes?: number | null;
    has_detailed_stats: boolean;
}

// ============================================================
// TIMELINE
// ============================================================

export interface GameInfo {
    set_number: number;
    game_number: number;
    server: 1 | 2;
    winner: 1 | 2;
    is_break: boolean;
    score_after: string;
}

export interface SetTimeline {
    set_number: number;
    games: GameInfo[];
    final_score: string;
    has_tiebreak: boolean;
    tiebreak_score?: string | null;
    breaks_player1: number;
    breaks_player2: number;
}

export interface MatchTimeline {
    sets: SetTimeline[];
    total_games: number;
    total_breaks: number;
    momentum_shifts: number;
    /** True si generado solo desde scores (sin pointbypoint). Orden de juegos desconocido. */
    from_scores_only?: boolean;
}

// ============================================================
// POINT BY POINT
// ============================================================

export interface PointInfo {
    set_number: number;
    game_number: number;
    point_number: number;
    score: string;
    server: 1 | 2;
    winner?: 1 | 2 | null;
    is_break_point: boolean;
    is_set_point: boolean;
    is_match_point: boolean;
}

export interface PointByPointData {
    total_points: number;
    points: PointInfo[];
    key_points: PointInfo[];
}

// ============================================================
// HEAD TO HEAD
// ============================================================

export interface PreviousMatch {
    date: string;
    tournament: string;
    surface: string;
    winner: 1 | 2;
    score: string;
}

export interface H2HData {
    total_matches: number;
    player1_wins: number;
    player2_wins: number;
    matches: PreviousMatch[];
    hard_record: [number, number];
    clay_record: [number, number];
    grass_record: [number, number];
}

// ============================================================
// ODDS
// ============================================================

export interface BookmakerOdds {
    bookmaker: string;
    player1_odds: number;
    player2_odds: number;
    updated_at?: string | null;
}

export interface MatchOdds {
    best_odds_player1?: number | null;
    best_odds_player2?: number | null;
    bookmakers: BookmakerOdds[];
    market_consensus?: 1 | 2 | null;
}

// ============================================================
// PREDICTION
// ============================================================

export interface MatchPrediction {
    predicted_winner: 1 | 2;
    confidence: number;
    probability_player1: number;
    probability_player2: number;
    value_bet?: 1 | 2 | null;
    recommendation?: string | null;
    /** Stake sugerido en € (Kelly) para jugador 1 */
    kelly_stake_jugador1?: number | null;
    /** Stake sugerido en € (Kelly) para jugador 2 */
    kelly_stake_jugador2?: number | null;
    /** Bankroll con el que se calculó el stake */
    bankroll_used?: number | null;
}

// ============================================================
// MAIN RESPONSE
// ============================================================

export interface MatchInfo {
    id: number;
    status: MatchStatus;
    date: string;
    time?: string | null;
    tournament: string;
    round?: string | null;
    surface: Surface;
    court?: string | null;
    /** Motivo de finalización: "Finished", "Retired", "Walk Over", etc. */
    event_status?: string | null;
}

export interface MatchFullResponse {
    match: MatchInfo;
    player1: PlayerInfo;
    player2: PlayerInfo;
    winner?: 1 | 2 | null;
    scores?: MatchScores | null;
    stats?: MatchStats | null;
    timeline?: MatchTimeline | null;
    h2h?: H2HData | null;
    odds?: MatchOdds | null;
    prediction?: MatchPrediction | null;
    last_updated?: string | null;
    data_quality: 'basic' | 'partial' | 'full';
}

// ============================================================
// UTILITY TYPES
// ============================================================

/** Nombre corto del jugador (apellido) */
export const getShortName = (name: string): string => {
    const parts = name.split(' ');
    return parts[parts.length - 1];
};

/** Formato de set score para display */
export const formatSetScore = (set: SetScore): string => {
    const base = `${set.player1_games}-${set.player2_games}`;
    if (set.tiebreak_score) {
        return `${base}(${set.tiebreak_score})`;
    }
    return base;
};

/** Calcula porcentaje seguro */
export const safePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
};
