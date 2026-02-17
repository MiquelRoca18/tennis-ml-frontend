import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../src/utils/constants';
import { fetchBettingSettings, updateBettingBankroll } from '../src/services/api/matchService';

export default function SettingsScreen() {
  const router = useRouter();
  const [bankroll, setBankroll] = useState<string>('');
  const [bankrollLoading, setBankrollLoading] = useState(true);
  const [bankrollSaving, setBankrollSaving] = useState(false);

  const loadBettingSettings = useCallback(async () => {
    try {
      setBankrollLoading(true);
      const res = await fetchBettingSettings();
      setBankroll(String(res.bankroll));
    } catch {
      setBankroll('1000');
    } finally {
      setBankrollLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBettingSettings();
  }, [loadBettingSettings]);

  const handleSaveBankroll = async () => {
    const value = parseFloat(bankroll.replace(',', '.'));
    if (Number.isNaN(value) || value < 0) {
      Alert.alert('Valor inválido', 'Introduce un bankroll válido (número ≥ 0).');
      return;
    }
    try {
      setBankrollSaving(true);
      await updateBettingBankroll(value);
      setBankroll(String(value));
      Alert.alert('Guardado', 'El bankroll se ha actualizado. Las cantidades sugeridas por partido se recalcularán con este valor.');
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
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apuestas</Text>
          <View style={styles.card}>
            <Text style={styles.bankrollLabel}>Bankroll (€)</Text>
            <Text style={styles.bankrollHint}>
              Cantidad de dinero que usamos para calcular el stake sugerido por partido (Kelly). Al registrar una apuesta, el bankroll se resta automáticamente. Cuando ganes (o pierdas), actualiza aquí el bankroll con tu nuevo total.
            </Text>
            {bankrollLoading ? (
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
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Versión</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.replace('/(tabs)/account')}
          >
            <Text style={styles.rowLabel}>Gestionar cuenta</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bankrollLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  bankrollHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
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
});
