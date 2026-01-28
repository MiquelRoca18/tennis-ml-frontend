import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface SetBySetScoreProps {
    matchDetails: any;
    player1Name: string;
    player2Name: string;
}

export default function SetBySetScore({ matchDetails, player1Name, player2Name }: SetBySetScoreProps) {
    const marcadorPorSets = matchDetails?.estadisticas_basicas?.marcador_por_sets;

    if (!marcadorPorSets || marcadorPorSets.length === 0) {
        return null;
    }

    // Short names for header
    const p1Short = player1Name.split(' ').pop() || player1Name;
    const p2Short = player2Name.split(' ').pop() || player2Name;

    // Calculate total sets won
    const setsWonP1 = marcadorPorSets.filter((s: any) => s.jugador1 > s.jugador2).length;
    const setsWonP2 = marcadorPorSets.filter((s: any) => s.jugador2 > s.jugador1).length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🎾 Score por Sets</Text>
                <View style={styles.totalSets}>
                    <Text style={styles.totalSetsText}>{setsWonP1} - {setsWonP2}</Text>
                </View>
            </View>

            {/* Player names header */}
            <View style={styles.playersHeader}>
                <View style={styles.setLabelSpace} />
                <View style={styles.namesContainer}>
                    <Text style={[styles.playerNameHeader, setsWonP1 > setsWonP2 && styles.winnerNameHeader]}>
                        {p1Short}
                    </Text>
                    <View style={styles.vsSpace} />
                    <Text style={[styles.playerNameHeader, setsWonP2 > setsWonP1 && styles.winnerNameHeader]}>
                        {p2Short}
                    </Text>
                </View>
                <View style={styles.winnerIndicatorSpace} />
            </View>

            {marcadorPorSets.map((set: any, index: number) => {
                const player1Won = set.jugador1 > set.jugador2;
                const player2Won = set.jugador2 > set.jugador1;
                const hasTiebreak = set.tiebreak !== undefined && set.tiebreak !== null;
                const isTiebreakSet = set.jugador1 === 7 || set.jugador2 === 7;

                return (
                    <View key={index} style={[styles.setRow, isTiebreakSet && styles.tiebreakSetRow]}>
                        <Text style={styles.setLabel}>Set {set.set || index + 1}</Text>

                        <View style={styles.scoreContainer}>
                            {/* Player 1 Score */}
                            <View style={[styles.scoreBox, player1Won && styles.wonScoreBox]}>
                                <Text style={[
                                    styles.scoreText,
                                    player1Won && styles.wonScore
                                ]}>
                                    {set.jugador1}
                                </Text>
                                {hasTiebreak && (
                                    <Text style={[styles.tiebreakText, player1Won && styles.tiebreakWon]}>
                                        ({set.tiebreak})
                                    </Text>
                                )}
                            </View>

                            {/* Separator */}
                            <Text style={styles.scoreDash}>-</Text>

                            {/* Player 2 Score */}
                            <View style={[styles.scoreBox, player2Won && styles.wonScoreBox]}>
                                <Text style={[
                                    styles.scoreText,
                                    player2Won && styles.wonScore
                                ]}>
                                    {set.jugador2}
                                </Text>
                            </View>
                        </View>

                        {/* Winner indicator */}
                        <View style={styles.winnerIndicator}>
                            {player1Won && <Text style={styles.winnerIcon}>✓</Text>}
                            {player2Won && <Text style={styles.winnerIcon}>✓</Text>}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    totalSets: {
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    totalSetsText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
        fontFamily: 'RobotoMono-Bold',
    },
    playersHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    setLabelSpace: {
        width: 50,
    },
    namesContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playerNameHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
        flex: 1,
    },
    winnerNameHeader: {
        color: COLORS.success,
        fontWeight: '700',
    },
    vsSpace: {
        width: 20,
    },
    winnerIndicatorSpace: {
        width: 24,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: COLORS.background,
    },
    tiebreakSetRow: {
        backgroundColor: COLORS.warning + '10',
        borderWidth: 1,
        borderColor: COLORS.warning + '30',
    },
    setLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        width: 50,
    },
    scoreContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    scoreBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minWidth: 50,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    wonScoreBox: {
        backgroundColor: COLORS.success + '15',
    },
    scoreText: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.textSecondary,
        fontFamily: 'RobotoMono-Bold',
    },
    wonScore: {
        color: COLORS.success,
    },
    scoreDash: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    tiebreakText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginLeft: 2,
    },
    tiebreakWon: {
        color: COLORS.success,
    },
    winnerIndicator: {
        width: 24,
        alignItems: 'center',
    },
    winnerIcon: {
        fontSize: 16,
        color: COLORS.success,
        fontWeight: '700',
    },
});
