import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchRankings } from '../../../src/services/api/rankingsService';
import { RankedPlayer, RankingsResponse } from '../../../src/types/api';
import { COLORS } from '../../../src/utils/constants';
import { getCountryFlag } from '../../../src/utils/countryUtils';

function movementIcon(movement?: string | null) {
  if (!movement || movement === 'same') return null;
  if (movement === 'up') return '↑';
  if (movement === 'down') return '↓';
  return null;
}

function RankRow({
  player,
  index,
  onPress,
}: {
  player: RankedPlayer;
  index: number;
  onPress: () => void;
}) {
  const rank = player.atp_ranking ?? player.wta_ranking ?? index + 1;
  const points = player.atp_points ?? player.wta_points ?? 0;
  const movement = player.ranking_movement ?? null;
  const flag = getCountryFlag(player.country);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rankCell}>
        <Text style={styles.rankText}>{rank}</Text>
        {movementIcon(movement) ? (
          <Text style={[styles.movement, movement === 'up' ? styles.movementUp : styles.movementDown]}>
            {movementIcon(movement)}
          </Text>
        ) : null}
      </View>
      <View style={styles.nameCell}>
        <Text style={styles.flag}>{flag}</Text>
        <Text style={styles.playerName} numberOfLines={1}>
          {player.player_name}
        </Text>
      </View>
      <Text style={styles.points}>{points.toLocaleString()}</Text>
    </TouchableOpacity>
  );
}

export default function RankingsScreen() {
  const router = useRouter();
  const [data, setData] = useState<RankingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetchRankings(200);
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar rankings');
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
        <Text style={styles.loadingText}>Cargando rankings...</Text>
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

  const players = data?.players ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerRank}>#</Text>
        <Text style={styles.headerName}>Jugador</Text>
        <Text style={styles.headerPoints}>Puntos</Text>
      </View>
      <FlatList
        data={players}
        keyExtractor={(item) => String(item.player_key)}
        renderItem={({ item, index }) => (
          <RankRow
            player={item}
            index={index}
            onPress={() => router.push({ pathname: '/player/[key]', params: { key: String(item.player_key) } })}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay datos del ranking ATP (individual masculino). Ejecuta POST /rankings/sync en el backend. Si tras el sync sigue en 0, comprueba en api-tennis.com que tu plan incluya «Standings».
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
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRank: { width: 44, fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  headerName: { flex: 1, fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  headerPoints: { width: 72, fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  rankCell: { width: 44, flexDirection: 'row', alignItems: 'center', gap: 4 },
  rankText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  movement: { fontSize: 12, fontWeight: '600' },
  movementUp: { color: COLORS.success },
  movementDown: { color: COLORS.danger },
  nameCell: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  flag: { fontSize: 18 },
  playerName: { fontSize: 15, color: COLORS.textPrimary, flex: 1 },
  points: { width: 72, fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'right' },
  emptyText: {
    padding: 24,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
