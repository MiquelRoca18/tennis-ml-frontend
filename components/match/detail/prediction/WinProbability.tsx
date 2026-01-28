import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface WinProbabilityProps {
    prediction: any;
    player1Name: string;
    player2Name: string;
}

export default function WinProbability({ prediction, player1Name, player2Name }: WinProbabilityProps) {
    if (!prediction) return null;

    const prob1 = (prediction.jugador1_probabilidad * 100);
    const prob2 = (prediction.jugador2_probabilidad * 100);
    const prob1Display = prob1.toFixed(0);
    const prob2Display = prob2.toFixed(0);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Probabilidad de Victoria</Text>

            {/* Players and Percentages */}
            <View style={styles.playersContainer}>
                <View style={styles.playerSection}>
                    <Text style={styles.playerName} numberOfLines={1}>{player1Name}</Text>
                    <Text style={styles.percentage}>{prob1Display}%</Text>
                </View>

                <View style={styles.vsContainer}>
                    <Text style={styles.vsText}>VS</Text>
                </View>

                <View style={styles.playerSection}>
                    <Text style={styles.playerName} numberOfLines={1}>{player2Name}</Text>
                    <Text style={styles.percentage}>{prob2Display}%</Text>
                </View>
            </View>

            {/* Visual Bar */}
            <View style={styles.barContainer}>
                <View style={styles.barBackground}>
                    <View style={[styles.player1Bar, { flex: prob1 }]} />
                    <View style={[styles.player2Bar, { flex: prob2 }]} />
                </View>
            </View>

            {/* Percentage Labels on Bar */}
            <View style={styles.barLabels}>
                <Text style={styles.barLabel}>{prob1Display}%</Text>
                <Text style={styles.barLabel}>{prob2Display}%</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    playersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    playerSection: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    playerName: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    percentage: {
        fontSize: 36,
        fontWeight: '700',
        color: COLORS.primary,
        fontFamily: 'RobotoMono-Bold',
    },
    vsContainer: {
        paddingHorizontal: 16,
    },
    vsText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    barContainer: {
        marginBottom: 8,
    },
    barBackground: {
        height: 12,
        backgroundColor: COLORS.border,
        borderRadius: 6,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    player1Bar: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    player2Bar: {
        height: '100%',
        backgroundColor: COLORS.success,
    },
    barLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    barLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textSecondary,
        fontFamily: 'RobotoMono-Bold',
    },
});
