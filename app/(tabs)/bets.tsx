import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { getBets, removeBet } from '../../src/services/betsService';
import type { Bet } from '../../src/services/betsService';
import { COLORS } from '../../src/utils/constants';

function formatDate(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return createdAt;
  }
}

export default function BetsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteBet = useCallback(
    (bet: Bet) => {
      Alert.alert(
        'Cancelar apuesta',
        `¿Cancelar esta apuesta de ${bet.stakeEur.toFixed(2)}€?\nSe devolverá esa cantidad al bankroll.`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí, cancelar',
            style: 'destructive',
            onPress: async () => {
              setDeletingId(bet.id);
              const result = await removeBet(bet, user?.id);
              setDeletingId(null);
              if (result.success) {
                setBets((prev) => prev.filter((b) => b.id !== bet.id));
                Alert.alert('Listo', `${bet.stakeEur.toFixed(2)}€ devueltos al bankroll.`);
              } else {
                Alert.alert('Error', result.error ?? 'No se pudo cancelar la apuesta');
              }
            },
          },
        ]
      );
    },
    [user?.id]
  );

  const loadBets = useCallback(async () => {
    try {
      const list = await getBets(user?.id);
      setBets(list);
    } catch {
      setBets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadBets();
    }, [loadBets])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBets();
  }, [loadBets]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis apuestas</Text>
        <Text style={styles.headerSubtitle}>
          Apuestas registradas. El bankroll se actualiza al apostar; cuando ganes, actualízalo en Configuración.
        </Text>
      </View>
      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {bets.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Sin apuestas</Text>
              <Text style={styles.emptyText}>
                Cuando apuestes a un partido desde su detalle (botón "Registrar apuesta"), aparecerán aquí.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.buttonText}>Ver partidos</Text>
              </TouchableOpacity>
            </View>
          ) : (
            bets.map((bet) => (
              <View key={bet.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.matchLabel} numberOfLines={1}>
                    {bet.player1Name || 'Jugador 1'} vs {bet.player2Name || 'Jugador 2'}
                  </Text>
                  <Text style={styles.stake}>{bet.stakeEur.toFixed(2)}€</Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.date}>{formatDate(bet.createdAt)}</Text>
                  <TouchableOpacity
                    style={[styles.deleteButton, deletingId === bet.id && styles.deleteButtonDisabled]}
                    onPress={() => handleDeleteBet(bet)}
                    disabled={deletingId !== null}
                  >
                    <Text style={styles.deleteButtonText}>
                      {deletingId === bet.id ? '...' : 'Cancelar apuesta'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
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
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  stake: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.danger + '20',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
});
