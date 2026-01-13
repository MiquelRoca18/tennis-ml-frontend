import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ErrorMessage from '../../components/common/ErrorMessage';
import { fetchStatsSummary } from '../../src/services/api/statsService';
import { StatsPeriod, StatsSummaryResponse } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';
import { formatCurrency, formatPercentage } from '../../src/utils/formatters';

export default function DashboardScreen() {
  const [stats, setStats] = useState<StatsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<StatsPeriod>('7d');

  const loadStats = async (period: StatsPeriod) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStatsSummary(period);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats(selectedPeriod);
  }, [selectedPeriod]);

  const handlePeriodChange = (period: StatsPeriod) => {
    setSelectedPeriod(period);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => loadStats(selectedPeriod)} />;
  }

  if (!stats) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay datos disponibles</Text>
      </View>
    );
  }

  const { apuestas, financiero, modelo } = stats;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Dashboard</Text>
        <Text style={styles.headerSubtitle}>{stats.periodo}</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === '7d' && styles.periodButtonActive]}
          onPress={() => handlePeriodChange('7d')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === '7d' && styles.periodButtonTextActive]}>
            7 días
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === '30d' && styles.periodButtonActive]}
          onPress={() => handlePeriodChange('30d')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === '30d' && styles.periodButtonTextActive]}>
            30 días
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'all' && styles.periodButtonActive]}
          onPress={() => handlePeriodChange('all')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'all' && styles.periodButtonTextActive]}>
            Todo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.cardsContainer}>
        {/* Total Apostado */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>💰</Text>
          <Text style={styles.cardLabel}>Total Apostado</Text>
          <Text style={styles.cardValue}>{formatCurrency(financiero.stake_total)}</Text>
        </View>

        {/* Ganancia Neta */}
        <View style={[styles.card, { backgroundColor: financiero.ganancia_neta >= 0 ? COLORS.success + '10' : COLORS.danger + '10' }]}>
          <Text style={styles.cardIcon}>{financiero.ganancia_neta >= 0 ? '📈' : '📉'}</Text>
          <Text style={styles.cardLabel}>Ganancia Neta</Text>
          <Text style={[styles.cardValue, { color: financiero.ganancia_neta >= 0 ? COLORS.success : COLORS.danger }]}>
            {formatCurrency(financiero.ganancia_neta)}
          </Text>
        </View>

        {/* ROI */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardLabel}>ROI</Text>
          <Text style={[styles.cardValue, { color: financiero.roi >= 0 ? COLORS.success : COLORS.danger }]}>
            {formatPercentage(financiero.roi)}
          </Text>
        </View>

        {/* Win Rate */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>🎯</Text>
          <Text style={styles.cardLabel}>Win Rate</Text>
          <Text style={styles.cardValue}>
            {formatPercentage(apuestas.win_rate)}
          </Text>
          <Text style={styles.cardSubtext}>
            {apuestas.ganadas}/{apuestas.total} ganadas
          </Text>
        </View>
      </View>

      {/* Detailed Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Resumen de Apuestas</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total de apuestas:</Text>
          <Text style={styles.statValue}>{apuestas.total}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Apuestas ganadas:</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{apuestas.ganadas}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Apuestas perdidas:</Text>
          <Text style={[styles.statValue, { color: COLORS.danger }]}>{apuestas.perdidas}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Ganancia bruta:</Text>
          <Text style={styles.statValue}>{formatCurrency(financiero.ganancia_bruta)}</Text>
        </View>
      </View>

      {/* Model Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 Rendimiento del Modelo</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Accuracy:</Text>
          <Text style={styles.statValue}>
            {modelo.accuracy != null ? formatPercentage(modelo.accuracy) : 'N/A'}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Brier Score:</Text>
          <Text style={styles.statValue}>
            {modelo.brier_score != null ? modelo.brier_score.toFixed(3) : 'N/A'}
          </Text>
          <Text style={styles.statHint}>(menor es mejor)</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>EV Promedio:</Text>
          <Text style={[styles.statValue, { color: modelo.ev_promedio != null && modelo.ev_promedio >= 0 ? COLORS.success : COLORS.danger }]}>
            {modelo.ev_promedio != null ? formatPercentage(modelo.ev_promedio) : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Sobre estas estadísticas</Text>
        <Text style={styles.infoText}>
          Estas métricas muestran el rendimiento histórico del modelo y las apuestas registradas.
          Un ROI positivo indica rentabilidad a largo plazo.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  cardSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
