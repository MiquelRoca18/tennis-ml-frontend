import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';
import StatComparisonBar from '../shared/StatComparisonBar';

interface KeyStatsComparisonProps {
    matchDetails: any;
    player1Name: string;
    player2Name: string;
}

export default function KeyStatsComparison({ matchDetails, player1Name, player2Name }: KeyStatsComparisonProps) {
    const advancedStats = matchDetails?.estadisticas_avanzadas;

    if (!advancedStats) {
        return null;
    }

    const player1Stats = advancedStats.jugador1 || {};
    const player2Stats = advancedStats.jugador2 || {};

    // Calculate percentages
    const servePercentage1 = player1Stats.porcentaje_saque || 0;
    const servePercentage2 = player2Stats.porcentaje_saque || 0;

    const breakPointsSaved1 = player1Stats.break_points_salvados || 0;
    const breakPointsFaced1 = player1Stats.break_points_enfrentados || 1;
    const savePercentage1 = (breakPointsSaved1 / breakPointsFaced1) * 100;

    const breakPointsSaved2 = player2Stats.break_points_salvados || 0;
    const breakPointsFaced2 = player2Stats.break_points_enfrentados || 1;
    const savePercentage2 = (breakPointsSaved2 / breakPointsFaced2) * 100;

    const pointsWon1 = player1Stats.puntos_totales || 0;
    const pointsWon2 = player2Stats.puntos_totales || 0;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Estadísticas Clave</Text>

            <StatComparisonBar
                label="1st Serve %"
                value1={servePercentage1}
                value2={servePercentage2}
                max={100}
                player1Name={player1Name.split(' ').pop() || player1Name}
                player2Name={player2Name.split(' ').pop() || player2Name}
                formatValue={(v) => `${v.toFixed(1)}%`}
            />

            <StatComparisonBar
                label="Break Points Saved"
                value1={savePercentage1}
                value2={savePercentage2}
                max={100}
                player1Name={player1Name.split(' ').pop() || player1Name}
                player2Name={player2Name.split(' ').pop() || player2Name}
                formatValue={(v) => `${v.toFixed(0)}%`}
            />

            <StatComparisonBar
                label="Points Won"
                value1={pointsWon1}
                value2={pointsWon2}
                player1Name={player1Name.split(' ').pop() || player1Name}
                player2Name={player2Name.split(' ').pop() || player2Name}
            />
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
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 20,
    },
});
