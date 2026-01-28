import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { StyleSheet } from 'react-native';
import { COLORS } from '../../../src/utils/constants';
import LiveTab from './tabs/LiveTab';
import OddsTab from './tabs/OddsTab';
import OverviewTab from './tabs/OverviewTab';
import PredictionTab from './tabs/PredictionTab';
import StatsTab from './tabs/StatsTab';

const Tab = createMaterialTopTabNavigator();

interface MatchTabsProps {
    match: any;
    matchDetails?: any;
    matchAnalysis?: any;
}

export default function MatchTabs({ match, matchDetails, matchAnalysis }: MatchTabsProps) {
    const isCompleted = match.estado === 'completado';
    const isLive = match.estado === 'en_juego' || match.is_live === '1';
    const isPending = match.estado === 'pendiente';

    // Determine which tabs to show based on match state
    const showStatsTab = isCompleted || isLive;
    const showLiveTab = (isCompleted || isLive) && (matchAnalysis?.timeline || matchDetails?.has_data);

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
            <Tab.Screen
                name="Overview"
                options={{ tabBarLabel: 'OVERVIEW' }}
            >
                {() => <OverviewTab match={match} matchDetails={matchDetails} />}
            </Tab.Screen>

            <Tab.Screen
                name="Prediction"
                options={{ tabBarLabel: 'PREDICCIÓN' }}
            >
                {() => <PredictionTab match={match} />}
            </Tab.Screen>

            <Tab.Screen
                name="Odds"
                options={{ tabBarLabel: 'CUOTAS' }}
            >
                {() => <OddsTab match={match} />}
            </Tab.Screen>

            {showStatsTab && (
                <Tab.Screen
                    name="Stats"
                    options={{ tabBarLabel: 'STATS' }}
                >
                    {() => <StatsTab match={match} />}
                </Tab.Screen>
            )}

            {showLiveTab && (
                <Tab.Screen
                    name="Live"
                    options={{ tabBarLabel: 'LIVE' }}
                >
                    {() => <LiveTab match={match} matchAnalysis={matchAnalysis} />}
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
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    tabItem: {
        width: 'auto',
        minWidth: 90,
    },
});
