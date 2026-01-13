import { MatchState } from '../types/api';

/**
 * Format date to Spanish locale
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Formatted date (e.g., "12 Ene 2026")
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
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
export const formatProbability = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
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

    const date = new Date(dateString);
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
