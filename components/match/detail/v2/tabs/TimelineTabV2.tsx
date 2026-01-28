/**
 * TimelineTabV2 - Tab de Timeline Visual
 * ======================================
 * 
 * Muestra el timeline del partido de forma visual:
 * - Juegos agrupados por set
 * - Indicadores de break
 * - Visualización de quién ganó cada juego
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameInfo, MatchFullResponse, SetTimeline, getShortName } from '../../../../../src/types/matchDetail';
import { COLORS } from '../../../../../src/utils/constants';

interface TimelineTabV2Props {
    data: MatchFullResponse;
}

export default function TimelineTabV2({ data }: TimelineTabV2Props) {
    const { timeline, player1, player2 } = data;

    const p1Short = getShortName(player1.name);
    const p2Short = getShortName(player2.name);
    const p1Initial = p1Short.charAt(0).toUpperCase();
    const p2Initial = p2Short.charAt(0).toUpperCase();

    if (!timeline || timeline.sets.length === 0) {
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
    const { set_number, games, final_score, has_tiebreak, tiebreak_score, breaks_player1, breaks_player2 } = set;

    return (
        <View style={styles.setCard}>
            {/* Set Header */}
            <View style={styles.setHeader}>
                <View style={styles.setTitleRow}>
                    <Text style={styles.setTitle}>Set {set_number}</Text>
                    {has_tiebreak && (
                        <View style={styles.tiebreakBadge}>
                            <Text style={styles.tiebreakText}>TB</Text>
                        </View>
                    )}
                </View>
                <View style={styles.setScoreContainer}>
                    <Text style={styles.setScore}>{final_score}</Text>
                    {tiebreak_score && (
                        <Text style={styles.setTiebreak}>({tiebreak_score})</Text>
                    )}
                </View>
            </View>

            {/* Break Summary */}
            {(breaks_player1 > 0 || breaks_player2 > 0) && (
                <View style={styles.breakSummary}>
                    <Text style={styles.breakSummaryText}>
                        Breaks: {p1Name} {breaks_player1} - {breaks_player2} {p2Name}
                    </Text>
                </View>
            )}

            {/* Games Grid */}
            <View style={styles.gamesGrid}>
                {games.map((game, idx) => (
                    <GameCell 
                        key={idx}
                        game={game}
                        p1Initial={p1Initial}
                        p2Initial={p2Initial}
                    />
                ))}
            </View>

            {/* Score Progression */}
            <View style={styles.progressionRow}>
                {games.map((game, idx) => (
                    <Text key={idx} style={styles.progressionScore}>
                        {game.score_after}
                    </Text>
                ))}
            </View>
        </View>
    );
}

// ============================================================
// GAME CELL
// ============================================================

interface GameCellProps {
    game: GameInfo;
    p1Initial: string;
    p2Initial: string;
}

function GameCell({ game, p1Initial, p2Initial }: GameCellProps) {
    const isP1Win = game.winner === 1;
    const isBreak = game.is_break;
    const initial = isP1Win ? p1Initial : p2Initial;

    return (
        <View style={[
            styles.gameCell,
            isP1Win ? styles.gameCellP1 : styles.gameCellP2,
            isBreak && styles.gameCellBreak,
        ]}>
            <Text style={[
                styles.gameCellInitial,
                isBreak && styles.gameCellInitialBreak,
            ]}>
                {initial}
            </Text>
            {isBreak && <View style={styles.gameCellBreakDot} />}
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
        color: COLORS.primary,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 16,
    },

    // Legend
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendBox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    legendBoxP1: {
        backgroundColor: COLORS.primary + '20',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    legendBoxP2: {
        backgroundColor: COLORS.success + '20',
        borderWidth: 1,
        borderColor: COLORS.success,
    },
    legendBoxBreak: {
        backgroundColor: COLORS.danger + '20',
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    legendInitial: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    breakDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.danger,
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    setTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    setTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    tiebreakBadge: {
        backgroundColor: COLORS.warning,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tiebreakText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFF',
    },
    setScoreContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    setScore: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.primary,
    },
    setTiebreak: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },

    // Break Summary
    breakSummary: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
    },
    breakSummaryText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },

    // Games Grid
    gamesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },

    // Game Cell
    gameCell: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    gameCellP1: {
        backgroundColor: COLORS.primary + '20',
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
    },
    gameCellP2: {
        backgroundColor: COLORS.success + '20',
        borderWidth: 1,
        borderColor: COLORS.success + '40',
    },
    gameCellBreak: {
        backgroundColor: COLORS.danger + '20',
        borderColor: COLORS.danger,
    },
    gameCellInitial: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    gameCellInitialBreak: {
        color: COLORS.danger,
    },
    gameCellBreakDot: {
        position: 'absolute',
        top: 3,
        right: 3,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.danger,
    },

    // Score Progression
    progressionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    progressionScore: {
        width: 36,
        fontSize: 9,
        fontWeight: '500',
        color: COLORS.textSecondary,
        textAlign: 'center',
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
