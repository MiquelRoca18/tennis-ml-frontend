import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import AppHeader from '../../components/common/AppHeader';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DateSelector from '../../components/match/DateSelector';
import MatchCard from '../../components/match/MatchCard';
import StatusFilterTabs, { StatusFilterValue } from '../../components/match/StatusFilterTabs';
import TournamentSection from '../../components/match/TournamentSection';
import { useFavoritesRefresh } from '../../src/contexts/FavoritesRefreshContext';
import { useSmartAutoRefresh } from '../../src/hooks/useAutoRefresh';
import { fetchMatches } from '../../src/services/api/matchService';
import { prefetchMatchFull } from '../../src/services/api/matchDetailService';
import { getCachedMatches, setCachedMatches } from '../../src/services/api/matchesCache';
import { Match } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';
import { formatDateLong, getDateRange, getTodayDate, isMatchStarted } from '../../src/utils/dateUtils';

const feedLayoutStyles = StyleSheet.create({
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  liveIndicator: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

// --- Componentes extraídos para reducir tamaño de MatchFeedScreen ---

function FeedEmptyState({ statusFilter }: { statusFilter: StatusFilterValue }) {
  const statusLabel = statusFilter === 'ALL' ? '' : statusFilter === 'completado' ? ' finalizados' : statusFilter === 'pendiente' ? ' por jugar' : ' en directo';
  return (
    <View style={feedLayoutStyles.emptyContainer}>
      <Text style={feedLayoutStyles.emptyIcon}>🎾</Text>
      <Text style={feedLayoutStyles.emptyTitle}>
        No hay partidos{statusLabel} para este día
      </Text>
      <Text style={feedLayoutStyles.emptyText}>
        {statusFilter !== 'ALL' ? 'Prueba otro filtro o ' : ''}Selecciona otra fecha para ver más partidos
      </Text>
    </View>
  );
}

function FeedSummaryBar({
  count,
  liveCount,
  statusFilter,
}: {
  count: number;
  liveCount: number;
  statusFilter: StatusFilterValue;
}) {
  if (count === 0) return null;
  return (
    <View style={feedLayoutStyles.summaryBar}>
      <Text style={feedLayoutStyles.summaryText}>
        {count} {count === 1 ? 'partido' : 'partidos'}
        {statusFilter !== 'ALL' && ` (filtrado)`}
      </Text>
      {liveCount > 0 && (
        <Text style={feedLayoutStyles.liveIndicator}>
          🔴 {liveCount} en vivo
        </Text>
      )}
    </View>
  );
}

// --- Reducer y estado del feed ---

type FeedState = {
  matches: Match[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  matchesSummary: any;
  bettingConfig: { bankroll: number } | null;
};

type FeedAction =
  | { type: 'CACHE_HIT'; payload: { partidos: Match[]; resumen: any; betting_config?: { bankroll: number } | null } }
  | { type: 'FETCH_SUCCESS'; payload: { partidos: Match[]; resumen: any; betting_config?: { bankroll: number } | null } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'RETRY'; payload: null };

const initialFeedState: FeedState = {
  matches: [],
  loading: true,
  refreshing: false,
  error: null,
  matchesSummary: null,
  bettingConfig: null,
};

function feedReducer(state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case 'CACHE_HIT':
    case 'FETCH_SUCCESS':
      return {
        ...state,
        matches: action.payload.partidos ?? [],
        matchesSummary: action.payload.resumen ?? null,
        bettingConfig: action.payload.betting_config ?? state.bettingConfig,
        loading: false,
        refreshing: false,
        error: null,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
        refreshing: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload, ...(action.payload ? { error: null } : {}) };
    case 'SET_REFRESHING':
      return { ...state, refreshing: action.payload };
    case 'RETRY':
      return { ...state, loading: true, error: null };
    default:
      return state;
  }
}

export default function MatchFeedScreen() {
  const router = useRouter();
  const { incrementRefresh } = useFavoritesRefresh();
  const [feedState, dispatch] = useReducer(feedReducer, initialFeedState);
  const { matches, loading, refreshing, error, matchesSummary, bettingConfig } = feedState;
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDate());
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('ALL');

  // Generate date range for selector (7 days before and after today)
  const dateRange = useMemo(() => getDateRange(7, 7), []);

  const cancelledRef = useRef(false);

  const loadMatches = useCallback(async (date: string, forceNetwork = false, getIsCancelled?: () => boolean) => {
    const cached = !forceNetwork ? getCachedMatches(date) : null;
    if (cached) {
      if (__DEV__) console.log(`[Feed] ${date} - CACHE HIT, showing immediately`);
      queueMicrotask(() => {
        if (getIsCancelled?.()) return;
        dispatch({
          type: 'CACHE_HIT',
          payload: {
            partidos: cached.partidos ?? [],
            resumen: cached.resumen ?? null,
            betting_config: cached.betting_config ?? undefined,
          },
        });
      });
      fetchMatches(date)
        .then((response) => {
          if (getIsCancelled?.()) return;
          setCachedMatches(date, response);
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: {
              partidos: response.partidos ?? [],
              resumen: response.resumen ?? null,
              betting_config: response.betting_config ?? undefined,
            },
          });
        })
        .catch(() => {});
      return;
    }
    // Primera carga sin caché: pedir sin enriquecimiento live (respuesta en ~2-5s en vez de ~15s)
    if (__DEV__) {
      console.log(`[Feed] ${date} - no cache, first load (live=false)`);
      console.time(`[Feed] ${date}`);
    }
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetchMatches(date, { live: false });
      if (__DEV__) {
        console.timeEnd(`[Feed] ${date}`);
        console.log(`[Feed] ${date} - done, ${response.partidos?.length ?? 0} partidos`);
      }
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          partidos: response.partidos ?? [],
          resumen: response.resumen ?? null,
          betting_config: response.betting_config ?? undefined,
        },
      });
      setCachedMatches(date, response);
      // Revalidar en segundo plano con datos en directo para actualizar estados/marcadores
      fetchMatches(date)
        .then((full) => {
          if (getIsCancelled?.()) return;
          setCachedMatches(date, full);
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: {
              partidos: full.partidos ?? [],
              resumen: full.resumen ?? null,
              betting_config: full.betting_config ?? undefined,
            },
          });
        })
        .catch(() => {});
    } catch (err: any) {
      if (__DEV__) console.timeEnd(`[Feed] ${date}`);
      dispatch({ type: 'FETCH_ERROR', payload: err?.message || 'Error al cargar los partidos' });
    }
  }, []);

  // Initial load: marcar como no cancelado y pasar getIsCancelled para ignorar respuestas si el usuario cambió de fecha
  useEffect(() => {
    cancelledRef.current = false;
    loadMatches(selectedDate, false, () => cancelledRef.current);
    return () => {
      cancelledRef.current = true;
    };
  }, [selectedDate, loadMatches]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    dispatch({ type: 'SET_REFRESHING', payload: true });
    loadMatches(selectedDate, true);
  }, [selectedDate, loadMatches]);

  // Solo considerar "en vivo" si el partido ha empezado (fecha+hora en el pasado)
  const hasLiveMatches = useMemo(() => {
    return matches.some(match => {
      const backendSaysLive = match.estado === 'en_juego' || Boolean(match.is_live);
      const hasStarted = isMatchStarted(match.fecha_partido, match.hora_inicio);
      return backendSaysLive && hasStarted;
    });
  }, [matches]);

  // Partidos cuya hora ya pasó pero el listado aún los marca pendiente → refrescar cada 15s para pillar el cambio a "en directo"
  const hasMatchesThatMayHaveJustStarted = useMemo(() => {
    return matches.some(match => {
      const hasStarted = isMatchStarted(match.fecha_partido, match.hora_inicio);
      return hasStarted && match.estado === 'pendiente';
    });
  }, [matches]);

  // Auto-refresh: 15s si hay en vivo O si hay partidos que ya deberían haber empezado (para que la card pase a EN VIVO pronto)
  useSmartAutoRefresh(hasLiveMatches || hasMatchesThatMayHaveJustStarted, () => {
    loadMatches(selectedDate);
  });

  // Al volver a la pestaña, recargar partidos (excepto en el primer foco para no duplicar la carga inicial)
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      incrementRefresh();
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      loadMatches(selectedDate);
    }, [incrementRefresh, selectedDate, loadMatches])
  );

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    dispatch({ type: 'SET_LOADING', payload: true });
  };

  // Navigate to match detail (pass bankroll so detail can show "según tu bankroll de X€" if needed)
  const handleMatchPress = (match: Match) => {
    prefetchMatchFull(match.id);
    router.push({
      pathname: '/match/[id]' as any,
      params: {
        id: match.id.toString(),
        match: JSON.stringify(match),
        ...(bettingConfig?.bankroll != null && { bankroll: String(bettingConfig.bankroll) }),
      },
    });
  };

  // Un partido cuenta como "En directo" si tiene datos en vivo O si ya empezó y sigue pendiente (sin datos API)
  const isMatchInLiveTab = useCallback((m: Match) =>
    m.estado === 'en_juego' || (isMatchStarted(m.fecha_partido, m.hora_inicio) && m.estado === 'pendiente'),
  []);

  // Filter by status (Todos, Finalizados, Por jugar, En directo)
  // "Por jugar" = solo pendientes que aún no han empezado (los que ya empezaron solo en "En directo")
  const statusFilteredMatches = useMemo(() => {
    if (statusFilter === 'ALL') return matches;
    if (statusFilter === 'en_juego') return matches.filter(isMatchInLiveTab);
    if (statusFilter === 'pendiente') return matches.filter(m => m.estado === 'pendiente' && !isMatchInLiveTab(m));
    return matches.filter(m => m.estado === statusFilter);
  }, [matches, statusFilter, isMatchInLiveTab]);

  // Status counts: pendiente = solo los que no cuentan como "en directo"
  const statusCounts = useMemo(() => ({
    all: matches.length,
    completado: matches.filter(m => m.estado === 'completado').length,
    pendiente: matches.filter(m => m.estado === 'pendiente' && !isMatchInLiveTab(m)).length,
    en_juego: matches.filter(isMatchInLiveTab).length,
  }), [matches, isMatchInLiveTab]);

  // Group matches by tournament (from status-filtered list)
  const matchesByTournament = useMemo(() => {
    const grouped = new Map<string, Match[]>();

    statusFilteredMatches.forEach((match) => {
      const tournamentKey = `${match.torneo || 'Sin Torneo'}_${match.superficie}`;
      if (!grouped.has(tournamentKey)) {
        grouped.set(tournamentKey, []);
      }
      grouped.get(tournamentKey)!.push(match);
    });

    // Sort matches within each tournament by time
    grouped.forEach((tournamentMatches) => {
      tournamentMatches.sort((a, b) => {
        // Partidos "en directo" (con datos o empezados sin datos) primero
        const aLive = isMatchInLiveTab(a);
        const bLive = isMatchInLiveTab(b);
        if (aLive && !bLive) return -1;
        if (!aLive && bLive) return 1;

        // Then by time
        const timeA = a.hora_inicio || '23:59';
        const timeB = b.hora_inicio || '23:59';
        return timeA.localeCompare(timeB);
      });
    });

    return grouped;
  }, [statusFilteredMatches, isMatchInLiveTab]);

  // Render match card
  const renderMatch = (match: Match) => (
    <MatchCard match={match} onPress={() => handleMatchPress(match)} />
  );

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <AppHeader title="Tenis" showSearch showAccount />
        <DateSelector
          dates={dateRange}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
        <LoadingSpinner message="Cargando partidos..." />
      </View>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <AppHeader title="Tenis" showSearch showAccount />
        <DateSelector
          dates={dateRange}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
        <ErrorMessage
          message={error}
          onRetry={() => {
            dispatch({ type: 'RETRY', payload: null });
            loadMatches(selectedDate);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Tenis"
        subtitle={formatDateLong(selectedDate)}
        showSearch
        showAccount
      />

      {/* Date Selector */}
      <DateSelector
        dates={dateRange}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      {/* Status Filter Tabs: Todos, Finalizados, Por jugar, En directo */}
      <StatusFilterTabs
        selectedFilter={statusFilter}
        onFilterChange={setStatusFilter}
        counts={statusCounts}
      />

      <FeedSummaryBar
        count={statusFilteredMatches.length}
        liveCount={statusFilteredMatches.filter(isMatchInLiveTab).length}
        statusFilter={statusFilter}
      />

      {/* Tournament Sections */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {matchesByTournament.size === 0 ? (
          <FeedEmptyState statusFilter={statusFilter} />
        ) : (
          Array.from(matchesByTournament.entries()).map(([tournamentKey, tournamentMatches]) => {
            const parts = tournamentKey.split('_');
            const surface = parts.pop() ?? '';
            const tournamentName = parts.join('_') || 'Sin Torneo';
            const filteredTournamentMatches = tournamentMatches;

            if (filteredTournamentMatches.length === 0) return null;

            const hasLiveMatches = filteredTournamentMatches.some(m => m.estado === 'en_juego');

            const firstMatch = filteredTournamentMatches[0];
            const tournamentId = firstMatch?.tournament_key != null ? String(firstMatch.tournament_key) : null;

            return (
              <TournamentSection
                key={tournamentKey}
                tournamentName={tournamentName}
                surface={surface}
                matches={filteredTournamentMatches}
                renderMatch={renderMatch}
                initiallyExpanded={hasLiveMatches}
                tournamentKey={tournamentId}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
});
