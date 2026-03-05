/**
 * Mapa de casas de apuestas a su URL oficial.
 * La API no proporciona enlaces; se usa este mapa para abrir la web al pulsar en la sección de cuotas.
 * Clave: nombre normalizado (sin espacios, minúsculas). Valor: URL.
 */
const BOOKMAKER_URLS: Record<string, string> = {
  bet365: 'https://www.bet365.com',
  williamhill: 'https://www.williamhill.com',
  betway: 'https://www.betway.com',
  bwin: 'https://www.bwin.com',
  marathonbet: 'https://www.marathonbet.com',
  pinnacle: 'https://www.pinnacle.com',
  unibet: 'https://www.unibet.com',
  '888sport': 'https://www.888sport.com',
  betfair: 'https://www.betfair.com',
  '1xbet': 'https://1xbet.com',
  '1x': 'https://1xbet.com',
  betano: 'https://www.betano.com',
  sport888: 'https://www.888sport.com',
  ladbrokes: 'https://www.ladbrokes.com',
  coral: 'https://www.coral.co.uk',
  betclic: 'https://www.betclic.com',
  winamax: 'https://www.winamax.com',
  parionssport: 'https://www.enligne.parionssport.fdj.com',
  netbet: 'https://www.netbet.com',
  pmu: 'https://www.pmu.fr',
  zebet: 'https://www.zebet.fr',
  maria: 'https://www.mariabingo.com',
  betsson: 'https://www.betsson.com',
  coolbet: 'https://www.coolbet.com',
  nordicbet: 'https://www.nordicbet.com',
  sportingbet: 'https://www.sportingbet.com',
  betcris: 'https://www.betcris.com',
  interwetten: 'https://www.interwetten.com',
  sbobet: 'https://www.sbobet.com',
};

function normalizeBookmakerName(name: string): string {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Devuelve la URL de la casa de apuestas si la tenemos; si no, null.
 */
export function getBookmakerUrl(bookmakerName: string): string | null {
  const key = normalizeBookmakerName(bookmakerName);
  return BOOKMAKER_URLS[key] ?? null;
}

/**
 * Devuelve la URL del logo/favicon de la casa (Google Favicon API; más fiable que Clearbit).
 * Si no tenemos web URL, devuelve null.
 */
export function getBookmakerLogoUrl(bookmakerName: string): string | null {
  const url = getBookmakerUrl(bookmakerName);
  if (!url) return null;
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '');
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return null;
  }
}
