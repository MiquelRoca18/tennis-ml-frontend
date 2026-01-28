/**
 * MatchDetailV2 - Pantalla Principal del Detalle de Partido
 * =========================================================
 * 
 * Componente principal que integra:
 * - MatchHeroV2: Cabecera con score
 * - Tabs de navegación: Overview, Stats, Timeline, H2H
 * 
 * Usa el nuevo endpoint /v2/matches/{id}/full para obtener
 * todos los datos en una sola llamada.
 */

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMatchDetail } from '../../../../src/hooks/useMatchDetail';
import { COLORS } from '../../../../src/utils/constants';
import MatchHeroV2 from './MatchHeroV2';
import H2HTabV2 from './tabs/H2HTabV2';
import OverviewTabV2 from './tabs/OverviewTabV2';
import StatsTabV2 from './tabs/StatsTabV2';
import TimelineTabV2 from './tabs/TimelineTabV2';

const Tab = createMaterialTopTabNavigator();

interface MatchDetailV2Props {
    matchId: number;
}

export default function MatchDetailV2({ matchId }: MatchDetailV2Props) {
    const { data, loading, error, refresh, isLive } = useMatchDetail(matchId);

    // Loading State
    if (loading && !data) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando partido...</Text>
            </View>
        );
    }

    // Error State
    if (error && !data) {
        return (
            <ScrollView 
                style={styles.container}
                contentContainerStyle={styles.centerContainer}
                refreshControl={
                    <RefreshControl 
                        refreshing={loading} 
                        onRefresh={refresh}
                        tintColor={COLORS.primary}
                    />
                }
            >
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Error al cargar</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorHint}>Desliza hacia abajo para reintentar</Text>
            </ScrollView>
        );
    }

    // No data
    if (!data) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorIcon}>🎾</Text>
                <Text style={styles.errorTitle}>Partido no encontrado</Text>
            </View>
        );
    }

    // Determine which tabs to show
    const showStatsTab = data.stats?.has_detailed_stats || false;
    const showTimelineTab = data.timeline && data.timeline.sets.length > 0;
    const showH2HTab = data.h2h && data.h2h.total_matches > 0;

    return (
        <View style={styles.container}>
            {/* Hero Section */}
            <MatchHeroV2 data={data} />

            {/* Live Indicator */}
            {isLive && (
                <View style={styles.liveRefreshIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveRefreshText}>
                        Actualizando automáticamente
                    </Text>
                </View>
            )}

            {/* Tabs */}
            <Tab.Navigator
                screenOptions={{
                    tabBarScrollEnabled: true,
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.textSecondary,
                    tabBarIndicatorStyle: styles.tabIndicator,
                    tabBarStyle: styles.tabBar,
                    tabBarLabelStyle: styles.tabLabel,
                    tabBarItemStyle: styles.tabItem,
                    swipeEnabled: true,
                }}
            >
                <Tab.Screen 
                    name="Overview" 
                    options={{ tabBarLabel: 'RESUMEN' }}
                >
                    {() => <OverviewTabV2 data={data} />}
                </Tab.Screen>

                {showStatsTab && (
                    <Tab.Screen 
                        name="Stats" 
                        options={{ tabBarLabel: 'STATS' }}
                    >
                        {() => <StatsTabV2 data={data} />}
                    </Tab.Screen>
                )}

                {showTimelineTab && (
                    <Tab.Screen 
                        name="Timeline" 
                        options={{ tabBarLabel: 'TIMELINE' }}
                    >
                        {() => <TimelineTabV2 data={data} />}
                    </Tab.Screen>
                )}

                {showH2HTab && (
                    <Tab.Screen 
                        name="H2H" 
                        options={{ tabBarLabel: 'H2H' }}
                    >
                        {() => <H2HTabV2 data={data} />}
                    </Tab.Screen>
                )}
            </Tab.Navigator>
        </View>
    );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
        padding: 20,
    },

    // Loading
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },

    // Error
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 16,
    },
    errorHint: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },

    // Live Indicator
    liveRefreshIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        backgroundColor: COLORS.success + '15',
        gap: 8,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
    },
    liveRefreshText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.success,
    },

    // Tab Bar
    tabBar: {
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        elevation: 0,
        shadowOpacity: 0,
    },
    tabIndicator: {
        backgroundColor: COLORS.primary,
        height: 3,
        borderRadius: 2,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    tabItem: {
        width: 'auto',
        minWidth: 90,
        paddingHorizontal: 16,
    },
});
