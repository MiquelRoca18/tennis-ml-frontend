/**
 * OverviewTabV2 - Tab de Resumen
 * ==============================
 * 
 * Muestra un resumen visual del partido con:
 * - Score por sets (visual)
 * - Estadísticas clave comparativas
 * - Información del partido
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MatchFullResponse, getShortName, safePercentage } from '../../../../../src/types/matchDetail';
import { COLORS } from '../../../../../src/utils/constants';

interface OverviewTabV2Props {
    data: MatchFullResponse;
}

export default function OverviewTabV2({ data }: OverviewTabV2Props) {
    const { match, player1, player2, stats, prediction } = data;
    const p1Short = getShortName(player1.name);
    const p2Short = getShortName(player2.name);
    const isPending = match.status === 'pendiente';

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Match Info Card - Solo info básica */}
            <MatchInfoCard data={data} />

            {/* Key Stats (solo si hay datos - partidos no pendientes) */}
            {!isPending && stats && stats.has_detailed_stats && (
                <KeyStatsCard 
                    stats={stats} 
                    p1Name={p1Short} 
                    p2Name={p2Short}
                />
            )}

            {/* Prediction Preview (solo para partidos no pendientes) */}
            {!isPending && prediction && (
                <PredictionPreview 
                    prediction={prediction}
                    p1Name={p1Short}
                    p2Name={p2Short}
                />
            )}

            {/* Info para partidos pendientes */}
            {isPending && (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>🎾</Text>
                    <Text style={styles.emptyTitle}>Partido Programado</Text>
                    <Text style={styles.emptyText}>
                        Consulta los tabs de Predicción y Cuotas para más información.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

// ============================================================
// MATCH INFO CARD
// ============================================================

function MatchInfoCard({ data }: { data: MatchFullResponse }) {
    const { match } = data;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    };

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Información del Partido</Text>
            
            <View style={styles.infoGrid}>
                <InfoRow label="Fecha" value={formatDate(match.date)} />
                {match.time && <InfoRow label="Hora" value={match.time.slice(0, 5)} />}
                {match.round && <InfoRow label="Ronda" value={match.round} />}
                <InfoRow label="Superficie" value={match.surface} />
            </View>
        </View>
    );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>
        </View>
    );
}

// ============================================================
// SCORE BY SET (no usado - ya está en Hero)
// ============================================================

function ScoreBySet({ sets, p1Name, p2Name, winner }: { 
    sets: any[]; 
    p1Name: string; 
    p2Name: string;
    winner?: 1 | 2 | null;
}) {
    const setsWonP1 = sets.filter(s => s.winner === 1).length;
    const setsWonP2 = sets.filter(s => s.winner === 2).length;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>🎾 Score por Sets</Text>
                <View style={styles.totalSets}>
                    <Text style={styles.totalSetsText}>{setsWonP1} - {setsWonP2}</Text>
                </View>
            </View>

            {/* Header Row */}
            <View style={styles.scoreHeader}>
                <View style={styles.scoreHeaderPlayer}>
                    <Text style={[
                        styles.scoreHeaderName,
                        winner === 1 && styles.scoreHeaderWinner
                    ]}>{p1Name}</Text>
                </View>
                {sets.map((_, idx) => (
                    <View key={idx} style={styles.scoreHeaderSet}>
                        <Text style={styles.scoreHeaderSetText}>S{idx + 1}</Text>
                    </View>
                ))}
                <View style={styles.scoreHeaderPlayer}>
                    <Text style={[
                        styles.scoreHeaderName,
                        winner === 2 && styles.scoreHeaderWinner
                    ]}>{p2Name}</Text>
                </View>
            </View>

            {/* Score Row */}
            <View style={styles.scoreRow}>
                <View style={styles.scorePlayerCol}>
                    {sets.map((set, idx) => (
                        <Text key={idx} style={[
                            styles.scoreValue,
                            set.winner === 1 && styles.scoreValueWinner
                        ]}>
                            {set.player1_games}
                        </Text>
                    ))}
                </View>
                
                {sets.map((set, idx) => (
                    <View key={idx} style={styles.scoreSetCol}>
                        <View style={[
                            styles.scoreSetBox,
                            set.winner === 1 && styles.scoreSetBoxP1Win,
                            set.winner === 2 && styles.scoreSetBoxP2Win,
                        ]}>
                            <Text style={styles.scoreSetText}>
                                {set.player1_games}-{set.player2_games}
                            </Text>
                            {set.tiebreak_score && (
                                <Text style={styles.scoreTiebreak}>({set.tiebreak_score})</Text>
                            )}
                        </View>
                    </View>
                ))}
                
                <View style={styles.scorePlayerCol}>
                    {sets.map((set, idx) => (
                        <Text key={idx} style={[
                            styles.scoreValue,
                            set.winner === 2 && styles.scoreValueWinner
                        ]}>
                            {set.player2_games}
                        </Text>
                    ))}
                </View>
            </View>
        </View>
    );
}

// ============================================================
// KEY STATS CARD
// ============================================================

function KeyStatsCard({ stats, p1Name, p2Name }: { 
    stats: any; 
    p1Name: string; 
    p2Name: string;
}) {
    const p1 = stats.player1;
    const p2 = stats.player2;

    const keyStats = [
        {
            label: 'Juegos Ganados',
            v1: p1.total_games_won,
            v2: p2.total_games_won,
        },
        {
            label: 'Juegos de Saque Ganados',
            v1: p1.serve.service_games_won,
            v2: p2.serve.service_games_won,
            t1: p1.serve.service_games_total,
            t2: p2.serve.service_games_total,
            showPct: true,
        },
        {
            label: 'Breaks Realizados',
            v1: p1.break_points.break_points_won,
            v2: p2.break_points.break_points_won,
            t1: p1.break_points.break_points_total,
            t2: p2.break_points.break_points_total,
            showPct: true,
        },
    ];

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Estadísticas Clave</Text>
            
            <View style={styles.statsHeader}>
                <Text style={styles.statsHeaderName}>{p1Name}</Text>
                <Text style={styles.statsHeaderLabel}></Text>
                <Text style={styles.statsHeaderName}>{p2Name}</Text>
            </View>

            {keyStats.map((stat, idx) => (
                <StatCompareRow 
                    key={idx}
                    label={stat.label}
                    v1={stat.v1}
                    v2={stat.v2}
                    t1={stat.t1}
                    t2={stat.t2}
                    showPct={stat.showPct}
                />
            ))}
        </View>
    );
}

function StatCompareRow({ label, v1, v2, t1, t2, showPct }: {
    label: string;
    v1: number;
    v2: number;
    t1?: number;
    t2?: number;
    showPct?: boolean;
}) {
    const max = Math.max(v1, v2, 1);
    const pct1 = (v1 / max) * 100;
    const pct2 = (v2 / max) * 100;
    const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0;

    const formatValue = (v: number, t?: number) => {
        if (showPct && t !== undefined && t > 0) {
            return `${v}/${t} (${safePercentage(v, t)}%)`;
        }
        return v.toString();
    };

    return (
        <View style={styles.statRow}>
            <View style={styles.statValue}>
                <Text style={[styles.statValueText, winner === 1 && styles.statValueWinner]}>
                    {formatValue(v1, t1)}
                </Text>
                <View style={styles.statBar}>
                    <View style={[
                        styles.statBarFill,
                        styles.statBarP1,
                        { width: `${pct1}%` }
                    ]} />
                </View>
            </View>
            
            <Text style={styles.statLabel}>{label}</Text>
            
            <View style={styles.statValue}>
                <View style={styles.statBar}>
                    <View style={[
                        styles.statBarFill,
                        styles.statBarP2,
                        { width: `${pct2}%` }
                    ]} />
                </View>
                <Text style={[styles.statValueText, winner === 2 && styles.statValueWinner]}>
                    {formatValue(v2, t2)}
                </Text>
            </View>
        </View>
    );
}

// ============================================================
// PREDICTION PREVIEW
// ============================================================

function PredictionPreview({ prediction, p1Name, p2Name }: {
    prediction: any;
    p1Name: string;
    p2Name: string;
}) {
    const favorito = prediction.predicted_winner === 1 ? p1Name : p2Name;
    const confianza = prediction.confidence;

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>🤖 Predicción ML</Text>
            
            <View style={styles.predictionContent}>
                <View style={styles.predictionMain}>
                    <Text style={styles.predictionLabel}>Favorito</Text>
                    <Text style={styles.predictionWinner}>{favorito}</Text>
                </View>
                
                <View style={styles.predictionConfidence}>
                    <Text style={styles.predictionConfidenceValue}>{confianza.toFixed(0)}%</Text>
                    <Text style={styles.predictionConfidenceLabel}>Confianza</Text>
                </View>
            </View>

            {prediction.value_bet && (
                <View style={styles.valueBetBadge}>
                    <Text style={styles.valueBetText}>
                        💎 Value Bet: {prediction.value_bet === 1 ? p1Name : p2Name}
                    </Text>
                </View>
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
    content: {
        padding: 16,
        paddingBottom: 32,
        gap: 16,
    },

    // Cards
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    totalSets: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    totalSetsText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
    },

    // Info Grid
    infoGrid: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    infoValueHighlight: {
        color: COLORS.primary,
    },

    // Odds Card
    oddsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    oddsBox: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    oddsBoxFavorite: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '10',
    },
    oddsPlayer: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    oddsValue: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    oddsValueFavorite: {
        color: COLORS.primary,
    },
    favoriteLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.primary,
        marginTop: 4,
        letterSpacing: 1,
    },
    oddsVs: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    oddsSource: {
        fontSize: 11,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 12,
    },

    // Score By Set
    scoreHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    scoreHeaderPlayer: {
        flex: 1,
    },
    scoreHeaderName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    scoreHeaderWinner: {
        color: COLORS.success,
        fontWeight: '700',
    },
    scoreHeaderSet: {
        width: 48,
        alignItems: 'center',
    },
    scoreHeaderSetText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scorePlayerCol: {
        flex: 1,
        gap: 8,
    },
    scoreSetCol: {
        width: 48,
        alignItems: 'center',
    },
    scoreSetBox: {
        backgroundColor: COLORS.background,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    scoreSetBoxP1Win: {
        backgroundColor: COLORS.primary + '15',
    },
    scoreSetBoxP2Win: {
        backgroundColor: COLORS.success + '15',
    },
    scoreSetText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    scoreTiebreak: {
        fontSize: 10,
        color: COLORS.textSecondary,
    },
    scoreValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    scoreValueWinner: {
        color: COLORS.success,
        fontWeight: '700',
    },

    // Stats
    statsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    statsHeaderName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    statsHeaderLabel: {
        width: 120,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    statValue: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statValueText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        minWidth: 60,
    },
    statValueWinner: {
        color: COLORS.textPrimary,
        fontWeight: '700',
    },
    statLabel: {
        width: 120,
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    statBar: {
        flex: 1,
        height: 6,
        backgroundColor: COLORS.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    statBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    statBarP1: {
        backgroundColor: COLORS.primary,
    },
    statBarP2: {
        backgroundColor: COLORS.success,
    },

    // Prediction
    predictionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    predictionMain: {
        flex: 1,
    },
    predictionLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    predictionWinner: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    predictionConfidence: {
        alignItems: 'center',
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    predictionConfidenceValue: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.primary,
    },
    predictionConfidenceLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    valueBetBadge: {
        marginTop: 12,
        backgroundColor: COLORS.success + '15',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    valueBetText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.success,
        textAlign: 'center',
    },

    // Empty State
    emptyCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyIcon: {
        fontSize: 48,
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
