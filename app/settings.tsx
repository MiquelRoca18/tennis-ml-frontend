import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { useBankroll } from '../src/contexts/BankrollContext';
import { fetchBettingSettings, updateBettingBankroll } from '../src/services/api/matchService';
import { COLORS } from '../src/utils/constants';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { bankroll: contextBankroll, loading: bankrollContextLoading, saveBankroll, refreshBankroll } = useBankroll();
  const [bankroll, setBankroll] = useState<string>('');
  const [bankrollLoading, setBankrollLoading] = useState(true);
  const [bankrollSaving, setBankrollSaving] = useState(false);

  const loadBettingSettings = useCallback(async () => {
    if (user) return;
    try {
      setBankrollLoading(true);
      const res = await fetchBettingSettings();
      setBankroll(String(res.bankroll));
    } catch {
      setBankroll('1000');
    } finally {
      setBankrollLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !bankrollContextLoading) {
      setBankroll(contextBankroll != null ? String(contextBankroll) : '1000');
    }
  }, [user, contextBankroll, bankrollContextLoading]);

  useEffect(() => {
    if (!user) loadBettingSettings();
  }, [user, loadBettingSettings]);

  useFocusEffect(
    useCallback(() => {
      if (user) void refreshBankroll();
    }, [user, refreshBankroll])
  );

  const showBankrollLoading = user ? bankrollContextLoading : bankrollLoading;

  const handleSaveBankroll = async () => {
    const value = parseFloat(bankroll.replace(',', '.'));
    if (Number.isNaN(value) || value < 0) {
      Alert.alert('Valor inválido', 'Introduce un bankroll válido (número ≥ 0).');
      return;
    }
    try {
      setBankrollSaving(true);
      if (user) {
        await saveBankroll(value);
        setBankroll(String(value));
        Alert.alert('Guardado', 'Bankroll actualizado. Las cantidades sugeridas se recalcularán con este valor.');
      } else {
        await updateBettingBankroll(value);
        setBankroll(String(value));
        Alert.alert('Guardado', 'Bankroll actualizado. Inicia sesión para que quede guardado en tu cuenta.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar el bankroll.');
    } finally {
      setBankrollSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Cuenta</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSubtitle}>Bankroll y preferencias</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, styles.sectionTitleFirst]}>Apuestas</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Bankroll (€)</Text>
          <Text style={styles.cardHint}>
            Cantidad que usamos para el stake sugerido por partido. Al registrar una apuesta se resta; al ganar o perder, actualiza aquí el total.
          </Text>
          {showBankrollLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={bankroll}
                onChangeText={setBankroll}
                keyboardType="decimal-pad"
                placeholder="Ej: 1000"
                placeholderTextColor={COLORS.textMuted}
                editable={!bankrollSaving}
              />
              <TouchableOpacity
                style={[styles.saveButton, bankrollSaving && styles.saveButtonDisabled]}
                onPress={handleSaveBankroll}
                disabled={bankrollSaving}
              >
                {bankrollSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar bankroll</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Versión</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>

        <Text style={styles.sectionTitle}>Cuenta</Text>
        <TouchableOpacity style={styles.row} onPress={() => router.replace('/(tabs)/account')}>
          <Text style={styles.rowLabel}>Volver a Cuenta</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
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
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
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
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitleFirst: {
    marginTop: 0,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  cardHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loader: {
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
});
