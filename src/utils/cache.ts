/**
 * Cache entry with data and timestamp
 */
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

/**
 * Simple in-memory cache with TTL + LRU eviction.
 *
 * LRU: cuando se supera `maxEntries`, se descarta la entrada menos recientemente
 * usada (primera del Map). Evita memory leaks en sesiones largas donde el usuario
 * abre muchos partidos / H2Hs.
 */
class Cache {
    private cache = new Map<string, CacheEntry<any>>();
    private ttl: number;
    private maxEntries: number;

    /**
     * Create a new cache instance
     * @param ttlMinutes - Time to live in minutes
     * @param maxEntries - Máximo número de entradas antes de aplicar eviction LRU
     */
    constructor(ttlMinutes = 5, maxEntries = 100) {
        this.ttl = ttlMinutes * 60 * 1000;
        this.maxEntries = maxEntries;
    }

    /**
     * Get cached data if not expired
     * @param key - Cache key
     * @returns Cached data or null if expired/not found
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check if expired
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        // LRU touch: re-insertar al final para marcar como más reciente
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.data;
    }

    /**
     * Set data in cache
     * @param key - Cache key
     * @param data - Data to cache
     */
    set<T>(key: string, data: T): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxEntries) {
            // Descartar la entrada más antigua (primera del Map)
            const oldest = this.cache.keys().next().value;
            if (oldest !== undefined) this.cache.delete(oldest);
        }
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    /**
     * Check if key exists and is not expired
     * @param key - Cache key
     * @returns True if key exists and is valid
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Remove a specific key from cache
     * @param key - Cache key
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cached data
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns Object with cache stats
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Create cache instances with different TTLs and bounded sizes (LRU).
// Los maxEntries se eligen para cubrir sesiones de uso intenso sin crecer sin control.
export const playerCache = new Cache(10, 200); // 10 min, hasta 200 jugadores
export const upcomingCache = new Cache(10, 50); // 10 min, hasta 50 listas de upcoming

/**
 * Fetch data with caching support
 * @param key - Cache key
 * @param fetcher - Function to fetch data if not cached
 * @param cache - Cache instance to use
 * @returns Promise with data (from cache or fetcher)
 */
export async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    cache: Cache
): Promise<T> {
    // Try to get from cache first
    const cached = cache.get<T>(key);
    if (cached !== null) {
        return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Store in cache
    cache.set(key, data);

    return data;
}

export default Cache;
