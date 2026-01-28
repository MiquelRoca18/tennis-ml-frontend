import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';
import StatComparisonBar from '../shared/StatComparisonBar';

interface ReturnStatsProps {
    matchDetails: any;
    player1Name: string;
    player2Name: string;
}

export default function ReturnStats({ matchDetails, player1Name, player2Name }: ReturnStatsProps) {
    const advancedStats = matchDetails?.estadisticas_avanzadas;

    if (!advancedStats) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No hay estadísticas de resto disponibles</Text>
            </View>
        );
    }

    const player1Stats = advancedStats.jugador1 || {};
    const player2Stats = advancedStats.jugador2 || {};

    const returnGamesWon1 = player1Stats.juegos_ganados_al_resto || 0;
    const returnGamesTotal1 = player1Stats.juegos_al_resto || 1;
    const returnGamesWon2 = player2Stats.juegos_ganados_al_resto || 0;
    const returnGamesTotal2 = player2Stats.juegos_al_resto || 1;

    const returnPercentage1 = (returnGamesWon1 / returnGamesTotal1) * 100;
    const returnPercentage2 = (returnGamesWon2 / returnGamesTotal2) * 100;

    const breakPointsConverted1 = player1Stats.break_points_convertidos || 0;
    const breakPointsTotal1 = player1Stats.break_points_a_favor || 1;
    const breakPointsConverted2 = player2Stats.break_points_convertidos || 0;
    const breakPointsTotal2 = player2Stats.break_points_a_favor || 1;

    const conversionRate1 = (breakPointsConverted1 / breakPointsTotal1) * 100;
    const conversionRate2 = (breakPointsConverted2 / breakPointsTotal2) * 100;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Estadísticas al Resto</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Return Games Won</Text>
                <StatComparisonBar
                    label={`${returnGamesWon1}/${returnGamesTotal1} vs ${returnGamesWon2}/${returnGamesTotal2}`}
                    value1={returnPercentage1}
                    value2={returnPercentage2}
                    max={100}
                    player1Name={player1Name.split(' ').pop() || player1Name}
                    player2Name={player2Name.split(' ').pop() || player2Name}
                    formatValue={(v) => `${v.toFixed(1)}%`}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Break Points Converted</Text>
                <StatComparisonBar
                    label={`${breakPointsConverted1}/${breakPointsTotal1} vs ${breakPointsConverted2}/${breakPointsTotal2}`}
                    value1={conversionRate1}
                    value2={conversionRate2}
                    max={100}
                    player1Name={player1Name.split(' ').pop() || player1Name}
                    player2Name={player2Name.split(' ').pop() || player2Name}
                    formatValue={(v) => `${v.toFixed(1)}%`}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
