/**
 * OddsTabV2 - Tab de Cuotas de Casas de Apuestas
 * ===============================================
 * 
 * Muestra las cuotas de diferentes bookmakers ordenadas de mejor a peor.
 * Obtiene las cuotas directamente de la API Tennis.
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchMatchOddsDetailed, DetailedOddsResponse } from '../../../../../src/services/api/matchDetailService';
import { MatchFullResponse, getShortName } from '../../../../../src/types/matchDetail';
import { COLORS } from '../../../../../src/utils/constants';

interface OddsTabV2Props {
    data: MatchFullResponse;
}

export default function OddsTabV2({ data }: OddsTabV2Props) {
    const [oddsData, setOddsData] = useState<DetailedOddsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { player1, player2 } = data;
    const p1Short = getShortName(player1.name);
    const p2Short = getShortName(player2.name);

    useEffect(() => {
        loadOdds();
    }, [data.match.id]);

    const loadOdds = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchMatchOddsDetailed(data.match.id);
            setOddsData(result);
        } catch (err) {
            setError('Error al cargar las cuotas');
            console.error('Error loading odds:', err);
        } finally {
            setLoading(false);
        }
    };

    // Loading
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando cuotas...</Text>
            </View>
        );
    }

    // Error
    if (error) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>⚠️</Text>
                <Text style={styles.emptyTitle}>Error</Text>
                <Text style={styles.emptyText}>{error}</Text>
            </View>
        );
    }

    // No odds
    if (!oddsData || oddsData.bookmakers.length === 0) {
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

    const bookmakers = oddsData.bookmakers;
    const bestP1 = oddsData.best_odds_player1;
    const bestP2 = oddsData.best_odds_player2;

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Header con mejores cuotas */}
            <View style={styles.bestOddsCard}>
                <Text style={styles.bestOddsTitle}>🏆 Mejores Cuotas Disponibles</Text>
                
                <View style={styles.bestOddsRow}>
                    <View style={styles.bestOddsPlayer}>
                        <Text style={styles.bestOddsName}>{p1Short}</Text>
                        <Text style={styles.bestOddsValue}>
                            {bestP1 ? bestP1.toFixed(2) : '-'}
                        </Text>
                    </View>
                    
                    <View style={styles.bestOddsDivider}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>
                    
                    <View style={styles.bestOddsPlayer}>
                        <Text style={styles.bestOddsName}>{p2Short}</Text>
                        <Text style={styles.bestOddsValue}>
                            {bestP2 ? bestP2.toFixed(2) : '-'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Lista de bookmakers */}
            <View style={styles.bookmakersCard}>
                <View style={styles.bookmakersHeader}>
                    <Text style={styles.bookmakersTitle}>
                        📊 Comparación de Cuotas ({bookmakers.length} casas)
                    </Text>
                    <Text style={styles.bookmakersSubtitle}>
                        Ordenadas de mejor a peor
                    </Text>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.tableColBookmaker]}>
                        Casa de Apuestas
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.tableColOdds]}>
                        {p1Short}
                    </Text>
                    <Text style={[styles.tableHeaderText, styles.tableColOdds]}>
                        {p2Short}
                    </Text>
                </View>

                {/* Bookmaker Rows */}
                {bookmakers.map((bm, index) => {
                    const isP1Best = bm.player1_odds === bestP1 && bm.player1_odds !== null;
                    const isP2Best = bm.player2_odds === bestP2 && bm.player2_odds !== null;
                    
                    return (
                        <View 
                            key={bm.bookmaker + index}
                            style={[
                                styles.tableRow,
                                index === bookmakers.length - 1 && styles.tableRowLast,
                                index === 0 && styles.tableRowFirst
                            ]}
                        >
                            <View style={styles.tableColBookmaker}>
                                <Text style={styles.bookmakerName}>{bm.bookmaker}</Text>
                                {index === 0 && (
                                    <View style={styles.bestBadge}>
                                        <Text style={styles.bestBadgeText}>TOP</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.tableColOdds}>
                                <Text style={[
                                    styles.oddsValue,
                                    isP1Best && styles.oddsValueBest
                                ]}>
                                    {bm.player1_odds ? bm.player1_odds.toFixed(2) : '-'}
                                </Text>
                            </View>
                            <View style={styles.tableColOdds}>
                                <Text style={[
                                    styles.oddsValue,
                                    isP2Best && styles.oddsValueBest
                                ]}>
                                    {bm.player2_odds ? bm.player2_odds.toFixed(2) : '-'}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                    💡 Las cuotas más altas representan mayor potencial de ganancia. 
                    Busca siempre la mejor cuota antes de apostar.
                </Text>
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
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textSecondary,
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

    // Best Odds Card
    bestOddsCard: {
        backgroundColor: COLORS.primary + '15',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    bestOddsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 16,
    },
    bestOddsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bestOddsPlayer: {
        flex: 1,
        alignItems: 'center',
    },
    bestOddsName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    bestOddsValue: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.primary,
    },
    bestOddsDivider: {
        paddingHorizontal: 16,
    },
    vsText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },

    // Bookmakers Card
    bookmakersCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    bookmakersHeader: {
        marginBottom: 16,
    },
    bookmakersTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    bookmakersSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },

    // Table
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.background,
        borderRadius: 8,
        marginBottom: 4,
    },
    tableHeaderText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tableColBookmaker: {
        flex: 2,
        paddingLeft: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tableColOdds: {
        flex: 1,
        alignItems: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    tableRowLast: {
        borderBottomWidth: 0,
    },
    tableRowFirst: {
        backgroundColor: COLORS.success + '10',
        borderRadius: 8,
        marginHorizontal: -8,
        paddingHorizontal: 8,
    },
    bookmakerName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    bestBadge: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    bestBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFF',
    },
    oddsValue: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    oddsValueBest: {
        color: COLORS.success,
        fontWeight: '800',
    },

    // Info Card
    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
});
