import { computeArbSplit } from '../arb';

/**
 * Reparto de stake + ganancia de un arbitraje, calculado EN CLIENTE para cualquier bankroll.
 * stake_i = bankroll * (1/odds_i) / inv ; retorno = bankroll/inv (igual gane quien gane);
 * ganancia = retorno - bankroll.
 */
describe('computeArbSplit', () => {
  const simetrico = [
    { side: 1, bookmaker: '1xBet', odds: 2.1 },
    { side: 2, bookmaker: 'bet365', odds: 2.1 },
  ];

  it('reparte 50/50 y calcula la ganancia (cuotas simétricas)', () => {
    const r = computeArbSplit(simetrico, 100);
    expect(r.legs[0].stake).toBeCloseTo(50, 2);
    expect(r.legs[1].stake).toBeCloseTo(50, 2);
    expect(r.guaranteedReturn).toBeCloseTo(105, 2);
    expect(r.profit).toBeCloseTo(5, 2);
    expect(r.profitPct).toBeCloseTo(5, 2);
  });

  it('escala con el bankroll', () => {
    const r = computeArbSplit(simetrico, 200);
    expect(r.legs[0].stake).toBeCloseTo(100, 2);
    expect(r.legs[1].stake).toBeCloseTo(100, 2);
    expect(r.profit).toBeCloseTo(10, 2);
  });

  it('reparte correctamente con cuotas asimétricas (2.04 / 1.97, 100€)', () => {
    const r = computeArbSplit(
      [
        { side: 1, bookmaker: 'Pinnacle', odds: 2.04 },
        { side: 2, bookmaker: 'Superbet', odds: 1.97 },
      ],
      100,
    );
    expect(r.legs[0].stake).toBeCloseTo(49.13, 1);
    expect(r.legs[1].stake).toBeCloseTo(50.87, 1);
    // los dos stakes suman el bankroll
    expect(r.legs[0].stake + r.legs[1].stake).toBeCloseTo(100, 2);
    // retorno igual gane quien gane
    expect(r.legs[0].stake * 2.04).toBeCloseTo(r.legs[1].stake * 1.97, 1);
    expect(r.profit).toBeCloseTo(0.22, 1);
  });

  it('sin cuotas válidas devuelve ganancia 0', () => {
    const r = computeArbSplit([], 100);
    expect(r.profit).toBe(0);
    expect(r.guaranteedReturn).toBe(0);
  });
});
