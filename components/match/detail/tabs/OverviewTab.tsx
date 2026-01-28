import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';
import KeyStatsComparison from '../overview/KeyStatsComparison';
import MatchInfoCard from '../overview/MatchInfoCard';
import QuickStats from '../overview/QuickStats';
import SetBySetScore from '../overview/SetBySetScore';

interface OverviewTabProps {
    match: any;
    matchDetails?: any;
}

export default function OverviewTab({ match, matchDetails }: OverviewTabProps) {
    const { jugador1, jugador2, estado, resultado } = match;
    const isCompleted = estado === 'completado';
    const isLive = estado === 'en_juego' || match.is_live === '1';
    const isPending = estado === 'pendiente';

    // Check for scores from multiple sources
    const hasScoresFromResultado = resultado?.scores?.sets && resultado.scores.sets.length > 0;
    const hasScoresFromDetails = matchDetails?.estadisticas_basicas?.marcador_por_sets?.length > 0;
    const hasScores = hasScoresFromResultado || hasScoresFromDetails;

    // Convert resultado.scores to matchDetails format for SetBySetScore
    const getEnhancedMatchDetails = () => {
        if (hasScoresFromDetails) {
            return matchDetails;
        }
        
        if (hasScoresFromResultado) {
            // Convert the new format to the expected format
            const sets = resultado.scores.sets.map((s: any) => ({
                set: s.set_number,
                jugador1: s.player1_score,
                jugador2: s.player2_score,
                tiebreak: s.tiebreak_score
            }));
            
            return {
                ...matchDetails,
                estadisticas_basicas: {
                    ...matchDetails?.estadisticas_basicas,
                    marcador_por_sets: sets
                }
            };
        }
        
        return matchDetails;
    };

    const enhancedDetails = getEnhancedMatchDetails();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Match Info Card - Always visible */}
            <MatchInfoCard match={match} matchDetails={matchDetails} />

            {/* Quick Stats - Only for completed/live matches */}
            {!isPending && (matchDetails?.estadisticas_basicas || resultado?.scores) && (
                <QuickStats
                    matchDetails={enhancedDetails}
                    player1Name={jugador1.nombre}
                    player2Name={jugador2.nombre}
                />
            )}

            {/* Set by Set Score - For completed or live matches with scores */}
            {(isCompleted || isLive) && hasScores && (
                <SetBySetScore
                    matchDetails={enhancedDetails}
                    player1Name={jugador1.nombre}
                    player2Name={jugador2.nombre}
                />
            )}

            {/* Key Stats Comparison - Only if advanced stats available */}
            {matchDetails?.estadisticas_avanzadas && (
                <KeyStatsComparison
                    matchDetails={matchDetails}
                    player1Name={jugador1.nombre}
                    player2Name={jugador2.nombre}
                />
            )}

            {/* Empty State for Pending Matches */}
            {isPending && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>⏳</Text>
                    <Text style={styles.emptyTitle}>Partido Programado</Text>
                    <Text style={styles.emptyText}>
                        Las estadísticas del partido estarán disponibles una vez que comience.
                    </Text>
                </View>
            )}

            {/* Empty State for No Data on completed matches */}
            {isCompleted && !hasScores && !matchDetails?.estadisticas_avanzadas && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📊</Text>
                    <Text style={styles.emptyTitle}>Datos Limitados</Text>
                    <Text style={styles.emptyText}>
                        No hay estadísticas detalladas disponibles para este partido. 
                        Las estadísticas pueden no estar disponibles para todos los partidos.
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
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 40,
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
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
