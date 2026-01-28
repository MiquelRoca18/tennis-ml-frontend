import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../src/utils/constants';

interface MatchesSummaryProps {
    summary: {
        total_partidos: number;
        completados: number;
        en_juego: number;
        pendientes: number;
    };
    date: string;
    isToday: boolean;
}

export default function MatchesSummary({ summary, date, isToday }: MatchesSummaryProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {isToday ? '📅 Partidos de Hoy' : `📅 ${date}`}
                </Text>
                <Text style={styles.total}>{summary.total_partidos} partidos</Text>
            </View>

            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <View style={[styles.statDot, styles.completedDot]} />
                    <Text style={styles.statLabel}>Completados</Text>
                    <Text style={styles.statValue}>{summary.completados}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                    <View style={[styles.statDot, styles.liveDot]} />
                    <Text style={styles.statLabel}>En Juego</Text>
                    <Text style={styles.statValue}>{summary.en_juego}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                    <View style={[styles.statDot, styles.pendingDot]} />
                    <Text style={styles.statLabel}>Pendientes</Text>
                    <Text style={styles.statValue}>{summary.pendientes}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    total: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    statDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    completedDot: {
        backgroundColor: COLORS.success,
    },
    liveDot: {
        backgroundColor: COLORS.danger,
    },
    pendingDot: {
        backgroundColor: COLORS.textSecondary,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: COLORS.border,
    },
});
