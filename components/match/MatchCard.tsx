import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FavoriteButton from '../ui/FavoriteButton';
import { useIsFavorite } from '../../src/hooks/useFavorites';
import { fetchPlayerLookup } from '../../src/services/api/playerService';
import { Match } from '../../src/types/api';
import { COLORS, EV_THRESHOLD_BET, EV_THRESHOLD_MARGINAL } from '../../src/utils/constants';
import { formatSeed, getCountryFlagSafe } from '../../src/utils/countryUtils';
import { isMatchStarted } from '../../src/utils/dateUtils';
import { formatMatchStatus, formatMatchTime, formatOdds, formatPercentage, formatProbability } from '../../src/utils/formatters';
import CompletedMatchScore from './CompletedMatchScore';
import LiveBadge from './LiveBadge';
import PlayerLogo from './PlayerLogo';

interface MatchCardProps {
    match: Match;
    onPress: () => void;
    /** Se llama cuando se quita de favoritos (para actualizar la lista en la vista Favoritos) */
    onFavoriteRemoved?: () => void;
}

export default function MatchCard({ match, onPress, onFavoriteRemoved }: MatchCardProps) {
    const router = useRouter();
    const { jugador1, jugador2, prediccion, estado, hora_inicio, is_live, resultado, fecha_partido, event_status } = match;
    const { favorited, loading: favLoading, toggle } = useIsFavorite(match.id);

    const isCompleted = estado === 'completado';
    // En vivo con datos de la API: backend dice en_juego/is_live
    const backendSaysLive = estado === 'en_juego' || Boolean(is_live);
    const hasStarted = isMatchStarted(fecha_partido, hora_inicio);
    const actuallyLive = backendSaysLive && (hasStarted || is_live === true);
    // En la card mostramos LIVE si tenemos datos en directo O si ya empezó y no está terminado (sin datos API → en detalle se verá "Solo Resultado Final")
    const showLiveOnCard = actuallyLive || (hasStarted && !isCompleted);

    const matchStatus = formatMatchStatus(estado);
    const hasPrediction = prediccion != null && typeof prediccion === 'object' && prediccion.jugador1_probabilidad != null;
    const shouldShowPrediction = estado === 'pendiente' && !showLiveOnCard && hasPrediction;

    const scoresForDisplay = resultado?.scores ?? null;
    const currentServer = resultado?.scores?.live?.current_server ?? null;
    const isPlayer1Serving = showLiveOnCard && actuallyLive && (currentServer === 'First Player' || /first|1/i.test(String(currentServer || '')));
    const isPlayer2Serving = showLiveOnCard && actuallyLive && (currentServer === 'Second Player' || /second|2/i.test(String(currentServer || '')));
    // Mostrar score solo cuando hay datos reales. En directo: no mostrar "0-0" ni marcador "0-0" si no hay sets ni puntos en vivo.
    const currentGameScore = scoresForDisplay?.live?.current_game_score;
    const isZeroZero = (s: string | null | undefined) =>
        s != null && String(s).trim().replace(/\s+/g, '-') === '0-0';
    const hasScoreToShow = Boolean(
        resultado && (
            (resultado.marcador && (resultado.marcador.trim() !== '0-0' || !showLiveOnCard))
            || (scoresForDisplay && (
                (scoresForDisplay.sets?.length ?? 0) > 0
                || (currentGameScore != null && !isZeroZero(currentGameScore))
                || (scoresForDisplay.sets_result && String(scoresForDisplay.sets_result).trim() !== '0-0')
            ))
        )
    );

    const isRetirementOrWalkover = Boolean(
        event_status && /retired|ret|walk|w\.o|w\/o|default/i.test(event_status)
    );
    const getFinishReasonLabel = (s?: string | null): string => {
        if (!s) return 'Retirada';
        const lower = s.toLowerCase();
        if (/retired|ret|retirement/.test(lower)) return 'Retirada';
        if (/walk|w\.o|w\/o/.test(lower)) return 'Walkover';
        if (/default/.test(lower)) return 'Default';
        return s;
    };

    // Determine best option and EV (only for pending matches)
    const bestEV = prediccion ? Math.max(prediccion.jugador1_ev, prediccion.jugador2_ev) : 0;
    const isBet = bestEV > EV_THRESHOLD_BET;
    const isMarginal = bestEV > EV_THRESHOLD_MARGINAL && bestEV <= EV_THRESHOLD_BET;

    // Determine confidence level (prefer new format)
    const confidenceLevel = prediccion?.confidence_level;
    const isLowConfidence = confidenceLevel === 'LOW' || confidenceLevel === 'UNKNOWN';
    const isMediumConfidence = confidenceLevel === 'MEDIUM';
    const isHighConfidence = confidenceLevel === 'HIGH';
    const showConfidenceWarning = isLowConfidence || isMediumConfidence;

    // INTELLIGENT RECOMMENDATION LOGIC: Consider both EV and confidence
    // Only show green if BOTH EV is good AND confidence is high (or no confidence data for backward compatibility)
    const shouldShowAsGoodBet = isBet && (isHighConfidence || !confidenceLevel);
    const shouldShowAsMarginal = (isMarginal || (isBet && isMediumConfidence)) && !isLowConfidence;

    // Determine color based on intelligent logic
    const evColor = isLowConfidence ? COLORS.danger
        : shouldShowAsGoodBet ? COLORS.success
            : shouldShowAsMarginal ? COLORS.warning
                : COLORS.danger;

    const handleCardPress = () => {
        onPress();
    };

    const handleFavoritePress = async () => {
        const newStatus = await toggle({
            player1Name: jugador1.nombre,
            player2Name: jugador2.nombre,
            tournament: match.torneo ?? '',
            eventKey: match.event_key,
        });
        if (!newStatus) onFavoriteRemoved?.();
    };

    const handlePlayerPress = async (playerKey: string | null | undefined, playerName: string, event: any) => {
        event?.stopPropagation?.();
        const key = playerKey != null ? String(playerKey).trim() : '';
        const numericKey = key ? parseInt(key, 10) : NaN;
        if (key && Number.isFinite(numericKey)) {
            router.push({ pathname: '/player/[key]', params: { key } } as any);
            return;
        }
        if (!playerName || !playerName.trim()) {
            Alert.alert('Perfil no disponible', 'No se puede abrir el perfil de este jugador.');
            return;
        }
        try {
            const resolvedKey = await fetchPlayerLookup(playerName.trim());
            if (resolvedKey != null) {
                router.push({ pathname: '/player/[key]', params: { key: String(resolvedKey) } } as any);
            } else {
                Alert.alert('Perfil no encontrado', 'No se encontró el perfil de este jugador.');
            }
        } catch {
            Alert.alert('Error', 'No se pudo cargar el perfil. Intenta de nuevo.');
        }
    };

    return (
        <>
            <View style={styles.cardWrapper}>
                <TouchableOpacity
                    style={styles.card}
                    onPress={handleCardPress}
                    activeOpacity={0.7}
                >
                    {/* Status Bar */}
                    <View style={styles.statusBar}>
                        <View style={styles.statusLeft}>
                            {showLiveOnCard ? (
                                <LiveBadge />
                            ) : (
                                <>
                                    <Text style={[styles.statusText, { color: matchStatus.color }]}>
                                        {matchStatus.emoji} {matchStatus.text}
                                    </Text>
                                    {isCompleted && isRetirementOrWalkover && (
                                        <View style={styles.reasonBadge}>
                                            <Text style={styles.reasonBadgeText}>{getFinishReasonLabel(event_status)}</Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                        <View style={styles.statusRight}>
                            <Text style={styles.time}>{formatMatchTime(fecha_partido, hora_inicio)}</Text>
                            <View style={styles.favButton} pointerEvents={favLoading ? 'none' : 'box-none'}>
                                <FavoriteButton
                                    isFavorite={favorited}
                                    onPress={handleFavoritePress}
                                    size={20}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Players Section - Unified Layout for All States */}
                    <>
                        {/* Player 1 Row */}
                        <View style={styles.playerRow}>
                            <PlayerLogo logoUrl={jugador1.logo} size={36} style={styles.playerLogo} />
                            <View style={styles.playerInfo}>
                                <TouchableOpacity
                                    onPress={(e) => handlePlayerPress(jugador1.key, jugador1.nombre, e)}
                                    activeOpacity={0.7}
                                    style={styles.playerNameRow}
                                >
                                    {getCountryFlagSafe(jugador1.pais) ? (
                                        <Text style={styles.flag}>{getCountryFlagSafe(jugador1.pais)}</Text>
                                    ) : null}
                                    {jugador1.seed && (
                                        <Text style={styles.seed}>{formatSeed(jugador1.seed)}</Text>
                                    )}
                                    <Text style={[
                                        styles.playerName,
                                        isCompleted && resultado?.ganador === jugador1.nombre && styles.winnerName
                                    ]} numberOfLines={1}>
                                        {jugador1.nombre}
                                    </Text>
                                    {isPlayer1Serving ? <Text style={styles.serverIcon}>🎾</Text> : null}
                                </TouchableOpacity>
                                {jugador1.ranking && (
                                    <Text style={styles.ranking}>#{jugador1.ranking}</Text>
                                )}
                            </View>
                            <View style={styles.rightInfo}>
                                {(isCompleted || showLiveOnCard) && hasScoreToShow ? (
                                    <CompletedMatchScore
                                        marcador={resultado?.marcador ?? ''}
                                        scores={scoresForDisplay ?? undefined}
                                        player1Name={jugador1.nombre}
                                        player2Name={jugador2.nombre}
                                        isWinner1={resultado?.ganador === jugador1.nombre}
                                        playerIndex={1}
                                        isLive={showLiveOnCard}
                                    />
                                ) : shouldShowPrediction && prediccion ? (
                                    <Text style={styles.probability}>{formatProbability(prediccion.jugador1_probabilidad)}</Text>
                                ) : jugador1.cuota > 0 ? (
                                    <Text style={styles.odds}>@{formatOdds(jugador1.cuota)}</Text>
                                ) : null}
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Player 2 Row */}
                        <View style={styles.playerRow}>
                            <PlayerLogo logoUrl={jugador2.logo} size={36} style={styles.playerLogo} />
                            <View style={styles.playerInfo}>
                                <TouchableOpacity
                                    onPress={(e) => handlePlayerPress(jugador2.key, jugador2.nombre, e)}
                                    activeOpacity={0.7}
                                    style={styles.playerNameRow}
                                >
                                    {getCountryFlagSafe(jugador2.pais) ? (
                                        <Text style={styles.flag}>{getCountryFlagSafe(jugador2.pais)}</Text>
                                    ) : null}
                                    {jugador2.seed && (
                                        <Text style={styles.seed}>{formatSeed(jugador2.seed)}</Text>
                                    )}
                                    <Text style={[
                                        styles.playerName,
                                        isCompleted && resultado?.ganador === jugador2.nombre && styles.winnerName
                                    ]} numberOfLines={1}>
                                        {jugador2.nombre}
                                    </Text>
                                    {isPlayer2Serving ? <Text style={styles.serverIcon}>🎾</Text> : null}
                                </TouchableOpacity>
                                {jugador2.ranking && (
                                    <Text style={styles.ranking}>#{jugador2.ranking}</Text>
                                )}
                            </View>
                            <View style={styles.rightInfo}>
                                {(isCompleted || showLiveOnCard) && hasScoreToShow ? (
                                    <CompletedMatchScore
                                        marcador={resultado?.marcador ?? ''}
                                        scores={scoresForDisplay ?? undefined}
                                        player1Name={jugador1.nombre}
                                        player2Name={jugador2.nombre}
                                        isWinner1={resultado?.ganador === jugador2.nombre}
                                        playerIndex={2}
                                        isLive={showLiveOnCard}
                                    />
                                ) : shouldShowPrediction && prediccion ? (
                                    <Text style={styles.probability}>{formatProbability(prediccion.jugador2_probabilidad)}</Text>
                                ) : jugador2.cuota > 0 ? (
                                    <Text style={styles.odds}>@{formatOdds(jugador2.cuota)}</Text>
                                ) : null}
                            </View>
                        </View>
                    </>

                    {/* Footer - Solo EV y cantidad sugerida (sin texto de recomendación ni confianza) */}
                    {shouldShowPrediction && prediccion && (
                        <View style={styles.footer}>
                            <View style={styles.footerTop}>
                                <Text style={styles.evLabel}>EV:</Text>
                                <Text style={[styles.evValue, { color: evColor }]}>
                                    {formatPercentage(bestEV)}
                                </Text>
                            </View>
                            {((prediccion.kelly_stake_jugador1 ?? 0) || (prediccion.kelly_stake_jugador2 ?? 0)) > 0 && (
                                <View style={styles.footerStakeRow}>
                                    <Text style={styles.stakeSuggested}>
                                        Cantidad sugerida: {((prediccion.kelly_stake_jugador1 ?? 0) || (prediccion.kelly_stake_jugador2 ?? 0)).toFixed(2)}€
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Completed match result */}
                    {isCompleted && resultado && resultado.apostamos && (
                        <View style={styles.footer}>
                            <View style={[
                                styles.resultBadge,
                                { backgroundColor: resultado.resultado_apuesta === 'ganada' ? COLORS.success + '20' : COLORS.danger + '20' }
                            ]}>
                                <Text style={[
                                    styles.resultText,
                                    { color: resultado.resultado_apuesta === 'ganada' ? COLORS.success : COLORS.danger }
                                ]}>
                                    {resultado.resultado_apuesta === 'ganada' ? '✓' : '✗'} {resultado.resultado_apuesta?.toUpperCase()}
                                </Text>
                                {resultado.ganancia !== undefined && (
                                    <Text style={styles.resultDetail}>
                                        {resultado.ganancia > 0 ? '+' : ''}{resultado.ganancia.toFixed(2)}€
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    cardWrapper: {
        marginBottom: 16,
        marginHorizontal: 16,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    reasonBadge: {
        backgroundColor: COLORS.warning + '25',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    reasonBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.warning,
        textTransform: 'uppercase',
    },
    statusRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    time: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    favButton: {
        padding: 4,
        minWidth: 28,
        alignItems: 'flex-end',
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 10,
        flexShrink: 1,
        minWidth: 0,
    },
    playerName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginRight: 4,
    },
    ranking: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    rightInfo: {
        minWidth: 80,
        alignItems: 'flex-end',
        flexShrink: 0,
    },
    probability: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.primary,
    },
    odds: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    score: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontFamily: 'RobotoMono-Bold',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 4,
    },
    footer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: 6,
    },
    footerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerStakeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    evContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    evLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginRight: 6,
        fontWeight: '600',
    },
    evValue: {
        fontSize: 14,
        fontWeight: '700',
        marginRight: 8,
    },
    recommendation: {
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    stakeSuggested: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
        gap: 8,
    },
    warningIcon: {
        fontSize: 16,
    },
    warningContent: {
        flex: 1,
    },
    warningTitle: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    warningSubtitle: {
        fontSize: 10,
        color: COLORS.textSecondary,
    },
    resultBadge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    resultText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    resultDetail: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    playerLogo: {
        marginRight: 0,
    },
    playerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    serverIcon: {
        fontSize: 12,
        marginLeft: 2,
    },
    flag: {
        fontSize: 14,
    },
    seed: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    winnerName: {
        fontWeight: '700',
        color: COLORS.success,
    },
    winnerScore: {
        color: COLORS.success,
    },
});
