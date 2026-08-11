import {
  KNOWN_BOOKMAKERS,
  availabilityIn,
  bookmakersFor,
  COUNTRIES_LAST_VERIFIED,
} from '../bookmakers';

describe('bookmakers por país', () => {
  it('incluye 888Sport, que faltaba en el catálogo', () => {
    expect(KNOWN_BOOKMAKERS).toContain('888Sport');
  });

  it('marca como disponible una casa accesible desde España', () => {
    expect(availabilityIn('bet365', 'ES')).toBe('available');
    expect(availabilityIn('1xBet', 'ES')).toBe('available');
  });

  it('marca como no disponible una casa inaccesible desde España', () => {
    expect(availabilityIn('Pncl', 'ES')).toBe('unavailable');
    expect(availabilityIn('Betano', 'ES')).toBe('unavailable');
  });

  it('marca como desconocida una casa que no está en el catálogo', () => {
    // API-Tennis puede añadir casas nuevas: nunca deben ocultarse ni romper la pantalla.
    expect(availabilityIn('CasaNueva', 'ES')).toBe('unknown');
  });

  it('bookmakersFor devuelve solo las disponibles, nunca las desconocidas', () => {
    const casas = bookmakersFor('ES');
    expect(casas.has('bet365')).toBe(true);
    expect(casas.has('Pncl')).toBe(false);
    expect(casas.has('CasaNueva')).toBe(false);
  });

  it('toda casa conocida tiene disponibilidad declarada', () => {
    // Si se añade una casa a KNOWN_BOOKMAKERS y se olvida el mapa, este test lo caza.
    for (const bm of KNOWN_BOOKMAKERS) {
      expect(availabilityIn(bm, 'ES')).not.toBe('unknown');
    }
  });

  it('expone la fecha de verificación, porque la lista caduca', () => {
    expect(COUNTRIES_LAST_VERIFIED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
