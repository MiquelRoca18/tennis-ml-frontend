/**
 * H2HTabV2 - Tab de Head to Head
 * ===============================
 * 
 * Muestra el historial de enfrentamientos entre los jugadores.
 * Carga los datos bajo demanda desde el endpoint /v2/matches/{id}/h2h
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import apiClient from '../../../../../src/services/api/apiClient';
import { MatchFullResponse, getShortName } from '../../../../../src/types/matchDetail';
import { COLORS } from '../../../../../src/utils/constants';
import { parseLocalDate } from '../../../../../src/utils/dateUtils';

interface H2HTabV2Props {
    data: MatchFullResponse;
    scrollable?: boolean;
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
    first_player_results?: PlayerRecentMatchItem[];
    second_player_results?: PlayerRecentMatchItem[];
}

export interface PlayerRecentMatchItem {
    date: string;
    tournament: string;
    round: string;
    result: string;
    our_player_won: boolean;
    opponent_name: string;
    event_type: string;
}

export default function H2HTabV2({ data, scrollable = true }: H2HTabV2Props) {
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

    // No data at all
    if (!h2hData) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🤝</Text>
                <Text style={styles.emptyTitle}>Sin datos</Text>
                <Text style={styles.emptyText}>No se pudo cargar el historial.</Text>
            </View>
        );
    }

    const hasDirectH2H = h2hData.total_matches > 0;
    const firstRecent = h2hData.first_player_results ?? [];
    const secondRecent = h2hData.second_player_results ?? [];
    const hasP1Recent = firstRecent.length > 0;
    const hasP2Recent = secondRecent.length > 0;

    // Sin enfrentamientos directos ni últimos partidos de ninguno
    if (!hasDirectH2H && !hasP1Recent && !hasP2Recent) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🤝</Text>
                <Text style={styles.emptyTitle}>Sin Enfrentamientos Previos</Text>
                <Text style={styles.emptyText}>
                    {p1Short} y {p2Short} no tienen enfrentamientos directos registrados.
                </Text>
            </View>
        );
    }

    const h2h = h2hData;

    const content = (
        <>
            {/* Enfrentamientos directos */}
            {hasDirectH2H && (
                <>
                    <View style={styles.balanceCard}>
                        <Text style={styles.balanceTitle}>Balance directo</Text>
                        
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

                        <View style={styles.winBar}>
                            <View style={[styles.winBarP1, { flex: h2h.player1_wins || 0.1 }]} />
                            <View style={[styles.winBarP2, { flex: h2h.player2_wins || 0.1 }]} />
                        </View>
                    </View>

                    {h2h.recent_matches && h2h.recent_matches.length > 0 && (
                        <View style={styles.matchesCard}>
                            <Text style={styles.cardTitle}>Últimos enfrentamientos entre ellos</Text>
                            {h2h.recent_matches.map((match, idx) => (
                                <PreviousMatchRow key={idx} match={match} p1Name={p1Short} p2Name={p2Short} />
                            ))}
                        </View>
                    )}
                </>
            )}

            {/* Sin directos pero hay últimos partidos: mensaje */}
            {!hasDirectH2H && (hasP1Recent || hasP2Recent) && (
                <View style={styles.noDirectCard}>
                    <Text style={styles.noDirectText}>Sin enfrentamientos directos.</Text>
                </View>
            )}

            {/* Últimos partidos: tabs Jugador 1 | Jugador 2 y lista con "Ver más" */}
            {(hasP1Recent || hasP2Recent) && (
                <LastMatchesSection
                    firstRecent={firstRecent}
                    secondRecent={secondRecent}
                    player1Name={player1.name}
                    player2Name={player2.name}
                />
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
// ÚLTIMOS PARTIDOS: Tabs + lista con "Ver más"
// ============================================================

const INITIAL_RECENT_VISIBLE = 5;

interface LastMatchesSectionProps {
    firstRecent: PlayerRecentMatchItem[];
    secondRecent: PlayerRecentMatchItem[];
    player1Name: string;
    player2Name: string;
}

function LastMatchesSection({ firstRecent, secondRecent, player1Name, player2Name }: LastMatchesSectionProps) {
    const [activeTab, setActiveTab] = useState<'p1' | 'p2'>('p1');
    const [p1Expanded, setP1Expanded] = useState(false);
    const [p2Expanded, setP2Expanded] = useState(false);

    const listP1 = firstRecent;
    const listP2 = secondRecent;
    const hasBoth = listP1.length > 0 && listP2.length > 0;

    const visibleP1 = p1Expanded ? listP1 : listP1.slice(0, INITIAL_RECENT_VISIBLE);
    const visibleP2 = p2Expanded ? listP2 : listP2.slice(0, INITIAL_RECENT_VISIBLE);
    const moreCountP1 = listP1.length - INITIAL_RECENT_VISIBLE;
    const moreCountP2 = listP2.length - INITIAL_RECENT_VISIBLE;

    return (
        <View style={styles.matchesCard}>
            <Text style={styles.cardTitle}>Últimos partidos</Text>

            {hasBoth ? (
                <>
                    <View style={styles.tabsRow}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'p1' && styles.tabActive]}
                            onPress={() => setActiveTab('p1')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, activeTab === 'p1' && styles.tabTextActive]}>
                                {getShortName(player1Name)}
                            </Text>
                            <Text style={[styles.tabCount, activeTab === 'p1' && styles.tabCountActive]}>
                                {listP1.length}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'p2' && styles.tabActive]}
                            onPress={() => setActiveTab('p2')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, activeTab === 'p2' && styles.tabTextActive]}>
                                {getShortName(player2Name)}
                            </Text>
                            <Text style={[styles.tabCount, activeTab === 'p2' && styles.tabCountActive]}>
                                {listP2.length}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'p1' && (
                        <>
                            {visibleP1.map((m, idx) => (
                                <PlayerRecentMatchRow key={idx} item={m} playerName={player1Name} isP1={true} />
                            ))}
                            {moreCountP1 > 0 && (
                                <TouchableOpacity
                                    style={styles.verMasButton}
                                    onPress={() => setP1Expanded(!p1Expanded)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.verMasText}>
                                        {p1Expanded ? 'Ver menos' : `Ver más (${moreCountP1})`}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                    {activeTab === 'p2' && (
                        <>
                            {visibleP2.map((m, idx) => (
                                <PlayerRecentMatchRow key={idx} item={m} playerName={player2Name} isP1={false} />
                            ))}
                            {moreCountP2 > 0 && (
                                <TouchableOpacity
                                    style={styles.verMasButton}
                                    onPress={() => setP2Expanded(!p2Expanded)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.verMasText}>
                                        {p2Expanded ? 'Ver menos' : `Ver más (${moreCountP2})`}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </>
            ) : (
                <>
                    {listP1.length > 0 && (
                        <>
                            <Text style={styles.subSectionTitle}>{player1Name}</Text>
                            {visibleP1.map((m, idx) => (
                                <PlayerRecentMatchRow key={idx} item={m} playerName={player1Name} isP1={true} />
                            ))}
                            {moreCountP1 > 0 && (
                                <TouchableOpacity style={styles.verMasButton} onPress={() => setP1Expanded(!p1Expanded)} activeOpacity={0.7}>
                                    <Text style={styles.verMasText}>
                                        {p1Expanded ? 'Ver menos' : `Ver más (${moreCountP1})`}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                    {listP2.length > 0 && (
                        <>
                            <Text style={styles.subSectionTitle}>{player2Name}</Text>
                            {visibleP2.map((m, idx) => (
                                <PlayerRecentMatchRow key={idx} item={m} playerName={player2Name} isP1={false} />
                            ))}
                            {moreCountP2 > 0 && (
                                <TouchableOpacity style={styles.verMasButton} onPress={() => setP2Expanded(!p2Expanded)} activeOpacity={0.7}>
                                    <Text style={styles.verMasText}>
                                        {p2Expanded ? 'Ver menos' : `Ver más (${moreCountP2})`}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </>
            )}
        </View>
    );
}

// ============================================================
// PLAYER RECENT MATCH ROW (últimos partidos de un jugador)
// ============================================================

function cleanRound(round: string): string {
    if (!round || !round.trim()) return '';
    const idx = round.indexOf(' - ');
    return idx >= 0 ? round.slice(idx + 3).trim() : round.trim();
}

interface PlayerRecentMatchRowProps {
    item: PlayerRecentMatchItem;
    playerName: string;
    isP1: boolean;
}

function PlayerRecentMatchRow({ item, playerName, isP1 }: PlayerRecentMatchRowProps) {
    const formatDate = (dateStr: string) => {
        const date = parseLocalDate(dateStr);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' });
    };
    const roundShort = cleanRound(item.round);
    const opponentShort = getShortName(item.opponent_name);

    return (
        <View style={styles.playerRecentRow}>
            <View style={styles.playerRecentLeft}>
                <Text style={styles.playerRecentDate}>{formatDate(item.date)}</Text>
                <Text style={styles.playerRecentTournament} numberOfLines={1}>{item.tournament}</Text>
                {roundShort ? (
                    <Text style={styles.playerRecentRound} numberOfLines={1}>{roundShort}</Text>
                ) : null}
                <Text style={styles.playerRecentVs}>vs {opponentShort}</Text>
            </View>
            <View style={styles.playerRecentRight}>
                <View style={[
                    styles.wlBadge,
                    item.our_player_won ? styles.wlBadgeW : styles.wlBadgeL
                ]}>
                    <Text style={[
                        styles.wlBadgeText,
                        item.our_player_won ? styles.wlBadgeTextW : styles.wlBadgeTextL
                    ]}>
                        {item.our_player_won ? 'V' : 'D'}
                    </Text>
                </View>
                <Text style={styles.playerRecentResult}>{item.result}</Text>
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
        const date = parseLocalDate(dateStr);
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

    tabsRow: {
        flexDirection: 'row',
        marginBottom: 12,
        backgroundColor: COLORS.background,
        borderRadius: 10,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: COLORS.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    tabTextActive: {
        color: COLORS.primary,
    },
    tabCount: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    tabCountActive: {
        color: COLORS.primary,
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 10,
    },
    verMasButton: {
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    verMasText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
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

    noDirectCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    noDirectText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },

    // Player recent match row (últimos partidos de un jugador)
    playerRecentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    playerRecentLeft: {
        flex: 1,
        gap: 2,
    },
    playerRecentDate: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    playerRecentTournament: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    playerRecentRound: {
        fontSize: 11,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    playerRecentVs: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textMuted,
        marginTop: 2,
    },
    playerRecentRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    playerRecentResult: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    wlBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-end',
    },
    wlBadgeW: {
        backgroundColor: COLORS.success + '25',
    },
    wlBadgeL: {
        backgroundColor: COLORS.danger + '25',
    },
    wlBadgeText: {
        fontSize: 12,
        fontWeight: '800',
    },
    wlBadgeTextW: {
        color: COLORS.success,
    },
    wlBadgeTextL: {
        color: COLORS.danger,
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
