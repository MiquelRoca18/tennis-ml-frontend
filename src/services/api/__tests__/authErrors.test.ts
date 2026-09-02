import { mensajeNoAutorizado } from '../authErrors';

describe('mensajeNoAutorizado', () => {
  it('cuando el servicio de auth no responde, NO manda a iniciar sesión', () => {
    // Caso real: el proyecto de Supabase está pausado y su dominio ya no resuelve.
    // Decirle al usuario "vuelve a iniciar sesión" lo mete en un bucle imposible.
    const msg = mensajeNoAutorizado({ authNoAlcanzable: true });

    expect(msg).toMatch(/autenticaci[óo]n/i);
    expect(msg).not.toMatch(/vuelve a iniciar sesi[óo]n/i);
  });

  it('cuando no hay sesión guardada, invita a entrar', () => {
    const msg = mensajeNoAutorizado({ sinSesion: true });
    expect(msg).toMatch(/iniciar sesi[óo]n/i);
  });

  it('cuando se envió un token y fue rechazado, la sesión caducó de verdad', () => {
    const msg = mensajeNoAutorizado({});
    expect(msg).toMatch(/caducada/i);
  });

  it('el fallo de servicio tiene prioridad sobre la falta de sesión', () => {
    // Si Supabase no responde, tampoco hay sesión: debe ganar la causa raíz.
    const msg = mensajeNoAutorizado({ authNoAlcanzable: true, sinSesion: true });
    expect(msg).toMatch(/autenticaci[óo]n/i);
  });
});
