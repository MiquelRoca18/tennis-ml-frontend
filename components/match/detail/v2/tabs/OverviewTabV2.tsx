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
import { MatchFullResponse, getShortName } from '../../../../../src/types/matchDetail';
import { COLORS } from '../../../../../src/utils/constants';
import { parseLocalDate } from '../../../../../src/utils/dateUtils';

interface OverviewTabV2Props {
    data: MatchFullResponse;
    /** Si false, usa View en lugar de ScrollView (para scroll unificado en padre) */
    scrollable?: boolean;
}

export default function OverviewTabV2({ data, scrollable = true }: OverviewTabV2Props) {
    const { match, player1, player2, stats, prediction } = data;
    const p1Short = getShortName(player1.name);
    const p2Short = getShortName(player2.name);
    const isPending = match.status === 'pendiente';

    const content = (
        <>
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

            {/* Prediction Preview - mostrar siempre que exista predicción (incluye pendientes) */}
            {prediction && (
                <PredictionPreview 
                    prediction={prediction}
                    p1Name={p1Short}
                    p2Name={p2Short}
                />
            )}

            {/* Info para partidos pendientes SIN predicción */}
            {isPending && !prediction && (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>🎾</Text>
                    <Text style={styles.emptyTitle}>Partido Programado</Text>
                    <Text style={styles.emptyText}>
                        La predicción se generará cuando haya cuotas disponibles. Consulta el tab de Cuotas.
                    </Text>
                </View>
            )}
        </>
    );

    if (scrollable) {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {content}
            </ScrollView>
        );
    }
    return <View style={[styles.container, styles.content]}>{content}</View>;
}

// ============================================================
// MATCH INFO CARD
// ============================================================

function formatEventStatus(eventStatus: string): string {
    const s = eventStatus.toLowerCase();
    if (s.includes('retired') || s.includes('ret') || s.includes('retirement')) return 'Finalizado por retirada';
    if (s.includes('walk') || s.includes('w.o') || s.includes('w/o')) return 'Walkover';
    if (s.includes('default')) return 'Finalizado por default';
    return eventStatus;
}

function MatchInfoCard({ data }: { data: MatchFullResponse }) {
    const { match } = data;

    const formatDate = (dateStr: string) => {
        const date = parseLocalDate(dateStr);
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
                {match.status === 'completado' && match.event_status && (
                    <InfoRow
                        label="Motivo de finalización"
                        value={formatEventStatus(match.event_status)}
                        highlight={/retired|walk|w\.o|w\/o|default/i.test(match.event_status)}
                    />
                )}
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
// RESUMEN RÁPIDO - Estadísticas clave a vista
// ============================================================

function KeyStatsCard({ stats, p1Name, p2Name }: { 
    stats: any; 
    p1Name: string; 
    p2Name: string;
}) {
    const p1 = stats.player1;
    const p2 = stats.player2;
    const wue1 = p1.winners - p1.unforced_errors;
    const wue2 = p2.winners - p2.unforced_errors;

    const keyStats = [
        { label: 'Puntos', v1: p1.total_points_won, v2: p2.total_points_won },
        { label: 'Juegos', v1: p1.total_games_won, v2: p2.total_games_won },
        { label: 'Juegos Saque', v1: p1.serve.service_games_won, v2: p2.serve.service_games_won, t1: p1.serve.service_games_total, t2: p2.serve.service_games_total, showPct: true },
        { label: 'Breaks', v1: p1.return?.return_games_won ?? 0, v2: p2.return?.return_games_won ?? 0 },
        { label: 'Aces', v1: p1.serve.aces, v2: p2.serve.aces },
        { label: 'Winners - UE', v1: wue1, v2: wue2 },
    ];

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Resumen Rápido</Text>
            <Text style={styles.cardSubtitle}>Estadísticas clave del partido</Text>
            
            <View style={styles.quickStatsGrid}>
                {keyStats.map((stat, idx) => (
                    <View key={idx} style={styles.quickStatItem}>
                        <View style={styles.quickStatValues}>
                            <Text style={[styles.quickStatValue, stat.v1 > stat.v2 && styles.quickStatWinner]}>
                                {stat.showPct && stat.t1 ? `${stat.v1}/${stat.t1}` : stat.v1}
                            </Text>
                            <Text style={styles.quickStatVs}>vs</Text>
                            <Text style={[styles.quickStatValue, stat.v2 > stat.v1 && styles.quickStatWinner]}>
                                {stat.showPct && stat.t2 ? `${stat.v2}/${stat.t2}` : stat.v2}
                            </Text>
                        </View>
                        <Text style={styles.quickStatLabel}>{stat.label}</Text>
                    </View>
                ))}
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
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    quickStatsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    quickStatItem: {
        flex: 1,
        minWidth: 100,
        maxWidth: '48%',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    quickStatValues: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    quickStatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textSecondary,
        fontFamily: 'RobotoMono-Regular',
    },
    quickStatWinner: {
        color: COLORS.textPrimary,
    },
    quickStatVs: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    quickStatLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
        textAlign: 'center',
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
        color: COLORS.warning,
        fontWeight: '600',
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
