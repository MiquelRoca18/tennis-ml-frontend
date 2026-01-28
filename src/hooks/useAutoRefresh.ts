import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
    enabled?: boolean;
    interval?: number;
    onRefresh: () => void | Promise<void>;
}

/**
 * Hook for automatic data refresh with polling
 * @param options - Configuration options
 * @param options.enabled - Whether auto-refresh is enabled (default: true)
 * @param options.interval - Refresh interval in milliseconds (default: 30000 = 30 seconds)
 * @param options.onRefresh - Function to call on each refresh
 */
export function useAutoRefresh({
    enabled = true,
    interval = 30000,
    onRefresh
}: UseAutoRefreshOptions) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const onRefreshRef = useRef(onRefresh);

    // Keep onRefresh reference updated
    useEffect(() => {
        onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Set up new interval
        intervalRef.current = setInterval(() => {
            onRefreshRef.current();
        }, interval);

        // Cleanup on unmount or when dependencies change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, interval]);
}

/**
 * Hook for smart auto-refresh that adjusts interval based on live matches
 * @param hasLiveMatches - Whether there are live matches
 * @param onRefresh - Function to call on each refresh
 */
export function useSmartAutoRefresh(
    hasLiveMatches: boolean,
    onRefresh: () => void | Promise<void>
) {
    // Faster refresh when there are live matches
    const interval = hasLiveMatches ? 15000 : 60000; // 15s for live, 60s for pending

    useAutoRefresh({
        enabled: true,
        interval,
        onRefresh,
    });
}
