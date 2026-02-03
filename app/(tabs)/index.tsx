import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfidenceFilter from '../../components/match/ConfidenceFilter';
import DateSelector from '../../components/match/DateSelector';
import MatchCard from '../../components/match/MatchCard';
import StatusFilterTabs, { StatusFilterValue } from '../../components/match/StatusFilterTabs';
import TournamentSection from '../../components/match/TournamentSection';
import { useFavoritesRefresh } from '../../src/contexts/FavoritesRefreshContext';
import { useSmartAutoRefresh } from '../../src/hooks/useAutoRefresh';
import { fetchMatches } from '../../src/services/api/matchService';
import { ConfidenceLevel, Match } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';
import { formatDateLong, getDateRange, getTodayDate, isMatchStarted } from '../../src/utils/dateUtils';

export default function MatchFeedScreen() {
  const router = useRouter();
  const { incrementRefresh } = useFavoritesRefresh();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('ALL');
  const [confidenceFilter, setConfidenceFilter] = useState<'ALL' | ConfidenceLevel>('ALL');
  const [matchesSummary, setMatchesSummary] = useState<any>(null);

  // Generate date range for selector (7 days before and after today)
  const dateRange = useMemo(() => getDateRange(7, 7), []);

  // Load matches
  const loadMatches = useCallback(async (date: string) => {
    try {
      setError(null);
      const response = await fetchMatches(date);
      setMatches(response.partidos);
      setMatchesSummary(response.resumen);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los partidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMatches(selectedDate);
  }, [selectedDate, loadMatches]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMatches(selectedDate);
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

  // Refrescar estado de favoritos al volver a esta pestaña (ej. si se quitó un favorito desde la vista Favoritos)
  useFocusEffect(
    useCallback(() => {
      incrementRefresh();
    }, [incrementRefresh])
  );

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setLoading(true);
  };

  // Navigate to match detail
  const handleMatchPress = (match: Match) => {
    router.push({
      pathname: '/match/[id]' as any,
      params: {
        id: match.id.toString(),
        match: JSON.stringify(match),
      },
    });
  };

  // Filter by status (Todos, Finalizados, Por jugar, En directo)
  const statusFilteredMatches = useMemo(() => {
    if (statusFilter === 'ALL') return matches;
    return matches.filter(m => m.estado === statusFilter);
  }, [matches, statusFilter]);

  // Status counts for tabs
  const statusCounts = useMemo(() => ({
    all: matches.length,
    completado: matches.filter(m => m.estado === 'completado').length,
    pendiente: matches.filter(m => m.estado === 'pendiente').length,
    en_juego: matches.filter(m => m.estado === 'en_juego').length,
  }), [matches]);

  // Filter by confidence (applied after status filter)
  const filteredMatches = useMemo(() => {
    if (confidenceFilter === 'ALL') return statusFilteredMatches;
    return statusFilteredMatches.filter(match => {
      const level = match.prediccion?.confidence_level;
      return level === confidenceFilter;
    });
  }, [statusFilteredMatches, confidenceFilter]);

  // Group matches by tournament (from filtered list)
  const matchesByTournament = useMemo(() => {
    const grouped = new Map<string, Match[]>();

    filteredMatches.forEach((match) => {
      const tournamentKey = `${match.torneo || 'Sin Torneo'}_${match.superficie}`;
      if (!grouped.has(tournamentKey)) {
        grouped.set(tournamentKey, []);
      }
      grouped.get(tournamentKey)!.push(match);
    });

    // Sort matches within each tournament by time
    grouped.forEach((tournamentMatches) => {
      tournamentMatches.sort((a, b) => {
        // Live matches first
        if (a.estado === 'en_juego' && b.estado !== 'en_juego') return -1;
        if (a.estado !== 'en_juego' && b.estado === 'en_juego') return 1;

        // Then by time
        const timeA = a.hora_inicio || '23:59';
        const timeB = b.hora_inicio || '23:59';
        return timeA.localeCompare(timeB);
      });
    });

    return grouped;
  }, [filteredMatches]);

  // Calculate confidence counts (from status-filtered list)
  const confidenceCounts = useMemo(() => {
    const counts = { all: statusFilteredMatches.length, HIGH: 0, MEDIUM: 0, LOW: 0 };
    statusFilteredMatches.forEach(match => {
      const level = match.prediccion?.confidence_level;
      if (level === 'HIGH') counts.HIGH++;
      else if (level === 'MEDIUM') counts.MEDIUM++;
      else if (level === 'LOW') counts.LOW++;
    });
    return counts;
  }, [statusFilteredMatches]);

  // Check if any match has confidence data (in status-filtered list)
  const hasConfidenceData = useMemo(() => {
    return statusFilteredMatches.some(m => m.prediccion?.confidence_level);
  }, [statusFilteredMatches]);

  // Render match card
  const renderMatch = (match: Match) => (
    <MatchCard match={match} onPress={() => handleMatchPress(match)} />
  );

  // Empty state
  const renderEmptyState = () => {
    const statusLabel = statusFilter === 'ALL' ? '' : statusFilter === 'completado' ? ' finalizados' : statusFilter === 'pendiente' ? ' por jugar' : ' en directo';
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎾</Text>
        <Text style={styles.emptyTitle}>
          No hay partidos{statusLabel} para este día
        </Text>
        <Text style={styles.emptyText}>
          {statusFilter !== 'ALL' ? 'Prueba otro filtro o ' : ''}Selecciona otra fecha para ver más partidos
        </Text>
      </View>
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎾 Tennis ML</Text>
        </View>
        <DateSelector
          dates={dateRange}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
        <LoadingSpinner />
      </View>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎾 Tennis ML</Text>
        </View>
        <DateSelector
          dates={dateRange}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
        <ErrorMessage message={error} onRetry={() => loadMatches(selectedDate)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎾 Tennis ML</Text>
        <Text style={styles.headerSubtitle}>
          {formatDateLong(selectedDate)}
        </Text>
      </View>

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

      {/* Confidence Filter - Only show if we have confidence data */}
      {hasConfidenceData && (
        <ConfidenceFilter
          selectedFilter={confidenceFilter}
          onFilterChange={setConfidenceFilter}
          counts={confidenceCounts}
        />
      )}

      {/* Match Count Summary */}
      {filteredMatches.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {filteredMatches.length} {filteredMatches.length === 1 ? 'partido' : 'partidos'}
            {(statusFilter !== 'ALL' || confidenceFilter !== 'ALL') && ` (filtrado)`}
          </Text>
          {filteredMatches.filter(m => m.estado === 'en_juego').length > 0 && (
            <Text style={styles.liveIndicator}>
              🔴 {filteredMatches.filter(m => m.estado === 'en_juego').length} en vivo
            </Text>
          )}
        </View>
      )}

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
          renderEmptyState()
        ) : (
          Array.from(matchesByTournament.entries()).map(([tournamentKey, tournamentMatches]) => {
            const [tournamentName, surface] = tournamentKey.split('_');
            const filteredTournamentMatches = tournamentMatches;

            // Skip tournament if no matches (already filtered by status + confidence)
            if (filteredTournamentMatches.length === 0) return null;

            const hasLiveMatches = filteredTournamentMatches.some(m => m.estado === 'en_juego');

            return (
              <TournamentSection
                key={tournamentKey}
                tournamentName={tournamentName}
                surface={surface}
                matches={filteredTournamentMatches}
                renderMatch={renderMatch}
                initiallyExpanded={hasLiveMatches}
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
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
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
