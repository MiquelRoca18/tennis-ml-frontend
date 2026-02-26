import React, { useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { PlayerTournament } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';

const INITIAL_COUNT = 5;
const STEP = 5;

function surfaceColor(surface: string): string {
    const s = (surface || '').toLowerCase();
    if (s.includes('clay') || s.includes('arcilla')) return COLORS.clay;
    if (s.includes('grass') || s.includes('hierba') || s.includes('césped')) return COLORS.grass;
    return COLORS.hard;
}

export default function PlayerTournaments({ tournaments }: { tournaments: PlayerTournament[] }) {
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

    const list = useMemo(() => {
        const singles = (tournaments || []).filter(
            t => String(t.type || '').toLowerCase() === 'singles'
        );
        return [...singles].sort((a, b) => {
            const seasonA = parseInt(String(a.season || '0'), 10);
            const seasonB = parseInt(String(b.season || '0'), 10);
            return seasonB - seasonA;
        });
    }, [tournaments]);

    const visible = list.slice(0, visibleCount);
    const hasMore = visibleCount < list.length;
    const canShowLess = visibleCount > INITIAL_COUNT;

    const showMore = () => setVisibleCount(c => Math.min(c + STEP, list.length));
    const showLess = () => setVisibleCount(INITIAL_COUNT);

    if (list.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Torneos (individuales)</Text>
            <Text style={styles.subtitle}>
                Ordenados por temporada (más reciente primero)
            </Text>

            <View style={styles.list}>
                {visible.map((t, i) => (
                    <View
                        key={`${t.name}-${t.season}-${i}`}
                        style={[styles.card, i === visible.length - 1 && !hasMore && styles.cardLast]}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.name} numberOfLines={2}>
                                {t.name}
                            </Text>
                            <View style={styles.badges}>
                                <View style={styles.seasonBadge}>
                                    <Text style={styles.seasonText}>{t.season}</Text>
                                </View>
                                {t.surface ? (
                                    <View style={[styles.surfaceBadge, { backgroundColor: surfaceColor(t.surface) + '30' }]}>
                                        <Text style={[styles.surfaceText, { color: surfaceColor(t.surface) }]}>
                                            {t.surface}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                        {t.prize ? (
                            <View style={styles.prizeRow}>
                                <Text style={styles.prizeLabel}>Premio</Text>
                                <Text style={styles.prize} numberOfLines={1}>
                                    {t.prize}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                ))}
            </View>

            <View style={styles.actions}>
                {hasMore && (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={showMore}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Ver más</Text>
                        <Text style={styles.buttonMeta}>
                            (+{Math.min(STEP, list.length - visibleCount)} de {list.length - visibleCount} restantes)
                        </Text>
                    </TouchableOpacity>
                )}
                {canShowLess && (
                    <TouchableOpacity
                        style={[styles.button, styles.buttonSecondary]}
                        onPress={showLess}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonTextSecondary}>Ver menos</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    list: {
        gap: 12,
    },
    card: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardLast: {
        marginBottom: 0,
    },
    cardHeader: {
        gap: 10,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
    badges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    seasonBadge: {
        backgroundColor: COLORS.primary + '25',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    seasonText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary,
    },
    surfaceBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    surfaceText: {
        fontSize: 12,
        fontWeight: '600',
    },
    prizeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: 8,
    },
    prizeLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    prize: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        flex: 1,
        textAlign: 'right',
    },
    actions: {
        marginTop: 16,
        gap: 10,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    buttonTextSecondary: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    buttonMeta: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
});
