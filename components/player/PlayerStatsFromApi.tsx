import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ApiPlayerStat } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';

function num(v: string | number | undefined): number {
    if (v === undefined || v === null || v === '') return 0;
    return typeof v === 'number' ? v : parseInt(String(v), 10) || 0;
}

function rankLabel(rank: string | number | undefined): string {
    if (rank == null || rank === '') return '–';
    return `#${rank}`;
}

export default function PlayerStatsFromApi({ stats }: { stats: ApiPlayerStat[] }) {
    const singles = (stats || []).filter(
        s => String(s.type || '').toLowerCase() === 'singles' && s.season && String(s.season).length === 4
    );
    const bySeason = [...singles].sort((a, b) =>
        String(b.season).localeCompare(String(a.season))
    ).slice(0, 12);

    if (bySeason.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Estadísticas por temporada</Text>
            <Text style={styles.subtitle}>Individuales · más reciente primero</Text>

            <View style={styles.list}>
                {bySeason.map((s, i) => {
                    const won = num(s.matches_won);
                    const lost = num(s.matches_lost);
                    const total = won + lost;
                    const winPct = total > 0 ? Math.round((won / total) * 100) : null;
                    const rankStr = rankLabel(s.rank);
                    const titles = num(s.titles);
                    const isTopRank = rankStr !== '–' && num(s.rank) <= 10;

                    return (
                        <View
                            key={`${s.season}-${i}`}
                            style={[styles.card, i === bySeason.length - 1 && styles.cardLast]}
                        >
                            <View style={styles.cardTop}>
                                <View style={styles.seasonBadge}>
                                    <Text style={styles.seasonText}>{s.season}</Text>
                                </View>
                                {titles > 0 && (
                                    <View style={styles.titlesBadge}>
                                        <Text style={styles.titlesBadgeText}>
                                            {titles} {titles === 1 ? 'título' : 'títulos'}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.metricsBlock}>
                                <View style={styles.metricRow}>
                                    <Text style={styles.metricLabel}>Ranking</Text>
                                    <Text style={[
                                        styles.metricValue,
                                        isTopRank && styles.metricValueHighlight,
                                    ]}>
                                        {rankStr}
                                    </Text>
                                </View>

                                <View style={styles.balanceBlock}>
                                    <Text style={styles.balanceLabel}>Victorias y derrotas</Text>
                                    <View style={styles.balanceRow}>
                                        <View style={styles.balanceCell}>
                                            <Text style={styles.wlWins}>{won}</Text>
                                            <Text style={styles.balanceCellLabel}>Victorias</Text>
                                        </View>
                                        <View style={styles.balanceDivider} />
                                        <View style={styles.balanceCell}>
                                            <Text style={styles.wlLosses}>{lost}</Text>
                                            <Text style={styles.balanceCellLabel}>Derrotas</Text>
                                        </View>
                                        {winPct != null && (
                                            <>
                                                <View style={styles.balanceDivider} />
                                                <View style={styles.balanceCell}>
                                                    <Text style={styles.wlPct}>{winPct}%</Text>
                                                    <Text style={styles.balanceCellLabel}>% victorias</Text>
                                                </View>
                                            </>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                })}
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
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    seasonBadge: {
        backgroundColor: COLORS.primary + '25',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    seasonText: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
    },
    titlesBadge: {
        backgroundColor: COLORS.success + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    titlesBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.success,
    },
    metricsBlock: {
        gap: 14,
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    metricLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    metricValueHighlight: {
        color: COLORS.primary,
    },
    balanceBlock: {
        backgroundColor: COLORS.background,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    balanceLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    balanceCell: {
        alignItems: 'center',
        flex: 1,
    },
    balanceCellLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    balanceDivider: {
        width: 1,
        height: 28,
        backgroundColor: COLORS.border,
    },
    wlWins: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.success,
    },
    wlLosses: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.textSecondary,
    },
    wlPct: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.primary,
    },
});
