import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { fetchTournamentMatches } from '../../src/services/api/tournamentService';
import { Match, TournamentMatchesResponse } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';
import { formatMatchStatus } from '../../src/utils/formatters';

interface MatchRowProps {
    match: Match;
    onPress: () => void;
}

function MatchRow({ match, onPress }: MatchRowProps) {
    const matchStatus = formatMatchStatus(match.estado);

    return (
        <TouchableOpacity
            style={styles.matchRow}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.matchInfo}>
                <Text style={styles.players}>
                    {match.jugador1.nombre} vs {match.jugador2.nombre}
                </Text>
                <View style={styles.matchDetails}>
                    <Text style={styles.round}>{match.ronda || 'Ronda'}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.surface}>{match.superficie}</Text>
                </View>
            </View>

            <View style={styles.statusContainer}>
                {match.estado === 'completado' && match.resultado ? (
                    <Text style={styles.score}>{match.resultado.marcador}</Text>
                ) : (
                    <Text style={[styles.status, { color: matchStatus.color }]}>
                        {matchStatus.emoji} {matchStatus.text}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

export default function TournamentDetailPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const rawKey = params.key as string | undefined;
    const tournamentKey = rawKey ? parseInt(rawKey, 10) : NaN;
    const validKey = Number.isFinite(tournamentKey) ? tournamentKey : null;
    const tournamentName = (params.name as string) || 'Torneo';

    const [data, setData] = useState<TournamentMatchesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (validKey != null) loadTournamentMatches();
        else setLoading(false);
    }, [validKey]);

    const loadTournamentMatches = async () => {
        if (validKey == null) return;
        setLoading(true);
        setError(null);
        try {
            const matchesData = await fetchTournamentMatches(validKey);
            setData(matchesData);
        } catch (err: any) {
            console.error('Error loading tournament matches:', err);
            setError('No se pudieron cargar los partidos del torneo');
        } finally {
            setLoading(false);
        }
    };

    const handleMatchPress = (match: Match) => {
        router.push({
            pathname: '/match/[id]',
            params: { match: JSON.stringify(match) }
        } as any);
    };

    if (validKey == null) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text style={styles.errorText}>Torneo no válido</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={2}>
                    {tournamentName}
                </Text>
                <View style={styles.backButton} />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Cargando partidos...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={loadTournamentMatches} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : data && data.matches.length > 0 ? (
                <>
                    <View style={styles.statsBar}>
                        <Text style={styles.statsText}>
                            {data.total_matches} {data.total_matches === 1 ? 'partido' : 'partidos'}
                        </Text>
                        {data.season && (
                            <Text style={styles.statsText}>Temporada {data.season}</Text>
                        )}
                    </View>

                    <FlatList
                        data={data.matches}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <MatchRow match={item} onPress={() => handleMatchPress(item)} />
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No hay partidos disponibles para este torneo
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    backButton: {
        width: 80,
    },
    backText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    statsText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    listContent: {
        padding: 16,
        gap: 8,
    },
    matchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    matchInfo: {
        flex: 1,
        gap: 6,
        marginRight: 12,
    },
    players: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    matchDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    round: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
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
    statusContainer: {
        alignItems: 'flex-end',
    },
    score: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
