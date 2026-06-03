import { isLiveMatch } from '../dateUtils';

/**
 * Regresión del bug "🔴 en el filtro Por jugar":
 * la fuente de verdad de "en directo" es el backend (estado en_juego / is_live),
 * NUNCA el reloj. Un partido pendiente cuya hora ya pasó NO debe contar como live.
 */
describe('isLiveMatch', () => {
  it('es live si el backend marca estado en_juego', () => {
    expect(isLiveMatch({ estado: 'en_juego', is_live: false })).toBe(true);
  });

  it('es live si el backend marca is_live=true', () => {
    expect(isLiveMatch({ estado: 'pendiente', is_live: true })).toBe(true);
  });

  it('NO es live un pendiente sin flag de directo (aunque su hora ya hubiera pasado)', () => {
    // Este es el caso del bug: antes se inferia por reloj y se marcaba 🔴 por error.
    expect(isLiveMatch({ estado: 'pendiente', is_live: false })).toBe(false);
  });

  it('NO es live un partido completado', () => {
    expect(isLiveMatch({ estado: 'completado', is_live: false })).toBe(false);
  });

  it('NO es live si is_live viene ausente (undefined/null)', () => {
    expect(isLiveMatch({ estado: 'pendiente' })).toBe(false);
    expect(isLiveMatch({ estado: 'pendiente', is_live: null })).toBe(false);
  });

  it('acepta is_live como string "1" pero rechaza "0" (robustez de tipos)', () => {
    expect(isLiveMatch({ estado: 'pendiente', is_live: '1' })).toBe(true);
    expect(isLiveMatch({ estado: 'pendiente', is_live: '0' })).toBe(false);
  });
});
