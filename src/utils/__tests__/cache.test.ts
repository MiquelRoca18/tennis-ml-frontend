import Cache from '../cache';

let dateNowSpy: jest.SpyInstance;

beforeEach(() => {
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
});

afterEach(() => {
    dateNowSpy.mockRestore();
});

describe('Cache', () => {
    it('returns null on miss', () => {
        const cache = new Cache(5, 100);
        expect(cache.get('missing')).toBeNull();
    });

    it('returns value within TTL', () => {
        const cache = new Cache(5, 100); // 5 min = 300_000 ms
        cache.set('key', { value: 42 });
        // still within TTL
        dateNowSpy.mockReturnValue(1_000_000 + 299_999);
        expect(cache.get('key')).toEqual({ value: 42 });
    });

    it('returns null after TTL expires', () => {
        const cache = new Cache(5, 100);
        cache.set('key', 'hello');
        dateNowSpy.mockReturnValue(1_000_000 + 300_001); // past 5 min
        expect(cache.get('key')).toBeNull();
    });

    it('expired entry is removed from cache', () => {
        const cache = new Cache(5, 100);
        cache.set('key', 'hello');
        dateNowSpy.mockReturnValue(1_000_000 + 300_001);
        cache.get('key'); // triggers deletion
        expect(cache.getStats().size).toBe(0);
    });

    it('set then get round-trip', () => {
        const cache = new Cache(5, 100);
        cache.set('foo', [1, 2, 3]);
        expect(cache.get('foo')).toEqual([1, 2, 3]);
    });

    it('evicts oldest on maxEntries overflow', () => {
        const cache = new Cache(5, 3);
        cache.set('A', 1);
        cache.set('B', 2);
        cache.set('C', 3);
        cache.set('D', 4); // A should be evicted
        expect(cache.get('A')).toBeNull();
        expect(cache.get('B')).toBe(2);
        expect(cache.get('C')).toBe(3);
        expect(cache.get('D')).toBe(4);
    });

    it('get touch moves entry to end, protecting it from eviction', () => {
        const cache = new Cache(5, 3);
        cache.set('A', 1);
        cache.set('B', 2);
        cache.set('C', 3);
        // Touch B — now B is most recently used, so A becomes LRU
        cache.get('B');
        cache.set('D', 4); // should evict A (LRU), not B
        expect(cache.get('A')).toBeNull();
        expect(cache.get('B')).toBe(2);
        expect(cache.get('C')).toBe(3);
        expect(cache.get('D')).toBe(4);
    });

    it('clear empties the cache', () => {
        const cache = new Cache(5, 100);
        cache.set('a', 1);
        cache.set('b', 2);
        cache.clear();
        expect(cache.getStats().size).toBe(0);
        expect(cache.get('a')).toBeNull();
    });

    it('has returns true for valid entry', () => {
        const cache = new Cache(5, 100);
        cache.set('x', 'data');
        expect(cache.has('x')).toBe(true);
    });

    it('has returns false for missing entry', () => {
        const cache = new Cache(5, 100);
        expect(cache.has('missing')).toBe(false);
    });

    it('has returns false for expired entry', () => {
        const cache = new Cache(5, 100);
        cache.set('x', 'data');
        dateNowSpy.mockReturnValue(1_000_000 + 300_001);
        expect(cache.has('x')).toBe(false);
    });

    it('overwriting existing key does not grow the cache', () => {
        const cache = new Cache(5, 100);
        cache.set('k', 'v1');
        cache.set('k', 'v2');
        expect(cache.getStats().size).toBe(1);
        expect(cache.get('k')).toBe('v2');
    });
});
