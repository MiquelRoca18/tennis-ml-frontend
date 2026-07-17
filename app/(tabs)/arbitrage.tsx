/**
 * Arbitraje - apostar a los dos jugadores en casas distintas para beneficio garantizado.
 *
 * Aviso de frescura SIEMPRE visible: capturamos cuotas cada ~2h, así que muchos arbs pueden
 * haber desaparecido. Copy honesto sobre las pegas reales (la casa anula, te limitan).
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useArbitrage } from '../../src/hooks/useArbitrage';
import type { Arb } from '../../src/services/api/arbitrageService';
import { bookmakerLabel } from '../../src/lib/bookmakers';
import { COLORS } from '../../src/utils/constants';

function parseBankroll(text: string): number {
  const n = parseFloat(text.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 100;
}

function playerForSide(arb: Arb, side: number): string {
  return (side === 1 ? arb.jugador1 : arb.jugador2) ?? `Jugador ${side}`;
}

export default function ArbitrageScreen() {
  const [bankrollInput, setBankrollInput] = useState('100');
  const [bankroll, setBankroll] = useState(100);
  const { data, loading, error, refresh } = useArbitrage(bankroll);

  const arbs = data?.arbs ?? [];
  const staleMinutes = data?.stale_minutes ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Arbitraje</Text>
        <Text style={styles.headerSubtitle}>Beneficio garantizado apostando a los dos lados</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={COLORS.primary} />}
      >
        {/* Aviso de frescura + riesgos: SIEMPRE visible */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Verifica antes de apostar</Text>
          <Text style={styles.warningText}>
            {staleMinutes != null
              ? `Cuotas de hace ~${staleMinutes} min. El arbitraje puede haber desaparecido: `
              : 'Las cuotas cambian constantemente: '}
            comprueba cada cuota en su casa antes de apostar. Algunas casas anulan cuotas erróneas
            o limitan las cuentas que hacen arbitraje. Esto no es dinero gratis sin riesgo.
          </Text>
        </View>

        {/* Bankroll */}
        <View style={styles.bankrollRow}>
          <Text style={styles.bankrollLabel}>Reparto para</Text>
          <TextInput
            style={styles.bankrollInput}
            value={bankrollInput}
            onChangeText={setBankrollInput}
            onEndEditing={() => setBankroll(parseBankroll(bankrollInput))}
            keyboardType="decimal-pad"
            placeholder="100"
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="done"
          />
          <Text style={styles.bankrollLabel}>€</Text>
        </View>

        {error && (
          <Text style={styles.errorText}>No se pudieron cargar los arbitrajes. Desliza para reintentar.</Text>
        )}

        {loading && arbs.length === 0 && !error ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : arbs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No hay arbitrajes ahora mismo</Text>
            <Text style={styles.emptyText}>Es lo normal: aparecen pocas veces y duran poco. Vuelve más tarde.</Text>
          </View>
        ) : (
          arbs.map((arb) => (
            <View key={arb.match_id} style={styles.arbCard}>
              <View style={styles.arbHeader}>
                <Text style={styles.arbMatch} numberOfLines={1}>
                  {playerForSide(arb, 1)} vs {playerForSide(arb, 2)}
                </Text>
                <View style={styles.profitBadge}>
                  <Text style={styles.profitText}>+{arb.profit_pct.toFixed(1)}% garantizado</Text>
                </View>
              </View>
              {arb.legs.map((leg) => (
                <View key={leg.side} style={styles.legRow}>
                  <Text style={styles.legText}>
                    Apuesta <Text style={styles.legStake}>{leg.stake.toFixed(2)}€</Text> a{' '}
                    {playerForSide(arb, leg.side)} @ {leg.odds.toFixed(2)} en{' '}
                    <Text style={styles.legBook}>{bookmakerLabel(leg.bookmaker)}</Text>
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 14 },
  warningCard: {
    backgroundColor: COLORS.warning + '18',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.warning + '55',
  },
  warningTitle: { fontSize: 15, fontWeight: '800', color: COLORS.warning, marginBottom: 6 },
  warningText: { fontSize: 13, color: COLORS.textPrimary, lineHeight: 19 },
  bankrollRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bankrollLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  bankrollInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
    minWidth: 90,
  },
  errorText: { fontSize: 14, color: COLORS.warning, textAlign: 'center' },
  loader: { marginVertical: 40 },
  emptyCard: { alignItems: 'center', padding: 32, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  arbCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  arbHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  arbMatch: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  profitBadge: {
    backgroundColor: COLORS.success + '22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profitText: { fontSize: 13, fontWeight: '800', color: COLORS.success },
  legRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  legText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  legStake: { fontWeight: '800', color: COLORS.primary },
  legBook: { fontWeight: '700', color: COLORS.textPrimary },
});
