/**
 * PredictionTabV2 - Tab de Predicción del Modelo ML
 * ==================================================
 * 
 * Muestra la predicción de nuestro modelo para partidos pendientes:
 * - Ganador predicho con probabilidades
 * - Nivel de confianza
 * - Value bet indicator
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MatchFullResponse, getShortName } from '../../../../../src/types/matchDetail';
import { COLORS } from '../../../../../src/utils/constants';
import RegisterBetModal from '../../../RegisterBetModal';

interface PredictionTabV2Props {
    data: MatchFullResponse;
    scrollable?: boolean;
    /** Tras registrar una apuesta se llama para refrescar datos (nuevo bankroll) */
    onBetPlaced?: () => void;
}

export default function PredictionTabV2({ data, scrollable = true, onBetPlaced }: PredictionTabV2Props) {
    const { prediction, player1, player2, odds, match: matchInfo } = data;

    const p1Short = getShortName(player1.name);
    const p2Short = getShortName(player2.name);

    if (!prediction) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🤖</Text>
                <Text style={styles.emptyTitle}>Predicción No Disponible</Text>
                <Text style={styles.emptyText}>
                    Nuestro modelo aún no ha generado una predicción para este partido.
                </Text>
            </View>
        );
    }

    const isP1Winner = prediction.predicted_winner === 1;
    const winnerName = isP1Winner ? player1.name : player2.name;
    const winnerShort = isP1Winner ? p1Short : p2Short;
    const loserShort = isP1Winner ? p2Short : p1Short;
    const winnerProb = isP1Winner ? prediction.probability_player1 : prediction.probability_player2;
    const loserProb = isP1Winner ? prediction.probability_player2 : prediction.probability_player1;

    const stakeEur = (prediction.kelly_stake_jugador1 ?? 0) || (prediction.kelly_stake_jugador2 ?? 0);
    const bankrollUsed = prediction.bankroll_used ?? 0;
    const hasStake = stakeEur > 0;
    const recommendationText = prediction.recommendation ?? (prediction as { recomendacion?: string }).recomendacion ?? '';
    const [showRegisterBetModal, setShowRegisterBetModal] = useState(false);

    const openRegisterBetModal = () => {
        if (!hasStake || stakeEur <= 0 || !matchInfo?.id) return;
        setShowRegisterBetModal(true);
    };

    const content = (
        <>
            {/* Main Prediction Card */}
            <View style={styles.mainCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderIcon}>🤖</Text>
                    <Text style={styles.cardHeaderTitle}>Predicción del Modelo</Text>
                </View>

                {/* Winner Section */}
                <View style={styles.winnerSection}>
                    <Text style={styles.winnerLabel}>GANADOR PREDICHO</Text>
                    <Text style={styles.winnerName}>{winnerName}</Text>
                    <View style={styles.probabilityBadge}>
                        <Text style={styles.probabilityText}>
                            {winnerProb.toFixed(0)}% probabilidad
                        </Text>
                    </View>
                </View>

                {/* Probability Bar */}
                <View style={styles.probabilitySection}>
                    <View style={styles.probHeader}>
                        <Text style={[styles.probPlayerName, styles.probP1]}>{p1Short}</Text>
                        <Text style={[styles.probPlayerName, styles.probP2]}>{p2Short}</Text>
                    </View>
                    <View style={styles.probBarContainer}>
                        <View 
                            style={[
                                styles.probBarFill, 
                                styles.probBarP1,
                                { flex: prediction.probability_player1 }
                            ]} 
                        />
                        <View 
                            style={[
                                styles.probBarFill, 
                                styles.probBarP2,
                                { flex: prediction.probability_player2 }
                            ]} 
                        />
                    </View>
                    <View style={styles.probValues}>
                        <Text style={[styles.probValue, styles.probP1]}>
                            {prediction.probability_player1.toFixed(0)}%
                        </Text>
                        <Text style={[styles.probValue, styles.probP2]}>
                            {prediction.probability_player2.toFixed(0)}%
                        </Text>
                    </View>
                </View>
            </View>

            {/* Recomendación y cantidad sugerida (sin card de confianza ni value bet duplicado) */}
            <View style={styles.recommendationCard}>
                <Text style={styles.recommendationCardTitle}>Recomendación de apuesta</Text>
                <Text style={styles.recommendationText}>
                    {recommendationText || '—'}
                </Text>
                <Text style={styles.stakeSuggestedBlock}>
                    Cantidad sugerida:{' '}
                    {hasStake ? (
                        <>
                            <Text style={styles.stakeValue}>{stakeEur.toFixed(2)}€</Text>
                            {bankrollUsed > 0 && (
                                <Text style={styles.bankrollNote}> (bankroll {bankrollUsed.toFixed(0)}€)</Text>
                            )}
                        </>
                    ) : (
                        <Text style={styles.stakeValue}>—</Text>
                    )}
                </Text>
            </View>

            {/* Botón Registrar apuesta */}
            {hasStake && matchInfo?.id && (
                <TouchableOpacity
                    style={styles.betButton}
                    onPress={openRegisterBetModal}
                >
                    <Text style={styles.betButtonText}>
                        Registrar apuesta ({stakeEur.toFixed(2)}€)
                    </Text>
                </TouchableOpacity>
            )}

            <RegisterBetModal
                visible={showRegisterBetModal}
                onClose={() => setShowRegisterBetModal(false)}
                onSuccess={onBetPlaced}
                matchId={matchInfo!.id}
                player1Name={player1.name}
                player2Name={player2.name}
                recommendedPlayerSide={prediction.recommended_bet_side ?? prediction.predicted_winner}
                suggestedStakeEur={stakeEur}
                bankrollEur={bankrollUsed}
                tournament={matchInfo?.tournament ?? ''}
            />

            {/* Model Info */}
            <View style={styles.modelInfo}>
                <Text style={styles.modelInfoTitle}>Sobre la predicción</Text>
                <Text style={styles.modelInfoText}>
                Predicción generada por nuestro modelo de Machine Learning basado en 
                estadísticas históricas, forma reciente, H2H, superficie y otros factores.
                </Text>
            </View>
        </>
    );

    if (scrollable) {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {content}
            </ScrollView>
        );
    }
    return <View style={[styles.container, styles.content]}>{content}</View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
        gap: 16,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: COLORS.background,
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
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Main Card
    mainCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    cardHeaderIcon: {
        fontSize: 20,
    },
    cardHeaderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },

    // Winner Section
    winnerSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    winnerLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        letterSpacing: 1,
        marginBottom: 8,
    },
    winnerName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.primary,
        marginBottom: 8,
    },
    probabilityBadge: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    probabilityText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },

    // Probability Section
    probabilitySection: {
        gap: 8,
    },
    probHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    probPlayerName: {
        fontSize: 13,
        fontWeight: '700',
    },
    probP1: {
        color: COLORS.primary,
    },
    probP2: {
        color: COLORS.success,
    },
    probBarContainer: {
        flexDirection: 'row',
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        gap: 2,
    },
    probBarFill: {
        height: '100%',
    },
    probBarP1: {
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 6,
        borderBottomLeftRadius: 6,
    },
    probBarP2: {
        backgroundColor: COLORS.success,
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
    },
    probValues: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    probValue: {
        fontSize: 14,
        fontWeight: '700',
    },

    // Confidence Card
    confidenceCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    confidenceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    confidenceEmoji: {
        fontSize: 32,
    },
    confidenceLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    confidenceLevel: {
        fontSize: 16,
        fontWeight: '800',
    },
    confidenceValueContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    confidenceValue: {
        fontSize: 24,
        fontWeight: '800',
    },

    // Recomendación y cantidad sugerida
    recommendationCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    recommendationCardTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    recommendationText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    stakeSuggestedBlock: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    stakeValue: {
        fontWeight: '800',
        color: COLORS.primary,
    },

    // Value Bet Card
    valueBetCard: {
        backgroundColor: COLORS.warning + '15',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.warning + '40',
    },
    valueBetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    valueBetIcon: {
        fontSize: 20,
    },
    valueBetTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.warning,
    },
    valueBetText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
    valueBetPlayer: {
        fontWeight: '700',
        color: COLORS.warning,
    },
    valueBetDisclaimer: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 8,
        fontStyle: 'italic',
    },
    stakeSuggested: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
        marginTop: 8,
    },
    bankrollNote: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    stakeCard: {
        backgroundColor: COLORS.primary + '18',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
    },
    stakeCardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    stakeCardValue: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
    },

    // Model Info
    betButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginTop: 16,
    },
    betButtonDisabled: {
        opacity: 0.6,
    },
    betButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    modelInfo: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modelInfoTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    modelInfoText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
});
