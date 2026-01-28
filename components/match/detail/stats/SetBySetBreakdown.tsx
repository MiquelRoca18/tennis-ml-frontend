import React, { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { DetailedStatsResponse } from '../../../../src/types/api';
import { COLORS } from '../../../../src/utils/constants';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SetBySetBreakdownProps {
    stats: DetailedStatsResponse;
    player1Name: string;
    player2Name: string;
}

export default function SetBySetBreakdown({ stats, player1Name, player2Name }: SetBySetBreakdownProps) {
    const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set());

    // Short names for display
    const p1Short = player1Name.split(' ').pop() || player1Name;
    const p2Short = player2Name.split(' ').pop() || player2Name;

    const toggleSet = (setName: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(setName)) {
                newSet.delete(setName);
            } else {
                newSet.add(setName);
            }
            return newSet;
        });
    };

    const setNames = stats?.sets ? Object.keys(stats.sets).sort() : [];

    // Calculate set stats
    const getSetStats = (games: any[]) => {
        const breaksP1 = games.filter(g => g.was_break === 1 && g.winner === 'First Player').length;
        const breaksP2 = games.filter(g => g.was_break === 1 && g.winner === 'Second Player').length;
        return { breaksP1, breaksP2, totalGames: games.length };
    };

    if (!stats?.sets || setNames.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>🎾 Desglose por Sets</Text>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                        No hay datos de desglose por sets disponibles para este partido.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎾 Desglose por Sets</Text>

            {setNames.map((setName) => {
                const setData = stats.sets[setName];
                const isExpanded = expandedSets.has(setName);
                const games = setData?.games || [];
                const setStats = getSetStats(games);
                const p1Won = setData.games_player1 > setData.games_player2;
                const p2Won = setData.games_player2 > setData.games_player1;

                return (
                    <View key={setName} style={styles.setCard}>
                        {/* Set Header */}
                        <TouchableOpacity
                            style={styles.setHeader}
                            onPress={() => toggleSet(setName)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.setHeaderLeft}>
                                <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
                                <Text style={styles.setName}>{setName}</Text>
                                {games.length > 0 && (
                                    <Text style={styles.setGamesCount}>
                                        ({setStats.totalGames} juegos)
                                    </Text>
                                )}
                            </View>
                            <View style={[styles.setScore, p1Won && styles.setScoreP1, p2Won && styles.setScoreP2]}>
                                <Text style={[styles.setScoreText, (p1Won || p2Won) && styles.setScoreTextWin]}>
                                    {setData.games_player1} - {setData.games_player2}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Set Summary */}
                        {isExpanded && games.length > 0 && (setStats.breaksP1 > 0 || setStats.breaksP2 > 0) && (
                            <View style={styles.setSummary}>
                                <Text style={styles.setSummaryTitle}>Breaks en este set:</Text>
                                <View style={styles.setSummaryRow}>
                                    <Text style={styles.setSummaryItem}>
                                        {p1Short}: {setStats.breaksP1}
                                    </Text>
                                    <Text style={styles.setSummaryItem}>
                                        {p2Short}: {setStats.breaksP2}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Games List */}
                        {isExpanded && games.length > 0 ? (
                            <View style={styles.gamesList}>
                                {games.map((game: any, idx: number) => {
                                    const isBreak = game.was_break === 1 || game.was_break === true;
                                    const isPlayer1Serve = game.server === 'First Player';
                                    const isPlayer1Win = game.winner === 'First Player';

                                    return (
                                        <View
                                            key={game.id || idx}
                                            style={[
                                                styles.gameRow,
                                                isBreak && styles.gameRowBreak
                                            ]}
                                        >
                                            <Text style={styles.gameNumber}>
                                                {game.game_number}
                                            </Text>
                                            <View style={styles.gameInfo}>
                                                <View style={[styles.serverBadge, isPlayer1Serve ? styles.serverP1 : styles.serverP2]}>
                                                    <Text style={styles.serverBadgeText}>
                                                        {isPlayer1Serve ? p1Short : p2Short}
                                                    </Text>
                                                </View>
                                                {isBreak && (
                                                    <View style={styles.breakBadge}>
                                                        <Text style={styles.breakText}>BREAK</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={[
                                                styles.gameWinner,
                                                isPlayer1Win ? styles.player1Color : styles.player2Color
                                            ]}>
                                                ✓ {isPlayer1Win ? p1Short : p2Short}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        ) : isExpanded && (
                            <View style={styles.noGamesData}>
                                <Text style={styles.noGamesText}>
                                    Datos de juegos no disponibles para este set
                                </Text>
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );
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
    setCard: {
        marginBottom: 12,
        backgroundColor: COLORS.background,
        borderRadius: 8,
        overflow: 'hidden',
    },
    setHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    setHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    chevron: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginRight: 8,
        width: 16,
    },
    setName: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    setScore: {
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    setScoreText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    gamesList: {
        padding: 8,
        gap: 6,
    },
    gameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: COLORS.surface,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    gameRowBreak: {
        backgroundColor: COLORS.danger + '10',
        borderColor: COLORS.danger + '40',
    },
    gameNumber: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        width: 60,
    },
    gameInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    gameServer: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    breakBadge: {
        backgroundColor: COLORS.danger,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    breakText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    gameWinner: {
        fontSize: 13,
        fontWeight: '700',
        width: 80,
        textAlign: 'right',
    },
    player1Color: {
        color: COLORS.primary,
    },
    player2Color: {
        color: COLORS.success,
    },
    setGamesCount: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginLeft: 8,
    },
    setScoreP1: {
        backgroundColor: COLORS.primary + '20',
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
    },
    setScoreP2: {
        backgroundColor: COLORS.success + '20',
        borderWidth: 1,
        borderColor: COLORS.success + '40',
    },
    setScoreTextWin: {
        fontWeight: '800',
    },
    setSummary: {
        backgroundColor: COLORS.surface,
        padding: 12,
        marginHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    setSummaryTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    setSummaryRow: {
        flexDirection: 'row',
        gap: 16,
    },
    setSummaryItem: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    serverBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    serverP1: {
        backgroundColor: COLORS.primary + '15',
    },
    serverP2: {
        backgroundColor: COLORS.success + '15',
    },
    serverBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    emptyState: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    noGamesData: {
        padding: 16,
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: 8,
        marginBottom: 8,
        borderRadius: 8,
    },
    noGamesText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
});
