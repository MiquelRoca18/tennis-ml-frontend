/**
 * StatsTabV2 - Tab de Estadísticas Profesional
 * ============================================
 * 
 * Muestra todas las estadísticas del partido con barras comparativas
 * organizadas por categorías:
 * - General
 * - Saque
 * - Resto
 * - Break Points
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MatchFullResponse, MatchStats, getShortName, safePercentage } from '../../../../../src/types/matchDetail';
import { COLORS } from '../../../../../src/utils/constants';

interface StatsTabV2Props {
    data: MatchFullResponse;
}

type StatsCategory = 'general' | 'serve' | 'return' | 'breakpoints';

export default function StatsTabV2({ data }: StatsTabV2Props) {
    const { stats, player1, player2 } = data;
    const [category, setCategory] = useState<StatsCategory>('general');

    const p1Short = getShortName(player1.name);
    const p2Short = getShortName(player2.name);

    if (!stats || !stats.has_detailed_stats) {
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
                    <View style={styles.playerNameSpacer} />
                    <Text style={[styles.playerName, styles.playerNameP2]}>{p2Short}</Text>
                </View>

                {category === 'general' && (
                    <GeneralStats stats={stats} />
                )}
                
                {category === 'serve' && (
                    <ServeStats stats={stats} />
                )}
                
                {category === 'return' && (
                    <ReturnStats stats={stats} />
                )}
                
                {category === 'breakpoints' && (
                    <BreakPointsStats stats={stats} />
                )}
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
    higherIsBetter?: boolean;
}

function StatBar({ label, v1, v2, format = 'number', t1, t2, higherIsBetter = true }: StatBarProps) {
    const max = Math.max(v1, v2, 1);
    const pct1 = (v1 / max) * 100;
    const pct2 = (v2 / max) * 100;
    
    const winner = higherIsBetter 
        ? (v1 > v2 ? 1 : v2 > v1 ? 2 : 0)
        : (v1 < v2 ? 1 : v2 < v1 ? 2 : 0);

    const formatValue = (v: number, t?: number): string => {
        switch (format) {
            case 'percent':
                return `${v.toFixed(0)}%`;
            case 'fraction':
                return t !== undefined ? `${v}/${t}` : v.toString();
            default:
                return v.toString();
        }
    };

    return (
        <View style={styles.statBarContainer}>
            {/* Value 1 */}
            <View style={styles.statBarValue}>
                <Text style={[
                    styles.statBarValueText,
                    winner === 1 && styles.statBarValueWinner
                ]}>
                    {formatValue(v1, t1)}
                </Text>
            </View>

            {/* Bars */}
            <View style={styles.statBarCenter}>
                <View style={styles.statBarRow}>
                    {/* P1 Bar (right to left) */}
                    <View style={styles.statBarP1Container}>
                        <View style={[
                            styles.statBarFill,
                            styles.statBarP1,
                            { width: `${pct1}%` }
                        ]} />
                    </View>
                    
                    {/* P2 Bar (left to right) */}
                    <View style={styles.statBarP2Container}>
                        <View style={[
                            styles.statBarFill,
                            styles.statBarP2,
                            { width: `${pct2}%` }
                        ]} />
                    </View>
                </View>
                <Text style={styles.statBarLabel}>{label}</Text>
            </View>

            {/* Value 2 */}
            <View style={styles.statBarValue}>
                <Text style={[
                    styles.statBarValueText,
                    winner === 2 && styles.statBarValueWinner
                ]}>
                    {formatValue(v2, t2)}
                </Text>
            </View>
        </View>
    );
}

// ============================================================
// GENERAL STATS
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
                label="Puntos Totales"
                v1={p1.total_points_won}
                v2={p2.total_points_won}
            />
            {(p1.winners > 0 || p2.winners > 0) && (
                <StatBar 
                    label="Winners"
                    v1={p1.winners}
                    v2={p2.winners}
                />
            )}
            {(p1.unforced_errors > 0 || p2.unforced_errors > 0) && (
                <StatBar 
                    label="Errores No Forzados"
                    v1={p1.unforced_errors}
                    v2={p2.unforced_errors}
                    higherIsBetter={false}
                />
            )}
        </View>
    );
}

// ============================================================
// SERVE STATS
// ============================================================

function ServeStats({ stats }: { stats: MatchStats }) {
    const p1 = stats.player1.serve;
    const p2 = stats.player2.serve;

    return (
        <View style={styles.statsSection}>
            <StatBar 
                label="Aces"
                v1={p1.aces}
                v2={p2.aces}
            />
            <StatBar 
                label="Dobles Faltas"
                v1={p1.double_faults}
                v2={p2.double_faults}
                higherIsBetter={false}
            />
            <StatBar 
                label="% 1er Servicio"
                v1={p1.first_serve_pct}
                v2={p2.first_serve_pct}
                format="percent"
            />
            <StatBar 
                label="% Pts con 1er Servicio"
                v1={p1.first_serve_won_pct}
                v2={p2.first_serve_won_pct}
                format="percent"
            />
            <StatBar 
                label="% Pts con 2do Servicio"
                v1={p1.second_serve_won_pct}
                v2={p2.second_serve_won_pct}
                format="percent"
            />
            <StatBar 
                label="Juegos de Saque Ganados"
                v1={p1.service_games_won}
                v2={p2.service_games_won}
                format="fraction"
                t1={p1.service_games_total}
                t2={p2.service_games_total}
            />
        </View>
    );
}

// ============================================================
// RETURN STATS
// ============================================================

function ReturnStats({ stats }: { stats: MatchStats }) {
    const p1 = stats.player1.return;
    const p2 = stats.player2.return;

    return (
        <View style={styles.statsSection}>
            <StatBar 
                label="Puntos Ganados al Resto"
                v1={p1.return_points_won}
                v2={p2.return_points_won}
                format="fraction"
                t1={p1.return_points_total}
                t2={p2.return_points_total}
            />
            <StatBar 
                label="Juegos de Resto Ganados"
                v1={p1.return_games_won}
                v2={p2.return_games_won}
                format="fraction"
                t1={p1.return_games_total}
                t2={p2.return_games_total}
            />
            {p1.return_points_total > 0 && (
                <StatBar 
                    label="% Puntos al Resto"
                    v1={safePercentage(p1.return_points_won, p1.return_points_total)}
                    v2={safePercentage(p2.return_points_won, p2.return_points_total)}
                    format="percent"
                />
            )}
        </View>
    );
}

// ============================================================
// BREAK POINTS STATS
// ============================================================

function BreakPointsStats({ stats }: { stats: MatchStats }) {
    const p1 = stats.player1.break_points;
    const p2 = stats.player2.break_points;

    return (
        <View style={styles.statsSection}>
            <StatBar 
                label="BP Convertidos"
                v1={p1.break_points_won}
                v2={p2.break_points_won}
                format="fraction"
                t1={p1.break_points_total}
                t2={p2.break_points_total}
            />
            {p1.break_points_total > 0 && (
                <StatBar 
                    label="% Conversión BP"
                    v1={safePercentage(p1.break_points_won, p1.break_points_total)}
                    v2={safePercentage(p2.break_points_won, p2.break_points_total)}
                    format="percent"
                />
            )}
            <StatBar 
                label="BP Enfrentados"
                v1={p1.break_points_faced}
                v2={p2.break_points_faced}
                higherIsBetter={false}
            />
            <StatBar 
                label="BP Salvados"
                v1={p1.break_points_saved}
                v2={p2.break_points_saved}
                format="fraction"
                t1={p1.break_points_faced}
                t2={p2.break_points_faced}
            />
            {p1.break_points_faced > 0 && (
                <StatBar 
                    label="% BP Salvados"
                    v1={safePercentage(p1.break_points_saved, p1.break_points_faced)}
                    v2={safePercentage(p2.break_points_saved, p2.break_points_faced)}
                    format="percent"
                />
            )}
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

    // Category Tabs
    categoryTabs: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    categoryTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
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

    // Stats Content
    statsScroll: {
        flex: 1,
    },
    statsContent: {
        padding: 16,
    },

    // Players Header
    playersHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    playerName: {
        fontSize: 15,
        fontWeight: '700',
    },
    playerNameP1: {
        color: COLORS.primary,
        flex: 1,
    },
    playerNameP2: {
        color: COLORS.success,
        flex: 1,
        textAlign: 'right',
    },
    playerNameSpacer: {
        width: 100,
    },

    // Stats Section
    statsSection: {
        gap: 20,
    },

    // Stat Bar
    statBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statBarValue: {
        width: 50,
    },
    statBarValueText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    statBarValueWinner: {
        color: COLORS.textPrimary,
        fontWeight: '700',
    },
    statBarCenter: {
        flex: 1,
        paddingHorizontal: 12,
    },
    statBarRow: {
        flexDirection: 'row',
        height: 8,
        gap: 2,
    },
    statBarP1Container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: COLORS.border,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        overflow: 'hidden',
    },
    statBarP2Container: {
        flex: 1,
        backgroundColor: COLORS.border,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        overflow: 'hidden',
    },
    statBarFill: {
        height: '100%',
    },
    statBarP1: {
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    statBarP2: {
        backgroundColor: COLORS.success,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    statBarLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 6,
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
