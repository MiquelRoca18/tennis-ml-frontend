import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../src/utils/constants';
import { getCountryFlag } from '../../../src/utils/countryUtils';
import { formatMatchTime } from '../../../src/utils/formatters';
import { isMatchStarted } from '../../../src/utils/dateUtils';
import LiveBadge from '../LiveBadge';
import PlayerLogo from '../PlayerLogo';
import { SOLO_RESULTADO_FINAL_STATUS } from '../../../src/utils/formatters';

interface MatchHeroProps {
    match: any;
    matchDetails?: any;
}

export default function MatchHero({ match, matchDetails }: MatchHeroProps) {
    const { jugador1, jugador2, torneo, superficie, fecha_partido, hora_inicio, estado, resultado, is_live, ronda } = match;
    const isLive = is_live === '1' || estado === 'en_juego';
    const isCompleted = estado === 'completado';
    const isPending = estado === 'pendiente';
    const fechaStr = (typeof fecha_partido === 'string' ? fecha_partido : (fecha_partido as Date)?.toISOString?.()?.slice(0, 10) ?? '').slice(0, 10);
    const hasStarted = Boolean(fechaStr) && isMatchStarted(fechaStr, hora_inicio ?? null);
    const noLiveDataButStarted = hasStarted && isPending;

    // Get live data if available
    const liveData = resultado?.scores?.live;
    const currentGameScore = liveData?.current_game_score || match.event_game_result;
    const currentServer = liveData?.current_server || match.event_serve;

    // Get scores from multiple sources with priority
    const getScore = () => {
        // Priority 1: structured scores from resultado
        // Solo contar sets COMPLETADOS (winner definido). No contar sets en curso (ej. 3-1).
        if (resultado?.scores?.sets && resultado.scores.sets.length > 0) {
            const sets = resultado.scores.sets;
            const p1 = sets.filter((s: any) => s.winner === 1).length;
            const p2 = sets.filter((s: any) => s.winner === 2).length;
            return {
                player1Sets: p1,
                player2Sets: p2,
                sets: sets.map((s: any) => ({
                    jugador1: s.player1_score,
                    jugador2: s.player2_score,
                    tiebreak: s.tiebreak_score,
                    set: s.set_number
                })),
                setsResult: resultado.scores.sets_result
            };
        }
        
        // Priority 2: matchDetails estadisticas_basicas
        // Solo contar sets completados (6+ juegos con ventaja de 2, o 7-6)
        if (matchDetails?.estadisticas_basicas?.marcador_por_sets && matchDetails.estadisticas_basicas.marcador_por_sets.length > 0) {
            const sets = matchDetails.estadisticas_basicas.marcador_por_sets;
            const isSetCompleted = (j1: number, j2: number) => {
                const [lo, hi] = [Math.min(j1, j2), Math.max(j1, j2)];
                return hi >= 6 && (hi - lo >= 2 || lo >= 6);
            };
            const p1 = sets.filter((s: any) => isSetCompleted(s.jugador1, s.jugador2) && s.jugador1 > s.jugador2).length;
            const p2 = sets.filter((s: any) => isSetCompleted(s.jugador1, s.jugador2) && s.jugador2 > s.jugador1).length;
            return {
                player1Sets: p1,
                player2Sets: p2,
                sets: sets,
                setsResult: null
            };
        }
        
        // Priority 3: resultado.marcador string
        if (resultado?.marcador) {
            const parts = resultado.marcador.split(',')[0].trim().split('-');
            return {
                player1Sets: parseInt(parts[0]) || 0,
                player2Sets: parseInt(parts[1]) || 0,
                sets: [],
                setsResult: resultado.marcador
            };
        }
        return null;
    };

    const score = getScore();

    return (
        <View style={styles.container}>
            {/* Tournament Info */}
            <View style={styles.tournamentInfo}>
                <Text style={styles.tournamentName}>{torneo}</Text>
                <View style={styles.matchMeta}>
                    <Text style={styles.metaText}>{superficie}</Text>
                    <Text style={styles.metaSeparator}>•</Text>
                    <Text style={styles.metaText}>{formatMatchTime(fecha_partido, hora_inicio)}</Text>
                </View>
            </View>

            {/* Players Section */}
            <View style={styles.playersContainer}>
                {/* Player 1 */}
                <View style={styles.playerSection}>
                    <PlayerLogo logoUrl={jugador1.logo} size={80} style={styles.playerLogo} />
                    <View style={styles.playerInfo}>
                        {jugador1.pais && (
                            <Text style={styles.flag}>{getCountryFlag(jugador1.pais)}</Text>
                        )}
                        <Text style={[
                            styles.playerName,
                            isCompleted && resultado?.ganador === jugador1.nombre && styles.winnerName
                        ]} numberOfLines={2}>
                            {jugador1.nombre}
                        </Text>
                        {jugador1.ranking && (
                            <Text style={styles.ranking}>#{jugador1.ranking}</Text>
                        )}
                    </View>
                </View>

                {/* Score / VS / Status */}
                <View style={styles.scoreContainer}>
                    {isLive && <LiveBadge />}

                    {isPending ? (
                        <View style={styles.vsContainer}>
                            <Text style={styles.vsText}>VS</Text>
                            {noLiveDataButStarted ? (
                                <>
                                    <Text style={[styles.statusText, { color: SOLO_RESULTADO_FINAL_STATUS.color }]}>{SOLO_RESULTADO_FINAL_STATUS.emoji} {SOLO_RESULTADO_FINAL_STATUS.text}</Text>
                                    <Text style={styles.srfSubtitle}>No hay datos en directo. El resultado se mostrará al finalizar.</Text>
                                </>
                            ) : (
                                <Text style={styles.statusText}>PROGRAMADO</Text>
                            )}
                        </View>
                    ) : score ? (
                        <View style={styles.scoreWrapper}>
                            <View style={styles.scoreDisplay}>
                                <Text style={[
                                    styles.scoreText,
                                    score.player1Sets > score.player2Sets && styles.winnerScore
                                ]}>
                                    {score.player1Sets}
                                </Text>
                                <Text style={styles.scoreSeparator}>-</Text>
                                <Text style={[
                                    styles.scoreText,
                                    score.player2Sets > score.player1Sets && styles.winnerScore
                                ]}>
                                    {score.player2Sets}
                                </Text>
                            </View>
                            
                            {/* Live game score */}
                            {isLive && currentGameScore && currentGameScore !== '-' && (
                                <View style={styles.liveGameContainer}>
                                    <Text style={styles.liveGameScore}>{currentGameScore}</Text>
                                </View>
                            )}
                            
                            {isCompleted && (
                                <Text style={styles.statusText}>FINALIZADO</Text>
                            )}
                        </View>
                    ) : (
                        <View style={styles.vsContainer}>
                            <Text style={styles.vsText}>VS</Text>
                        </View>
                    )}
                </View>

                {/* Player 2 */}
                <View style={styles.playerSection}>
                    <PlayerLogo logoUrl={jugador2.logo} size={80} style={styles.playerLogo} />
                    <View style={styles.playerInfo}>
                        {jugador2.pais && (
                            <Text style={styles.flag}>{getCountryFlag(jugador2.pais)}</Text>
                        )}
                        <Text style={[
                            styles.playerName,
                            isCompleted && resultado?.ganador === jugador2.nombre && styles.winnerName
                        ]} numberOfLines={2}>
                            {jugador2.nombre}
                        </Text>
                        {jugador2.ranking && (
                            <Text style={styles.ranking}>#{jugador2.ranking}</Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Set Scores (if completed or live and available) */}
            {(isCompleted || isLive) && score?.sets && score.sets.length > 0 && (
                <View style={styles.setsContainer}>
                    {score.sets.map((set: any, idx: number) => {
                        const hasTiebreak = set.tiebreak !== undefined && set.tiebreak !== null;
                        const p1Won = set.jugador1 > set.jugador2;
                        const p2Won = set.jugador2 > set.jugador1;
                        
                        return (
                            <View key={idx} style={styles.setScore}>
                                <Text style={[
                                    styles.setScoreText,
                                    p1Won && styles.wonSet
                                ]}>
                                    {set.jugador1}
                                </Text>
                                <Text style={styles.setScoreSeparator}>-</Text>
                                <Text style={[
                                    styles.setScoreText,
                                    p2Won && styles.wonSet
                                ]}>
                                    {set.jugador2}
                                </Text>
                                {hasTiebreak && (
                                    <Text style={styles.tiebreakScore}>
                                        ({set.tiebreak})
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}
            
            {/* Server indicator for live matches */}
            {isLive && currentServer && (
                <View style={styles.serverIndicator}>
                    <Text style={styles.serverText}>
                        🎾 Saca: {currentServer === 'First Player' ? jugador1.nombre : jugador2.nombre}
                    </Text>
                </View>
            )}
            
            {/* Round info */}
            {ronda && (
                <View style={styles.roundContainer}>
                    <Text style={styles.roundText}>{ronda}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.primary + '10',
        paddingTop: 20,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    tournamentInfo: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    tournamentName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 6,
    },
    matchMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    metaSeparator: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    playersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    playerSection: {
        flex: 1,
        alignItems: 'center',
        gap: 12,
    },
    playerLogo: {
        marginBottom: 4,
    },
    playerInfo: {
        alignItems: 'center',
        gap: 4,
    },
    flag: {
        fontSize: 20,
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
    scoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
        gap: 8,
    },
    vsContainer: {
        alignItems: 'center',
        gap: 8,
    },
    vsText: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textSecondary,
        letterSpacing: 1,
        marginTop: 8,
    },
    srfSubtitle: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    scoreWrapper: {
        alignItems: 'center',
        gap: 8,
    },
    scoreDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    scoreText: {
        fontSize: 48,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontFamily: 'RobotoMono-Bold',
    },
    scoreSeparator: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    winnerScore: {
        color: COLORS.success,
    },
    setsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 20,
        marginTop: 8,
    },
    setScore: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    setScoreText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
        fontFamily: 'RobotoMono-Regular',
    },
    wonSet: {
        color: COLORS.textPrimary,
        fontWeight: '700',
    },
    setScoreSeparator: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    tiebreakScore: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginLeft: 2,
    },
    liveGameContainer: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
    },
    liveGameScore: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
        fontFamily: 'RobotoMono-Bold',
    },
    serverIndicator: {
        backgroundColor: COLORS.success + '15',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'center',
        marginTop: 12,
    },
    serverText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.success,
    },
    roundContainer: {
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    roundText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
