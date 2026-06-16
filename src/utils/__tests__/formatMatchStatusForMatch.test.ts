import { formatMatchStatusForMatch, isMatchAnulado } from '../formatters';

/**
 * Partido ANULADO (cancelado/walkover): consta como completado/cancelado pero SIN ganador.
 * Debe quedarse dentro de Finalizados pero mostrar "Anulado" en vez de "Finalizado".
 */
describe('isMatchAnulado / formatMatchStatusForMatch', () => {
  it('completado SIN ganador → anulado', () => {
    expect(isMatchAnulado({ estado: 'completado', resultado: { ganador: null } })).toBe(true);
    expect(formatMatchStatusForMatch({ estado: 'completado', resultado: { ganador: null } }).text).toBe(
      'Anulado',
    );
  });

  it('completado CON ganador → Finalizado (no anulado)', () => {
    expect(isMatchAnulado({ estado: 'completado', resultado: { ganador: 'Alice' } })).toBe(false);
    expect(formatMatchStatusForMatch({ estado: 'completado', resultado: { ganador: 'Alice' } }).text).toBe(
      'Finalizado',
    );
  });

  it('cancelado sin ganador → anulado', () => {
    expect(isMatchAnulado({ estado: 'cancelado', resultado: null })).toBe(true);
    expect(formatMatchStatusForMatch({ estado: 'cancelado', resultado: null }).text).toBe('Anulado');
  });

  it('pendiente → Pendiente (nunca anulado)', () => {
    expect(isMatchAnulado({ estado: 'pendiente', resultado: null })).toBe(false);
    expect(formatMatchStatusForMatch({ estado: 'pendiente', resultado: null }).text).toBe('Pendiente');
  });

  it('en_juego → EN VIVO (nunca anulado)', () => {
    expect(isMatchAnulado({ estado: 'en_juego', resultado: null })).toBe(false);
    expect(formatMatchStatusForMatch({ estado: 'en_juego', resultado: null }).text).toBe('EN VIVO');
  });
});
