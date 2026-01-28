
export const Typography = {
    // === HEADERS ===
    display: {
        fontSize: 36,
        fontWeight: '900' as const,          // Black
        lineHeight: 40,
        letterSpacing: -0.5,
    },

    h1: {
        fontSize: 28,
        fontWeight: '700' as const,          // Bold
        lineHeight: 34,
        letterSpacing: -0.3,
    },

    h2: {
        fontSize: 24,
        fontWeight: '600' as const,          // Semibold
        lineHeight: 30,
        letterSpacing: -0.2,
    },

    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 26,
        letterSpacing: 0,
    },

    // === BODY ===
    bodyLarge: {
        fontSize: 16,
        fontWeight: '400' as const,          // Regular
        lineHeight: 24,
        letterSpacing: 0,
    },

    body: {
        fontSize: 14,
        fontWeight: '400' as const,
        lineHeight: 20,
        letterSpacing: 0,
    },

    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
        lineHeight: 16,
        letterSpacing: 0.4,
    },

    // === ESPECIALES ===
    button: {
        fontSize: 16,
        fontWeight: '600' as const,          // Semibold
        lineHeight: 20,
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
    },

    stats: {
        fontSize: 24,
        fontWeight: '700' as const,          // Bold
        fontVariant: ['tabular-nums'] as const, // Números tabulares
        lineHeight: 28,
    },

    label: {
        fontSize: 12,
        fontWeight: '600' as const,
        lineHeight: 16,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
    },
};
