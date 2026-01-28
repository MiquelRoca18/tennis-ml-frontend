import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Match } from '../../src/types/api';
import { COLORS, EV_THRESHOLD_BET, EV_THRESHOLD_MARGINAL } from '../../src/utils/constants';
import { formatSeed, getCountryFlag } from '../../src/utils/countryUtils';
import { formatMatchStatus, formatMatchTime, formatOdds, formatPercentage, formatProbability } from '../../src/utils/formatters';
import CompletedMatchScore from './CompletedMatchScore';
import ConfidenceBadge from './ConfidenceBadge';
import LiveBadge from './LiveBadge';
import PlayerLogo from './PlayerLogo';

interface MatchCardProps {
    match: Match;
    onPress: () => void;
}

export default function MatchCard({ match, onPress }: MatchCardProps) {
    const router = useRouter();
    const { jugador1, jugador2, prediccion, estado, hora_inicio, is_live, resultado, fecha_partido } = match;

    // Get match status
    const matchStatus = formatMatchStatus(estado);

    // Determine if we should show prediction
    const shouldShowPrediction = estado === 'pendiente' && !is_live && prediccion !== null;
    const isCompleted = estado === 'completado';

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

    // Determine recommendation text
    const getRecommendationText = () => {
        if (!prediccion) return null;
        if (!prediccion.mejor_opcion) return null;

        if (isLowConfidence) {
            return '❌ NO APOSTAR - Baja confianza';
        }

        if (isMediumConfidence && isBet) {
            return `⚠️ ${prediccion.mejor_opcion} `;
        }

        return prediccion.mejor_opcion;
    };

    const recommendationText = getRecommendationText();

    const handleCardPress = () => {
        onPress(); // Always navigate to detail page
    };

    const handlePlayerPress = (playerKey: string, event: any) => {
        event.stopPropagation();
        const keyNum = parseInt(playerKey);
        if (!isNaN(keyNum)) {
            router.push(`/ player / ${keyNum} ` as any);
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
                            {is_live ? (
                                <LiveBadge />
                            ) : (
                                <Text style={[styles.statusText, { color: matchStatus.color }]}>
                                    {matchStatus.emoji} {matchStatus.text}
                                </Text>
                            )}
                        </View>
                        <Text style={styles.time}>{formatMatchTime(fecha_partido, hora_inicio)}</Text>
                    </View>

                    {/* Players Section - Unified Layout for All States */}
                    <>
                        {/* Player 1 Row */}
                        <View style={styles.playerRow}>
                            <PlayerLogo logoUrl={jugador1.logo} size={40} style={styles.playerLogo} />
                            <View style={styles.playerInfo}>
                                <TouchableOpacity
                                    onPress={(e) => handlePlayerPress(jugador1.key, e)}
                                    activeOpacity={0.7}
                                    style={styles.playerNameRow}
                                >
                                    {jugador1.pais && (
                                        <Text style={styles.flag}>{getCountryFlag(jugador1.pais)}</Text>
                                    )}
                                    {jugador1.seed && (
                                        <Text style={styles.seed}>{formatSeed(jugador1.seed)}</Text>
                                    )}
                                    <Text style={[
                                        styles.playerName,
                                        isCompleted && resultado?.ganador === jugador1.nombre && styles.winnerName
                                    ]} numberOfLines={1}>
                                        {jugador1.nombre}
                                    </Text>
                                </TouchableOpacity>
                                {jugador1.ranking && (
                                    <Text style={styles.ranking}>#{jugador1.ranking}</Text>
                                )}
                            </View>
                            <View style={styles.rightInfo}>
                                {isCompleted && resultado ? (
                                    <CompletedMatchScore
                                        marcador={resultado.marcador}
                                        player1Name={jugador1.nombre}
                                        player2Name={jugador2.nombre}
                                        isWinner1={resultado.ganador === jugador1.nombre}
                                        playerIndex={1}
                                    />
                                ) : shouldShowPrediction && prediccion ? (
                                    <Text style={styles.probability}>{formatProbability(prediccion.jugador1_probabilidad)}</Text>
                                ) : (
                                    <Text style={styles.odds}>@{formatOdds(jugador1.cuota)}</Text>
                                )}
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Player 2 Row */}
                        <View style={styles.playerRow}>
                            <PlayerLogo logoUrl={jugador2.logo} size={40} style={styles.playerLogo} />
                            <View style={styles.playerInfo}>
                                <TouchableOpacity
                                    onPress={(e) => handlePlayerPress(jugador2.key, e)}
                                    activeOpacity={0.7}
                                    style={styles.playerNameRow}
                                >
                                    {jugador2.pais && (
                                        <Text style={styles.flag}>{getCountryFlag(jugador2.pais)}</Text>
                                    )}
                                    {jugador2.seed && (
                                        <Text style={styles.seed}>{formatSeed(jugador2.seed)}</Text>
                                    )}
                                    <Text style={[
                                        styles.playerName,
                                        isCompleted && resultado?.ganador === jugador2.nombre && styles.winnerName
                                    ]} numberOfLines={1}>
                                        {jugador2.nombre}
                                    </Text>
                                </TouchableOpacity>
                                {jugador2.ranking && (
                                    <Text style={styles.ranking}>#{jugador2.ranking}</Text>
                                )}
                            </View>
                            <View style={styles.rightInfo}>
                                {isCompleted && resultado ? (
                                    <CompletedMatchScore
                                        marcador={resultado.marcador}
                                        player1Name={jugador1.nombre}
                                        player2Name={jugador2.nombre}
                                        isWinner1={resultado.ganador === jugador1.nombre}
                                        playerIndex={2}
                                    />
                                ) : shouldShowPrediction && prediccion ? (
                                    <Text style={styles.probability}>{formatProbability(prediccion.jugador2_probabilidad)}</Text>
                                ) : (
                                    <Text style={styles.odds}>@{formatOdds(jugador2.cuota)}</Text>
                                )}
                            </View>
                        </View>
                    </>

                    {/* Confidence Warning - Only for pending matches with low/medium confidence */}
                    {shouldShowPrediction && prediccion && showConfidenceWarning && (
                        <View style={[
                            styles.warningBanner,
                            { backgroundColor: isLowConfidence ? COLORS.danger + '15' : COLORS.warning + '15' }
                        ]}>
                            <Text style={styles.warningIcon}>{isLowConfidence ? '❌' : '⚠️'}</Text>
                            <View style={styles.warningContent}>
                                <Text style={[
                                    styles.warningTitle,
                                    { color: isLowConfidence ? COLORS.danger : COLORS.warning }
                                ]}>
                                    {isLowConfidence ? 'BAJA CONFIANZA' : 'Confianza Media'}
                                </Text>
                                <Text style={styles.warningSubtitle}>
                                    {isLowConfidence
                                        ? 'Jugadores sin historial - No recomendado'
                                        : 'Datos limitados disponibles'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Footer - Only for pending matches */}
                    {shouldShowPrediction && prediccion && (
                        <View style={styles.footer}>
                            <View style={styles.evContainer}>
                                <Text style={styles.evLabel}>EV:</Text>
                                <Text style={[styles.evValue, { color: evColor }]}>
                                    {formatPercentage(bestEV)}
                                </Text>
                                {recommendationText && (
                                    <Text style={[styles.recommendation, { color: evColor }]} numberOfLines={1}>
                                        {recommendationText}
                                    </Text>
                                )}
                            </View>
                            {confidenceLevel && (
                                <ConfidenceBadge confidenceLevel={confidenceLevel} />
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
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    time: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 12,
    },
    playerName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginRight: 6,
    },
    ranking: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    rightInfo: {
        minWidth: 60,
        alignItems: 'flex-end',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        gap: 6,
    },
    flag: {
        fontSize: 16,
    },
    seed: {
        fontSize: 11,
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
