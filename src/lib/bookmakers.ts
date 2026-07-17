/**
 * Casas de apuestas conocidas. Los ids son los identificadores EXACTOS que usa API-Tennis
 * en la tabla match_odds del backend — deben coincidir para que el filtrado por casas
 * del usuario (bestOdds) funcione. Para mostrar se usa un nombre legible.
 */
export const KNOWN_BOOKMAKERS = [
  '10Bet',
  '1xBet',
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

const BOOKMAKER_LABELS: Record<string, string> = {
  Pncl: 'Pinnacle',
  Sbo: 'SBOBet',
  WilliamHill: 'William Hill',
};

/** Nombre legible para mostrar (el id se sigue usando para filtrar). */
export function bookmakerLabel(id: string): string {
  return BOOKMAKER_LABELS[id] ?? id;
}
