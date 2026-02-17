import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthButton from '../../components/auth/AuthButton';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS } from '../../src/utils/constants';

export default function AccountScreen() {
  const router = useRouter();
  const { user, signOut, deleteAccount, isConfigured } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Borrar cuenta',
      'Se eliminarán todos tus datos (favoritos, etc.). Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Entendido, borrar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '¿Última confirmación?',
              '¿Estás seguro de que quieres borrar tu cuenta permanentemente?',
              [
                { text: 'No, cancelar', style: 'cancel' },
                {
                  text: 'Sí, borrar mi cuenta',
                  style: 'destructive',
                  onPress: async () => {
                    setDeleting(true);
                    const { error } = await deleteAccount();
                    setDeleting(false);
                    if (error) {
                      Alert.alert('Error', error.message);
                    } else {
                      router.replace('/(tabs)');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (!isConfigured) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cuenta</Text>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.settingsRowLabel}>Configuración (bankroll y apuestas)</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.content}>
            <Text style={styles.placeholderText}>
              Configura Supabase para acceder a tu cuenta
            </Text>
            <Text style={styles.hintText}>
              Añade EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en .env
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cuenta</Text>
          <Text style={styles.headerSubtitle}>Sesión iniciada</Text>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.settingsRowLabel}>Configuración (bankroll, apuestas)</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <AuthButton
            title="Cerrar sesión"
            onPress={() => signOut()}
            variant="secondary"
          />
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            <Text style={styles.dangerText}>
              {deleting ? 'Borrando...' : 'Borrar cuenta'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cuenta</Text>
        <Text style={styles.headerSubtitle}>Inicia sesión para sincronizar tus favoritos</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsRowLabel}>Configuración (bankroll, apuestas)</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <AuthButton
          title="Iniciar sesión"
          onPress={() => router.push('/(auth)/login')}
        />
        <AuthButton
          title="Crear cuenta"
          onPress={() => router.push('/(auth)/register')}
          variant="secondary"
        />
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
    padding: 24,
    gap: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsRowLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
  dangerRow: {
    marginTop: 24,
    padding: 16,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.danger + '60',
  },
  dangerText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
