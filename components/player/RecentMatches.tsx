import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PlayerMatch } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';
import { formatMatchStatus } from '../../src/utils/formatters';

interface RecentMatchesProps {
    matches: PlayerMatch[];
    playerName: string;
}

interface MatchRowProps {
    match: PlayerMatch;
    playerName: string;
    onPress: () => void;
}

function MatchRow({ match, playerName, onPress }: MatchRowProps) {
    const isWin = match.resultado_ganador === playerName;
    const opponent = match.jugador1_nombre === playerName
        ? match.jugador2_nombre
        : match.jugador1_nombre;

    const matchStatus = formatMatchStatus(match.estado);

    return (
        <TouchableOpacity
            style={styles.matchRow}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Result Badge */}
            <View style={[
                styles.resultBadge,
                isWin ? styles.winBadge : styles.lossBadge
            ]}>
                <Text style={[
                    styles.resultText,
                    isWin ? styles.winText : styles.lossText
                ]}>
                    {match.estado === 'completado' ? (isWin ? 'W' : 'L') : matchStatus.emoji}
                </Text>
            </View>

            {/* Match Info */}
            <View style={styles.matchInfo}>
                <Text style={styles.opponent} numberOfLines={1}>
                    vs {opponent}
                </Text>
                <View style={styles.matchDetails}>
                    <Text style={styles.tournament} numberOfLines={1}>
                        {match.torneo}
                    </Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.surface}>{match.superficie}</Text>
                </View>
            </View>

            {/* Score */}
            <View style={styles.scoreContainer}>
                {match.resultado_marcador ? (
                    <Text style={styles.score} numberOfLines={1}>
                        {match.resultado_marcador}
                    </Text>
                ) : (
                    <Text style={styles.statusText}>{matchStatus.text}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

export default function RecentMatches({ matches, playerName }: RecentMatchesProps) {
    const router = useRouter();

    if (!matches || matches.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Últimos Partidos</Text>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No hay partidos recientes
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Últimos Partidos</Text>

            <View style={styles.matchesList}>
                {matches.map((match) => (
                    <MatchRow
                        key={match.id}
                        match={match}
                        playerName={playerName}
                        onPress={() => router.push(`/match/${match.id}`)}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    matchesList: {
        gap: 12,
    },
    matchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    resultBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    winBadge: {
        backgroundColor: COLORS.success + '20',
        borderColor: COLORS.success,
    },
    lossBadge: {
        backgroundColor: COLORS.danger + '20',
        borderColor: COLORS.danger,
    },
    resultText: {
        fontSize: 14,
        fontWeight: '700',
    },
    winText: {
        color: COLORS.success,
    },
    lossText: {
        color: COLORS.danger,
    },
    matchInfo: {
        flex: 1,
        gap: 4,
    },
    opponent: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    matchDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tournament: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
        flex: 1,
    },
    dot: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    surface: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    score: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
});
