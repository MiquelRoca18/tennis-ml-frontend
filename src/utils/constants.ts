// API Configuration
export const API_BASE_URL = 'http://localhost:8000';
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Colors
export const COLORS = {
  // Primary colors
  primary: '#1E88E5',
  secondary: '#43A047',
  accent: '#FFB300',

  // Semantic colors
  success: '#00C853',
  warning: '#FFA726',
  danger: '#E53935',

  // Neutrals
  background: '#FAFAFA',
  surface: '#FFFFFF',
  textPrimary: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',

  // EV indicators
  evPositive: '#00C853',
  evMarginal: '#FFA726',
  evNegative: '#E53935',
};

// Tennis surfaces
export const SURFACES = ['Hard', 'Clay', 'Grass', 'Carpet'] as const;

// Confidence levels
export const CONFIDENCE_LEVELS = ['Alta', 'Media', 'Baja'] as const;

// Match states
export const MATCH_STATES = ['pendiente', 'en_juego', 'completado', 'cancelado'] as const;

// Stats periods
export const STATS_PERIODS = ['7d', '30d', 'all'] as const;

// EV thresholds
export const EV_THRESHOLD_BET = 0.03; // 3%
export const EV_THRESHOLD_MARGINAL = 0.0; // 0%

// Kelly fraction default
export const KELLY_FRACTION_DEFAULT = 0.25; // 25% Kelly
