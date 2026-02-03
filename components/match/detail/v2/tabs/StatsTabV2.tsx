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
    /** Si false, el contenido no usa ScrollView propio (scroll unificado en padre) */
    scrollable?: boolean;
}

type StatsCategory = 'general' | 'serve' | 'return' | 'breakpoints' | 'points';

export default function StatsTabV2({ data, scrollable = true }: StatsTabV2Props) {
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
            // DEBUG: Ver qué devuelve la API
            if (__DEV__) {
                console.log('[StatsTabV2] API /v2/matches/' + data.match.id + '/stats response:', JSON.stringify(response.data, null, 2));
                console.log('[StatsTabV2] has_detailed_stats:', response.data?.has_detailed_stats);
            }
            setStats(response.data);
        } catch (err: any) {
            setError('Error al cargar estadísticas');
            console.error('[StatsTabV2] Error loading stats:', err?.response?.status, err?.response?.data, err?.message);
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
        { id: 'general', label: 'Resumen', icon: '📊' },
        { id: 'serve', label: 'Saque', icon: '🎾' },
        { id: 'return', label: 'Resto', icon: '↩️' },
        { id: 'breakpoints', label: 'Break Pts', icon: '🎯' },
        { id: 'points', label: 'Puntos', icon: '⚡' },
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
            {scrollable ? (
            <ScrollView 
                style={styles.statsScroll}
                contentContainerStyle={styles.statsContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.categoryCard}>
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
                {category === 'points' && <PointsStats stats={stats} />}
                </View>
            </ScrollView>
            ) : (
                <View style={[styles.statsScroll, styles.statsContent]}>
                    <View style={styles.categoryCard}>
                        <View style={styles.playersHeader}>
                            <Text style={[styles.playerName, styles.playerNameP1]}>{p1Short}</Text>
                            <Text style={styles.playerVs}>vs</Text>
                            <Text style={[styles.playerName, styles.playerNameP2]}>{p2Short}</Text>
                        </View>
                        {category === 'general' && <GeneralStats stats={stats} />}
                        {category === 'serve' && <ServeStats stats={stats} />}
                        {category === 'return' && <ReturnStats stats={stats} />}
                        {category === 'breakpoints' && <BreakPointsStats stats={stats} />}
                        {category === 'points' && <PointsStats stats={stats} />}
                    </View>
                </View>
            )}
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
    format?: 'number' | 'percent' | 'fraction' | 'speed';
    t1?: number;
    t2?: number;
    hideBar?: boolean;
    /** Si true, destaca como stat principal (tamaño mayor, borde) */
    primary?: boolean;
}

function StatBar({ label, v1, v2, format = 'number', t1, t2, hideBar, primary }: StatBarProps) {
    const max = Math.max(v1, v2, 1);
    const pct1 = (v1 / max) * 100;
    const pct2 = (v2 / max) * 100;
    const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;

    const formatValue = (v: number, t?: number) => {
        if (format === 'percent') return `${v}%`;
        if (format === 'speed') return `${v} km/h`;
        if (format === 'fraction' && t !== undefined) {
            const pct = t > 0 ? Math.round((v / t) * 100) : 0;
            return `${v}/${t} (${pct}%)`;
        }
        return v.toString();
    };

    return (
        <View style={[styles.statRow, primary && styles.statRowPrimary]}>
            <View style={styles.statValueContainer}>
                <Text style={[
                    styles.statValue,
                    primary && styles.statValuePrimary,
                    winner === 1 && styles.statValueWinner
                ]}>
                    {formatValue(v1, t1)}
                </Text>
            </View>
            <View style={styles.statBarContainer}>
                {!hideBar && (
                    <>
                        <View style={styles.statBarWrapper}>
                            <View style={[styles.statBarP1, { width: `${pct1}%` }]} />
                        </View>
                        <Text style={[styles.statLabel, primary && styles.statLabelPrimary]}>{label}</Text>
                        <View style={styles.statBarWrapper}>
                            <View style={[styles.statBarP2, { width: `${pct2}%` }]} />
                        </View>
                    </>
                )}
                {hideBar && <Text style={[styles.statLabel, primary && styles.statLabelPrimary]}>{label}</Text>}
            </View>
            <View style={styles.statValueContainer}>
                <Text style={[
                    styles.statValue,
                    primary && styles.statValuePrimary,
                    winner === 2 && styles.statValueWinner
                ]}>
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
            <Text style={styles.sectionHeader}>Resumen del partido</Text>
            <StatBar label="Puntos" v1={p1.total_points_won} v2={p2.total_points_won} primary />
            <StatBar label="Juegos" v1={p1.total_games_won} v2={p2.total_games_won} />
            <StatBar
                label="Juegos saque"
                v1={p1.serve.service_games_won}
                v2={p2.serve.service_games_won}
                format="fraction"
                t1={p1.serve.service_games_total}
                t2={p2.serve.service_games_total}
            />
            <StatBar
                label="Breaks"
                v1={p1.return?.return_games_won ?? 0}
                v2={p2.return?.return_games_won ?? 0}
                format="fraction"
                t1={p1.return?.return_games_total}
                t2={p2.return?.return_games_total}
                primary
            />
        </View>
    );
}

function StatBlock({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.statBlock}>
            <Text style={styles.statBlockTitle}>{title}</Text>
            <View style={styles.statBlockContent}>{children}</View>
        </View>
    );
}

function ServeStats({ stats }: { stats: MatchStats }) {
    const p1 = stats.player1;
    const p2 = stats.player2;

    return (
        <View style={styles.statsSection}>
            <Text style={styles.sectionHeader}>Saque</Text>

            <StatBlock title="Conteos">
                <StatBar label="Aces" v1={p1.serve.aces} v2={p2.serve.aces} primary />
                <StatBar label="Dobles faltas" v1={p1.serve.double_faults} v2={p2.serve.double_faults} />
            </StatBlock>

            <StatBlock title="1er saque">
                <StatBar
                    label="% 1er saque"
                    v1={Math.round(p1.serve.first_serve_pct)}
                    v2={Math.round(p2.serve.first_serve_pct)}
                    format="percent"
                />
                <StatBar
                    label="% pts ganados"
                    v1={Math.round(p1.serve.first_serve_won_pct)}
                    v2={Math.round(p2.serve.first_serve_won_pct)}
                    format="percent"
                />
            </StatBlock>

            <StatBlock title="2do saque">
                <StatBar
                    label="% pts 2do saque"
                    v1={Math.round(p1.serve.second_serve_won_pct)}
                    v2={Math.round(p2.serve.second_serve_won_pct)}
                    format="percent"
                />
            </StatBlock>

            <StatBlock title="Puntos y juegos">
                <StatBar
                    label="Pts saque"
                v1={p1.serve.service_points_won ?? 0}
                v2={p2.serve.service_points_won ?? 0}
                format="fraction"
                t1={p1.serve.service_points_total}
                t2={p2.serve.service_points_total}
            />
            <StatBar
                label="Juegos saque"
                v1={p1.serve.service_games_won}
                v2={p2.serve.service_games_won}
                format="fraction"
                t1={p1.serve.service_games_total}
                t2={p2.serve.service_games_total}
            />
            </StatBlock>

            {((p1.serve.avg_first_serve_speed_kmh ?? 0) > 0 || (p2.serve.avg_first_serve_speed_kmh ?? 0) > 0) && (
                <StatBlock title="Velocidad">
                <StatBar
                    label="1er saque"
                    v1={p1.serve.avg_first_serve_speed_kmh ?? 0}
                    v2={p2.serve.avg_first_serve_speed_kmh ?? 0}
                    format="speed"
                />
                {((p1.serve.avg_second_serve_speed_kmh ?? 0) > 0 || (p2.serve.avg_second_serve_speed_kmh ?? 0) > 0) && (
                    <StatBar
                        label="2do saque"
                        v1={p1.serve.avg_second_serve_speed_kmh ?? 0}
                        v2={p2.serve.avg_second_serve_speed_kmh ?? 0}
                        format="speed"
                    />
                )}
                </StatBlock>
            )}
        </View>
    );
}

function ReturnStats({ stats }: { stats: MatchStats }) {
    const p1 = stats.player1;
    const p2 = stats.player2;

    return (
        <View style={styles.statsSection}>
            <Text style={styles.sectionHeader}>Resto</Text>

            <StatBlock title="1er resto">
                <StatBar
                    label="% pts ganados"
                    v1={Math.round(p1.return?.first_return_points_won_pct ?? 0)}
                    v2={Math.round(p2.return?.first_return_points_won_pct ?? 0)}
                    format="percent"
                />
            </StatBlock>

            <StatBlock title="2do resto">
                <StatBar
                    label="% pts ganados"
                    v1={Math.round(p1.return?.second_return_points_won_pct ?? 0)}
                    v2={Math.round(p2.return?.second_return_points_won_pct ?? 0)}
                    format="percent"
                />
            </StatBlock>

            <StatBlock title="Puntos y breaks">
                <StatBar
                    label="Pts resto"
                    v1={p1.return?.return_points_won ?? 0}
                    v2={p2.return?.return_points_won ?? 0}
                    format="fraction"
                    t1={p1.return?.return_points_total}
                    t2={p2.return?.return_points_total}
                />
                <StatBar
                    label="Breaks"
                    v1={p1.return?.return_games_won ?? 0}
                    v2={p2.return?.return_games_won ?? 0}
                    format="fraction"
                    t1={p1.return?.return_games_total}
                    t2={p2.return?.return_games_total}
                    primary
                />
            </StatBlock>
        </View>
    );
}

function BreakPointsStats({ stats }: { stats: MatchStats }) {
    const p1 = stats.player1;
    const p2 = stats.player2;

    return (
        <View style={styles.statsSection}>
            <Text style={styles.sectionHeader}>Break Points</Text>
            <View style={styles.subSectionHeader}>
                <Text style={styles.subSectionTitle}>Conversión</Text>
            </View>
            <StatBar
                label="BP convertidos"
                v1={p1.break_points.break_points_won}
                v2={p2.break_points.break_points_won}
                format="fraction"
                t1={p1.break_points.break_points_total}
                t2={p2.break_points.break_points_total}
            />
            <View style={styles.subSectionHeader}>
                <Text style={styles.subSectionTitle}>Defensa</Text>
            </View>
            <StatBar
                label="BP salvados"
                v1={p1.break_points.break_points_saved}
                v2={p2.break_points.break_points_saved}
                format="fraction"
                t1={p1.break_points.break_points_faced}
                t2={p2.break_points.break_points_faced}
            />
        </View>
    );
}

function StatCompact({ label, v1, v2 }: { label: string; v1: number; v2: number }) {
    const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;
    return (
        <View style={styles.statCompact}>
            <Text style={[styles.statCompactValue, winner === 1 && styles.statValueWinner]}>{v1}</Text>
            <Text style={styles.statCompactLabel}>{label}</Text>
            <Text style={[styles.statCompactValue, winner === 2 && styles.statValueWinner]}>{v2}</Text>
        </View>
    );
}

function PointsStats({ stats }: { stats: MatchStats }) {
    const p1 = stats.player1;
    const p2 = stats.player2;
    const wue1 = p1.winners - p1.unforced_errors;
    const wue2 = p2.winners - p2.unforced_errors;

    return (
        <View style={styles.statsSection}>
            <Text style={styles.sectionHeader}>Puntos y juego</Text>

            <View style={styles.statGrid}>
                <StatCompact label="Winners" v1={p1.winners} v2={p2.winners} />
                <StatCompact label="Errores" v1={p1.unforced_errors} v2={p2.unforced_errors} />
                <StatCompact label="Winners - UE" v1={wue1} v2={wue2} />
            </View>

            {((p1.net_points_total ?? 0) > 0 || (p2.net_points_total ?? 0) > 0) && (
                <StatBar
                    label="Pts en la red"
                    v1={p1.net_points_won ?? 0}
                    v2={p2.net_points_won ?? 0}
                    format="fraction"
                    t1={p1.net_points_total}
                    t2={p2.net_points_total}
                />
            )}
            {(p1.last_10_balls != null || p2.last_10_balls != null) && (
                <StatBar
                    label="Últimos 10 pts"
                    v1={p1.last_10_balls ?? 0}
                    v2={p2.last_10_balls ?? 0}
                />
            )}
            {((p1.match_points_saved ?? 0) > 0 || (p2.match_points_saved ?? 0) > 0) && (
                <StatBar
                    label="Match points salvados"
                    v1={p1.match_points_saved ?? 0}
                    v2={p2.match_points_saved ?? 0}
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

    // Category Tabs - Ocupan todo el ancho disponible
    categoryTabs: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    categoryTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 4,
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
        paddingBottom: 40,
    },
    categoryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    // Players Header
    playersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
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

    // Stats Section - Más espacio entre elementos
    statsSection: {
        gap: 20,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 8,
        marginTop: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    subSectionHeader: {
        marginTop: 20,
        marginBottom: 8,
    },
    subSectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statBlock: {
        marginTop: 16,
    },
    statBlockTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 10,
        paddingLeft: 4,
    },
    statBlockContent: {
        gap: 16,
    },
    statGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCompact: {
        flex: 1,
        minWidth: '47%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statCompactValue: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textSecondary,
        fontFamily: 'RobotoMono-Regular',
    },
    statCompactLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
        flex: 1,
    },

    // Stat Row - Más padding y separación
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statRowPrimary: {
        borderColor: COLORS.primary + '50',
        backgroundColor: COLORS.primary + '08',
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
    statValuePrimary: {
        fontSize: 16,
        fontWeight: '700',
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
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginVertical: 6,
        textAlign: 'center',
    },
    statLabelPrimary: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
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
