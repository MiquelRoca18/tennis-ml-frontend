import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Match } from '../../src/types/api';
import { COLORS, EV_THRESHOLD_BET, EV_THRESHOLD_MARGINAL } from '../../src/utils/constants';
import { formatMatchStatus, formatOdds, formatPercentage, formatProbability, formatTime } from '../../src/utils/formatters';

interface MatchCardProps {
    match: Match;
    onPress: () => void;
}

export default function MatchCard({ match, onPress }: MatchCardProps) {
    const { jugador1, jugador2, prediccion, estado, hora_inicio } = match;

    // Get match status
    const matchStatus = formatMatchStatus(estado);

    // Handle missing prediction
    if (!prediccion) {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.statusBar}>
                    <Text style={[styles.statusText, { color: matchStatus.color }]}>
                        {matchStatus.emoji} {matchStatus.text}
                    </Text>
                    <Text style={styles.time}>{formatTime(hora_inicio)}</Text>
                </View>

                <View style={styles.playerRow}>
                    <View style={styles.playerInfo}>
                        <Text style={styles.playerName} numberOfLines={1}>
                            {jugador1.nombre}
                        </Text>
                        {jugador1.ranking && (
                            <Text style={styles.ranking}>[{jugador1.ranking}]</Text>
                        )}
                    </View>
                    <Text style={styles.odds}>@{formatOdds(jugador1.cuota)}</Text>
                </View>

                <View style={styles.playerRow}>
                    <View style={styles.playerInfo}>
                        <Text style={styles.playerName} numberOfLines={1}>
                            {jugador2.nombre}
                        </Text>
                        {jugador2.ranking && (
                            <Text style={styles.ranking}>[{jugador2.ranking}]</Text>
                        )}
                    </View>
                    <Text style={styles.odds}>@{formatOdds(jugador2.cuota)}</Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.pendingText}>⏳ Predicción pendiente</Text>
                </View>
            </TouchableOpacity>
        );
    }

    // Determine best option and EV
    const bestEV = Math.max(prediccion.jugador1_ev, prediccion.jugador2_ev);
    const isBet = bestEV > EV_THRESHOLD_BET;
    const isMarginal = bestEV > EV_THRESHOLD_MARGINAL && bestEV <= EV_THRESHOLD_BET;

    // Recommendation color
    const evColor = isBet ? COLORS.success : isMarginal ? COLORS.warning : COLORS.danger;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Status Bar */}
            <View style={styles.statusBar}>
                <Text style={[styles.statusText, { color: matchStatus.color }]}>
                    {matchStatus.emoji} {matchStatus.text}
                </Text>
                <Text style={styles.time}>{formatTime(hora_inicio)}</Text>
            </View>

            {/* Player 1 */}
            <View style={styles.playerRow}>
                <View style={styles.playerInfo}>
                    <Text style={styles.playerName} numberOfLines={1}>
                        {jugador1.nombre}
                    </Text>
                    {jugador1.ranking && (
                        <Text style={styles.ranking}>[{jugador1.ranking}]</Text>
                    )}
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.probability}>{formatProbability(prediccion.jugador1_probabilidad)}</Text>
                    <Text style={styles.odds}>@{formatOdds(jugador1.cuota)}</Text>
                </View>
            </View>

            {/* Player 2 */}
            <View style={styles.playerRow}>
                <View style={styles.playerInfo}>
                    <Text style={styles.playerName} numberOfLines={1}>
                        {jugador2.nombre}
                    </Text>
                    {jugador2.ranking && (
                        <Text style={styles.ranking}>[{jugador2.ranking}]</Text>
                    )}
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.probability}>{formatProbability(prediccion.jugador2_probabilidad)}</Text>
                    <Text style={styles.odds}>@{formatOdds(jugador2.cuota)}</Text>
                </View>
            </View>

            {/* Footer with EV */}
            <View style={styles.footer}>
                <View style={styles.evContainer}>
                    <Text style={styles.evLabel}>EV:</Text>
                    <Text style={[styles.evValue, { color: evColor }]}>
                        {formatPercentage(bestEV)}
                    </Text>
                    {prediccion.mejor_opcion && (
                        <Text style={[styles.recommendation, { color: evColor }]} numberOfLines={1}>
                            • {prediccion.mejor_opcion}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    time: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    playerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    playerName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginRight: 4,
    },
    ranking: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    probability: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
        minWidth: 48,
        textAlign: 'right',
    },
    odds: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '600',
        minWidth: 42,
        textAlign: 'right',
    },
    footer: {
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: COLORS.border + '40',
    },
    evContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    evLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginRight: 4,
    },
    evValue: {
        fontSize: 12,
        fontWeight: '700',
        marginRight: 4,
    },
    recommendation: {
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    pendingText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
});
