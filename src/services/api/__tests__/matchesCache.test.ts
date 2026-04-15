import { getCachedMatches, setCachedMatches, clearMatchesCache } from '../matchesCache';
import type { MatchesResponse } from '../../types/api';

// Minimal valid MatchesResponse factory
function makeResponse(fecha = '2026-04-15'): MatchesResponse {
    return {
        fecha,
        es_hoy: true,
        resumen: { total_partidos: 0, completados: 0, en_juego: 0, pendientes: 0 },
        partidos: [],
    } as unknown as MatchesResponse;
}

let dateNowSpy: jest.SpyInstance;
const TTL_MS = 5 * 60 * 1000; // must match module constant (300_000 ms)

beforeEach(() => {
    clearMatchesCache();
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
});

afterEach(() => {
    dateNowSpy.mockRestore();
});

describe('matchesCache', () => {
    it('returns null on miss', () => {
        expect(getCachedMatches('2026-04-15')).toBeNull();
    });

    it('returns data within TTL', () => {
        const data = makeResponse();
        setCachedMatches('2026-04-15', data);
        dateNowSpy.mockReturnValue(1_000_000 + TTL_MS - 1);
        expect(getCachedMatches('2026-04-15')).toEqual(data);
    });

    it('returns null after TTL expires', () => {
        setCachedMatches('2026-04-15', makeResponse());
        dateNowSpy.mockReturnValue(1_000_000 + TTL_MS + 1);
        expect(getCachedMatches('2026-04-15')).toBeNull();
    });

    it('set + get round-trip returns identical object', () => {
        const data = makeResponse('2026-04-20');
        setCachedMatches('2026-04-20', data);
        expect(getCachedMatches('2026-04-20')).toBe(data); // same reference
    });

    it('overwriting same date replaces data', () => {
        const first = makeResponse();
        const second = makeResponse();
        setCachedMatches('2026-04-15', first);
        setCachedMatches('2026-04-15', second);
        expect(getCachedMatches('2026-04-15')).toBe(second);
    });

    it('LRU: oldest entry evicted when 20 entries are exceeded', () => {
        // Fill cache with 20 entries
        for (let i = 0; i < 20; i++) {
            const day = String(i).padStart(2, '0');
            setCachedMatches(`2026-01-${day}`, makeResponse(`2026-01-${day}`));
        }
        // Adding a 21st entry should evict the first ('2026-01-00')
        setCachedMatches('2026-02-01', makeResponse('2026-02-01'));
        expect(getCachedMatches('2026-01-00')).toBeNull(); // evicted
        expect(getCachedMatches('2026-02-01')).not.toBeNull(); // present
    });

    it('clearMatchesCache removes all entries', () => {
        setCachedMatches('2026-04-15', makeResponse());
        setCachedMatches('2026-04-16', makeResponse());
        clearMatchesCache();
        expect(getCachedMatches('2026-04-15')).toBeNull();
        expect(getCachedMatches('2026-04-16')).toBeNull();
    });
});
