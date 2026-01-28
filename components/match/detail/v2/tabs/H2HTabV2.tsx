/**
 * H2HTabV2 - Tab de Head to Head
 * ===============================
 * 
 * Muestra el historial de enfrentamientos entre los jugadores.
 * Carga los datos bajo demanda desde el endpoint /v2/matches/{id}/h2h
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import apiClient from '../../../../../src/services/api/apiClient';
import { MatchFullResponse, getShortName } from '../../../../../src/types/matchDetail';
import { COLORS } from '../../../../../src/utils/constants';

interface H2HTabV2Props {
    data: MatchFullResponse;
}

interface H2HResponse {
    success: boolean;
    message?: string;
    total_matches: number;
    player1_wins: number;
    player2_wins: number;
    surface_records?: {
        Hard: [number, number];
        Clay: [number, number];
        Grass: [number, number];
    };
    recent_matches?: {
        date: string;
        tournament: string;
        surface: string;
        winner: number;
        score: string;
    }[];
}

export default function H2HTabV2({ data }: H2HTabV2Props) {
    const [h2hData, setH2hData] = useState<H2HResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { player1, player2 } = data;
    const p1Short = getShortName(player1.name);
    const p2Short = getShortName(player2.name);

    useEffect(() => {
        loadH2H();
    }, [data.match.id]);

    const loadH2H = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get<H2HResponse>(`/v2/matches/${data.match.id}/h2h`);
            setH2hData(response.data);
        } catch (err) {
            setError('Error al cargar el historial');
            console.error('Error loading H2H:', err);
        } finally {
            setLoading(false);
        }
    };

    // Loading
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
        );
    }

    // Error
    if (error) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>⚠️</Text>
                <Text style={styles.emptyTitle}>Error</Text>
                <Text style={styles.emptyText}>{error}</Text>
            </View>
        );
    }

    // No data
    if (!h2hData || h2hData.total_matches === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🤝</Text>
                <Text style={styles.emptyTitle}>Sin Enfrentamientos Previos</Text>
                <Text style={styles.emptyText}>
                    {p1Short} y {p2Short} no tienen enfrentamientos previos registrados.
                </Text>
            </View>
        );
    }

    const h2h = h2hData;
    const surfaceRecords = h2h.surface_records || { Hard: [0, 0], Clay: [0, 0], Grass: [0, 0] };

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Main Balance */}
            <View style={styles.balanceCard}>
                <Text style={styles.balanceTitle}>Balance General</Text>
                
                <View style={styles.balanceMain}>
                    <View style={styles.balancePlayer}>
                        <Text style={styles.balanceWins}>{h2h.player1_wins}</Text>
                        <Text style={[styles.balanceName, styles.balanceNameP1]}>{p1Short}</Text>
                    </View>

                    <View style={styles.balanceVs}>
                        <Text style={styles.balanceVsText}>VS</Text>
                        <Text style={styles.balanceTotal}>{h2h.total_matches} partidos</Text>
                    </View>

                    <View style={styles.balancePlayer}>
                        <Text style={styles.balanceWins}>{h2h.player2_wins}</Text>
                        <Text style={[styles.balanceName, styles.balanceNameP2]}>{p2Short}</Text>
                    </View>
                </View>

                {/* Win Bar */}
                <View style={styles.winBar}>
                    <View style={[styles.winBarP1, { flex: h2h.player1_wins || 0.1 }]} />
                    <View style={[styles.winBarP2, { flex: h2h.player2_wins || 0.1 }]} />
                </View>
            </View>

            {/* Surface Records */}
            <View style={styles.surfaceCard}>
                <Text style={styles.cardTitle}>📊 Por Superficie</Text>
                
                <View style={styles.surfaceGrid}>
                    <SurfaceRecord 
                        surface="Hard"
                        icon="🎾"
                        record={surfaceRecords.Hard}
                        p1Name={p1Short}
                        p2Name={p2Short}
                    />
                    <SurfaceRecord 
                        surface="Clay"
                        icon="🧱"
                        record={surfaceRecords.Clay}
                        p1Name={p1Short}
                        p2Name={p2Short}
                    />
                    <SurfaceRecord 
                        surface="Grass"
                        icon="🌿"
                        record={surfaceRecords.Grass}
                        p1Name={p1Short}
                        p2Name={p2Short}
                    />
                </View>
            </View>

            {/* Previous Matches */}
            {h2h.recent_matches && h2h.recent_matches.length > 0 && (
                <View style={styles.matchesCard}>
                    <Text style={styles.cardTitle}>📅 Últimos Enfrentamientos</Text>
                    
                    {h2h.recent_matches.map((match, idx) => (
                        <PreviousMatchRow 
                            key={idx}
                            match={match}
                            p1Name={p1Short}
                            p2Name={p2Short}
                        />
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

// ============================================================
// SURFACE RECORD
// ============================================================

interface SurfaceRecordProps {
    surface: string;
    icon: string;
    record: [number, number];
    p1Name: string;
    p2Name: string;
}

function SurfaceRecord({ surface, icon, record, p1Name, p2Name }: SurfaceRecordProps) {
    const [p1Wins, p2Wins] = record;
    const total = p1Wins + p2Wins;
    
    if (total === 0) {
        return null;
    }

    const leader = p1Wins > p2Wins ? 1 : p2Wins > p1Wins ? 2 : 0;

    return (
        <View style={styles.surfaceItem}>
            <View style={styles.surfaceHeader}>
                <Text style={styles.surfaceIcon}>{icon}</Text>
                <Text style={styles.surfaceName}>{surface}</Text>
            </View>
            <View style={styles.surfaceRecord}>
                <Text style={[
                    styles.surfaceWins,
                    leader === 1 && styles.surfaceWinsLeader
                ]}>
                    {p1Wins}
                </Text>
                <Text style={styles.surfaceDash}>-</Text>
                <Text style={[
                    styles.surfaceWins,
                    leader === 2 && styles.surfaceWinsLeader
                ]}>
                    {p2Wins}
                </Text>
            </View>
        </View>
    );
}

// ============================================================
// PREVIOUS MATCH ROW
// ============================================================

interface PreviousMatchRowProps {
    match: {
        date: string;
        tournament: string;
        surface: string;
        winner: number;
        score: string;
    };
    p1Name: string;
    p2Name: string;
}

function PreviousMatchRow({ match, p1Name, p2Name }: PreviousMatchRowProps) {
    const winner = match.winner === 1 ? p1Name : p2Name;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <View style={styles.matchRow}>
            <View style={styles.matchInfo}>
                <Text style={styles.matchDate}>{formatDate(match.date)}</Text>
                <Text style={styles.matchTournament} numberOfLines={1}>
                    {match.tournament}
                </Text>
                <View style={styles.matchSurface}>
                    <Text style={styles.matchSurfaceText}>{match.surface}</Text>
                </View>
            </View>
            
            <View style={styles.matchResult}>
                <Text style={[
                    styles.matchWinner,
                    match.winner === 1 ? styles.matchWinnerP1 : styles.matchWinnerP2
                ]}>
                    {winner}
                </Text>
                <Text style={styles.matchScore}>{match.score}</Text>
            </View>
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

    // Balance Card
    balanceCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    balanceTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 20,
    },
    balanceMain: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    balancePlayer: {
        flex: 1,
        alignItems: 'center',
    },
    balanceWins: {
        fontSize: 48,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    balanceName: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 4,
    },
    balanceNameP1: {
        color: COLORS.primary,
    },
    balanceNameP2: {
        color: COLORS.success,
    },
    balanceVs: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    balanceVsText: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    balanceTotal: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    winBar: {
        flexDirection: 'row',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        gap: 2,
    },
    winBarP1: {
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    winBarP2: {
        backgroundColor: COLORS.success,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },

    // Card Styles
    surfaceCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    matchesCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },

    // Surface Grid
    surfaceGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    surfaceItem: {
        alignItems: 'center',
        flex: 1,
    },
    surfaceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    surfaceIcon: {
        fontSize: 16,
    },
    surfaceName: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    surfaceRecord: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    surfaceWins: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    surfaceWinsLeader: {
        color: COLORS.textPrimary,
    },
    surfaceDash: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },

    // Match Row
    matchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    matchInfo: {
        flex: 1,
        gap: 4,
    },
    matchDate: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    matchTournament: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    matchSurface: {
        flexDirection: 'row',
    },
    matchSurfaceText: {
        fontSize: 11,
        fontWeight: '500',
        color: COLORS.textSecondary,
        backgroundColor: COLORS.background,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    matchResult: {
        alignItems: 'flex-end',
        gap: 4,
    },
    matchWinner: {
        fontSize: 14,
        fontWeight: '700',
    },
    matchWinnerP1: {
        color: COLORS.primary,
    },
    matchWinnerP2: {
        color: COLORS.success,
    },
    matchScore: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
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
