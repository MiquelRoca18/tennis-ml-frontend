/**
 * Traducción de un 401 a un mensaje ÚTIL para el usuario.
 *
 * Un 401 puede venir de tres sitios muy distintos y el consejo cambia en cada uno. Antes
 * todos decían "Sesión caducada. Vuelve a iniciar sesión.", lo que deja al usuario en un
 * bucle imposible cuando el problema es que el servicio de autenticación no existe:
 * reintentar el login nunca va a funcionar y el mensaje no da ninguna pista de por qué.
 */

export interface EstadoAuth {
  /** El proveedor de auth no se pudo alcanzar (caído, pausado, sin red). */
  authNoAlcanzable?: boolean;
  /** Se pudo consultar el proveedor, pero no hay sesión guardada. */
  sinSesion?: boolean;
}

export function mensajeNoAutorizado(estado: EstadoAuth): string {
  // La causa raíz manda: si el proveedor no responde, tampoco habrá sesión, y pedir
  // login sería un callejón sin salida.
  if (estado.authNoAlcanzable) {
    return 'El servicio de autenticación no responde. Vuelve a intentarlo más tarde.';
  }
  if (estado.sinSesion) {
    return 'Necesitas iniciar sesión para ver esto.';
  }
  return 'Sesión caducada. Vuelve a iniciar sesión.';
}
