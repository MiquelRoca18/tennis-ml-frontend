
// API Configuration
// La URL del backend se toma de EXPO_PUBLIC_API_URL (inyectada en build por Vercel/EAS).
// Fallback: Railway (mantiene compatibilidad con builds/instalaciones que aún no la definen).
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://panaderiaroca.tail739b56.ts.net';
/** Base URL para fotos de jugadores (API-Tennis). Si logo_url viene solo como "12345_nombre.jpg", se resuelve aquí. */
export const PLAYER_LOGO_BASE_URL = 'https://api.api-tennis.com/logo-tennis';

// Colors - FlashScore Style
export const COLORS = {
  // Backgrounds
  background: '#0D1117',      // Negro azulado principal
  surface: '#161B22',         // Negro más claro para cards
  surfaceElevated: '#1C2128', // Para elementos elevados

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8B949E',
  textMuted: '#484F58',

  // Brand colors (tono amarillento para Tenly, fondo oscuro)
  primary: '#D4A84B',         // Amarillo/dorado suave
  secondary: '#6C757D',
  accent: '#FFC107',
  neonGreen: '#00FF41',       // Verde neón (live, success)
  liveRed: '#FF0000',         // Rojo para LIVE

  // Status
  success: '#00FF41',         // Verde neón
  warning: '#FFA500',
  danger: '#FF4444',

  // Borders
  border: '#30363D',
  borderLight: '#21262D',

  // Surfaces
  hard: '#D4A84B',
  clay: '#D2691E',
  grass: '#228B22',

  // EV indicators
  evPositive: '#00FF41',
  evMarginal: '#FFA500',
  evNegative: '#FF4444',
};

// EV thresholds
export const EV_THRESHOLD_BET = 0.03; // 3%
export const EV_THRESHOLD_MARGINAL = 0.0; // 0%
