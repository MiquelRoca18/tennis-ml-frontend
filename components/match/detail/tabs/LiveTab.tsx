import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { fetchMatchGames, fetchPointByPoint } from '../../../../src/services/api/matchService';
import { COLORS } from '../../../../src/utils/constants';
import GameTimeline from '../live/GameTimeline';
import KeyPoints from '../live/KeyPoints';
import MomentumChart from '../live/MomentumChart';
import PointByPointView from '../live/PointByPointView';

const Tab = createMaterialTopTabNavigator();

interface LiveTabProps {
    match: any;
    matchAnalysis?: any;
}

export default function LiveTab({ match, matchAnalysis }: LiveTabProps) {
    const { jugador1, jugador2 } = match;
    const [gamesData, setGamesData] = useState<any>(null);
    const [pointByPointData, setPointByPointData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLiveData();
    }, [match.id]);

    const loadLiveData = async () => {
        try {
            setLoading(true);

            // Load games and point by point data in parallel
            const [games, points] = await Promise.all([
                fetchMatchGames(match.id).catch(() => null),
                fetchPointByPoint(match.id).catch(() => null)
            ]);

            setGamesData(games);
            setPointByPointData(points);
            setLoading(false);
        } catch (err) {
            console.error('Error loading live data:', err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando datos en vivo...</Text>
            </View>
        );
    }

    const hasTimelineData = gamesData?.games && gamesData.games.length > 0;
    const hasKeyPoints = matchAnalysis?.puntos_clave && matchAnalysis.puntos_clave.length > 0;
    const hasPointByPoint = pointByPointData?.points && pointByPointData.points.length > 0;
    const hasMomentum = matchAnalysis?.momentum && matchAnalysis.momentum.length > 0;

    if (!hasTimelineData && !hasKeyPoints && !hasPointByPoint && !hasMomentum) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>⚡</Text>
                <Text style={styles.emptyTitle}>Datos en Vivo No Disponibles</Text>
                <Text style={styles.emptyText}>
                    Los datos punto por punto estarán disponibles cuando el partido esté en juego o completado.
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
            {hasTimelineData && (
                <Tab.Screen name="Timeline" options={{ tabBarLabel: 'TIMELINE' }}>
                    {() => (
                        <View style={styles.tabContent}>
                            <GameTimeline
                                games={gamesData.games as any}
                                player1Name={jugador1.nombre}
                                player2Name={jugador2.nombre}
                            />
                        </View>
                    )}
                </Tab.Screen>
            )}

            {hasPointByPoint && (
                <Tab.Screen name="PointByPoint" options={{ tabBarLabel: 'PUNTO X PUNTO' }}>
                    {() => (
                        <PointByPointView
                            matchId={match.id}
                            points={pointByPointData.points}
                            player1Name={jugador1.nombre}
                            player2Name={jugador2.nombre}
                        />
                    )}
                </Tab.Screen>
            )}

            {hasMomentum && (
                <Tab.Screen name="Momentum" options={{ tabBarLabel: 'MOMENTUM' }}>
                    {() => (
                        <View style={styles.tabContent}>
                            <MomentumChart
                                momentum={matchAnalysis.momentum}
                                player1Name={jugador1.nombre}
                                player2Name={jugador2.nombre}
                            />
                        </View>
                    )}
                </Tab.Screen>
            )}

            {hasKeyPoints && (
                <Tab.Screen name="KeyPoints" options={{ tabBarLabel: 'PUNTOS CLAVE' }}>
                    {() => <KeyPoints matchAnalysis={matchAnalysis} />}
                </Tab.Screen>
            )}
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
        minWidth: 100,
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
});
