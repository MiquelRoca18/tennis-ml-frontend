import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlayerStatsResponse } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';

interface PlayerStatsProps {
    stats: PlayerStatsResponse[];
}

interface StatBarProps {
    surface: string;
    won: number;
    lost: number;
    winPercentage: number;
}

function StatBar({ surface, won, lost, winPercentage }: StatBarProps) {
    const getSurfaceColor = (surface: string) => {
        switch (surface.toLowerCase()) {
            case 'hard':
                return '#3B82F6'; // Blue
            case 'clay':
                return '#EF4444'; // Red
            case 'grass':
                return '#10B981'; // Green
            default:
                return COLORS.primary;
        }
    };

    const getSurfaceIcon = (surface: string) => {
        switch (surface.toLowerCase()) {
            case 'hard':
                return '🏟️';
            case 'clay':
                return '🟫';
            case 'grass':
                return '🌱';
            default:
                return '🎾';
        }
    };

    const color = getSurfaceColor(surface);
    const total = won + lost;

    return (
        <View style={styles.statRow}>
            <View style={styles.surfaceInfo}>
                <Text style={styles.surfaceIcon}>{getSurfaceIcon(surface)}</Text>
                <Text style={styles.surfaceName}>{surface}</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.recordContainer}>
                    <Text style={styles.recordText}>
                        {won}-{lost}
                    </Text>
                    <Text style={styles.totalMatches}>({total} partidos)</Text>
                </View>

                <View style={styles.barContainer}>
                    <View style={styles.barTrack}>
                        <View
                            style={[
                                styles.barFill,
                                {
                                    width: `${winPercentage}%`,
                                    backgroundColor: color
                                }
                            ]}
                        />
                    </View>
                    <Text style={[styles.percentage, { color }]}>
                        {winPercentage.toFixed(1)}%
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default function PlayerStats({ stats }: PlayerStatsProps) {
    if (!stats || stats.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Estadísticas por Superficie</Text>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No hay estadísticas disponibles
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Estadísticas por Superficie</Text>

            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <StatBar
                        key={index}
                        surface={stat.stats.surface}
                        won={stat.stats.won}
                        lost={stat.stats.lost}
                        winPercentage={stat.stats.win_percentage}
                    />
                ))}
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
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    statsGrid: {
        gap: 16,
    },
    statRow: {
        gap: 12,
    },
    surfaceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    surfaceIcon: {
        fontSize: 20,
    },
    surfaceName: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    statsContainer: {
        gap: 8,
    },
    recordContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    recordText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    totalMatches: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    barContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    barTrack: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.background,
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
    percentage: {
        fontSize: 14,
        fontWeight: '700',
        minWidth: 50,
        textAlign: 'right',
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
});
