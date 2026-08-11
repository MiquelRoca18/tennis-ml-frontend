import type { CountryCode } from '../lib/bookmakers';

/**
 * País del usuario, para saber en qué casas puede apostar de verdad.
 *
 * Hoy devuelve España fija porque solo hay un usuario. Cuando la app tenga usuarios de
 * otros países, ESTE es el único sitio que hay que cambiar (leer el país del perfil de
 * Supabase); ningún consumidor se entera.
 */
export function useUserCountry(): CountryCode {
  return 'ES';
}
