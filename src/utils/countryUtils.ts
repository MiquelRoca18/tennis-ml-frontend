/**
 * Safe flag getter: accepts country name or code. Use when data may be missing (we don't have
 * all data Flashscore has). Returns '' if unknown so UI can hide the flag cell.
 */
export function getCountryFlagSafe(value: string | null | undefined): string {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    const flag = getCountryFlag(trimmed);
    if (flag) return flag;
    // Try mapping common country names to code (API often returns "Spain", "USA")
    const nameToCode: Record<string, string> = {
        'Spain': 'ES', 'España': 'ES', 'USA': 'US', 'United States': 'US', 'France': 'FR', 'Francia': 'FR',
        'Germany': 'DE', 'Alemania': 'DE', 'Italy': 'IT', 'Italia': 'IT', 'Argentina': 'AR', 'Brazil': 'BR',
        'Brasil': 'BR', 'Australia': 'AU', 'Austria': 'AT', 'Belgium': 'BE', 'Canada': 'CA', 'Chile': 'CL',
        'China': 'CN', 'Croatia': 'HR', 'Czech Republic': 'CZ', 'Serbia': 'RS', 'Switzerland': 'CH',
        'Suiza': 'CH', 'Poland': 'PL', 'Polonia': 'PL', 'Russia': 'RU', 'Rusia': 'RU', 'World': '',
    };
    const code = nameToCode[trimmed] ?? nameToCode[trimmed.toLowerCase()];
    return code ? getCountryFlag(code) : '';
}

/**
 * Get country flag emoji from country code
 * @param countryCode - ISO 3166-1 alpha-2 or alpha-3 country code
 * @returns Flag emoji or empty string
 */
export function getCountryFlag(countryCode: string | null | undefined): string {
    if (!countryCode) return '';

    // Convert to uppercase and handle common formats
    const code = countryCode.toUpperCase().trim();

    // Handle alpha-3 to alpha-2 conversion for common countries
    const alpha3ToAlpha2: Record<string, string> = {
        'ESP': 'ES', 'USA': 'US', 'GBR': 'GB', 'FRA': 'FR', 'GER': 'DE',
        'ITA': 'IT', 'ARG': 'AR', 'BRA': 'BR', 'AUS': 'AU', 'CAN': 'CA',
        'CHN': 'CN', 'JPN': 'JP', 'RUS': 'RU', 'SRB': 'RS', 'SUI': 'CH',
        'NED': 'NL', 'BEL': 'BE', 'AUT': 'AT', 'CZE': 'CZ', 'POL': 'PL',
        'SWE': 'SE', 'NOR': 'NO', 'DEN': 'DK', 'FIN': 'FI', 'GRE': 'GR',
        'CRO': 'HR', 'POR': 'PT', 'MEX': 'MX', 'CHI': 'CL', 'COL': 'CO',
        'URU': 'UY', 'VEN': 'VE', 'PER': 'PE', 'ECU': 'EC', 'BOL': 'BO',
        'PAR': 'PY', 'IND': 'IN', 'KOR': 'KR', 'THA': 'TH', 'VIE': 'VN',
        'PHI': 'PH', 'INA': 'ID', 'MAS': 'MY', 'SIN': 'SG', 'HKG': 'HK',
        'TPE': 'TW', 'NZL': 'NZ', 'RSA': 'ZA', 'EGY': 'EG', 'MAR': 'MA',
        'TUN': 'TN', 'ALG': 'DZ', 'ISR': 'IL', 'TUR': 'TR', 'UKR': 'UA',
        'BLR': 'BY', 'KAZ': 'KZ', 'UZB': 'UZ', 'GEO': 'GE', 'ARM': 'AM',
        'AZE': 'AZ', 'LAT': 'LV', 'LTU': 'LT', 'EST': 'EE', 'SVK': 'SK',
        'SLO': 'SI', 'BUL': 'BG', 'ROU': 'RO', 'HUN': 'HU',
    };

    // Get alpha-2 code
    const alpha2 = code.length === 3 ? (alpha3ToAlpha2[code] || code.slice(0, 2)) : code;

    // Convert to flag emoji using regional indicator symbols
    if (alpha2.length === 2) {
        const codePoints = [...alpha2].map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    return '';
}

/**
 * Format seed number for display
 * @param seed - Seed number
 * @returns Formatted seed string
 */
export function formatSeed(seed: number | null | undefined): string {
    if (!seed) return '';
    return `[${seed}]`;
}
