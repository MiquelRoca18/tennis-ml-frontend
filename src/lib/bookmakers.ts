/**
 * Casas de apuestas conocidas. Los ids son los identificadores EXACTOS que usa API-Tennis
 * en la tabla match_odds del backend — deben coincidir para que el filtrado por casas
 * del usuario (bestOdds) funcione. Para mostrar se usa un nombre legible.
 */
export const KNOWN_BOOKMAKERS = [
  '10Bet',
  '1xBet',
  '888Sport',
  'bet365',
  'Betano',
  'Betfair',
  'BetVictor',
  'Marathon',
  'Pncl',
  'Sbo',
  'Superbet',
  'Unibet',
  'WilliamHill',
] as const;

export type BookmakerId = (typeof KNOWN_BOOKMAKERS)[number];

/** Países soportados. Se amplía cuando la app tenga usuarios fuera de España. */
export type CountryCode = 'ES';

/** Disponibilidad de una casa en un país. 'unknown' = casa que no está en el catálogo. */
export type Availability = 'available' | 'unavailable' | 'unknown';

/**
 * Países desde los que se puede apostar en cada casa.
 *
 * OJO: esta lista CADUCA. Betano, por ejemplo, obtuvo licencia española en julio de 2026
 * pero todavía no acepta usuarios. Por eso la selección manual del usuario en Ajustes
 * siempre manda sobre esta clasificación: solo él sabe dónde tiene cuenta abierta.
 */
export const BOOKMAKER_COUNTRIES: Record<string, readonly CountryCode[]> = {
  // Accesibles desde España
  '1xBet': ['ES'],
  '888Sport': ['ES'],
  bet365: ['ES'],
  Betfair: ['ES'],
  WilliamHill: ['ES'],
  // No accesibles desde España
  '10Bet': [],
  Betano: [],
  BetVictor: [],
  Marathon: [],
  Pncl: [],
  Sbo: [],
  Superbet: [],
  Unibet: [],
};

/** Fecha de la última verificación de BOOKMAKER_COUNTRIES. Se muestra en Ajustes. */
export const COUNTRIES_LAST_VERIFIED = '2026-08-11';

const BOOKMAKER_LABELS: Record<string, string> = {
  Pncl: 'Pinnacle',
  Sbo: 'SBOBet',
  WilliamHill: 'William Hill',
};

/** Nombre legible para mostrar (el id se sigue usando para filtrar). */
export function bookmakerLabel(id: string): string {
  return BOOKMAKER_LABELS[id] ?? id;
}

/**
 * Disponibilidad de una casa desde un país.
 *
 * Una casa fuera del catálogo devuelve 'unknown' en lugar de 'unavailable': si API-Tennis
 * empieza a servir una casa nueva, se sigue mostrando en vez de desaparecer sin aviso.
 */
export function availabilityIn(bookmaker: string, country: CountryCode): Availability {
  const countries = BOOKMAKER_COUNTRIES[bookmaker];
  if (countries === undefined) return 'unknown';
  return countries.includes(country) ? 'available' : 'unavailable';
}

/** Casas accesibles desde un país. Las desconocidas quedan fuera: no se precargan a ciegas. */
export function bookmakersFor(country: CountryCode): Set<string> {
  return new Set(KNOWN_BOOKMAKERS.filter((bm) => availabilityIn(bm, country) === 'available'));
}
