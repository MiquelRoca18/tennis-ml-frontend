import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';
import StatComparisonBar from '../shared/StatComparisonBar';

interface ServeStatsProps {
    matchDetails: any;
    player1Name: string;
    player2Name: string;
}

export default function ServeStats({ matchDetails, player1Name, player2Name }: ServeStatsProps) {
    const advancedStats = matchDetails?.estadisticas_avanzadas;

    if (!advancedStats) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No hay estadísticas de saque disponibles</Text>
            </View>
        );
    }

    const player1Stats = advancedStats.jugador1 || {};
    const player2Stats = advancedStats.jugador2 || {};

    const serviceGamesWon1 = player1Stats.juegos_ganados_al_saque || 0;
    const serviceGamesTotal1 = player1Stats.juegos_al_saque || 1;
    const serviceGamesWon2 = player2Stats.juegos_ganados_al_saque || 0;
    const serviceGamesTotal2 = player2Stats.juegos_al_saque || 1;

    const servicePercentage1 = (serviceGamesWon1 / serviceGamesTotal1) * 100;
    const servicePercentage2 = (serviceGamesWon2 / serviceGamesTotal2) * 100;

    const servicePoints1 = player1Stats.puntos_totales || 0; // Approximate
    const servicePoints2 = player2Stats.puntos_totales || 0;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Estadísticas al Saque</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service Games Won</Text>
                <StatComparisonBar
                    label={`${serviceGamesWon1}/${serviceGamesTotal1} vs ${serviceGamesWon2}/${serviceGamesTotal2}`}
                    value1={servicePercentage1}
                    value2={servicePercentage2}
                    max={100}
                    player1Name={player1Name.split(' ').pop() || player1Name}
                    player2Name={player2Name.split(' ').pop() || player2Name}
                    formatValue={(v) => `${v.toFixed(1)}%`}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Service Points Won</Text>
                <StatComparisonBar
                    label="Total Points"
                    value1={servicePoints1}
                    value2={servicePoints2}
                    player1Name={player1Name.split(' ').pop() || player1Name}
                    player2Name={player2Name.split(' ').pop() || player2Name}
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
