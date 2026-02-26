import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchTournamentMatches } from '../../src/services/api/tournamentService';
import { Match, TournamentMatchesResponse } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';
import MatchCard from '../../components/match/MatchCard';
import DateSelector from '../../components/match/DateSelector';
import { getTodayDate } from '../../src/utils/dateUtils';

/** Ordenar partidos: en vivo primero, luego por fecha y hora */
function sortMatchesByDateAndTime(matches: Match[]): Match[] {
    return [...matches].sort((a, b) => {
        const aLive = a.estado === 'en_juego' || Boolean(a.is_live);
        const bLive = b.estado === 'en_juego' || Boolean(b.is_live);
        if (aLive && !bLive) return -1;
        if (!aLive && bLive) return 1;
        const dateA = (a.fecha_partido || '').slice(0, 10);
        const dateB = (b.fecha_partido || '').slice(0, 10);
        const cmpDate = dateA.localeCompare(dateB);
        if (cmpDate !== 0) return cmpDate;
        const timeA = a.hora_inicio || '23:59';
        const timeB = b.hora_inicio || '23:59';
        return timeA.localeCompare(timeB);
    });
}

export default function TournamentDetailPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const rawKey = params.key as string | undefined;
    const tournamentKey = rawKey ? parseInt(rawKey, 10) : NaN;
    const validKey = Number.isFinite(tournamentKey) ? tournamentKey : null;
    const tournamentName = (params.name as string) || 'Torneo';

    const [data, setData] = useState<TournamentMatchesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    /** Fecha seleccionada en el selector de días (YYYY-MM-DD) */
    const [selectedDate, setSelectedDate] = useState<string>('');

    /** Días con partidos en el torneo, ordenados, para el DateSelector */
    const tournamentDates = useMemo(() => {
        if (!data?.matches?.length) return [];
        const keys = new Set<string>();
        for (const m of data.matches) {
            const key = (m.fecha_partido || '').slice(0, 10);
            if (key) keys.add(key);
        }
        return Array.from(keys).sort((a, b) => a.localeCompare(b));
    }, [data?.matches]);

    /** Al cargar datos, seleccionar el primer día o hoy si está en el torneo */
    const tournamentDatesKey = tournamentDates.join(',');
    useEffect(() => {
        if (tournamentDates.length === 0) return;
        const today = getTodayDate();
        if (tournamentDates.includes(today)) {
            setSelectedDate(today);
        } else {
            setSelectedDate(tournamentDates[0]);
        }
    }, [tournamentDatesKey]);

    /** Partidos del día seleccionado, ordenados por hora */
    const matchesForSelectedDay = useMemo(() => {
        if (!data?.matches?.length) return [];
        const dateToUse = selectedDate || tournamentDates[0];
        if (!dateToUse) return [];
        const ofDay = data.matches.filter((m) => (m.fecha_partido || '').slice(0, 10) === dateToUse);
        return sortMatchesByDateAndTime(ofDay);
    }, [data?.matches, selectedDate, tournamentDates]);

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
            params: { id: match.id.toString(), match: JSON.stringify(match) },
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
            <View style={[styles.header, { paddingTop: Math.max(16, insets.top) }]}>
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

                    <DateSelector
                        dates={tournamentDates}
                        selectedDate={selectedDate || tournamentDates[0] || ''}
                        onDateSelect={setSelectedDate}
                    />

                    <FlatList
                        data={matchesForSelectedDay}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <MatchCard
                                match={item}
                                onPress={() => handleMatchPress(item)}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            selectedDate ? (
                                <View style={styles.emptyDay}>
                                    <Text style={styles.emptyDayText}>
                                        No hay partidos este día
                                    </Text>
                                </View>
                            ) : null
                        }
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
        paddingBottom: 16,
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
        paddingVertical: 16,
        paddingHorizontal: 0,
    },
    emptyDay: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    emptyDayText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
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
