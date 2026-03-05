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
      'Se eliminarán todos tus datos (favoritos, apuestas, etc.). Esta acción no se puede deshacer.',
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
          <Text style={styles.headerSubtitle}>Configura Supabase para acceder</Text>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.cardRow} onPress={() => router.push('/settings')}>
            <Text style={styles.cardRowLabel}>⚙️ Configuración</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.placeholderBlock}>
            <Text style={styles.placeholderText}>Configura Supabase para acceder a tu cuenta</Text>
            <Text style={styles.hintText}>Añade EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en .env</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.sessionBadge}>
              <Text style={styles.sessionBadgeDot}>●</Text>
              <Text style={styles.sessionBadgeText}>Sesión iniciada</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Cuenta</Text>
          <Text style={styles.headerSubtitle}>{user.email}</Text>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, styles.sectionTitleFirst]}>Ajustes</Text>
          <TouchableOpacity style={styles.cardRow} onPress={() => router.push('/settings')}>
            <Text style={styles.cardRowLabel}>Bankroll y preferencias</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Sesión</Text>
          <AuthButton title="Cerrar sesión" onPress={() => signOut()} variant="secondary" />

          <Text style={[styles.sectionTitle, styles.dangerSectionTitle]}>Zona peligro</Text>
          <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteAccount} disabled={deleting}>
            <Text style={styles.dangerRowText}>{deleting ? 'Borrando…' : 'Borrar cuenta'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cuenta</Text>
        <Text style={styles.headerSubtitle}>Inicia sesión para sincronizar favoritos y apuestas</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, styles.sectionTitleFirst]}>Ajustes</Text>
        <TouchableOpacity style={styles.cardRow} onPress={() => router.push('/settings')}>
          <Text style={styles.cardRowLabel}>Configuración (bankroll)</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Sesión</Text>
        <View style={styles.sessionButtons}>
          <AuthButton title="Iniciar sesión" onPress={() => router.push('/(auth)/login')} />
          <AuthButton title="Crear cuenta" onPress={() => router.push('/(auth)/register')} variant="secondary" />
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
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  badgeRow: {
    marginBottom: 8,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  sessionBadgeDot: {
    fontSize: 8,
    color: COLORS.primary,
  },
  sessionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
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
  dangerSectionTitle: {
    marginTop: 28,
    color: COLORS.danger + 'cc',
  },
  sessionButtons: {
    gap: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardRowLabel: {
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
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.danger + '60',
  },
  dangerRowText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '600',
  },
  placeholderBlock: {
    marginTop: 24,
    padding: 20,
    alignItems: 'center',
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
