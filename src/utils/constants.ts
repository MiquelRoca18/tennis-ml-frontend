
// API Configuration
export const API_BASE_URL = 'https://tennis-ml-predictor-production.up.railway.app';
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

  // Brand colors
  primary: '#4A90E2',         // Azul principal
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
  hard: '#4A90E2',
  clay: '#D2691E',
  grass: '#228B22',

  // EV indicators
  evPositive: '#00FF41',
  evMarginal: '#FFA500',
  evNegative: '#FF4444',
};

// Tennis surfaces
export const SURFACES = ['Hard', 'Clay', 'Grass', 'Carpet'] as const;

// Confidence levels
export const CONFIDENCE_LEVELS = ['Alta', 'Media', 'Baja'] as const;
export const CONFIDENCE_LEVELS_NEW = ['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'] as const;

// Confidence level descriptions
export const CONFIDENCE_DESCRIPTIONS = {
  HIGH: 'Ambos jugadores en datos históricos',
  MEDIUM: 'Datos parciales disponibles',
  LOW: 'Jugadores sin historial - NO apostar',
  UNKNOWN: 'Nivel desconocido',
  Alta: 'Alta confianza',
  Media: 'Confianza media',
  Baja: 'Baja confianza',
};

// Match states
export const MATCH_STATES = ['pendiente', 'en_juego', 'completado', 'cancelado'] as const;

// Stats periods
export const STATS_PERIODS = ['7d', '30d', 'all'] as const;

// EV thresholds
export const EV_THRESHOLD_BET = 0.03; // 3%
export const EV_THRESHOLD_MARGINAL = 0.0; // 0%

// Kelly fraction default
export const KELLY_FRACTION_DEFAULT = 0.25; // 25% Kelly
