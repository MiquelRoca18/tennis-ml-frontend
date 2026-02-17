import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchTournaments } from '../../../src/services/api/tournamentService';
import { Tournament } from '../../../src/types/api';
import { COLORS } from '../../../src/utils/constants';

function TournamentRow({ tournament, onPress }: { tournament: Tournament; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {tournament.tournament_name}
        </Text>
        {tournament.event_type_type ? (
          <Text style={styles.type} numberOfLines={1}>
            {tournament.event_type_type}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

export default function TournamentsScreen() {
  const router = useRouter();
  const [data, setData] = useState<{ total: number; tournaments: Tournament[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetchTournaments();
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar torneos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando torneos...</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => load()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tournaments = data?.tournaments ?? [];

  return (
    <View style={styles.container}>
      <FlatList
        data={tournaments}
        keyExtractor={(item) => String(item.tournament_key)}
        renderItem={({ item }) => (
          <TournamentRow
            tournament={item}
            onPress={() =>
              router.push({
                pathname: '/tournament/[key]',
                params: { key: String(item.tournament_key), name: item.tournament_name },
              })
            }
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay torneos. Sincroniza desde el panel de administración (POST /tournaments/sync).
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  loadingText: { marginTop: 12, color: COLORS.textSecondary },
  errorText: { color: COLORS.danger, textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: '#FFF', fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  type: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  emptyText: {
    padding: 24,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
