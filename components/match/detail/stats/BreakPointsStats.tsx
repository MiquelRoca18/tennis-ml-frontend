import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface BreakPointsStatsProps {
    breakPoints: any; // Flexible to handle different API structures
    player1Name: string;
    player2Name: string;
}

export default function BreakPointsStats({
    breakPoints,
    player1Name,
    player2Name
}: BreakPointsStatsProps) {

    // Extract player stats with safe fallbacks
    const getPlayerStats = (playerKey: string) => {
        const stats = breakPoints?.[playerKey] || breakPoints?.player1 || breakPoints?.player2 || {};

        return {
            break_points_faced: stats.break_points_faced || stats.break_points_enfrentados || 0,
            break_points_saved: stats.break_points_saved || stats.break_points_salvados || 0,
            break_points_lost: stats.break_points_lost || stats.break_points_perdidos || 0,
            save_percentage: stats.save_percentage || stats.porcentaje_salvados || 0,
            break_points_won: stats.break_points_won || stats.break_points_convertidos || 0,
            break_points_total: stats.break_points_total || stats.break_points_a_favor || 0,
            conversion_percentage: stats.conversion_percentage || stats.porcentaje_conversion || 0,
        };
    };

    const player1Stats = getPlayerStats('player1');
    const player2Stats = getPlayerStats('player2');

    // Check if we have any valid data
    const hasData = player1Stats.break_points_faced > 0 || player2Stats.break_points_faced > 0;

    if (!hasData) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>🎯 Estadísticas de Break Points</Text>
                </View>
                <View style={styles.content}>
                    <Text style={styles.noDataText}>
                        No hay estadísticas de break points disponibles
                    </Text>
                </View>
            </View>
        );
    }

    const renderPlayerStats = (
        playerName: string,
        stats: {
            break_points_faced: number;
            break_points_saved: number;
            break_points_lost: number;
            save_percentage: number;
            break_points_won: number;
            break_points_total: number;
            conversion_percentage: number;
        }
    ) => {
        return (
            <View style={styles.playerSection}>
                <Text style={styles.playerName}>{playerName}</Text>

                {/* Break Points Faced/Saved */}
                <View style={styles.statItem}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statLabel}>Break Points Enfrentados</Text>
                        <Text style={styles.statValue}>{stats.break_points_faced}</Text>
                    </View>
                </View>

                <View style={styles.statItem}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statLabel}>Break Points Salvados</Text>
                        <Text style={styles.statValue}>
                            {stats.break_points_saved}/{stats.break_points_faced} ({stats.save_percentage.toFixed(0)}%)
                        </Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                styles.progressSaved,
                                { width: `${Math.min(stats.save_percentage, 100)}%` }
                            ]}
                        />
                    </View>
                </View>

                {/* Break Points Won/Conversion */}
                <View style={styles.statItem}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statLabel}>Break Points Convertidos</Text>
                        <Text style={styles.statValue}>
                            {stats.break_points_won}/{stats.break_points_total} ({stats.conversion_percentage.toFixed(0)}%)
                        </Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                styles.progressConverted,
                                { width: `${Math.min(stats.conversion_percentage, 100)}%` }
                            ]}
                        />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🎯 Estadísticas de Break Points</Text>
            </View>

            <View style={styles.content}>
                {renderPlayerStats(player1Name, player1Stats)}

                <View style={styles.divider} />

                {renderPlayerStats(player2Name, player2Stats)}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    header: {
        backgroundColor: COLORS.surfaceElevated,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    content: {
        padding: 16,
    },
    playerSection: {
        gap: 12,
    },
    playerName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    statItem: {
        gap: 6,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    statValue: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    progressBar: {
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressSaved: {
        backgroundColor: COLORS.success,
    },
    progressConverted: {
        backgroundColor: COLORS.primary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 20,
    },
    noDataText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        padding: 20,
    },
});
