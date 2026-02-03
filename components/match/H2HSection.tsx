import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { H2HData } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';
import { parseLocalDate } from '../../src/utils/dateUtils';

interface H2HSectionProps {
    h2h: H2HData;
    player1Name: string;
    player2Name: string;
}

type SurfaceFilter = 'ALL' | 'HARD' | 'CLAY' | 'GRASS';

export default function H2HSection({ h2h, player1Name, player2Name }: H2HSectionProps) {
    const [selectedSurface, setSelectedSurface] = useState<SurfaceFilter>('ALL');

    // Filter matches by surface
    const filteredMatches = selectedSurface === 'ALL'
        ? h2h.last_meetings
        : h2h.last_meetings.filter(match =>
            match.surface?.toUpperCase() === selectedSurface
        );

    // Calculate filtered stats
    const filteredStats = React.useMemo(() => {
        if (selectedSurface === 'ALL') {
            return {
                player1Wins: h2h.player1_wins,
                player2Wins: h2h.player2_wins,
                totalMatches: h2h.total_matches,
            };
        }

        const surfaceMatches = h2h.last_meetings.filter(match =>
            match.surface?.toUpperCase() === selectedSurface
        );

        const player1Wins = surfaceMatches.filter(match => match.winner === player1Name).length;
        const player2Wins = surfaceMatches.filter(match => match.winner === player2Name).length;

        return {
            player1Wins,
            player2Wins,
            totalMatches: surfaceMatches.length,
        };
    }, [selectedSurface, h2h, player1Name, player2Name]);

    const surfaceFilters: { label: string; value: SurfaceFilter; emoji: string }[] = [
        { label: 'TODAS', value: 'ALL', emoji: '🎾' },
        { label: 'DURA', value: 'HARD', emoji: '🔵' },
        { label: 'ARCILLA', value: 'CLAY', emoji: '🟠' },
        { label: 'HIERBA', value: 'GRASS', emoji: '🟢' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>⚔️ Head to Head</Text>

            {/* Surface Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                {surfaceFilters.map((filter) => (
                    <TouchableOpacity
                        key={filter.value}
                        style={[
                            styles.filterButton,
                            selectedSurface === filter.value && styles.filterButtonActive,
                        ]}
                        onPress={() => setSelectedSurface(filter.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.filterEmoji}>{filter.emoji}</Text>
                        <Text
                            style={[
                                styles.filterText,
                                selectedSurface === filter.value && styles.filterTextActive,
                            ]}
                        >
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Overall Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{filteredStats.player1Wins}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{player1Name}</Text>
                </View>
                <View style={styles.statBoxCenter}>
                    <Text style={styles.statValueCenter}>{filteredStats.totalMatches}</Text>
                    <Text style={styles.statLabelCenter}>PARTIDOS</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{filteredStats.player2Wins}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{player2Name}</Text>
                </View>
            </View>

            {/* Win Percentage Bar */}
            {filteredStats.totalMatches > 0 && (
                <View style={styles.percentageContainer}>
                    <View style={styles.percentageBar}>
                        <View
                            style={[
                                styles.percentageFill1,
                                {
                                    width: `${(filteredStats.player1Wins / filteredStats.totalMatches) * 100}%`,
                                },
                            ]}
                        />
                        <View
                            style={[
                                styles.percentageFill2,
                                {
                                    width: `${(filteredStats.player2Wins / filteredStats.totalMatches) * 100}%`,
                                },
                            ]}
                        />
                    </View>
                    <View style={styles.percentageLabels}>
                        <Text style={styles.percentageText}>
                            {((filteredStats.player1Wins / filteredStats.totalMatches) * 100).toFixed(0)}%
                        </Text>
                        <Text style={styles.percentageText}>
                            {((filteredStats.player2Wins / filteredStats.totalMatches) * 100).toFixed(0)}%
                        </Text>
                    </View>
                </View>
            )}

            {/* Match History */}
            <Text style={styles.historyTitle}>Últimos Enfrentamientos</Text>
            {filteredMatches.length > 0 ? (
                <View style={styles.matchesList}>
                    {filteredMatches.map((match, index) => {
                        const isPlayer1Winner = match.winner === player1Name;
                        return (
                            <View key={index} style={styles.matchRow}>
                                <View style={styles.matchDate}>
                                    <Text style={styles.matchDateText}>
                                        {parseLocalDate(match.date).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: '2-digit',
                                        })}
                                    </Text>
                                </View>
                                <View style={styles.matchInfo}>
                                    <Text style={styles.matchTournament} numberOfLines={1}>
                                        {match.tournament}
                                    </Text>
                                    {match.surface && (
                                        <View style={[styles.surfaceBadge, { backgroundColor: getSurfaceColor(match.surface) }]}>
                                            <Text style={styles.surfaceText}>{match.surface}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.matchResult}>
                                    <View
                                        style={[
                                            styles.resultBadge,
                                            { backgroundColor: isPlayer1Winner ? COLORS.success : COLORS.danger },
                                        ]}
                                    >
                                        <Text style={styles.resultText}>
                                            {isPlayer1Winner ? 'G' : 'P'}
                                        </Text>
                                    </View>
                                    {match.score && (
                                        <Text style={styles.matchScore}>{match.score}</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                        No hay enfrentamientos en {surfaceFilters.find(f => f.value === selectedSurface)?.label.toLowerCase()}
                    </Text>
                </View>
            )}
        </View>
    );
}

function getSurfaceColor(surface: string): string {
    switch (surface.toLowerCase()) {
        case 'hard':
        case 'dura':
            return COLORS.hard;
        case 'clay':
        case 'arcilla':
            return COLORS.clay;
        case 'grass':
        case 'hierba':
            return COLORS.grass;
        default:
            return COLORS.textMuted;
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    filtersContainer: {
        marginBottom: 16,
        marginHorizontal: -4,
    },
    filtersContent: {
        paddingHorizontal: 4,
        gap: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 6,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary + '20',
        borderColor: COLORS.primary,
    },
    filterEmoji: {
        fontSize: 14,
    },
    filterText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    filterTextActive: {
        color: COLORS.primary,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statBoxCenter: {
        flex: 1,
        alignItems: 'center',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.border,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 4,
    },
    statValueCenter: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    statLabelCenter: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
    },
    percentageContainer: {
        marginBottom: 20,
    },
    percentageBar: {
        flexDirection: 'row',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: COLORS.background,
    },
    percentageFill1: {
        backgroundColor: COLORS.primary,
    },
    percentageFill2: {
        backgroundColor: COLORS.danger,
    },
    percentageLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    percentageText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    matchesList: {
        gap: 8,
    },
    matchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 8,
        padding: 12,
        gap: 12,
    },
    matchDate: {
        width: 60,
    },
    matchDateText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    matchInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    matchTournament: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textPrimary,
        flex: 1,
    },
    surfaceBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    surfaceText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    matchResult: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    resultBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    matchScore: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        minWidth: 40,
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMuted,
        textAlign: 'center',
    },
});
