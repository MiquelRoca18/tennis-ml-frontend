import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchMultiOdds } from '../../../../src/services/api/oddsService';
import { COLORS } from '../../../../src/utils/constants';
import BestOdds from '../odds/BestOdds';
import MarketSummary from '../odds/MarketSummary';
import OddsComparison from '../odds/OddsComparison';

interface OddsTabProps {
    match: any;
}

export default function OddsTab({ match }: OddsTabProps) {
    const { jugador1, jugador2 } = match;
    const [oddsData, setOddsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOdds();
    }, [match.id]);

    const loadOdds = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetchMultiOdds(match.id);
            const data: any = response;

            // Normalize data structure (same logic as MultiBookmakerOdds)
            let normalizedData: any = {
                match_id: data.match_id,
                total_bookmakers: 0,
                bookmakers: []
            };

            // Check if we have the new format (odds array with selection field)
            if ('odds' in data && Array.isArray(data.odds) && data.odds.length > 0) {
                // Group odds by bookmaker
                const bookmakerMap = new Map<string, { player1?: number; player2?: number }>();

                data.odds.forEach((odd: any) => {
                    const bookmakerName = odd.bookmaker;
                    const selection = odd.selection;
                    const oddsValue = odd.odds;

                    if (!bookmakerMap.has(bookmakerName)) {
                        bookmakerMap.set(bookmakerName, {});
                    }

                    const entry = bookmakerMap.get(bookmakerName)!;

                    // Determine if this is player1 or player2
                    if (selection === jugador1.nombre || selection.includes(jugador1.nombre.split(' ').pop() || '')) {
                        entry.player1 = oddsValue;
                    } else if (selection === jugador2.nombre || selection.includes(jugador2.nombre.split(' ').pop() || '')) {
                        entry.player2 = oddsValue;
                    }
                });

                // Convert map to array
                normalizedData.bookmakers = Array.from(bookmakerMap.entries())
                    .filter(([_, entry]) => entry.player1 !== undefined && entry.player2 !== undefined)
                    .map(([bookmakerName, entry]) => ({
                        bookmaker: bookmakerName,
                        player1_odds: entry.player1,
                        player2_odds: entry.player2,
                    }));

                normalizedData.total_bookmakers = normalizedData.bookmakers.length;
            }
            // Check if we have the old format (bookmakers array)
            else if ('bookmakers' in data && Array.isArray(data.bookmakers)) {
                normalizedData.total_bookmakers = data.total_bookmakers || data.bookmakers.length;
                normalizedData.bookmakers = data.bookmakers;
            }

            setOddsData(normalizedData);
            setLoading(false);
        } catch (err: any) {
            console.error('Error loading odds:', err);
            setError(err.message || 'Error al cargar las cuotas');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando cuotas...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!oddsData || !oddsData.bookmakers || oddsData.bookmakers.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💰</Text>
                <Text style={styles.emptyTitle}>Cuotas No Disponibles</Text>
                <Text style={styles.emptyText}>
                    No hay cuotas disponibles para este partido en este momento.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Best Odds - Highlighted */}
            <BestOdds
                oddsData={oddsData}
                player1Name={jugador1.nombre}
                player2Name={jugador2.nombre}
            />

            {/* Odds Comparison - Detailed List */}
            <OddsComparison
                oddsData={oddsData}
                player1Name={jugador1.nombre}
                player2Name={jugador2.nombre}
            />

            {/* Market Summary */}
            <MarketSummary
                oddsData={oddsData}
                player1Name={jugador1.nombre}
                player2Name={jugador2.nombre}
            />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 16,
    },
    errorIcon: {
        fontSize: 64,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.danger,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 16,
    },
    emptyIcon: {
        fontSize: 64,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
