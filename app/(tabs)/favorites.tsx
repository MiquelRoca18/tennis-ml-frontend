import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FavoriteTournamentSection from '../../components/match/FavoriteTournamentSection';
import type { Favorite } from '../../src/services/favoritesService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../src/contexts/AuthContext';
import { useFavorites } from '../../src/hooks/useFavorites';
import { fetchMatches } from '../../src/services/api/matchService';
import { COLORS } from '../../src/utils/constants';
import { getTodayDate } from '../../src/utils/dateUtils';

type FavoritesFilter = 'all' | 'live';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user, isConfigured } = useAuth();
  const { favorites, loading, refresh } = useFavorites();
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FavoritesFilter>('all');
  const [liveMatchIds, setLiveMatchIds] = useState<Set<number>>(new Set());

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    if (filter === 'live') await fetchLiveIds();
    setRefreshing(false);
  };

  // Refrescar favoritos al entrar en la pestaña. Usamos ref para no depender de [refresh] y evitar bucle.
  useFocusEffect(
    useCallback(() => {
      refreshRef.current();
    }, [])
  );

  const fetchLiveIds = useCallback(async () => {
    try {
      const res = await fetchMatches(getTodayDate());
      setLiveMatchIds(
        new Set((res.partidos ?? []).filter((m) => m.estado === 'en_juego').map((m) => m.id))
      );
    } catch {
      setLiveMatchIds(new Set());
    }
  }, []);

  // Cuando el filtro es "En directo", cargar partidos de hoy y refrescar cada 60 s
  useEffect(() => {
    if (filter !== 'live') return;
    let cancelled = false;
    fetchLiveIds();
    const interval = setInterval(() => {
      if (cancelled) return;
      fetchLiveIds();
    }, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [filter, fetchLiveIds]);

  // Hooks siempre en el mismo orden (antes de cualquier return)
  const filteredFavorites = useMemo(() => {
    if (filter === 'all') return favorites;
    return favorites.filter((fav) => liveMatchIds.has(fav.matchId));
  }, [favorites, filter, liveMatchIds]);

  const favoritesByTournament = useMemo(() => {
    const grouped = new Map<string, Favorite[]>();
    filteredFavorites.forEach((fav) => {
      const key = fav.tournament?.trim() || 'Sin Torneo';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(fav);
    });
    grouped.forEach((list) => {
      list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    });
    return new Map([...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }, [filteredFavorites]);

  const hasFavorites = favorites.length > 0;
  const showLoginPrompt = !user && !hasFavorites && isConfigured;

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⭐ Favoritos</Text>
        </View>
        <LoadingSpinner message="Cargando favoritos..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⭐ Favoritos</Text>
        {user && (
          <Text style={styles.headerSubtitle}>
            {refreshing ? 'Actualizando…' : `${favorites.length} ${favorites.length === 1 ? 'partido' : 'partidos'} guardados`}
          </Text>
        )}
      </View>

      {showLoginPrompt && (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginIcon}>🔐</Text>
          <Text style={styles.loginTitle}>Inicia sesión para sincronizar</Text>
          <Text style={styles.loginText}>
            Tus favoritos se guardarán en la nube y estarán disponibles en todos tus dispositivos
          </Text>
          {isConfigured && (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!hasFavorites && !showLoginPrompt && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>☆</Text>
          <Text style={styles.emptyTitle}>Sin favoritos</Text>
          <Text style={styles.emptyText}>
            Marca partidos como favoritos desde el detalle del partido para verlos aquí
          </Text>
        </View>
      )}

      {hasFavorites && (
        <>
          {/* Filtros Todos / En directo */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
              onPress={() => setFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterPillText, filter === 'all' && styles.filterPillTextActive]}>
                Todos los partidos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterPill, filter === 'live' && styles.filterPillActive]}
              onPress={() => setFilter('live')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterPillText, filter === 'live' && styles.filterPillTextActive]}>
                En directo
              </Text>
            </TouchableOpacity>
          </View>
          {!user && isConfigured && (
            <TouchableOpacity
              style={styles.syncBanner}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.syncBannerText}>☁️ Inicia sesión para sincronizar tus favoritos</Text>
              <Text style={styles.syncBannerSubtext}>Toca para guardarlos en la nube</Text>
            </TouchableOpacity>
          )}
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
            {filter === 'live' && filteredFavorites.length === 0 && (
              <View style={styles.emptyFilterState}>
                <Text style={styles.emptyFilterText}>No hay favoritos en directo ahora</Text>
                <Text style={styles.emptyFilterSubtext}>Pulsa "Todos los partidos" para ver todos</Text>
              </View>
            )}
            {Array.from(favoritesByTournament.entries()).map(([tournamentName, tournamentFavorites]) => (
              <FavoriteTournamentSection
                key={tournamentName}
                tournamentName={tournamentName}
                favorites={tournamentFavorites}
                initiallyExpanded={false}
                onFavoriteRemoved={refresh}
              />
            ))}
          </ScrollView>
        </>
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
    backgroundColor: COLORS.surface,
    paddingTop: 60,
    paddingBottom: 16,
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
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFF',
  },
  emptyFilterState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyFilterText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptyFilterSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  syncBanner: {
    backgroundColor: COLORS.primary + '20',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  syncBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  syncBannerSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  loginPrompt: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
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
