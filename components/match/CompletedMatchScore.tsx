import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../src/utils/constants';

interface CompletedMatchScoreProps {
    marcador: string;
    player1Name: string;
    player2Name: string;
    isWinner1: boolean;
    playerIndex?: 1 | 2; // Optional: if provided, only render that player's row
}

/**
 * Parses and displays completed match score in Flashscore style
 * Expected format: "2-1, 6-4 3-6 7-6(3)"
 * - First part: sets won (2-1)
 * - Second part: games per set with optional tiebreak scores
 */
export default function CompletedMatchScore({
    marcador,
    player1Name,
    player2Name,
    isWinner1,
    playerIndex
}: CompletedMatchScoreProps) {

    const parseScore = () => {
        if (!marcador) return null;

        // Split by comma: ["2-1", "6-4 3-6 7-6(3)"]
        const parts = marcador.split(',').map(p => p.trim());

        let sets1 = 0, sets2 = 0;
        let setScores: Array<{ g1: string; g2: string; tb1?: string; tb2?: string }> = [];

        // Parse sets won (first part)
        if (parts[0] && parts[0].includes('-')) {
            const setScoresParts = parts[0].split('-');
            sets1 = parseInt(setScoresParts[0]) || 0;
            sets2 = parseInt(setScoresParts[1]) || 0;
        }

        // Parse games per set (second part if exists, otherwise use first part)
        const gamesStr = parts.length > 1 ? parts[1] : parts[0];
        if (gamesStr) {
            // Split by spaces: ["6-4", "3-6", "7-6(3)"]
            const gameSets = gamesStr.split(' ').filter(s => s.includes('-'));
            setScores = gameSets.map(set => {
                // Check for tiebreak: "7-6(3)" or "6-7(5)"
                const tiebreakMatch = set.match(/(\d+)-(\d+)\((\d+)\)/);
                if (tiebreakMatch) {
                    const g1 = tiebreakMatch[1];
                    const g2 = tiebreakMatch[2];
                    const tbScore = tiebreakMatch[3];

                    // Determine who won the tiebreak
                    if (parseInt(g1) > parseInt(g2)) {
                        return { g1, g2, tb1: tbScore };
                    } else {
                        return { g1, g2, tb2: tbScore };
                    }
                } else {
                    // Regular set without tiebreak
                    const [g1, g2] = set.split('-');
                    return { g1: g1.trim(), g2: g2.trim() };
                }
            });
        }

        return { sets1, sets2, setScores };
    };

    const score = parseScore();
    if (!score || score.setScores.length === 0) {
        // Fallback to simple display
        return (
            <View style={styles.rightInfo}>
                <Text style={styles.simpleScore}>{marcador}</Text>
            </View>
        );
    }

    const { sets1, sets2, setScores } = score;

    // If playerIndex is specified, render only that player's row
    if (playerIndex) {
        const isPlayer1 = playerIndex === 1;
        const sets = isPlayer1 ? sets1 : sets2;
        const isWinner = isPlayer1 ? isWinner1 : !isWinner1;

        return (
            <View style={styles.scoreRow}>
                {/* Sets Won */}
                <View style={[styles.setsCell, isWinner && styles.winnerSetsCell]}>
                    <Text style={[styles.setsText, isWinner && styles.winnerSetsText]}>
                        {sets}
                    </Text>
                </View>

                {/* Games per Set */}
                <View style={styles.gamesContainer}>
                    {setScores.map((set, idx) => {
                        const g = isPlayer1 ? set.g1 : set.g2;
                        const tb = isPlayer1 ? set.tb1 : set.tb2;
                        const wonSet = isPlayer1
                            ? parseInt(set.g1) > parseInt(set.g2)
                            : parseInt(set.g2) > parseInt(set.g1);

                        return (
                            <View key={idx} style={styles.gameCell}>
                                <Text style={[
                                    styles.gameText,
                                    wonSet && styles.wonGameText
                                ]}>
                                    {g}
                                    {tb && <Text style={styles.tiebreakText}>{tb}</Text>}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    }

    // Full match view - show both players
    return (
        <View style={styles.scoreContainer}>
            {/* Player 1 Score Row */}
            <View style={styles.scoreRow}>
                {/* Sets Won */}
                <View style={[styles.setsCell, isWinner1 && styles.winnerSetsCell]}>
                    <Text style={[styles.setsText, isWinner1 && styles.winnerSetsText]}>
                        {sets1}
                    </Text>
                </View>

                {/* Games per Set */}
                <View style={styles.gamesContainer}>
                    {setScores.map((set, idx) => {
                        const wonSet = parseInt(set.g1) > parseInt(set.g2);
                        return (
                            <View key={idx} style={styles.gameCell}>
                                <Text style={[
                                    styles.gameText,
                                    wonSet && styles.wonGameText
                                ]}>
                                    {set.g1}
                                    {set.tb1 && <Text style={styles.tiebreakText}>{set.tb1}</Text>}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Player 2 Score Row */}
            <View style={styles.scoreRow}>
                {/* Sets Won */}
                <View style={[styles.setsCell, !isWinner1 && styles.winnerSetsCell]}>
                    <Text style={[styles.setsText, !isWinner1 && styles.winnerSetsText]}>
                        {sets2}
                    </Text>
                </View>

                {/* Games per Set */}
                <View style={styles.gamesContainer}>
                    {setScores.map((set, idx) => {
                        const wonSet = parseInt(set.g2) > parseInt(set.g1);
                        return (
                            <View key={idx} style={styles.gameCell}>
                                <Text style={[
                                    styles.gameText,
                                    wonSet && styles.wonGameText
                                ]}>
                                    {set.g2}
                                    {set.tb2 && <Text style={styles.tiebreakText}>{set.tb2}</Text>}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    scoreContainer: {
        gap: 4,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rightInfo: {
        alignItems: 'flex-end',
    },
    simpleScore: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    setsCell: {
        minWidth: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.border,
        borderRadius: 4,
        paddingHorizontal: 6,
    },
    winnerSetsCell: {
        backgroundColor: COLORS.success + '30',
    },
    setsText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontFamily: 'RobotoMono-Bold',
    },
    winnerSetsText: {
        color: COLORS.success,
    },
    gamesContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    gameCell: {
        minWidth: 20,
        alignItems: 'center',
    },
    gameText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textMuted,
        fontFamily: 'RobotoMono-Regular',
    },
    wonGameText: {
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    tiebreakText: {
        fontSize: 8,
        fontWeight: '600',
        color: COLORS.textSecondary,
        verticalAlign: 'top',
    },
});
