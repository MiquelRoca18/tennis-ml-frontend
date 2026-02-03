import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
import { COLORS } from '../../src/utils/constants';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user, isConfigured } = useAuth();
  const { favorites, loading, refresh } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Refrescar favoritos cada vez que la pestaña gana foco (ej. al volver de añadir un favorito)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

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

  const hasFavorites = favorites.length > 0;
  const showLoginPrompt = !user && !hasFavorites && isConfigured;

  // Agrupar favoritos por torneo, ordenados
  const favoritesByTournament = useMemo(() => {
    const grouped = new Map<string, Favorite[]>();
    favorites.forEach((fav) => {
      const key = fav.tournament?.trim() || 'Sin Torneo';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(fav);
    });
    grouped.forEach((list) => {
      list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    });
    return new Map([...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }, [favorites]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⭐ Favoritos</Text>
        {user && (
          <Text style={styles.headerSubtitle}>
            {favorites.length} {favorites.length === 1 ? 'partido' : 'partidos'} guardados
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
            {Array.from(favoritesByTournament.entries()).map(([tournamentName, tournamentFavorites]) => (
              <FavoriteTournamentSection
                key={tournamentName}
                tournamentName={tournamentName}
                favorites={tournamentFavorites}
                initiallyExpanded={favoritesByTournament.size <= 3}
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
