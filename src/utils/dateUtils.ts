/**
 * Date utility functions for the tennis match feed
 */

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
    const today = new Date();
    return formatDateToISO(today);
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Add or subtract days from a date
 */
export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
    return dateString === getTodayDate();
}

/**
 * Check if a date string is in the past
 */
export function isPast(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
}

/**
 * Check if a date string is in the future
 */
export function isFuture(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date > today;
}

/**
 * Generate an array of dates for the date selector
 * @param daysBefore - Number of days before today
 * @param daysAfter - Number of days after today
 * @returns Array of date strings in YYYY-MM-DD format
 */
export function getDateRange(daysBefore: number = 7, daysAfter: number = 7): string[] {
    const dates: string[] = [];
    const today = new Date();

    for (let i = -daysBefore; i <= daysAfter; i++) {
        const date = addDays(today, i);
        dates.push(formatDateToISO(date));
    }

    return dates;
}

/**
 * Format date for short display (e.g., "Lun 13")
 */
export function formatDateShort(dateString: string): { dayName: string; dayNumber: string } {
    const date = new Date(dateString);
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return {
        dayName: dayNames[date.getDay()],
        dayNumber: String(date.getDate()),
    };
}

/**
 * Format day of week in Spanish
 */
export function formatDayOfWeek(dateString: string): string {
    const date = new Date(dateString);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dayNames[date.getDay()];
}

/**
 * Format date for display (e.g., "Lunes, 13 de Enero")
 */
export function formatDateLong(dateString: string): string {
    const date = new Date(dateString);
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];

    return `${dayName}, ${day} de ${month}`;
}
