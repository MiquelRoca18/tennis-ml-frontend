import { MatchState } from '../types/api';
import { parseLocalDate } from './dateUtils';

/**
 * Format date to Spanish locale
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Formatted date (e.g., "12 Ene 2026")
 */
export const formatDate = (dateString: string): string => {
    const date = parseLocalDate(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    };
    return date.toLocaleDateString('es-ES', options);
};

/**
 * Format time
 * @param timeString - Time in HH:MM format
 * @returns Formatted time (e.g., "14:00")
 */
export const formatTime = (timeString: string | null): string => {
    if (!timeString) return 'TBD';
    return timeString;
};

/**
 * Format match time with date context
 * @param fecha - Date in YYYY-MM-DD format
 * @param hora - Time in HH:MM format
 * @returns Formatted time with context (e.g., "Hoy 14:30", "Mañana 10:00")
 */
export const formatMatchTime = (fecha: string, hora: string | null): string => {
    if (!hora) return 'Hora por confirmar';

    // Remove seconds if present (14:30:00 -> 14:30)
    const timeWithoutSeconds = hora.includes(':')
        ? hora.split(':').slice(0, 2).join(':')
        : hora;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const matchDate = parseLocalDate(fecha);
    matchDate.setHours(0, 0, 0, 0);

    const diffTime = matchDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return `Hoy ${timeWithoutSeconds}`;
    if (diffDays === 1) return `Mañana ${timeWithoutSeconds}`;
    if (diffDays === -1) return `Ayer ${timeWithoutSeconds}`;

    // For other days, show short date
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const dateStr = matchDate.toLocaleDateString('es-ES', options);
    return `${dateStr} ${timeWithoutSeconds}`;
};


/**
 * Format percentage with sign
 * @param value - Decimal value (e.g., 0.052 for 5.2%)
 * @returns Formatted percentage (e.g., "+5.2%" or "-2.7%")
 */
export const formatPercentage = (value: number): string => {
    const percentage = (value * 100).toFixed(1);
    const sign = value >= 0 ? '+' : '';
    return `${sign}${percentage}%`;
};

/**
 * Format probability as percentage
 * @param value - Decimal value (e.g., 0.673 for 67.3%)
 * @returns Formatted percentage (e.g., "67.3%")
 */
export const formatProbability = (value: number | null | undefined): string => {
    if (value == null || typeof value !== 'number') return '—';
    // Aceptar tanto 0-1 (0.58) como 0-100 (58)
    const pct = value <= 1 ? value * 100 : value;
    return `${Math.min(100, Math.max(0, pct)).toFixed(1)}%`;
};

/**
 * Format odds
 * @param odds - Odds value
 * @returns Formatted odds (e.g., "1.75" or "2.10")
 */
export const formatOdds = (odds: number): string => {
    return odds.toFixed(2);
};

/**
 * Format currency (Euro)
 * @param amount - Amount in euros
 * @returns Formatted currency (e.g., "€10.50")
 */
export const formatCurrency = (amount: number): string => {
    return `€${amount.toFixed(2)}`;
};

/**
 * Get relative date string
 * @param dateString - Date in YYYY-MM-DD format
 * @returns "Hoy", "Mañana", "Ayer", or formatted date
 */
export const getRelativeDate = (dateString: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = parseLocalDate(dateString);
    date.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';

    return formatDate(dateString);
};

/**
 * Format match state to Spanish
 * @param estado - Match state
 * @returns Spanish translation
 */
export const formatMatchState = (estado: string): string => {
    const states: Record<string, string> = {
        pendiente: 'Pendiente',
        en_juego: 'En Juego',
        completado: 'Finalizado',
        cancelado: 'Cancelado',
    };
    return states[estado] || estado;
};

/**
 * Estado mostrado en el detalle cuando el partido ya ha empezado pero no hay datos en directo
 * (la API no aporta livescore). Solo se usa en vista detalle; en la card se muestra LIVE.
 */
export const SOLO_RESULTADO_FINAL_STATUS = {
    emoji: '📋',
    text: 'Solo Resultado Final',
    color: '#757575',
} as const;

/**
 * Format match status with emoji and color
 * @param estado - Match state
 * @returns Object with emoji, text, and color
 */
export const formatMatchStatus = (estado: MatchState): { emoji: string; text: string; color: string } => {
    switch (estado) {
        case 'en_juego':
            return { emoji: '🔴', text: 'EN VIVO', color: '#FF4444' };
        case 'pendiente':
            return { emoji: '⏰', text: 'Pendiente', color: '#FFA726' };
        case 'completado':
            return { emoji: '✅', text: 'Finalizado', color: '#66BB6A' };
        case 'cancelado':
            return { emoji: '❌', text: 'Cancelado', color: '#999999' };
        default:
            return { emoji: '❓', text: 'Desconocido', color: '#999999' };
    }
};

/**
 * True si el partido fue ANULADO (cancelado/walkover/retiro antes de jugarse): consta como
 * completado/cancelado pero SIN ganador. Mismo criterio que el backend ("anulada").
 */
export const isMatchAnulado = (m: {
    estado?: string | null;
    resultado?: { ganador?: string | null } | null;
}): boolean => (m.estado === 'completado' || m.estado === 'cancelado') && !m.resultado?.ganador;

/**
 * Estado a mostrar de un partido concreto: igual que formatMatchStatus, pero muestra "Anulado"
 * cuando el partido fue anulado (queda dentro de Finalizados, solo cambia la etiqueta).
 */
export const formatMatchStatusForMatch = (m: {
    estado?: string | null;
    resultado?: { ganador?: string | null } | null;
}): { emoji: string; text: string; color: string } => {
    if (isMatchAnulado(m)) {
        return { emoji: '🚫', text: 'Anulado', color: '#999999' };
    }
    return formatMatchStatus((m.estado ?? 'pendiente') as MatchState);
};
