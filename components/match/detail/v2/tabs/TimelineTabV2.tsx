/**
 * TimelineTabV2 - Tab de Timeline Visual
 * ======================================
 * 
 * Carga timeline bajo demanda desde /v2/matches/{id}/timeline
 * Muestra juegos agrupados por set con indicadores de break.
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import apiClient from '../../../../../src/services/api/apiClient';
import { GameInfo, MatchFullResponse, MatchTimeline, SetTimeline, getShortName } from '../../../../../src/types/matchDetail';
import { COLORS } from '../../../../../src/utils/constants';

interface TimelineTabV2Props {
    data: MatchFullResponse;
}

export default function TimelineTabV2({ data }: TimelineTabV2Props) {
    const [timeline, setTimeline] = useState<MatchTimeline | null>(data.timeline || null);
    const [loading, setLoading] = useState(!data.timeline?.sets?.length);
    const [error, setError] = useState<string | null>(null);

    const { player1, player2 } = data;
    const p1Short = getShortName(player1.name);
    const p2Short = getShortName(player2.name);
    const p1Initial = p1Short.charAt(0).toUpperCase();
    const p2Initial = p2Short.charAt(0).toUpperCase();

    useEffect(() => {
        // Si ya tenemos timeline con datos, no cargar
        if (data.timeline?.sets?.length) {
            setTimeline(data.timeline);
            setLoading(false);
            return;
        }
        
        // Cargar timeline bajo demanda
        loadTimeline();
    }, [data.match.id]);

    const loadTimeline = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get<MatchTimeline>(`/v2/matches/${data.match.id}/timeline`);
            setTimeline(response.data);
        } catch (err) {
            setError('Error al cargar timeline');
            console.error('Error loading timeline:', err);
        } finally {
            setLoading(false);
        }
    };

    // Loading
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando timeline...</Text>
            </View>
        );
    }

    // Error or no data
    if (error || !timeline || !timeline.sets?.length) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📈</Text>
                <Text style={styles.emptyTitle}>Timeline No Disponible</Text>
                <Text style={styles.emptyText}>
                    Los datos de timeline no están disponibles para este partido.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Summary Card */}
            <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{timeline.total_games}</Text>
                    <Text style={styles.summaryLabel}>Juegos</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{timeline.total_breaks}</Text>
                    <Text style={styles.summaryLabel}>Breaks</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{timeline.momentum_shifts}</Text>
                    <Text style={styles.summaryLabel}>Cambios</Text>
                </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, styles.legendBoxP1]}>
                        <Text style={styles.legendInitial}>{p1Initial}</Text>
                    </View>
                    <Text style={styles.legendText}>{p1Short} ganó</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, styles.legendBoxP2]}>
                        <Text style={styles.legendInitial}>{p2Initial}</Text>
                    </View>
                    <Text style={styles.legendText}>{p2Short} ganó</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendBox, styles.legendBoxBreak]}>
                        <View style={styles.breakDot} />
                    </View>
                    <Text style={styles.legendText}>Break</Text>
                </View>
            </View>

            {/* Sets */}
            {timeline.sets.map(set => (
                <SetTimelineCard 
                    key={set.set_number}
                    set={set}
                    p1Initial={p1Initial}
                    p2Initial={p2Initial}
                    p1Name={p1Short}
                    p2Name={p2Short}
                />
            ))}
        </ScrollView>
    );
}

// ============================================================
// SET TIMELINE CARD
// ============================================================

interface SetTimelineCardProps {
    set: SetTimeline;
    p1Initial: string;
    p2Initial: string;
    p1Name: string;
    p2Name: string;
}

function SetTimelineCard({ set, p1Initial, p2Initial, p1Name, p2Name }: SetTimelineCardProps) {
    const p1GamesWon = set.games.filter(g => g.winner === 1).length;
    const p2GamesWon = set.games.filter(g => g.winner === 2).length;
    const setWinner = p1GamesWon > p2GamesWon ? 1 : 2;

    return (
        <View style={styles.setCard}>
            {/* Set Header */}
            <View style={styles.setHeader}>
                <Text style={styles.setTitle}>Set {set.set_number}</Text>
                <View style={styles.setScore}>
                    <Text style={[
                        styles.setScoreNum,
                        setWinner === 1 && styles.setScoreNumWinner
                    ]}>
                        {p1GamesWon}
                    </Text>
                    <Text style={styles.setScoreDash}>-</Text>
                    <Text style={[
                        styles.setScoreNum,
                        setWinner === 2 && styles.setScoreNumWinner
                    ]}>
                        {p2GamesWon}
                    </Text>
                </View>
                {set.breaks_p1 > 0 || set.breaks_p2 > 0 ? (
                    <Text style={styles.setBreaks}>
                        Breaks: {set.breaks_p1}-{set.breaks_p2}
                    </Text>
                ) : null}
            </View>

            {/* Games Grid */}
            <View style={styles.gamesGrid}>
                {set.games.map((game, idx) => (
                    <GameBox 
                        key={idx}
                        game={game}
                        p1Initial={p1Initial}
                        p2Initial={p2Initial}
                    />
                ))}
            </View>
        </View>
    );
}

// ============================================================
// GAME BOX
// ============================================================

interface GameBoxProps {
    game: GameInfo;
    p1Initial: string;
    p2Initial: string;
}

function GameBox({ game, p1Initial, p2Initial }: GameBoxProps) {
    const isP1 = game.winner === 1;
    const isBreak = game.is_break;
    const initial = isP1 ? p1Initial : p2Initial;

    return (
        <View style={[
            styles.gameBox,
            isP1 ? styles.gameBoxP1 : styles.gameBoxP2,
            isBreak && styles.gameBoxBreak
        ]}>
            <Text style={[
                styles.gameInitial,
                isP1 ? styles.gameInitialP1 : styles.gameInitialP2
            ]}>
                {initial}
            </Text>
            {isBreak && <View style={styles.gameBreakDot} />}
        </View>
    );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
        gap: 16,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textSecondary,
    },

    // Summary Card
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginVertical: 4,
    },

    // Legend
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        paddingVertical: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendBox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    legendBoxP1: {
        backgroundColor: COLORS.primary,
    },
    legendBoxP2: {
        backgroundColor: COLORS.success,
    },
    legendBoxBreak: {
        backgroundColor: COLORS.warning,
    },
    legendInitial: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    breakDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFF',
    },
    legendText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },

    // Set Card
    setCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    setHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    setTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        flex: 1,
    },
    setScore: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 12,
    },
    setScoreNum: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    setScoreNumWinner: {
        color: COLORS.textPrimary,
    },
    setScoreDash: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginHorizontal: 4,
    },
    setBreaks: {
        fontSize: 11,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },

    // Games Grid
    gamesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    gameBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    gameBoxP1: {
        backgroundColor: COLORS.primary + '20',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    gameBoxP2: {
        backgroundColor: COLORS.success + '20',
        borderWidth: 2,
        borderColor: COLORS.success,
    },
    gameBoxBreak: {
        borderStyle: 'dashed',
    },
    gameInitial: {
        fontSize: 12,
        fontWeight: '700',
    },
    gameInitialP1: {
        color: COLORS.primary,
    },
    gameInitialP2: {
        color: COLORS.success,
    },
    gameBreakDot: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.warning,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: COLORS.background,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
