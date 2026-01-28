import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface MarketSummaryProps {
    oddsData: any;
    player1Name: string;
    player2Name: string;
}

export default function MarketSummary({ oddsData, player1Name, player2Name }: MarketSummaryProps) {
    if (!oddsData || !oddsData.bookmakers || oddsData.bookmakers.length === 0) {
        return null;
    }

    // Calculate averages
    const calculateAverages = () => {
        let sum1 = 0, count1 = 0;
        let sum2 = 0, count2 = 0;

        oddsData.bookmakers.forEach((b: any) => {
            if (b.player1_odds) {
                sum1 += b.player1_odds;
                count1++;
            }
            if (b.player2_odds) {
                sum2 += b.player2_odds;
                count2++;
            }
        });

        return {
            avg1: count1 > 0 ? sum1 / count1 : 0,
            avg2: count2 > 0 ? sum2 / count2 : 0,
            count: Math.max(count1, count2)
        };
    };

    // Calculate spread (difference between best and worst odds)
    const calculateSpread = () => {
        const player1Odds = oddsData.bookmakers
            .map((b: any) => b.player1_odds)
            .filter((o: any) => o !== undefined && o !== null);

        if (player1Odds.length === 0) return 0;

        const max = Math.max(...player1Odds);
        const min = Math.min(...player1Odds);
        const spread = ((max - min) / min) * 100;

        return spread;
    };

    const { avg1, avg2, count } = calculateAverages();
    const spread = calculateSpread();

    // Get last update time (if available)
    const getLastUpdate = () => {
        // Assuming timestamp is available in oddsData
        if (oddsData.timestamp) {
            const date = new Date(oddsData.timestamp);
            return date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return 'Ahora';
    };

    const StatRow = ({ label, value }: { label: string; value: string }) => (
        <View style={styles.statRow}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📊 Resumen del Mercado</Text>

            <View style={styles.content}>
                <StatRow
                    label={`Promedio ${player1Name.split(' ').pop()}:`}
                    value={avg1 > 0 ? avg1.toFixed(2) : 'N/A'}
                />
                <StatRow
                    label={`Promedio ${player2Name.split(' ').pop()}:`}
                    value={avg2 > 0 ? avg2.toFixed(2) : 'N/A'}
                />

                <View style={styles.divider} />

                <StatRow
                    label="Spread:"
                    value={`${spread.toFixed(1)}%`}
                />
                <StatRow
                    label="Bookmakers activos:"
                    value={count.toString()}
                />
                <StatRow
                    label="Última actualización:"
                    value={getLastUpdate()}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    content: {
        gap: 12,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        flex: 1,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontFamily: 'RobotoMono-Bold',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 4,
    },
});
