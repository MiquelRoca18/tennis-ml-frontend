import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
    fetchBreakPointsStats,
    fetchMatchStatsDetailed,
    fetchMatchStatsSummary
} from '../../../../src/services/api/matchService';
import { COLORS } from '../../../../src/utils/constants';
import BreakPointsStats from '../stats/BreakPointsStats';
import GeneralStats from '../stats/GeneralStats';
import ReturnStats from '../stats/ReturnStats';
import ServeStats from '../stats/ServeStats';
import SetBySetBreakdown from '../stats/SetBySetBreakdown';

const Tab = createMaterialTopTabNavigator();

interface StatsTabProps {
    match: any;
}

export default function StatsTab({ match }: StatsTabProps) {
    const { jugador1, jugador2 } = match;
    const [matchDetails, setMatchDetails] = useState<any>(null);
    const [breakPointsStats, setBreakPointsStats] = useState<any>(null);
    const [detailedStats, setDetailedStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllStats();
    }, [match.id]);

    const loadAllStats = async () => {
        try {
            setLoading(true);

            console.log('🔍 Loading stats for match:', match.id);

            const [summary, breakPoints, detailed] = await Promise.all([
                fetchMatchStatsSummary(match.id).catch((err) => {
                    console.error('❌ Error loading summary:', err);
                    return null;
                }),
                fetchBreakPointsStats(match.id).catch((err) => {
                    console.error('❌ Error loading break points:', err);
                    return null;
                }),
                fetchMatchStatsDetailed(match.id).catch((err) => {
                    console.error('❌ Error loading detailed stats:', err);
                    return null;
                })
            ]);

            console.log('📊 Stats loaded:');
            console.log('  - Summary:', summary ? 'YES' : 'NO', summary);
            console.log('  - Break Points:', breakPoints ? 'YES' : 'NO', breakPoints);
            console.log('  - Detailed:', detailed ? 'YES' : 'NO', detailed);

            setMatchDetails(summary);
            setBreakPointsStats(breakPoints);
            setDetailedStats(detailed);
            setLoading(false);
        } catch (err) {
            console.error('❌ Error loading stats:', err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando estadísticas...</Text>
            </View>
        );
    }

    // Check if backend explicitly says no data available
    const hasNoData = matchDetails?.has_data === false &&
        breakPointsStats?.has_data === false &&
        detailedStats?.has_data === false;

    if (hasNoData || (!matchDetails && !breakPointsStats && !detailedStats)) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>Estadísticas No Disponibles</Text>
                <Text style={styles.emptyText}>
                    {matchDetails?.message ||
                        'Las estadísticas punto por punto no están disponibles para este partido. Esto puede ocurrir si el partido no tiene datos detallados registrados.'}
                </Text>
            </View>
        );
    }

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarScrollEnabled: true,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarIndicatorStyle: styles.indicator,
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabLabel,
                tabBarItemStyle: styles.tabItem,
                swipeEnabled: true,
            }}
        >
            <Tab.Screen name="General" options={{ tabBarLabel: 'GENERAL' }}>
                {() => (
                    <GeneralStats
                        matchDetails={matchDetails}
                        player1Name={jugador1.nombre}
                        player2Name={jugador2.nombre}
                    />
                )}
            </Tab.Screen>

            <Tab.Screen name="Serve" options={{ tabBarLabel: 'SAQUE' }}>
                {() => (
                    <ServeStats
                        matchDetails={matchDetails}
                        player1Name={jugador1.nombre}
                        player2Name={jugador2.nombre}
                    />
                )}
            </Tab.Screen>

            <Tab.Screen name="Return" options={{ tabBarLabel: 'RESTO' }}>
                {() => (
                    <ReturnStats
                        matchDetails={matchDetails}
                        player1Name={jugador1.nombre}
                        player2Name={jugador2.nombre}
                    />
                )}
            </Tab.Screen>

            <Tab.Screen name="BreakPoints" options={{ tabBarLabel: 'BREAK PTS' }}>
                {() => (
                    <View style={styles.tabContent}>
                        {(breakPointsStats?.break_points_stats || matchDetails?.summary) ? (
                            <BreakPointsStats
                                breakPoints={breakPointsStats?.break_points_stats?.player1 ? breakPointsStats.break_points_stats : matchDetails?.summary}
                                player1Name={jugador1.nombre}
                                player2Name={jugador2.nombre}
                            />
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>
                                    No hay estadísticas de break points disponibles
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </Tab.Screen>

            <Tab.Screen name="Sets" options={{ tabBarLabel: 'SETS' }}>
                {() => (
                    <View style={styles.tabContent}>
                        {detailedStats ? (
                            <SetBySetBreakdown
                                stats={detailedStats}
                                player1Name={jugador1.nombre}
                                player2Name={jugador2.nombre}
                            />
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>
                                    No hay desglose por sets disponible
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        elevation: 0,
        shadowOpacity: 0,
    },
    indicator: {
        backgroundColor: COLORS.primary,
        height: 3,
        borderRadius: 2,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    tabItem: {
        width: 'auto',
        minWidth: 80,
    },
    tabContent: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
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
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
});
