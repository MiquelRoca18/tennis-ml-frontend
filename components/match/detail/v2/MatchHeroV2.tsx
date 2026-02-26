/**
 * MatchHeroV2 - Cabecera del Marcador Profesional
 * ===============================================
 * 
 * Muestra el score principal del partido de forma visual y profesional.
 * 
 * Características:
 * - Jugadores con foto, bandera y ranking
 * - Score principal (sets ganados)
 * - Score de cada set con tiebreaks
 * - Indicador de servidor (en vivo)
 * - Score del juego actual (en vivo)
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import FavoriteButton from '../../../ui/FavoriteButton';
import { useIsFavorite } from '../../../../src/hooks/useFavorites';
import { fetchPlayerLookup } from '../../../../src/services/api/playerService';
import { MatchFullResponse, getShortName } from '../../../../src/types/matchDetail';
import { COLORS } from '../../../../src/utils/constants';
import { getCountryFlag } from '../../../../src/utils/countryUtils';
import { isMatchStarted } from '../../../../src/utils/dateUtils';
import { SOLO_RESULTADO_FINAL_STATUS } from '../../../../src/utils/formatters';
import LiveBadge from '../../LiveBadge';
import PlayerLogo from '../../PlayerLogo';

/** Parsea tiebreak "7-5" → [7, 5], "3" → [7, 3]. Devuelve [ganador, perdedor]. */
function parseTiebreakPoints(tb: string): [number, number] {
    const t = tb.trim();
    if (t.includes('-')) {
        const [a, b] = t.split('-').map(s => parseInt(s.trim(), 10));
        return [a ?? 7, b ?? 0];
    }
    const n = parseInt(t, 10);
    return Number.isNaN(n) ? [7, 0] : [7, n];
}

/** True si el set está terminado (6-4, 7-5, 7-6, etc.). No poner verde si el set sigue en curso (ej. 6-5). */
function isSetCompleted(p1: number, p2: number): boolean {
    const lo = Math.min(p1, p2);
    const hi = Math.max(p1, p2);
    if (hi < 6) return false;
    return hi - lo >= 2 || lo >= 6;
}

/** Etiqueta de cierre: retirada, walkover o finalizado */
function getFinishLabel(eventStatus?: string | null): string {
    if (!eventStatus) return 'FINALIZADO';
    const s = eventStatus.toLowerCase();
    if (s.includes('retired') || s.includes('ret') || s.includes('retirement')) return 'Finalizado por retirada';
    if (s.includes('walk') || s.includes('w.o') || s.includes('w/o')) return 'Walkover';
    if (s.includes('default')) return 'Finalizado por default';
    return 'FINALIZADO';
}

interface MatchHeroV2Props {
    data: MatchFullResponse;
}

export default function MatchHeroV2({ data }: MatchHeroV2Props) {
    const router = useRouter();
    const { match, player1, player2, winner, scores } = data;
    const { favorited, loading: favLoading, toggle } = useIsFavorite(match.id);
    const isLive = match.status === 'en_juego';
    const isCompleted = match.status === 'completado';
    const isPending = match.status === 'pendiente';
    const hasStarted = isMatchStarted(match.date, match.time ?? null);
    const noLiveDataButStarted = hasStarted && isPending;

    // Scores (resultado en sets; si no hay, 0-0)
    const setsWon = scores?.sets_won || [0, 0];
    const live = scores?.live;
    // Solo resaltar en verde cuando hay un líder (o partido terminado con ganador). En empate (2-2) o sin ganador por retirada, nada en verde.
    const showWinner1 = (isCompleted && winner === 1) || (isLive && setsWon[0] > setsWon[1]);
    const showWinner2 = (isCompleted && winner === 2) || (isLive && setsWon[1] > setsWon[0]);
    const isRetirementOrWalkover = Boolean(
        match.event_status &&
        /retired|ret|walk|w\.o|w\/o|default/i.test(match.event_status)
    );

    const handlePlayerPress = async (playerKey: string | number | null | undefined, playerName: string) => {
        const key = playerKey != null ? String(playerKey).trim() : '';
        const numericKey = key ? parseInt(key, 10) : NaN;
        if (key && Number.isFinite(numericKey)) {
            router.push({ pathname: '/player/[key]', params: { key } } as any);
            return;
        }
        if (!playerName || !playerName.trim()) return;
        try {
            const resolvedKey = await fetchPlayerLookup(playerName.trim());
            if (resolvedKey != null) {
                router.push({ pathname: '/player/[key]', params: { key: String(resolvedKey) } } as any);
            }
        } catch {
            // Silently ignore lookup failure
        }
    };

    return (
        <View style={styles.container}>
            {/* Tournament Info */}
            <View style={styles.tournamentSection}>
                <View style={styles.tournamentRow}>
                    <Text style={styles.tournamentName}>{match.tournament}</Text>
                    <FavoriteButton
                        isFavorite={favorited}
                        onPress={() =>
                            toggle({
                                player1Name: player1.name,
                                player2Name: player2.name,
                                tournament: match.tournament ?? '',
                            })
                        }
                        size={28}
                    />
                </View>
                <View style={styles.metaRow}>
                    <View style={styles.surfaceBadge}>
                        <Text style={styles.surfaceText}>{match.surface}</Text>
                    </View>
                    {match.round && (
                        <Text style={styles.roundText}>{match.round}</Text>
                    )}
                </View>
            </View>

            {/* Main Score Section */}
            <View style={styles.scoreSection}>
                {/* Player 1 */}
                <TouchableOpacity
                    style={styles.playerColumn}
                    onPress={() => handlePlayerPress(player1.player_key, player1.name)}
                    activeOpacity={0.7}
                >
                    <PlayerLogo logoUrl={player1.logo_url ?? undefined} size={72} />
                    <View style={styles.playerInfo}>
                        {player1.country && (
                            <Text style={styles.flag}>{getCountryFlag(player1.country)}</Text>
                        )}
                        <Text 
                            style={[
                                styles.playerName,
                                showWinner1 && styles.winnerName
                            ]} 
                            numberOfLines={2}
                        >
                            {getShortName(player1.name)}
                        </Text>
                        {player1.ranking && (
                            <Text style={styles.ranking}>#{player1.ranking}</Text>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Center Score */}
                <View style={styles.centerScore}>
                    {isLive && <LiveBadge />}
                    
                    {isPending ? (
                        <View style={styles.vsContainer}>
                            <Text style={styles.vsText}>VS</Text>
                            {noLiveDataButStarted ? (
                                <View style={styles.soloResultadoBox}>
                                    <Text style={[styles.soloResultadoTitle, { color: SOLO_RESULTADO_FINAL_STATUS.color }]}>
                                        {SOLO_RESULTADO_FINAL_STATUS.emoji} {SOLO_RESULTADO_FINAL_STATUS.text}
                                    </Text>
                                    <Text style={styles.soloResultadoSubtitle} numberOfLines={2}>
                                        No hay datos en directo. Resultado al finalizar.
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.statusText}>PROGRAMADO</Text>
                            )}
                        </View>
                    ) : (
                        <View style={styles.mainScore}>
                            {/* Razón de cierre (retirada, walkover) arriba del resultado para que sea visible */}
                            {isCompleted && isRetirementOrWalkover && (
                                <Text style={styles.reasonText}>
                                    {getFinishLabel(match.event_status)}
                                </Text>
                            )}

                            {/* Sets Won: verde solo si hay líder o partido terminado con ganador; en empate (2-2) nada en verde */}
                            <View style={styles.setsWonRow}>
                                <Text style={[
                                    styles.setsWonNumber,
                                    showWinner1 && styles.winnerScore
                                ]}>
                                    {setsWon[0]}
                                </Text>
                                <Text style={styles.setsDash}>-</Text>
                                <Text style={[
                                    styles.setsWonNumber,
                                    showWinner2 && styles.winnerScore
                                ]}>
                                    {setsWon[1]}
                                </Text>
                            </View>

                            {/* Live Game Score */}
                            {isLive && live && (
                                <View style={styles.liveGameBox}>
                                    <Text style={styles.liveGameScore}>{live.current_game}</Text>
                                </View>
                            )}

                            {/* Status: finalizado (solo si no es retirada/walkover, que ya está arriba) */}
                            {isCompleted && !isRetirementOrWalkover && (
                                <Text style={styles.statusText}>FINALIZADO</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Player 2 */}
                <TouchableOpacity
                    style={styles.playerColumn}
                    onPress={() => handlePlayerPress(player2.player_key, player2.name)}
                    activeOpacity={0.7}
                >
                    <PlayerLogo logoUrl={player2.logo_url ?? undefined} size={72} />
                    <View style={styles.playerInfo}>
                        {player2.country && (
                            <Text style={styles.flag}>{getCountryFlag(player2.country)}</Text>
                        )}
                        <Text 
                            style={[
                                styles.playerName,
                                showWinner2 && styles.winnerName
                            ]} 
                            numberOfLines={2}
                        >
                            {getShortName(player2.name)}
                        </Text>
                        {player2.ranking && (
                            <Text style={styles.ranking}>#{player2.ranking}</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            {/* Resumen de juegos por set cuando el partido está finalizado (o en vivo) */}
            {!isPending && scores?.sets && scores.sets.length > 0 && (
                <View style={styles.setsSummarySection}>
                    <View style={styles.setsSummaryRow}>
                        <Text style={[styles.setsSummaryName, showWinner1 && styles.winnerName]} numberOfLines={1}>
                            {getShortName(player1.name)}
                        </Text>
                        <View style={styles.setsSummaryGames}>
                            {scores.sets.map((set, idx) => {
                                const pts = set.tiebreak_score ? parseTiebreakPoints(set.tiebreak_score) : null;
                                const tbSup = pts ? pts[0] : null; // API envía tiebreak como jugador1-jugador2
                                const completed = isSetCompleted(set.player1_games, set.player2_games);
                                const showP1Winner = completed && set.winner === 1;
                                return (
                                    <View key={idx} style={[styles.setsSummaryCell, showP1Winner && styles.setsSummaryCellWinner]}>
                                        <View style={styles.setsSummaryValueRow}>
                                            <Text style={[styles.setsSummaryValue, showP1Winner && styles.setsSummaryValueWinner]}>
                                                {set.player1_games}
                                            </Text>
                                            {tbSup != null && (
                                                <Text style={[styles.setsSummaryTiebreakSup, showP1Winner && styles.setsSummaryValueWinner]}>
                                                    {tbSup}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                    <View style={styles.setsSummaryRow}>
                        <Text style={[styles.setsSummaryName, showWinner2 && styles.winnerName]} numberOfLines={1}>
                            {getShortName(player2.name)}
                        </Text>
                        <View style={styles.setsSummaryGames}>
                            {scores.sets.map((set, idx) => {
                                const pts = set.tiebreak_score ? parseTiebreakPoints(set.tiebreak_score) : null;
                                const tbSup = pts ? pts[1] : null; // API envía tiebreak como jugador1-jugador2
                                const completed = isSetCompleted(set.player1_games, set.player2_games);
                                const showP2Winner = completed && set.winner === 2;
                                return (
                                    <View key={idx} style={[styles.setsSummaryCell, showP2Winner && styles.setsSummaryCellWinner]}>
                                        <View style={styles.setsSummaryValueRow}>
                                            <Text style={[styles.setsSummaryValue, showP2Winner && styles.setsSummaryValueWinner]}>
                                                {set.player2_games}
                                            </Text>
                                            {tbSup != null && (
                                                <Text style={[styles.setsSummaryTiebreakSup, showP2Winner && styles.setsSummaryValueWinner]}>
                                                    {tbSup}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            )}

            {/* En directo: set actual, juegos del set y puntos del juego */}
            {isLive && live && scores?.sets && scores.sets.length > 0 && (() => {
                const currentSetIndex = scores.sets.length - 1;
                const currentSet = scores.sets[currentSetIndex];
                const setLabel = `Set ${live.current_set}`;
                const gamesInSet = `${currentSet.player1_games} - ${currentSet.player2_games}`;
                const pointsLabel = live.is_tiebreak ? 'Puntos tiebreak' : 'Puntos';
                return (
                    <View style={styles.liveContextSection}>
                        <View style={styles.liveContextRow}>
                            <View style={styles.liveContextBadge}>
                                <Text style={styles.liveContextBadgeText}>{setLabel}</Text>
                            </View>
                            <Text style={styles.liveContextLabel}>Juegos</Text>
                            <Text style={styles.liveContextGames}>{gamesInSet}</Text>
                        </View>
                        <View style={[styles.liveContextRow, styles.liveContextRowPoints]}>
                            <Text style={styles.liveContextLabel}>{pointsLabel}</Text>
                            <Text style={styles.liveContextPoints}>{live.current_game}</Text>
                        </View>
                    </View>
                );
            })()}

            {/* Server Indicator */}
            {isLive && live && (
                <View style={styles.serverIndicator}>
                    <Text style={styles.serverIcon}>🎾</Text>
                    <Text style={styles.serverText}>
                        Saca: {live.current_server === 1 ? player1.name : player2.name}
                    </Text>
                    {live.is_tiebreak && (
                        <View style={styles.tiebreakBadge}>
                            <Text style={styles.tiebreakText}>TIEBREAK</Text>
                        </View>
                    )}
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
        backgroundColor: COLORS.surface,
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    
    // Tournament
    tournamentSection: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    tournamentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 8,
    },
    tournamentName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    surfaceBadge: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    surfaceText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
    },
    roundText: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },

    // Score Section
    scoreSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    playerColumn: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    playerInfo: {
        alignItems: 'center',
        gap: 4,
    },
    flag: {
        fontSize: 24,
    },
    playerName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    winnerName: {
        color: COLORS.success,
    },
    ranking: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },

    // Center Score (ancho fijo para no desplazar jugadores)
    centerScore: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        minWidth: 100,
        maxWidth: 140,
    },
    vsContainer: {
        alignItems: 'center',
        gap: 8,
    },
    vsText: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    mainScore: {
        alignItems: 'center',
        gap: 8,
    },
    reasonText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.warning,
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 4,
    },
    setsWonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    setsWonNumber: {
        fontSize: 48,
        fontWeight: '800',
        color: COLORS.textPrimary,
        fontVariant: ['tabular-nums'],
    },
    winnerScore: {
        color: COLORS.success,
    },
    setsDash: {
        fontSize: 36,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    liveGameBox: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
    },
    liveGameScore: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
        fontVariant: ['tabular-nums'],
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textSecondary,
        letterSpacing: 1,
        marginTop: 4,
    },
    soloResultadoBox: {
        maxWidth: 130,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    soloResultadoTitle: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    soloResultadoSubtitle: {
        fontSize: 9,
        color: COLORS.textSecondary,
        marginTop: 4,
        textAlign: 'center',
        lineHeight: 12,
    },

    // Resumen de juegos por set (finalizado / en vivo)
    setsSummarySection: {
        marginTop: 16,
        marginHorizontal: 20,
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: COLORS.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    setsSummaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    setsSummaryName: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textPrimary,
        minWidth: 80,
    },
    setsSummaryGames: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'flex-end',
    },
    setsSummaryCell: {
        minWidth: 28,
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderRadius: 4,
        backgroundColor: COLORS.border + '40',
    },
    setsSummaryCellWinner: {
        backgroundColor: COLORS.success + '25',
    },
    setsSummaryValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
        fontVariant: ['tabular-nums'],
    },
    setsSummaryValueWinner: {
        color: COLORS.success,
    },
    setsSummaryValueRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    setsSummaryTiebreakSup: {
        fontSize: 9,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginLeft: 2,
        marginTop: -4,
        lineHeight: 12,
        fontVariant: ['tabular-nums'],
    },

    // En directo: set, juegos del set, puntos del juego
    liveContextSection: {
        marginTop: 12,
        marginHorizontal: 20,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: COLORS.primary + '12',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    liveContextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    liveContextRowPoints: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    liveContextBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    liveContextBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
        fontVariant: ['tabular-nums'],
    },
    liveContextLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    liveContextGames: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontVariant: ['tabular-nums'],
        marginLeft: 'auto',
    },
    liveContextPoints: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary,
        fontVariant: ['tabular-nums'],
        marginLeft: 'auto',
    },

    // Server Indicator
    serverIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: COLORS.success + '15',
        marginHorizontal: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    serverIcon: {
        fontSize: 14,
    },
    serverText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.success,
    },
    tiebreakBadge: {
        backgroundColor: COLORS.warning,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tiebreakText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFF',
    },
});
