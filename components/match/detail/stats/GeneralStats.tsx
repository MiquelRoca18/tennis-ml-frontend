import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';
import StatComparisonBar from '../shared/StatComparisonBar';

interface GeneralStatsProps {
    matchDetails: any;
    player1Name: string;
    player2Name: string;
}

export default function GeneralStats({ matchDetails, player1Name, player2Name }: GeneralStatsProps) {
    // Handle both summary and details API structures
    const summary = matchDetails?.summary;
    const stats = matchDetails?.estadisticas_basicas;
    const advancedStats = matchDetails?.estadisticas_avanzadas;

    if (!stats && !advancedStats && !summary) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>Estadísticas No Disponibles</Text>
                <Text style={styles.emptyText}>
                    Las estadísticas de este partido no están disponibles todavía.
                </Text>
            </View>
        );
    }

    // Extract player short names
    const p1Short = player1Name.split(' ').pop() || player1Name;
    const p2Short = player2Name.split(' ').pop() || player2Name;

    // Extract all available stats with fallbacks
    const totalPoints1 = summary?.player1?.serve_points || advancedStats?.jugador1?.puntos_totales || 0;
    const totalPoints2 = summary?.player2?.serve_points || advancedStats?.jugador2?.puntos_totales || 0;
    const gamesWon1 = summary?.player1?.games_won || stats?.juegos_ganados_jugador1 || 0;
    const gamesWon2 = summary?.player2?.games_won || stats?.juegos_ganados_jugador2 || 0;
    const setsWon1 = stats?.sets_ganados_jugador1 || 0;
    const setsWon2 = stats?.sets_ganados_jugador2 || 0;
    
    // Break stats
    const breaks1 = summary?.player1?.breaks || 0;
    const breaks2 = summary?.player2?.breaks || 0;
    
    // Total games
    const totalGames = summary?.total_games || 0;
    const totalPointsPlayed = summary?.total_points || (totalPoints1 + totalPoints2);

    const hasData = totalPoints1 > 0 || totalPoints2 > 0 || gamesWon1 > 0 || gamesWon2 > 0;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Match Summary Card */}
            {totalGames > 0 && (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>📈 Resumen del Partido</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{totalGames}</Text>
                            <Text style={styles.summaryLabel}>Juegos</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{totalPointsPlayed}</Text>
                            <Text style={styles.summaryLabel}>Puntos</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{breaks1 + breaks2}</Text>
                            <Text style={styles.summaryLabel}>Breaks</Text>
                        </View>
                    </View>
                </View>
            )}

            <Text style={styles.sectionTitle}>Rendimiento General</Text>

            {(setsWon1 > 0 || setsWon2 > 0) && (
                <StatComparisonBar
                    label="Sets Ganados"
                    value1={setsWon1}
                    value2={setsWon2}
                    max={5}
                    player1Name={p1Short}
                    player2Name={p2Short}
                />
            )}

            {(gamesWon1 > 0 || gamesWon2 > 0) && (
                <StatComparisonBar
                    label="Juegos Ganados"
                    value1={gamesWon1}
                    value2={gamesWon2}
                    player1Name={p1Short}
                    player2Name={p2Short}
                />
            )}

            {(totalPoints1 > 0 || totalPoints2 > 0) && (
                <StatComparisonBar
                    label="Puntos Totales Ganados"
                    value1={totalPoints1}
                    value2={totalPoints2}
                    player1Name={p1Short}
                    player2Name={p2Short}
                />
            )}

            {(breaks1 > 0 || breaks2 > 0) && (
                <StatComparisonBar
                    label="Breaks Realizados"
                    value1={breaks1}
                    value2={breaks2}
                    player1Name={p1Short}
                    player2Name={p2Short}
                />
            )}

            {!hasData && (
                <View style={styles.noDataCard}>
                    <Text style={styles.noDataText}>
                        Las estadísticas detalladas se mostrarán cuando estén disponibles.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    summaryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    summaryTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.primary,
        fontFamily: 'RobotoMono-Bold',
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 20,
    },
    emptyState: {
        flex: 1,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIcon: {
        fontSize: 48,
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
    noDataCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 20,
        marginTop: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    noDataText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
