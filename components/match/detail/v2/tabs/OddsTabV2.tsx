/**
 * OddsTabV2 - Tab de Cuotas de Casas de Apuestas
 * ===============================================
 * 
 * Muestra las cuotas de diferentes bookmakers para partidos pendientes:
 * - Comparación de cuotas
 * - Favorito del mercado
 * - Mejores cuotas disponibles
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MatchFullResponse, getShortName } from '../../../../../src/types/matchDetail';
import { COLORS } from '../../../../../src/utils/constants';

interface OddsTabV2Props {
    data: MatchFullResponse;
}

export default function OddsTabV2({ data }: OddsTabV2Props) {
    const { odds, player1, player2, prediction } = data;

    const p1Short = getShortName(player1.name);
    const p2Short = getShortName(player2.name);

    if (!odds || (!odds.best_odds_player1 && !odds.best_odds_player2)) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💰</Text>
                <Text style={styles.emptyTitle}>Cuotas No Disponibles</Text>
                <Text style={styles.emptyText}>
                    Las cuotas de las casas de apuestas no están disponibles para este partido.
                </Text>
            </View>
        );
    }

    const p1Odds = odds.best_odds_player1 || 0;
    const p2Odds = odds.best_odds_player2 || 0;
    
    // Calcular probabilidades implícitas
    const p1ImpliedProb = p1Odds > 0 ? (1 / p1Odds * 100) : 0;
    const p2ImpliedProb = p2Odds > 0 ? (1 / p2Odds * 100) : 0;
    
    // Determinar favorito
    const favorite = p1Odds < p2Odds ? 1 : p1Odds > p2Odds ? 2 : 0;
    const favoriteName = favorite === 1 ? p1Short : p2Short;
    const favoriteOdds = favorite === 1 ? p1Odds : p2Odds;
    
    // Calcular margen de la casa (overround)
    const margin = p1ImpliedProb + p2ImpliedProb - 100;

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Market Favorite Card */}
            {favorite !== 0 && (
                <View style={styles.favoriteCard}>
                    <Text style={styles.favoriteLabel}>FAVORITO DEL MERCADO</Text>
                    <Text style={styles.favoriteName}>{favoriteName}</Text>
                    <View style={styles.favoriteOddsContainer}>
                        <Text style={styles.favoriteOdds}>@{favoriteOdds.toFixed(2)}</Text>
                    </View>
                </View>
            )}

            {/* Main Odds Comparison */}
            <View style={styles.oddsCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderIcon}>📊</Text>
                    <Text style={styles.cardHeaderTitle}>Comparación de Cuotas</Text>
                </View>

                {/* Player 1 */}
                <View style={styles.playerOddsRow}>
                    <View style={styles.playerInfo}>
                        <View style={[styles.playerDot, styles.playerDotP1]} />
                        <Text style={styles.playerName}>{player1.name}</Text>
                    </View>
                    <View style={styles.oddsInfo}>
                        <Text style={[styles.oddsValue, favorite === 1 && styles.oddsValueFavorite]}>
                            {p1Odds.toFixed(2)}
                        </Text>
                        <Text style={styles.impliedProb}>
                            {p1ImpliedProb.toFixed(0)}% impl.
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Player 2 */}
                <View style={styles.playerOddsRow}>
                    <View style={styles.playerInfo}>
                        <View style={[styles.playerDot, styles.playerDotP2]} />
                        <Text style={styles.playerName}>{player2.name}</Text>
                    </View>
                    <View style={styles.oddsInfo}>
                        <Text style={[styles.oddsValue, favorite === 2 && styles.oddsValueFavorite]}>
                            {p2Odds.toFixed(2)}
                        </Text>
                        <Text style={styles.impliedProb}>
                            {p2ImpliedProb.toFixed(0)}% impl.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Visual Comparison */}
            <View style={styles.visualCard}>
                <Text style={styles.visualTitle}>Probabilidad Implícita</Text>
                <View style={styles.visualBar}>
                    <View style={[styles.visualBarP1, { flex: p1ImpliedProb }]}>
                        <Text style={styles.visualBarText}>{p1Short}</Text>
                    </View>
                    <View style={[styles.visualBarP2, { flex: p2ImpliedProb }]}>
                        <Text style={styles.visualBarText}>{p2Short}</Text>
                    </View>
                </View>
                <View style={styles.visualValues}>
                    <Text style={[styles.visualValue, styles.visualValueP1]}>
                        {p1ImpliedProb.toFixed(1)}%
                    </Text>
                    <Text style={[styles.visualValue, styles.visualValueP2]}>
                        {p2ImpliedProb.toFixed(1)}%
                    </Text>
                </View>
            </View>

            {/* Model vs Market Comparison */}
            {prediction && (
                <View style={styles.comparisonCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderIcon}>🤖 vs 💰</Text>
                        <Text style={styles.cardHeaderTitle}>Modelo vs Mercado</Text>
                    </View>

                    <View style={styles.comparisonGrid}>
                        {/* Player 1 */}
                        <View style={styles.comparisonRow}>
                            <Text style={styles.comparisonPlayer}>{p1Short}</Text>
                            <View style={styles.comparisonValues}>
                                <View style={styles.comparisonItem}>
                                    <Text style={styles.comparisonLabel}>Modelo</Text>
                                    <Text style={[styles.comparisonValue, styles.comparisonModel]}>
                                        {prediction.probability_player1.toFixed(0)}%
                                    </Text>
                                </View>
                                <View style={styles.comparisonItem}>
                                    <Text style={styles.comparisonLabel}>Mercado</Text>
                                    <Text style={[styles.comparisonValue, styles.comparisonMarket]}>
                                        {p1ImpliedProb.toFixed(0)}%
                                    </Text>
                                </View>
                                <View style={styles.comparisonItem}>
                                    <Text style={styles.comparisonLabel}>Diff</Text>
                                    <Text style={[
                                        styles.comparisonValue,
                                        styles.comparisonDiff,
                                        { color: prediction.probability_player1 > p1ImpliedProb 
                                            ? COLORS.success 
                                            : COLORS.danger }
                                    ]}>
                                        {(prediction.probability_player1 - p1ImpliedProb) > 0 ? '+' : ''}
                                        {(prediction.probability_player1 - p1ImpliedProb).toFixed(0)}%
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Player 2 */}
                        <View style={[styles.comparisonRow, styles.comparisonRowLast]}>
                            <Text style={styles.comparisonPlayer}>{p2Short}</Text>
                            <View style={styles.comparisonValues}>
                                <View style={styles.comparisonItem}>
                                    <Text style={styles.comparisonLabel}>Modelo</Text>
                                    <Text style={[styles.comparisonValue, styles.comparisonModel]}>
                                        {prediction.probability_player2.toFixed(0)}%
                                    </Text>
                                </View>
                                <View style={styles.comparisonItem}>
                                    <Text style={styles.comparisonLabel}>Mercado</Text>
                                    <Text style={[styles.comparisonValue, styles.comparisonMarket]}>
                                        {p2ImpliedProb.toFixed(0)}%
                                    </Text>
                                </View>
                                <View style={styles.comparisonItem}>
                                    <Text style={styles.comparisonLabel}>Diff</Text>
                                    <Text style={[
                                        styles.comparisonValue,
                                        styles.comparisonDiff,
                                        { color: prediction.probability_player2 > p2ImpliedProb 
                                            ? COLORS.success 
                                            : COLORS.danger }
                                    ]}>
                                        {(prediction.probability_player2 - p2ImpliedProb) > 0 ? '+' : ''}
                                        {(prediction.probability_player2 - p2ImpliedProb).toFixed(0)}%
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.comparisonHint}>
                        Diferencia positiva = el modelo cree que hay más probabilidad que el mercado
                    </Text>
                </View>
            )}

            {/* Bookmakers List */}
            {odds.bookmakers && odds.bookmakers.length > 0 && (
                <View style={styles.bookmakersCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderIcon}>🏢</Text>
                        <Text style={styles.cardHeaderTitle}>Casas de Apuestas</Text>
                    </View>

                    {/* Header */}
                    <View style={styles.bookmakerHeader}>
                        <Text style={styles.bookmakerHeaderText}>Casa</Text>
                        <Text style={styles.bookmakerHeaderText}>{p1Short}</Text>
                        <Text style={styles.bookmakerHeaderText}>{p2Short}</Text>
                    </View>

                    {/* Rows */}
                    {odds.bookmakers.map((bm, index) => (
                        <View 
                            key={bm.bookmaker + index} 
                            style={[
                                styles.bookmakerRow,
                                index === odds.bookmakers.length - 1 && styles.bookmakerRowLast
                            ]}
                        >
                            <Text style={styles.bookmakerName}>{bm.bookmaker}</Text>
                            <Text style={styles.bookmakerOdds}>
                                {bm.player1_odds.toFixed(2)}
                            </Text>
                            <Text style={styles.bookmakerOdds}>
                                {bm.player2_odds.toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Info */}
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Sobre las cuotas</Text>
                <Text style={styles.infoText}>
                    Las cuotas muestran las probabilidades implícitas según el mercado. 
                    Cuotas más bajas = mayor probabilidad de ganar según las casas de apuestas.
                </Text>
                {margin > 0 && (
                    <Text style={styles.marginText}>
                        Margen de la casa: {margin.toFixed(1)}%
                    </Text>
                )}
            </View>
        </ScrollView>
    );
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

    // Favorite Card
    favoriteCard: {
        backgroundColor: COLORS.primary + '15',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    favoriteLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        letterSpacing: 1,
        marginBottom: 4,
    },
    favoriteName: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.primary,
        marginBottom: 8,
    },
    favoriteOddsContainer: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    favoriteOdds: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },

    // Card Common
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    cardHeaderIcon: {
        fontSize: 18,
    },
    cardHeaderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },

    // Odds Card
    oddsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    playerOddsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    playerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    playerDotP1: {
        backgroundColor: COLORS.primary,
    },
    playerDotP2: {
        backgroundColor: COLORS.success,
    },
    playerName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
        flex: 1,
    },
    oddsInfo: {
        alignItems: 'flex-end',
    },
    oddsValue: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    oddsValueFavorite: {
        color: COLORS.primary,
    },
    impliedProb: {
        fontSize: 11,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
    },

    // Visual Card
    visualCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    visualTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 12,
        textAlign: 'center',
    },
    visualBar: {
        flexDirection: 'row',
        height: 40,
        borderRadius: 8,
        overflow: 'hidden',
        gap: 2,
    },
    visualBarP1: {
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    visualBarP2: {
        backgroundColor: COLORS.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    visualBarText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    visualValues: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    visualValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    visualValueP1: {
        color: COLORS.primary,
    },
    visualValueP2: {
        color: COLORS.success,
    },

    // Comparison Card
    comparisonCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    comparisonGrid: {
        gap: 0,
    },
    comparisonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    comparisonRowLast: {
        borderBottomWidth: 0,
    },
    comparisonPlayer: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        width: 80,
    },
    comparisonValues: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    comparisonItem: {
        alignItems: 'center',
    },
    comparisonLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    comparisonValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    comparisonModel: {
        color: COLORS.primary,
    },
    comparisonMarket: {
        color: COLORS.textPrimary,
    },
    comparisonDiff: {
        // Color set dynamically
    },
    comparisonHint: {
        fontSize: 11,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },

    // Bookmakers Card
    bookmakersCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    bookmakerHeader: {
        flexDirection: 'row',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    bookmakerHeaderText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    bookmakerRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    bookmakerRowLast: {
        borderBottomWidth: 0,
    },
    bookmakerName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    bookmakerOdds: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },

    // Info Card
    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    marginText: {
        fontSize: 12,
        color: COLORS.warning,
        marginTop: 8,
        fontWeight: '500',
    },
});
