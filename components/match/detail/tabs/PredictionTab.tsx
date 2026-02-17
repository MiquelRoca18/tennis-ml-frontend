import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';
import AIInsights from '../prediction/AIInsights';
import BettingRecommendation from '../prediction/BettingRecommendation';
import ConfidenceIndicator from '../prediction/ConfidenceIndicator';
import PredictionHeader from '../prediction/PredictionHeader';
import ValueAnalysis from '../prediction/ValueAnalysis';
import WinProbability from '../prediction/WinProbability';

interface PredictionTabProps {
    match: any;
    /** Bankroll usado para los stakes (opcional; si viene del listado con betting_config) */
    bankrollUsed?: number | null;
}

export default function PredictionTab({ match, bankrollUsed }: PredictionTabProps) {
    const { jugador1, jugador2, prediccion } = match;

    // Check if prediction data exists
    if (!prediccion) {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🤖</Text>
                    <Text style={styles.emptyTitle}>Predicción No Disponible</Text>
                    <Text style={styles.emptyText}>
                        No hay predicción de IA disponible para este partido.
                    </Text>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Prediction Header */}
            <PredictionHeader prediction={prediccion} />

            {/* Win Probability - Main Feature */}
            <WinProbability
                prediction={prediccion}
                player1Name={jugador1.nombre}
                player2Name={jugador2.nombre}
            />

            {/* Confidence Indicator */}
            <ConfidenceIndicator prediction={prediccion} />

            {/* Betting Recommendation - Highlighted */}
            <BettingRecommendation prediction={prediccion} bankrollUsed={bankrollUsed} />

            {/* Value Analysis - Expandable */}
            <ValueAnalysis
                prediction={prediccion}
                player1Name={jugador1.nombre}
                player2Name={jugador2.nombre}
            />

            {/* AI Insights - Expandable */}
            <AIInsights prediction={prediccion} match={match} />
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
