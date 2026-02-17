/**
 * MatchDetailV2 - Pantalla Principal del Detalle de Partido
 * =========================================================
 * 
 * Componente principal que integra:
 * - MatchHeroV2: Cabecera con score
 * - Tabs de navegación: Overview, Stats, H2H
 * 
 * Scroll unificado: toda la pantalla hace scroll (hero, tabs y contenido).
 * Usa el nuevo endpoint /v2/matches/{id}/full para obtener todos los datos.
 */

import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMatchDetail } from '../../../../src/hooks/useMatchDetail';
import { COLORS } from '../../../../src/utils/constants';
import MatchHeroV2 from './MatchHeroV2';
import H2HTabV2 from './tabs/H2HTabV2';
import OddsTabV2 from './tabs/OddsTabV2';
import OverviewTabV2 from './tabs/OverviewTabV2';
import PredictionTabV2 from './tabs/PredictionTabV2';
import StatsTabV2 from './tabs/StatsTabV2';

type TabId = 'Overview' | 'Prediction' | 'Odds' | 'Stats' | 'H2H';

interface MatchDetailV2Props {
    matchId: number;
}

export default function MatchDetailV2({ matchId }: MatchDetailV2Props) {
    const { data, loading, error, refresh, isLive } = useMatchDetail(matchId);
    const [activeTab, setActiveTab] = useState<TabId>('Overview');

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

    const isPending = data.match.status === 'pendiente';

    const tabs: { id: TabId; label: string }[] = [
        { id: 'Overview', label: 'RESUMEN' },
        ...(isPending ? [{ id: 'Prediction' as TabId, label: 'PREDICCIÓN' }, { id: 'Odds' as TabId, label: 'CUOTAS' }] : []),
        ...(!isPending ? [{ id: 'Stats' as TabId, label: 'STATS' }] : []),
        { id: 'H2H', label: 'H2H' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Overview': return <OverviewTabV2 data={data} scrollable={false} />;
            case 'Prediction': return <PredictionTabV2 data={data} scrollable={false} onBetPlaced={refresh} />;
            case 'Odds': return <OddsTabV2 data={data} scrollable={false} />;
            case 'Stats': return <StatsTabV2 data={data} scrollable={false} />;
            case 'H2H': return <H2HTabV2 data={data} scrollable={false} />;
            default: return <OverviewTabV2 data={data} scrollable={false} />;
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={COLORS.primary} />
            }
        >
            {/* Hero Section */}
            <MatchHeroV2 data={data} />

            {/* Live Indicator */}
            {isLive && (
                <View style={styles.liveRefreshIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveRefreshText}>Actualizando automáticamente</Text>
                </View>
            )}

            {/* Custom Tabs */}
            <View style={styles.tabBar}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Text style={[
                            styles.tabLabel,
                            activeTab === tab.id && styles.tabLabelActive
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {/* Tab Content */}
            <View style={styles.tabContent}>
                {renderTabContent()}
            </View>
        </ScrollView>
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

    scrollContent: {
        paddingBottom: 40,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingHorizontal: 8,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabItemActive: {
        borderBottomWidth: 3,
        borderBottomColor: COLORS.primary,
        marginBottom: -1,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: COLORS.textSecondary,
    },
    tabLabelActive: {
        color: COLORS.primary,
    },
    tabContent: {
        minHeight: 400,
    },
});
