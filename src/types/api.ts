// TypeScript types for API responses

export type Surface = 'Hard' | 'Clay' | 'Grass' | 'Carpet';
export type MatchState = 'pendiente' | 'en_juego' | 'completado' | 'cancelado';
export type Confidence = 'Alta' | 'Media' | 'Baja';
export type StatsPeriod = '7d' | '30d' | 'all';

export interface Player {
    nombre: string;
    ranking: number | null;
    cuota: number;
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
}

export interface MatchResult {
    ganador: string;
    marcador: string;
}

export interface Match {
    id: number;
    estado: MatchState;
    fecha_partido: string;
    hora_inicio: string | null;
    torneo: string | null;
    ronda: string | null;
    superficie: Surface;
    jugador1: Player;
    jugador2: Player;
    prediccion: Prediction;
    resultado: MatchResult | null;
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
