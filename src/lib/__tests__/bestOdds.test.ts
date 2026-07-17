import { bestOdds } from '../bestOdds';

/**
 * Port TS de best_odds (backend): mejor cuota por lado entre casas (line-shopping).
 * Con el parámetro `casas` filtra a las casas del usuario (SP2). Ignora cuotas <= 1.
 */
const ROWS = [
  { bookmaker: 'bet365', side: 1, odds: 1.9 },
  { bookmaker: '1xBet', side: 1, odds: 2.05 },
  { bookmaker: 'bet365', side: 2, odds: 1.95 },
  { bookmaker: 'Pinnacle', side: 2, odds: 2.02 },
];

describe('bestOdds', () => {
  it('devuelve la mejor cuota por lado', () => {
    expect(bestOdds(ROWS)[1]).toEqual({ odds: 2.05, bookmaker: '1xBet' });
    expect(bestOdds(ROWS)[2]).toEqual({ odds: 2.02, bookmaker: 'Pinnacle' });
  });

  it('filtra por las casas del usuario', () => {
    expect(bestOdds(ROWS, new Set(['bet365']))[1]).toEqual({ odds: 1.9, bookmaker: 'bet365' });
  });

  it('ignora cuotas <= 1', () => {
    const rows = [
      { bookmaker: 'x', side: 1 as const, odds: 1.0 },
      { bookmaker: 'y', side: 1 as const, odds: 1.5 },
    ];
    expect(bestOdds(rows)[1]).toEqual({ odds: 1.5, bookmaker: 'y' });
  });

  it('sin datos válidos devuelve {}', () => {
    expect(bestOdds([])).toEqual({});
    expect(bestOdds([{ bookmaker: 'x', side: 1, odds: 1.0 }])).toEqual({});
  });

  it('un lado sin datos no aparece', () => {
    const res = bestOdds([{ bookmaker: 'x', side: 1, odds: 2.0 }]);
    expect(res[1]).toEqual({ odds: 2.0, bookmaker: 'x' });
    expect(res[2]).toBeUndefined();
  });
});
