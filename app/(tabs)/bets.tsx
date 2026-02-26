import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { getBets, removeBet, deleteBetWithoutRefund } from '../../src/services/betsService';
import type { Bet } from '../../src/services/betsService';
import { fetchMatchesStatusBatch } from '../../src/services/api/matchService';
import { getShortName } from '../../src/types/matchDetail';
import { fetchBettingSettings, updateBettingBankroll } from '../../src/services/api/matchService';
import { COLORS } from '../../src/utils/constants';

function formatDate(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return createdAt;
  }
}

/** Formato "26 feb, 19:42" para fecha y hora del partido (match_date YYYY-MM-DD, match_time HH:mm) */
function formatMatchScheduled(matchDate?: string, matchTime?: string): string {
  if (!matchDate && !matchTime) return '';
  const parts: string[] = [];
  if (matchDate) {
    try {
      const [y, m, d] = matchDate.slice(0, 10).split('-');
      const dNum = parseInt(d, 10);
      const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const month = monthNames[parseInt(m, 10) - 1] ?? m;
      parts.push(`${dNum} ${month}`);
    } catch {
      parts.push(matchDate.slice(0, 10));
    }
  }
  if (matchTime) {
    parts.push(matchTime.slice(0, 5));
  }
  return parts.join(', ');
}

/** Compara si el ganador del partido coincide con el jugador apostado (nombres o apellido) */
function isSamePlayer(winnerName: string, pickedPlayer: string): boolean {
  if (!winnerName?.trim() || !pickedPlayer?.trim()) return false;
  const w = winnerName.trim().toLowerCase();
  const p = pickedPlayer.trim().toLowerCase();
  if (w === p) return true;
  const wLast = getShortName(winnerName).toLowerCase();
  const pLast = getShortName(pickedPlayer).toLowerCase();
  return wLast === pLast || w.includes(p) || p.includes(w);
}

export default function BetsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  /** matchId -> { match_date, match_time } desde status-batch */
  const [matchSchedule, setMatchSchedule] = useState<Record<string, { match_date?: string; match_time?: string }>>({});

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

      // Liquidar apuestas de partidos ya completados (1 llamada batch en lugar de N fetchMatchFull)
      if (list.length === 0) return;
      const matchIds = list.map((b) => b.matchId);
      let statusMap: Record<string, { status: string; winner: number | null; match_date?: string; match_time?: string }> = {};
      try {
        statusMap = await fetchMatchesStatusBatch(matchIds);
      } catch {
        // Si falla el batch, no liquidamos esta vez
      }
      const schedule: Record<string, { match_date?: string; match_time?: string }> = {};
      Object.entries(statusMap).forEach(([id, v]) => {
        if (v.match_date != null || v.match_time != null) {
          schedule[id] = { match_date: v.match_date, match_time: v.match_time };
        }
      });
      setMatchSchedule(schedule);

      let totalWinnings = 0;
      const toDelete: Bet[] = [];
      for (const bet of list) {
        const info = statusMap[String(bet.matchId)];
        if (!info || info.status !== 'completado' || info.winner == null) continue;
        if (!bet.pickedPlayer?.trim()) continue;
        const winnerName =
          info.winner === 1 ? bet.player1Name : bet.player2Name;
        if (!winnerName) continue;
        const won = isSamePlayer(winnerName, bet.pickedPlayer);
        if (won && bet.odds >= 1) totalWinnings += bet.potentialWin;
        toDelete.push(bet);
      }
      if (totalWinnings > 0) {
        try {
          const { bankroll = 0 } = await fetchBettingSettings();
          await updateBettingBankroll(bankroll + totalWinnings);
        } catch (e) {
          console.warn('[Bets] No se pudo actualizar bankroll tras liquidar:', e);
        }
      }
      for (const bet of toDelete) {
        await deleteBetWithoutRefund(bet, user?.id);
      }
      if (toDelete.length > 0) {
        const updated = await getBets(user?.id);
        setBets(updated);
      }
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
          Apuestas activas. Al ganar el partido se actualizará el bankroll y la apuesta saldrá de la lista.
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
            bets.map((bet) => {
              const scheduleInfo = matchSchedule[String(bet.matchId)];
              const matchScheduledStr = formatMatchScheduled(scheduleInfo?.match_date, scheduleInfo?.match_time);
              return (
                <Pressable
                  key={bet.id}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                  onPress={() => router.push({ pathname: '/match/[id]', params: { id: String(bet.matchId) } })}
                >
                  <View style={styles.cardRow}>
                    <Text style={styles.matchLabel} numberOfLines={1}>
                      {bet.player1Name || 'Jugador 1'} vs {bet.player2Name || 'Jugador 2'}
                    </Text>
                    <Text style={styles.stake}>{bet.stakeEur.toFixed(2)}€</Text>
                  </View>
                  {(bet.pickedPlayer || bet.bookmaker || bet.odds >= 1) && (
                    <View style={styles.betDetail}>
                      <Text style={styles.betDetailText} numberOfLines={1}>
                        {bet.pickedPlayer ? `Apostado a ${bet.pickedPlayer}` : ''}
                        {bet.odds >= 1 ? ` @ ${bet.odds.toFixed(2)}` : ''}
                        {bet.bookmaker ? ` en ${bet.bookmaker}` : ''}
                      </Text>
                      {bet.potentialWin > 0 && (
                        <Text style={styles.potentialWin}>
                          Ganancia potencial: {bet.potentialWin.toFixed(2)}€
                        </Text>
                      )}
                    </View>
                  )}
                  <View style={styles.cardFooter}>
                    <Text style={styles.date}>
                      {matchScheduledStr || formatDate(bet.createdAt)}
                    </Text>
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
                </Pressable>
              );
            })
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
  cardPressed: {
    opacity: 0.85,
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
  betDetail: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  betDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  potentialWin: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
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
