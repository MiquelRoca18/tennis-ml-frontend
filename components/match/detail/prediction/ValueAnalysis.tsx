import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface ValueAnalysisProps {
    prediction: any;
    player1Name: string;
    player2Name: string;
}

export default function ValueAnalysis({ prediction, player1Name, player2Name }: ValueAnalysisProps) {
    const [expanded, setExpanded] = useState(false);

    if (!prediction) return null;

    const ev1 = prediction.jugador1_ev || 0;
    const ev2 = prediction.jugador2_ev || 0;
    const edge1 = prediction.jugador1_edge || 0;
    const edge2 = prediction.jugador2_edge || 0;
    const kelly1 = prediction.kelly_stake_jugador1 || 0;
    const kelly2 = prediction.kelly_stake_jugador2 || 0;

    const formatPercentage = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${(value * 100).toFixed(1)}%`;
    };
    const formatEuro = (value: number) => `${value.toFixed(2)}€`;

    const getEVColor = (ev: number) => {
        if (ev > 0) return COLORS.success;
        if (ev < 0) return COLORS.danger;
        return COLORS.textSecondary;
    };

    const getEVIcon = (ev: number) => {
        if (ev > 0) return '✅';
        if (ev < 0) return '❌';
        return '➖';
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>📊 Análisis de Valor</Text>
                <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>

            {expanded && (
                <View style={styles.content}>
                    {/* Expected Value */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Expected Value (EV)</Text>
                        <View style={styles.row}>
                            <Text style={styles.playerLabel}>{player1Name}:</Text>
                            <View style={styles.valueContainer}>
                                <Text style={[styles.value, { color: getEVColor(ev1) }]}>
                                    {formatPercentage(ev1)}
                                </Text>
                                <Text style={styles.icon}>{getEVIcon(ev1)}</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.playerLabel}>{player2Name}:</Text>
                            <View style={styles.valueContainer}>
                                <Text style={[styles.value, { color: getEVColor(ev2) }]}>
                                    {formatPercentage(ev2)}
                                </Text>
                                <Text style={styles.icon}>{getEVIcon(ev2)}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Edge */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Edge (Ventaja sobre bookmaker)</Text>
                        <View style={styles.row}>
                            <Text style={styles.playerLabel}>{player1Name}:</Text>
                            <Text style={styles.value}>{formatPercentage(edge1)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.playerLabel}>{player2Name}:</Text>
                            <Text style={styles.value}>{formatPercentage(edge2)}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Kelly Criterion - Stake sugerido en € */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Stake sugerido (Kelly)</Text>
                        <View style={styles.row}>
                            <Text style={styles.playerLabel}>{player1Name}:</Text>
                            <Text style={styles.value}>{kelly1 > 0 ? formatEuro(kelly1) : '—'}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.playerLabel}>{player2Name}:</Text>
                            <Text style={styles.value}>{kelly2 > 0 ? formatEuro(kelly2) : '—'}</Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    expandIcon: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    content: {
        padding: 16,
        paddingTop: 0,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    playerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        flex: 1,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    value: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontFamily: 'RobotoMono-Bold',
    },
    icon: {
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 16,
    },
});
