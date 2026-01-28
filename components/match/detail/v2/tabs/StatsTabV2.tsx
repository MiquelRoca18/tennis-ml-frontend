/**
 * StatsTabV2 - Tab de Estadísticas Profesional
 * ============================================
 * 
 * Carga estadísticas bajo demanda desde /v2/matches/{id}/stats
 * Muestra barras comparativas organizadas por categorías.
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient from '../../../../../src/services/api/apiClient';
import { MatchFullResponse, MatchStats, getShortName } from '../../../../../src/types/matchDetail';
import { COLORS } from '../../../../../src/utils/constants';

interface StatsTabV2Props {
    data: MatchFullResponse;
}

type StatsCategory = 'general' | 'serve' | 'return' | 'breakpoints';

export default function StatsTabV2({ data }: StatsTabV2Props) {
    const [stats, setStats] = useState<MatchStats | null>(data.stats || null);
    const [loading, setLoading] = useState(!data.stats?.has_detailed_stats);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<StatsCategory>('general');

    const { player1, player2 } = data;
    const p1Short = getShortName(player1.name);
    const p2Short = getShortName(player2.name);

    useEffect(() => {
        // Si ya tenemos stats con datos, no cargar
        if (data.stats?.has_detailed_stats) {
            setStats(data.stats);
            setLoading(false);
            return;
        }
        
        // Cargar stats bajo demanda
        loadStats();
    }, [data.match.id]);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get<MatchStats>(`/v2/matches/${data.match.id}/stats`);
            setStats(response.data);
        } catch (err) {
            setError('Error al cargar estadísticas');
            console.error('Error loading stats:', err);
        } finally {
            setLoading(false);
        }
    };

    // Loading
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando estadísticas...</Text>
            </View>
        );
    }

    // Error or no data
    if (error || !stats || !stats.has_detailed_stats) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>Estadísticas No Disponibles</Text>
                <Text style={styles.emptyText}>
                    Las estadísticas detalladas punto por punto no están disponibles para este partido.
                </Text>
            </View>
        );
    }

    const categories: { id: StatsCategory; label: string; icon: string }[] = [
        { id: 'general', label: 'General', icon: '📊' },
        { id: 'serve', label: 'Saque', icon: '🎾' },
        { id: 'return', label: 'Resto', icon: '↩️' },
        { id: 'breakpoints', label: 'Break Pts', icon: '🎯' },
    ];

    return (
        <View style={styles.container}>
            {/* Category Tabs */}
            <View style={styles.categoryTabs}>
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[
                            styles.categoryTab,
                            category === cat.id && styles.categoryTabActive
                        ]}
                        onPress={() => setCategory(cat.id)}
                    >
                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                        <Text style={[
                            styles.categoryLabel,
                            category === cat.id && styles.categoryLabelActive
                        ]}>
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Stats Content */}
            <ScrollView 
                style={styles.statsScroll}
                contentContainerStyle={styles.statsContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Players Header */}
                <View style={styles.playersHeader}>
                    <Text style={[styles.playerName, styles.playerNameP1]}>{p1Short}</Text>
                    <Text style={styles.playerVs}>vs</Text>
                    <Text style={[styles.playerName, styles.playerNameP2]}>{p2Short}</Text>
                </View>

                {/* Stats by Category */}
                {category === 'general' && <GeneralStats stats={stats} />}
                {category === 'serve' && <ServeStats stats={stats} />}
                {category === 'return' && <ReturnStats stats={stats} />}
                {category === 'breakpoints' && <BreakPointsStats stats={stats} />}
            </ScrollView>
        </View>
    );
}

// ============================================================
// STAT BAR COMPONENT
// ============================================================

interface StatBarProps {
    label: string;
    v1: number;
    v2: number;
    format?: 'number' | 'percent' | 'fraction';
    t1?: number;
    t2?: number;
}

function StatBar({ label, v1, v2, format = 'number', t1, t2 }: StatBarProps) {
    const max = Math.max(v1, v2, 1);
    const pct1 = (v1 / max) * 100;
    const pct2 = (v2 / max) * 100;
    const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;

    const formatValue = (v: number, t?: number) => {
        if (format === 'percent') return `${v}%`;
        if (format === 'fraction' && t !== undefined) {
            const pct = t > 0 ? Math.round((v / t) * 100) : 0;
            return `${v}/${t} (${pct}%)`;
        }
        return v.toString();
    };

    return (
        <View style={styles.statRow}>
            {/* Value P1 */}
            <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, winner === 1 && styles.statValueWinner]}>
                    {formatValue(v1, t1)}
                </Text>
            </View>

            {/* Bar */}
            <View style={styles.statBarContainer}>
                <View style={styles.statBarWrapper}>
                    <View style={[styles.statBarP1, { width: `${pct1}%` }]} />
                </View>
                <Text style={styles.statLabel}>{label}</Text>
                <View style={styles.statBarWrapper}>
                    <View style={[styles.statBarP2, { width: `${pct2}%` }]} />
                </View>
            </View>

            {/* Value P2 */}
            <View style={styles.statValueContainer}>
                <Text style={[styles.statValue, winner === 2 && styles.statValueWinner]}>
                    {formatValue(v2, t2)}
                </Text>
            </View>
        </View>
    );
}

// ============================================================
// STATS SECTIONS
// ============================================================

function GeneralStats({ stats }: { stats: MatchStats }) {
    const p1 = stats.player1;
    const p2 = stats.player2;

    return (
        <View style={styles.statsSection}>
            <StatBar 
                label="Juegos Ganados"
                v1={p1.total_games_won}
                v2={p2.total_games_won}
            />
            <StatBar 
                label="Juegos de Saque Ganados"
                v1={p1.serve.service_games_won}
                v2={p2.serve.service_games_won}
                format="fraction"
                t1={p1.serve.service_games_total}
                t2={p2.serve.service_games_total}
            />
            <StatBar 
                label="Breaks Realizados"
                v1={p1.return?.return_games_won || 0}
                v2={p2.return?.return_games_won || 0}
            />
        </View>
    );
}

function ServeStats({ stats }: { stats: MatchStats }) {
    const p1 = stats.player1;
    const p2 = stats.player2;

    return (
        <View style={styles.statsSection}>
            <StatBar 
                label="Juegos de Saque Ganados"
                v1={p1.serve.service_games_won}
                v2={p2.serve.service_games_won}
                format="fraction"
                t1={p1.serve.service_games_total}
                t2={p2.serve.service_games_total}
            />
        </View>
    );
}

function ReturnStats({ stats }: { stats: MatchStats }) {
    const p1 = stats.player1;
    const p2 = stats.player2;

    return (
        <View style={styles.statsSection}>
            <StatBar 
                label="Breaks Realizados"
                v1={p1.return?.return_games_won || 0}
                v2={p2.return?.return_games_won || 0}
            />
        </View>
    );
}

function BreakPointsStats({ stats }: { stats: MatchStats }) {
    const p1 = stats.player1;
    const p2 = stats.player2;

    return (
        <View style={styles.statsSection}>
            {/* Conversión de BP */}
            <View style={styles.subSectionHeader}>
                <Text style={styles.subSectionTitle}>Conversión de Break Points</Text>
            </View>
            <StatBar 
                label="BP Convertidos"
                v1={p1.break_points.break_points_won}
                v2={p2.break_points.break_points_won}
                format="fraction"
                t1={p1.break_points.break_points_total}
                t2={p2.break_points.break_points_total}
            />
            
            {/* Defensa de BP */}
            <View style={styles.subSectionHeader}>
                <Text style={styles.subSectionTitle}>Defensa de Break Points</Text>
            </View>
            <StatBar 
                label="BP Salvados"
                v1={p1.break_points.break_points_saved}
                v2={p2.break_points.break_points_saved}
                format="fraction"
                t1={p1.break_points.break_points_faced}
                t2={p2.break_points.break_points_faced}
            />
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
        padding: 40,
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textSecondary,
    },

    // Category Tabs
    categoryTabs: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    categoryTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 8,
        gap: 4,
    },
    categoryTabActive: {
        backgroundColor: COLORS.primary + '20',
    },
    categoryIcon: {
        fontSize: 14,
    },
    categoryLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    categoryLabelActive: {
        color: COLORS.primary,
    },

    // Stats Scroll
    statsScroll: {
        flex: 1,
    },
    statsContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // Players Header
    playersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    playerName: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    playerNameP1: {
        color: COLORS.primary,
        textAlign: 'left',
    },
    playerNameP2: {
        color: COLORS.success,
        textAlign: 'right',
    },
    playerVs: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginHorizontal: 16,
    },

    // Stats Section
    statsSection: {
        gap: 16,
    },
    subSectionHeader: {
        marginTop: 12,
        marginBottom: 4,
    },
    subSectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },

    // Stat Row
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 12,
    },
    statValueContainer: {
        width: 70,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    statValueWinner: {
        color: COLORS.textPrimary,
        fontWeight: '700',
    },
    statBarContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginVertical: 4,
        textAlign: 'center',
    },
    statBarWrapper: {
        width: '100%',
        height: 6,
        backgroundColor: COLORS.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    statBarP1: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    statBarP2: {
        height: '100%',
        backgroundColor: COLORS.success,
        borderRadius: 3,
        alignSelf: 'flex-end',
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: COLORS.background,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
