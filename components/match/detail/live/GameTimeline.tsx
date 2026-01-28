import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface Game {
    id: number;
    match_id: number;
    set_number: string;
    game_number: number;
    server: string;
    winner: string;
    score_games: string;
    score_sets: string;
    was_break: boolean;
}

interface GameTimelineProps {
    games: Game[];
    player1Name: string;
    player2Name: string;
}

export default function GameTimeline({
    games,
    player1Name,
    player2Name
}: GameTimelineProps) {

    // Group games by set
    const gamesBySet = games.reduce((acc, game) => {
        const setNum = game.set_number;
        if (!acc[setNum]) {
            acc[setNum] = [];
        }
        acc[setNum].push(game);
        return acc;
    }, {} as Record<string, Game[]>);

    const setNumbers = Object.keys(gamesBySet).sort((a, b) => parseInt(a) - parseInt(b));

    const renderGame = (game: Game) => {
        const isPlayer1Winner = game.winner === 'First Player';
        const isPlayer1Server = game.server === 'First Player';
        const isBreak = game.was_break;

        const winnerInitial = isPlayer1Winner ? player1Name.charAt(0) : player2Name.charAt(0);

        return (
            <View
                key={game.id}
                style={[
                    styles.gameCell,
                    isBreak && styles.gameCellBreak
                ]}
            >
                <Text style={[
                    styles.gameWinner,
                    isBreak && styles.gameWinnerBreak
                ]}>
                    {winnerInitial}
                </Text>
                {isBreak && <View style={styles.breakIndicator} />}
            </View>
        );
    };

    const renderSet = (setNumber: string, setGames: Game[]) => {
        const lastGame = setGames[setGames.length - 1];
        const setScore = lastGame?.score_games || '';

        return (
            <View key={setNumber} style={styles.setContainer}>
                <View style={styles.setHeader}>
                    <Text style={styles.setTitle}>Set {setNumber}</Text>
                    <Text style={styles.setScore}>{setScore}</Text>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.gamesScroll}
                    contentContainerStyle={styles.gamesContainer}
                >
                    {setGames.map(renderGame)}
                </ScrollView>
            </View>
        );
    };

    if (games.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>📈 Timeline del Partido</Text>
                </View>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                        No hay datos de timeline disponibles para este partido
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📈 Timeline del Partido</Text>
                <Text style={styles.subtitle}>
                    {games.length} juegos jugados
                </Text>
            </View>

            <View style={styles.content}>
                {setNumbers.map(setNumber => renderSet(setNumber, gamesBySet[setNumber]))}

                {/* Legend */}
                <View style={styles.legend}>
                    <Text style={styles.legendTitle}>Leyenda:</Text>
                    <View style={styles.legendItems}>
                        <View style={styles.legendItem}>
                            <View style={styles.legendBox}>
                                <Text style={styles.legendText}>{player1Name.charAt(0)}</Text>
                            </View>
                            <Text style={styles.legendLabel}>{player1Name} ganó</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={styles.legendBox}>
                                <Text style={styles.legendText}>{player2Name.charAt(0)}</Text>
                            </View>
                            <Text style={styles.legendLabel}>{player2Name} ganó</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, styles.legendBoxBreak]}>
                                <Text style={[styles.legendText, styles.legendTextBreak]}>
                                    {player1Name.charAt(0)}
                                </Text>
                                <View style={styles.breakIndicator} />
                            </View>
                            <Text style={styles.legendLabel}>Break (ganó al resto)</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    header: {
        backgroundColor: COLORS.surfaceElevated,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    content: {
        padding: 16,
    },
    setContainer: {
        marginBottom: 20,
    },
    setHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    setTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    setScore: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
        fontFamily: 'RobotoMono-Bold',
    },
    gamesScroll: {
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    gamesContainer: {
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: 16,
    },
    gameCell: {
        width: 36,
        height: 36,
        backgroundColor: COLORS.background,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    gameCellBreak: {
        backgroundColor: COLORS.danger + '15',
        borderColor: COLORS.danger,
    },
    gameWinner: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    gameWinnerBreak: {
        color: COLORS.danger,
    },
    breakIndicator: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 6,
        height: 6,
        backgroundColor: COLORS.danger,
        borderRadius: 3,
    },
    legend: {
        marginTop: 20,
        padding: 12,
        backgroundColor: COLORS.background,
        borderRadius: 8,
    },
    legendTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    legendItems: {
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendBox: {
        width: 28,
        height: 28,
        backgroundColor: COLORS.surface,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    legendBoxBreak: {
        backgroundColor: COLORS.danger + '15',
        borderColor: COLORS.danger,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    legendTextBreak: {
        color: COLORS.danger,
    },
    legendLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});
