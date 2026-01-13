import { useRouter } from 'expo-router';
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
import DateSelector from '../../components/match/DateSelector';
import MatchCard from '../../components/match/MatchCard';
import TournamentSection from '../../components/match/TournamentSection';
import { fetchMatches } from '../../src/services/api/matchService';
import { Match } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';
import { formatDateLong, getDateRange, getTodayDate } from '../../src/utils/dateUtils';

export default function MatchFeedScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());

  // Generate date range for selector (7 days before and after today)
  const dateRange = useMemo(() => getDateRange(7, 7), []);

  // Load matches
  const loadMatches = useCallback(async (date: string) => {
    try {
      setError(null);
      const response = await fetchMatches(date);
      setMatches(response.partidos);
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

  // Group matches by tournament
  const matchesByTournament = useMemo(() => {
    const grouped = new Map<string, Match[]>();

    matches.forEach((match) => {
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
  }, [matches]);

  // Render match card
  const renderMatch = (match: Match) => (
    <MatchCard match={match} onPress={() => handleMatchPress(match)} />
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎾</Text>
      <Text style={styles.emptyTitle}>No hay partidos disponibles</Text>
      <Text style={styles.emptyText}>
        Selecciona otra fecha para ver más partidos
      </Text>
    </View>
  );

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

      {/* Match Count Summary */}
      {matches.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {matches.length} {matches.length === 1 ? 'partido' : 'partidos'}
          </Text>
          {matches.filter(m => m.estado === 'en_juego').length > 0 && (
            <Text style={styles.liveIndicator}>
              🔴 {matches.filter(m => m.estado === 'en_juego').length} en vivo
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
            const hasLiveMatches = tournamentMatches.some(m => m.estado === 'en_juego');

            return (
              <TournamentSection
                key={tournamentKey}
                tournamentName={tournamentName}
                surface={surface}
                matches={tournamentMatches}
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
