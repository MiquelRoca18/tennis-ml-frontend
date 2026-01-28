/**
 * Cache entry with data and timestamp
 */
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

/**
 * Simple in-memory cache with TTL support
 */
class Cache {
    private cache = new Map<string, CacheEntry<any>>();
    private ttl: number;

    /**
     * Create a new cache instance
     * @param ttlMinutes - Time to live in minutes
     */
    constructor(ttlMinutes = 5) {
        this.ttl = ttlMinutes * 60 * 1000;
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

        return entry.data;
    }

    /**
     * Set data in cache
     * @param key - Cache key
     * @param data - Data to cache
     */
    set<T>(key: string, data: T): void {
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

// Create cache instances with different TTLs for different data types
export const playerCache = new Cache(10); // 10 minutes - player data changes rarely
export const rankingsCache = new Cache(60); // 1 hour - rankings update daily
export const h2hCache = new Cache(30); // 30 minutes - H2H is static
export const matchCache = new Cache(5); // 5 minutes - match data changes frequently
export const tournamentCache = new Cache(60); // 1 hour - tournament data is static

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
        console.log(`[Cache HIT] ${key}`);
        return cached;
    }

    // Fetch fresh data
    console.log(`[Cache MISS] ${key}`);
    const data = await fetcher();

    // Store in cache
    cache.set(key, data);

    return data;
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
    playerCache.clear();
    rankingsCache.clear();
    h2hCache.clear();
    matchCache.clear();
    tournamentCache.clear();
    console.log('[Cache] All caches cleared');
}

/**
 * Get stats for all caches
 */
export function getAllCacheStats() {
    return {
        player: playerCache.getStats(),
        rankings: rankingsCache.getStats(),
        h2h: h2hCache.getStats(),
        match: matchCache.getStats(),
        tournament: tournamentCache.getStats(),
    };
}

export default Cache;
