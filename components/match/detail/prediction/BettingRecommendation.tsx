import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface BettingRecommendationProps {
    prediction: any;
    /** Bankroll usado para el stake mostrado (opcional, para mostrar "según tu bankroll de X€") */
    bankrollUsed?: number | null;
}

export default function BettingRecommendation({ prediction, bankrollUsed }: BettingRecommendationProps) {
    if (!prediction) return null;

    const recommendation = prediction.recomendacion || 'NO APOSTAR';
    const bestOption = prediction.mejor_opcion;
    const stakeEur = (prediction.kelly_stake_jugador1 ?? 0) || (prediction.kelly_stake_jugador2 ?? 0);

    // Determine recommendation type
    const getRecommendationType = (rec: string): 'bet' | 'caution' | 'no-bet' => {
        const recLower = rec.toLowerCase();
        if (recLower.includes('apostar') && !recLower.includes('no')) return 'bet';
        if (recLower.includes('precaución') || recLower.includes('caution')) return 'caution';
        return 'no-bet';
    };

    const type = getRecommendationType(recommendation);

    // Get icon and color based on type
    const getRecommendationStyle = () => {
        switch (type) {
            case 'bet':
                return {
                    icon: '✅',
                    color: COLORS.success,
                    bgColor: COLORS.success + '20',
                    message: 'Hay valor en esta apuesta según el modelo'
                };
            case 'caution':
                return {
                    icon: '⚠️',
                    color: COLORS.warning,
                    bgColor: COLORS.warning + '20',
                    message: 'Apostar con precaución, valor marginal'
                };
            case 'no-bet':
            default:
                return {
                    icon: '❌',
                    color: COLORS.textSecondary,
                    bgColor: COLORS.border + '40',
                    message: 'No hay valor en las cuotas actuales según el modelo'
                };
        }
    };

    const style = getRecommendationStyle();

    return (
        <View style={[styles.container, { backgroundColor: style.bgColor }]}>
            <View style={styles.header}>
                <Text style={styles.icon}>{style.icon}</Text>
                <Text style={styles.title}>Recomendación de Apuesta</Text>
            </View>

            <Text style={[styles.recommendation, { color: style.color }]}>
                {recommendation}
            </Text>

            {bestOption && (
                <Text style={styles.bestOption}>
                    Mejor opción: {bestOption}
                </Text>
            )}

            {type === 'bet' && stakeEur > 0 && (
                <Text style={styles.stakeSuggested}>
                    Cantidad sugerida: {stakeEur.toFixed(2)}€
                    {bankrollUsed != null && bankrollUsed > 0 && (
                        <Text style={styles.bankrollNote}> (bankroll {bankrollUsed.toFixed(0)}€)</Text>
                    )}
                </Text>
            )}

            <Text style={styles.message}>{style.message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    icon: {
        fontSize: 24,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    recommendation: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    bestOption: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    stakeSuggested: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    bankrollNote: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    message: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
});
