// TypeScript types for API responses

export type Surface = 'Hard' | 'Clay' | 'Grass' | 'Carpet';
export type MatchState = 'pendiente' | 'en_juego' | 'completado' | 'cancelado';
export type Confidence = 'Alta' | 'Media' | 'Baja';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type StatsPeriod = '7d' | '30d' | 'all';

export interface Bookmaker {
    bookmaker: string;
    odds: number;
    is_best: boolean;
}

export interface CuotasTop3 {
    top3_player1: Bookmaker[];
    top3_player2: Bookmaker[];
}

export interface Player {
    nombre: string;
    key?: string | null;      // ID del jugador en API-Tennis (opcional si el partido no tiene keys en BD)
    ranking: number | null;
    cuota: number;
    logo: string;             // 🆕 URL del logo del jugador
}

export interface Prediction {
    version: number;
    timestamp: string;
    jugador1_cuota: number;
    jugador2_cuota: number;
    jugador1_probabilidad: number;
    jugador2_probabilidad: number;
    jugador1_ev: number;
    jugador2_ev: number;
    jugador1_edge: number;
    jugador2_edge: number;
    recomendacion: string;
    mejor_opcion: string | null;
    confianza: Confidence;
    kelly_stake_jugador1: number | null;
    kelly_stake_jugador2: number | null;
    // New confidence system fields
    confidence_level?: ConfidenceLevel;
    confidence_score?: number;
    player1_known?: boolean;
    player2_known?: boolean;
}

// Score de un set individual (para marcador detallado)
export interface SetScoreSimple {
    set_number: number;
    player1_score: number;
    player2_score: number;
    tiebreak_score?: string | null;  // Ej: "7-5" si hubo tiebreak
}

// Datos en vivo del partido (solo cuando está en juego)
export interface LiveData {
    current_game_score?: string | null;  // Ej: "30-15", "40-30", "Deuce"
    current_server?: string | null;      // "First Player" o "Second Player"
    current_set?: number | null;         // Set actual (1, 2, 3...)
    current_game?: number | null;        // Juego actual del set
    is_tiebreak: boolean;
}

// Marcador completo del partido
export interface MatchScores {
    sets_result?: string | null;   // Resultado en sets (ej: "2-0", "2-1")
    sets: SetScoreSimple[];        // Score detallado por set
    live?: LiveData | null;        // Datos en vivo (solo si está en juego)
}

export interface MatchResult {
    ganador?: string | null;
    marcador?: string | null;      // Formato string: "6-4, 7-5, 6-3"
    scores?: MatchScores | null;   // 🆕 Scores estructurados (sets, live data)
    apostamos?: boolean;           // Si apostamos en este partido
    resultado_apuesta?: string;    // 'ganada' | 'perdida'
    stake?: number;                // Cantidad apostada
    ganancia?: number;             // Ganancia/pérdida
    roi?: number;                  // Return on Investment
}

export interface Match {
    id: number;
    event_key: string;        // 🆕 ID único en API-Tennis
    estado: MatchState;
    is_live: boolean;         // 🆕 Estado en vivo
    is_qualification: boolean; // 🆕 Si es clasificación
    fecha_partido: string;
    hora_inicio: string | null;
    torneo: string | null;
    tournament_key: string;   // 🆕 ID del torneo
    tournament_season: string; // 🆕 Temporada (ej: "2026")
    ronda: string | null;
    superficie: Surface;
    jugador1: Player;
    jugador2: Player;
    cuotas_top3: CuotasTop3;  // 🆕 Top 3 cuotas
    prediccion: Prediction | null;
    resultado: MatchResult | null;
    /** Motivo de finalización: "Retired", "Walk Over", etc. Para mostrar en card. */
    event_status?: string | null;
}

/** Configuración de apuestas usada para los stakes mostrados (bankroll actual) */
export interface BettingConfig {
    bankroll: number;
}

export interface MatchesResponse {
    fecha: string;
    es_hoy: boolean;
    resumen: {
        total_partidos: number;
        completados: number;
        en_juego: number;
        pendientes: number;
    };
    partidos: Match[];
    /** Bankroll usado para calcular los stakes de cada predicción */
    betting_config?: BettingConfig | null;
}

/** Respuesta GET /settings/betting */
export interface BettingSettingsResponse {
    bankroll: number;
    min_stake_eur: number;
    max_stake_eur: number | null;
    max_stake_pct: number;
    kelly_fraction: number;
}

export interface PredictMatchRequest {
    fecha_partido: string;
    hora_inicio?: string;
    torneo?: string;
    ronda?: string;
    superficie: Surface;
    jugador1_nombre: string;
    jugador1_cuota: number;
    jugador1_ranking?: number;
    jugador2_nombre: string;
    jugador2_cuota: number;
    jugador2_ranking?: number;
}

export interface PredictMatchResponse {
    match_id: number;
    prediction_id: number;
    recomendacion: string;
    mensaje: string;
}

export interface UpdateResultRequest {
    ganador: string;
    marcador?: string;
}

export interface UpdateResultResponse {
    match_id: number;
    ganador: string;
    marcador: string | null;
    actualizado: boolean;
    apuesta?: {
        jugador_apostado: string;
        resultado: string;
        ganancia: number;
        roi: number;
    };
}

export interface PredictionVersion {
    version: number;
    timestamp: string;
    cuotas: {
        jugador1: number;
        jugador2: number;
    };
    probabilidades: {
        jugador1: number;
        jugador2: number;
    };
    expected_values: {
        jugador1: number;
        jugador2: number;
    };
    recomendacion: string;
    mejor_opcion: string | null;
    confianza: Confidence;
}

export interface MatchHistoryResponse {
    match_id: number;
    jugador1: string;
    jugador2: string;
    estado: MatchState;
    total_versiones: number;
    versiones: PredictionVersion[];
    cambios_significativos: Array<{
        version: number;
        tipo: string;
        anterior?: string;
        nueva?: string;
        cambio_j1?: string;
        cambio_j2?: string;
    }>;
}

export interface StatsSummaryResponse {
    periodo: string;
    fecha_inicio: string;
    fecha_fin: string;
    apuestas: {
        total: number;
        ganadas: number;
        perdidas: number;
        win_rate: number;
    };
    financiero: {
        stake_total: number;
        ganancia_bruta: number;
        ganancia_neta: number;
        roi: number;
    };
    modelo: {
        accuracy: number;
        brier_score: number;
        ev_promedio: number;
    };
}

export interface DailyStats {
    fecha: string;
    apuestas: number;
    ganadas: number;
    win_rate: number;
    ganancia: number;
    roi: number;
}

export interface StatsDailyResponse {
    dias: DailyStats[];
}

export interface HealthResponse {
    status: string;
    timestamp: string;
    model_loaded: boolean;
    database_connected: boolean;
    version: string;
}

// ============================================
// MATCH STATISTICS TYPES
// ============================================

// Estadísticas por Set
export interface SetScore {
    set: number;
    jugador1: number;
    jugador2: number;
}

// Estadísticas Básicas
export interface EstadisticasBasicas {
    total_sets: number;
    sets_ganados_jugador1: number;
    sets_ganados_jugador2: number;
    total_juegos: number;
    juegos_ganados_jugador1: number;
    juegos_ganados_jugador2: number;
    marcador_por_sets: SetScore[];
}

// Estadísticas Avanzadas por Jugador
export interface EstadisticasJugador {
    juegos_al_saque: number;
    juegos_ganados_al_saque: number;
    porcentaje_saque: number;
    break_points_enfrentados: number;
    break_points_salvados: number;
    break_points_a_favor: number;
    break_points_convertidos: number;
    puntos_totales: number;
}

export interface EstadisticasAvanzadas {
    jugador1: EstadisticasJugador;
    jugador2: EstadisticasJugador;
}

// Timeline Entry
export interface TimelineEntry {
    set: string;
    juego: string;
    servidor: string;
    ganador: string;
    marcador_juegos: string;
    marcador_sets: string;
    fue_break: boolean;
}

// Momentum Entry
export interface MomentumEntry {
    juego: number;
    set: string;
    momentum: number;  // -100 a +100
    dominando: 'jugador1' | 'jugador2' | 'equilibrado';
}

// Punto Clave
export type PuntoClaveType = 'break_point' | 'set_point' | 'match_point';

export interface PuntoClave {
    tipo: PuntoClaveType;
    set: string;
    juego: string;
    punto: string;
    marcador: string;
    descripcion: string;
}

// Response de /matches/{id}/details
export interface MatchDetailsResponse {
    match_id: number;
    estado: MatchState;
    ganador: string;
    duracion_estimada: string | null;
    estadisticas_basicas: EstadisticasBasicas;
    estadisticas_avanzadas: EstadisticasAvanzadas | null;
}

// Response de /matches/{id}/analysis
export interface MatchAnalysisResponse extends MatchDetailsResponse {
    timeline: TimelineEntry[];
    momentum: MomentumEntry[];
    puntos_clave: PuntoClave[];
}

// ============================================
// ELITE API TYPES
// ============================================

// Player Types (profile from GET /players/:key - backend returns DB columns + API-Tennis stats/tournaments)
export interface Player {
    player_key: number | string;
    player_name: string;
    player_full_name?: string | null;
    player_country?: string | null;
    country?: string | null;  // backend DB column name
    player_bday?: string | null;
    player_birthday?: string | null;
    player_logo?: string | null;
    atp_ranking?: number | null;
    wta_ranking?: number | null;
    atp_points?: number | null;
    wta_points?: number | null;
    ranking_movement?: 'up' | 'down' | 'same' | null;
    ranking_points?: number | null;  // display: atp_points or wta_points
    last_updated?: string;
    created_at?: string;
    /** Stats from API-Tennis get_players (singles/doubles by season) */
    stats?: ApiPlayerStat[];
    /** Tournaments from API-Tennis get_players */
    tournaments?: PlayerTournament[];
}

/** One season/type stat from API-Tennis (numbers can come as strings) */
export interface ApiPlayerStat {
    season: string;
    type: string;
    rank?: string | number;
    titles?: string | number;
    matches_won?: string | number;
    matches_lost?: string | number;
    hard_won?: string | number;
    hard_lost?: string | number;
    clay_won?: string | number;
    clay_lost?: string | number;
    grass_won?: string | number;
    grass_lost?: string | number;
}

export interface PlayerTournament {
    name: string;
    season: string;
    type: string;
    surface: string;
    prize?: string;
}

export interface PlayerMatch {
    id: number;
    fecha_partido: string;
    torneo: string;
    superficie: string;
    jugador1_nombre: string;
    jugador2_nombre: string;
    /** Rival del jugador del perfil (backend lo rellena por player_key) */
    opponent_name?: string;
    /** Si el jugador del perfil ganó (backend lo rellena por player_key) */
    is_win?: boolean;
    /** true = perfil es jugador1 (primer número del marcador) */
    profile_is_jugador1?: boolean;
    resultado_ganador: string | null;
    resultado_marcador: string | null;
    estado: MatchState;
}

export interface PlayerMatchesResponse {
    player_key: number;
    total_matches: number;
    matches: PlayerMatch[];
}

export interface PlayerUpcomingMatch {
    event_key: number | string | null;
    date: string;
    time: string;
    opponent_name: string;
    tournament_name: string;
    round: string;
    event_type_type?: string;
    /** ID del partido en nuestra BD cuando existe (para abrir detalle) */
    match_id?: number | null;
}

export interface PlayerUpcomingResponse {
    player_key: number;
    upcoming: PlayerUpcomingMatch[];
}

export interface PlayerStatsResponse {
    player_key: number;
    surface: string | null;
    season: number | null;
    stats: {
        surface: string;
        won: number;
        lost: number;
        total: number;
        win_percentage: number;
    };
}

// H2H Types
export interface H2HMatch {
    match_id: number;
    match_date: string;
    winner_key: number;
    tournament_name: string;
    surface: string;
    final_result: string;
}

export interface SurfaceH2HStats {
    total: number;
    player1_wins: number;
    player2_wins: number;
}

export interface RecentForm {
    date: string;
    tournament: string;
    surface: string;
    opponent: string;
    result: 'W' | 'L';
    score: string;
}

export interface H2HData {
    player1_key: number;
    player2_key: number;
    total_matches: number;
    player1_wins: number;
    player2_wins: number;
    last_matches: H2HMatch[];
    by_surface: Record<string, SurfaceH2HStats>;
}

export interface H2HResponse {
    h2h: H2HData;
    player1_recent_form: RecentForm[];
    player2_recent_form: RecentForm[];
}

// Rankings Types (backend returns DB columns: player_key, player_name, atp_ranking, atp_points, etc.)
export interface RankedPlayer {
    player_key: string | number;
    player_name: string;
    atp_ranking?: number | null;
    atp_points?: number | null;
    wta_ranking?: number | null;
    wta_points?: number | null;
    ranking_movement?: string | null;
    country?: string | null;
    player_logo?: string | null;
}

export interface RankingsResponse {
    league: 'ATP';
    label?: string;  // ej. "ATP Individual masculino"
    total: number;
    players: RankedPlayer[];
}

// Tournament Types (backend may return tournament_key as string from DB)
export interface Tournament {
    tournament_key: number | string;
    tournament_name: string;
    event_type_key?: number | string;
    event_type_type: string;
    created_at?: string;
}

export interface TournamentsResponse {
    total: number;
    tournaments: Tournament[];
}

export interface TournamentMatchesResponse {
    tournament_key: number;
    season: number | null;
    total_matches: number;
    matches: Match[];
}

// Multi-Bookmaker Odds Types
export interface BookmakerOdds {
    bookmaker: string;
    player1_odds: number;
    player2_odds: number;
    last_updated: string;
}

export interface MultiOddsResponse {
    match_id: number;
    total_bookmakers: number;
    bookmakers: BookmakerOdds[];
}

export interface BestOddsResponse {
    match_id: number;
    player1_best: {
        bookmaker: string;
        odds: number;
    };
    player2_best: {
        bookmaker: string;
        odds: number;
    };
}

export interface OddsComparisonResponse {
    match_id: number;
    comparison: {
        bookmaker: string;
        player1_odds: number;
        player2_odds: number;
        player1_ev: number;
        player2_ev: number;
    }[];
}

// Point-by-Point Enhanced Types
export interface BreakPointsResponse {
    match_id: number;
    player1_break_points: {
        opportunities: number;
        converted: number;
        conversion_rate: number;
    };
    player2_break_points: {
        opportunities: number;
        converted: number;
        conversion_rate: number;
    };
}

// ============================================
// STATISTICS TYPES (New Backend Endpoints)
// ============================================

// Stats Summary Response
export interface StatsSummaryResponse {
    match_id: number;
    has_data: boolean;
    summary: {
        total_games: number;
        total_points: number;
        player1: PlayerStatsData;
        player2: PlayerStatsData;
    };
}

export interface PlayerStatsData {
    games_won: number;
    breaks: number;
    break_points_faced: number;
    break_points_won: number;
    serve_points: number;
    break_conversion: string;
}

// Detailed Stats Response
export interface DetailedStatsResponse {
    match_id: number;
    summary: {
        total_games: number;
        total_points: number;
        breaks_player1: number;
        breaks_player2: number;
        total_sets: number;
    };
    sets: Record<string, SetData>;
    break_points: BreakPointsData;
    has_data: boolean;
}

export interface SetData {
    games: GameData[];
    games_player1: number;
    games_player2: number;
}

export interface Player {
    nombre: string;
    cuota: number;
    logo: string;
    ranking: number | null;
    key: string;
    pais?: string;        // Country code (ISO 3166-1 alpha-2 or alpha-3)
    seed?: number;        // Tournament seed number
}
export interface GameData {
    id: number;
    match_id: number;
    set_number: string;
    game_number: number;
    server: string;
    winner: string;
    score_games: string;
    score_sets?: string;
    was_break: number;
}

export interface BreakPointsData {
    total_break_points: number;
    breaks_converted: number;
    conversion_rate: number;
}

// Point by Point Response
export interface PointByPointResponse {
    match_id: number;
    set_number: string | null;
    total_points: number;
    points: PointData[];
}

export interface PointData {
    id: number;
    match_id: number;
    set_number: string;
    game_number: number;
    point_number: number;
    server: string;
    score: string;
    is_break_point: number;
    is_set_point: number;
    is_match_point: number;
}

// Games Response
export interface GamesResponse {
    match_id: number;
    total_games: number;
    games: GameData[];
}

// Break Points Response
export interface BreakPointsResponse {
    match_id: number;
    break_points_stats: {
        total_break_points: number;
        breaks_converted: number;
        conversion_rate: number;
    };
}
