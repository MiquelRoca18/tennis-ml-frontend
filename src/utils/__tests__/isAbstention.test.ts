import { isAbstention } from '../formatters';

/**
 * El modelo Challenger devuelve EXACTAMENTE 50%/50% cuando el partido cae fuera de su
 * nicho (top-150 vs 300+) o le falta ranking (_skip_response en el backend). Eso NO es
 * una predicción real — es una abstención ("no me mojo"). Una predicción real nunca da
 * 0.5000 exacto. El frontend debe mostrar "Sin predicción" en esos casos, no "50% / 50%".
 */
describe('isAbstention', () => {
  it('detecta abstención con probabilidades 0.5 / 0.5 (escala 0-1)', () => {
    expect(isAbstention(0.5, 0.5)).toBe(true);
  });

  it('detecta abstención con probabilidades 50 / 50 (escala 0-100)', () => {
    expect(isAbstention(50, 50)).toBe(true);
  });

  it('NO es abstención una predicción real cercana al 50% (0.498 / 0.502)', () => {
    expect(isAbstention(0.498, 0.502)).toBe(false);
  });

  it('NO es abstención una predicción real cercana al 50% en escala 0-100 (49.8 / 50.2)', () => {
    expect(isAbstention(49.8, 50.2)).toBe(false);
  });

  it('NO es abstención una predicción clara (0.73 / 0.27)', () => {
    expect(isAbstention(0.73, 0.27)).toBe(false);
  });

  it('NO es abstención si falta alguna probabilidad', () => {
    expect(isAbstention(null, null)).toBe(false);
    expect(isAbstention(0.5, undefined)).toBe(false);
    expect(isAbstention(undefined, 0.5)).toBe(false);
  });
});
