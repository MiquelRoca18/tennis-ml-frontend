import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchRankings } from '../src/services/api/rankingsService';
import { fetchTournaments } from '../src/services/api/tournamentService';
import { RankedPlayer } from '../src/types/api';
import { Tournament } from '../src/types/api';
import { COLORS } from '../src/utils/constants';
import { getCountryFlagSafe } from '../src/utils/countryUtils';

type Tab = 'players' | 'tournaments';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('players');
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rankingsRes, tournamentsRes] = await Promise.all([
        fetchRankings(500).catch(() => ({ players: [] })),
        fetchTournaments().catch(() => ({ tournaments: [] })),
      ]);
      setPlayers(rankingsRes.players ?? []);
      setTournaments(tournamentsRes.tournaments ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar');
      setPlayers([]);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const q = query.trim().toLowerCase();
  const filteredPlayers = q
    ? players.filter((p) => (p.player_name ?? '').toLowerCase().includes(q))
    : players;
  const filteredTournaments = q
    ? tournaments.filter((t) => (t.tournament_name ?? '').toLowerCase().includes(q))
    : tournaments;

  const renderPlayer = useCallback(
    ({ item }: { item: RankedPlayer }) => {
      const flag = getCountryFlagSafe(item.country);
      const key = String(item.player_key ?? '');
      return (
        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            Keyboard.dismiss();
            if (key) router.push({ pathname: '/player/[key]', params: { key } } as any);
          }}
          activeOpacity={0.7}
        >
          {flag ? <Text style={styles.flag}>{flag}</Text> : null}
          <View style={styles.rowText}>
            <Text style={styles.name} numberOfLines={1}>{item.player_name ?? '—'}</Text>
            {(item.atp_ranking != null || item.atp_points != null) && (
              <Text style={styles.meta}>
                {item.atp_ranking != null ? `#${item.atp_ranking}` : ''}
                {item.atp_ranking != null && item.atp_points != null ? ' · ' : ''}
                {item.atp_points != null ? `${item.atp_points} pts` : ''}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      );
    },
    [router]
  );

  const renderTournament = useCallback(
    ({ item }: { item: Tournament }) => {
      const key = String(item.tournament_key ?? '');
      const name = item.tournament_name ?? '—';
      return (
        <TouchableOpacity
          style={styles.row}
          onPress={() => {
            Keyboard.dismiss();
            if (key) router.push({ pathname: '/tournament/[key]', params: { key, name } } as any);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.tournamentIcon}>
            <Text style={styles.trophyIcon}>🏆</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            {item.event_type_type ? (
              <Text style={styles.meta} numberOfLines={1}>{item.event_type_type}</Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      );
    },
    [router]
  );

  const listEmpty = loading ? (
    <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>
  ) : error ? (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
        <Text style={styles.retryBtnText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>
        {q ? 'No hay resultados para "' + query + '"' : tab === 'players' ? 'Escribe para buscar jugadores' : 'Escribe para buscar torneos'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={tab === 'players' ? 'Buscar jugador...' : 'Buscar torneo...'}
        placeholderTextColor={COLORS.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'players' && styles.tabActive]}
          onPress={() => setTab('players')}
        >
          <Text style={[styles.tabText, tab === 'players' && styles.tabTextActive]}>Jugadores</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'tournaments' && styles.tabActive]}
          onPress={() => setTab('tournaments')}
        >
          <Text style={[styles.tabText, tab === 'tournaments' && styles.tabTextActive]}>Torneos</Text>
        </TouchableOpacity>
      </View>
      {tab === 'players' ? (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => String(item.player_key ?? '')}
          renderItem={renderPlayer}
          ListEmptyComponent={listEmpty}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <FlatList
          data={filteredTournaments}
          keyExtractor={(item) => String(item.tournament_key ?? '')}
          renderItem={renderTournament}
          ListEmptyComponent={listEmpty}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: '#FFF' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  flag: { fontSize: 22, marginRight: 12 },
  tournamentIcon: { width: 40, alignItems: 'center', marginRight: 12 },
  trophyIcon: { fontSize: 22 },
  rowText: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  meta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  centered: { padding: 32, alignItems: 'center' },
  errorText: { color: COLORS.danger, textAlign: 'center', marginBottom: 12 },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center' },
  retryBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 8 },
  retryBtnText: { color: '#FFF', fontWeight: '600' },
});
