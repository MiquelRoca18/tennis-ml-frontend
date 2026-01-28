import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface MomentumPoint {
    juego: number;
    set: string;
    momentum: number;
    dominando: string;
}

interface MomentumChartProps {
    momentum: MomentumPoint[];
    player1Name: string;
    player2Name: string;
}

export default function MomentumChart({ momentum, player1Name, player2Name }: MomentumChartProps) {
    if (!momentum || momentum.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📈</Text>
                <Text style={styles.emptyText}>No hay datos de momentum disponibles</Text>
            </View>
        );
    }

    const screenWidth = Dimensions.get('window').width;
    const chartWidth = Math.max(screenWidth - 40, momentum.length * 30);
    const chartHeight = 200;
    const maxMomentum = Math.max(...momentum.map(m => Math.abs(m.momentum)));

    // Group by set for visual separation
    const momentumBySet = momentum.reduce((acc, point) => {
        if (!acc[point.set]) {
            acc[point.set] = [];
        }
        acc[point.set].push(point);
        return acc;
    }, {} as Record<string, MomentumPoint[]>);

    const renderBar = (point: MomentumPoint, index: number) => {
        const isPlayer1 = point.dominando === 'jugador1';
        const normalizedHeight = (Math.abs(point.momentum) / maxMomentum) * (chartHeight / 2);
        const barWidth = 20;

        return (
            <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                    {/* Player 1 (top) */}
                    <View style={[styles.barHalf, styles.barTop]}>
                        {isPlayer1 && (
                            <View
                                style={[
                                    styles.bar,
                                    styles.barPlayer1,
                                    {
                                        height: normalizedHeight,
                                        width: barWidth,
                                    }
                                ]}
                            />
                        )}
                    </View>

                    {/* Center line */}
                    <View style={styles.centerLine} />

                    {/* Player 2 (bottom) */}
                    <View style={[styles.barHalf, styles.barBottom]}>
                        {!isPlayer1 && (
                            <View
                                style={[
                                    styles.bar,
                                    styles.barPlayer2,
                                    {
                                        height: normalizedHeight,
                                        width: barWidth,
                                    }
                                ]}
                            />
                        )}
                    </View>
                </View>

                {/* Game label */}
                <Text style={styles.gameLabel}>G{point.juego}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📈 Momentum del Partido</Text>
                <Text style={styles.subtitle}>
                    Muestra quién dominó cada juego
                </Text>
            </View>

            {/* Player labels */}
            <View style={styles.playersContainer}>
                <View style={styles.playerLabel}>
                    <View style={[styles.playerIndicator, styles.player1Indicator]} />
                    <Text style={styles.playerName}>{player1Name.split(' ').pop()}</Text>
                </View>
                <View style={styles.playerLabel}>
                    <View style={[styles.playerIndicator, styles.player2Indicator]} />
                    <Text style={styles.playerName}>{player2Name.split(' ').pop()}</Text>
                </View>
            </View>

            {/* Chart */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chartScroll}
                contentContainerStyle={[styles.chartContent, { width: chartWidth }]}
            >
                {Object.entries(momentumBySet).map(([set, points], setIndex) => (
                    <View key={set} style={styles.setSection}>
                        <Text style={styles.setLabel}>Set {set}</Text>
                        <View style={styles.barsContainer}>
                            {points.map((point, index) => renderBar(point, index))}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Info */}
            <View style={styles.info}>
                <Text style={styles.infoText}>
                    💡 Las barras más altas indican mayor dominio en ese juego
                </Text>
            </View>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    playersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 12,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    playerLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    playerIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    player1Indicator: {
        backgroundColor: COLORS.primary,
    },
    player2Indicator: {
        backgroundColor: COLORS.success,
    },
    playerName: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    chartScroll: {
        backgroundColor: COLORS.background,
    },
    chartContent: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    setSection: {
        marginRight: 20,
    },
    setLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 8,
        textAlign: 'center',
    },
    barsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    barContainer: {
        alignItems: 'center',
        gap: 4,
    },
    barWrapper: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    barHalf: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    barTop: {
        justifyContent: 'flex-end',
    },
    barBottom: {
        justifyContent: 'flex-start',
    },
    centerLine: {
        width: 30,
        height: 2,
        backgroundColor: COLORS.border,
    },
    bar: {
        borderRadius: 4,
    },
    barPlayer1: {
        backgroundColor: COLORS.primary,
    },
    barPlayer2: {
        backgroundColor: COLORS.success,
    },
    gameLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    info: {
        padding: 12,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    infoText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
