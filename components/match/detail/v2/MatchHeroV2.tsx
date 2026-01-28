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
import { StyleSheet, Text, View } from 'react-native';
import { MatchFullResponse, SetScore, getShortName } from '../../../../src/types/matchDetail';
import { COLORS } from '../../../../src/utils/constants';
import { getCountryFlag } from '../../../../src/utils/countryUtils';
import LiveBadge from '../../LiveBadge';
import PlayerLogo from '../../PlayerLogo';

interface MatchHeroV2Props {
    data: MatchFullResponse;
}

export default function MatchHeroV2({ data }: MatchHeroV2Props) {
    const { match, player1, player2, winner, scores } = data;
    const isLive = match.status === 'en_juego';
    const isCompleted = match.status === 'completado';
    const isPending = match.status === 'pendiente';

    // Scores
    const setsWon = scores?.sets_won || [0, 0];
    const sets = scores?.sets || [];
    const live = scores?.live;

    return (
        <View style={styles.container}>
            {/* Tournament Info */}
            <View style={styles.tournamentSection}>
                <Text style={styles.tournamentName}>{match.tournament}</Text>
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
                <View style={styles.playerColumn}>
                    <PlayerLogo logoUrl={player1.logo_url} size={72} />
                    <View style={styles.playerInfo}>
                        {player1.country && (
                            <Text style={styles.flag}>{getCountryFlag(player1.country)}</Text>
                        )}
                        <Text 
                            style={[
                                styles.playerName,
                                winner === 1 && styles.winnerName
                            ]} 
                            numberOfLines={2}
                        >
                            {getShortName(player1.name)}
                        </Text>
                        {player1.ranking && (
                            <Text style={styles.ranking}>#{player1.ranking}</Text>
                        )}
                    </View>
                </View>

                {/* Center Score */}
                <View style={styles.centerScore}>
                    {isLive && <LiveBadge />}
                    
                    {isPending ? (
                        <View style={styles.vsContainer}>
                            <Text style={styles.vsText}>VS</Text>
                            <Text style={styles.statusText}>PROGRAMADO</Text>
                        </View>
                    ) : (
                        <View style={styles.mainScore}>
                            {/* Sets Won */}
                            <View style={styles.setsWonRow}>
                                <Text style={[
                                    styles.setsWonNumber,
                                    setsWon[0] > setsWon[1] && styles.winnerScore
                                ]}>
                                    {setsWon[0]}
                                </Text>
                                <Text style={styles.setsDash}>-</Text>
                                <Text style={[
                                    styles.setsWonNumber,
                                    setsWon[1] > setsWon[0] && styles.winnerScore
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

                            {/* Status */}
                            {isCompleted && (
                                <Text style={styles.statusText}>FINALIZADO</Text>
                            )}
                        </View>
                    )}
                </View>

                {/* Player 2 */}
                <View style={styles.playerColumn}>
                    <PlayerLogo logoUrl={player2.logo_url} size={72} />
                    <View style={styles.playerInfo}>
                        {player2.country && (
                            <Text style={styles.flag}>{getCountryFlag(player2.country)}</Text>
                        )}
                        <Text 
                            style={[
                                styles.playerName,
                                winner === 2 && styles.winnerName
                            ]} 
                            numberOfLines={2}
                        >
                            {getShortName(player2.name)}
                        </Text>
                        {player2.ranking && (
                            <Text style={styles.ranking}>#{player2.ranking}</Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Set Scores */}
            {sets.length > 0 && (
                <View style={styles.setsSection}>
                    {sets.map((set, idx) => (
                        <SetScoreBox 
                            key={idx} 
                            set={set} 
                            isCurrentSet={isLive && idx === sets.length - 1}
                        />
                    ))}
                </View>
            )}

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
// SET SCORE BOX
// ============================================================

interface SetScoreBoxProps {
    set: SetScore;
    isCurrentSet?: boolean;
}

function SetScoreBox({ set, isCurrentSet }: SetScoreBoxProps) {
    const p1Won = set.winner === 1;
    const p2Won = set.winner === 2;
    const hasTiebreak = !!set.tiebreak_score;

    return (
        <View style={[
            styles.setBox,
            isCurrentSet && styles.setBoxCurrent
        ]}>
            <Text style={styles.setLabel}>S{set.set_number}</Text>
            <View style={styles.setScores}>
                <Text style={[
                    styles.setScoreNum,
                    p1Won && styles.setScoreWinner
                ]}>
                    {set.player1_games}
                </Text>
                <Text style={styles.setScoreDash}>-</Text>
                <Text style={[
                    styles.setScoreNum,
                    p2Won && styles.setScoreWinner
                ]}>
                    {set.player2_games}
                </Text>
            </View>
            {hasTiebreak && (
                <Text style={styles.tiebreakScore}>({set.tiebreak_score})</Text>
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
    tournamentName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
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

    // Center Score
    centerScore: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        minWidth: 120,
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

    // Sets Section
    setsSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    setBox: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        minWidth: 56,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    setBoxCurrent: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '10',
    },
    setLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    setScores: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    setScoreNum: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textSecondary,
        fontVariant: ['tabular-nums'],
    },
    setScoreWinner: {
        color: COLORS.textPrimary,
    },
    setScoreDash: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    tiebreakScore: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 2,
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
