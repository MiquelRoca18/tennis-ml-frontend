import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthButton from '../../components/auth/AuthButton';
import AuthInput from '../../components/auth/AuthInput';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS } from '../../src/utils/constants';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Introduce tu email');
      return;
    }

    setLoading(true);
    const { error: authError } = await resetPassword(email.trim());
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSuccess(true);
  };

  if (!isConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>Configura Supabase primero</Text>
        <AuthButton title="Volver" onPress={() => router.replace('/(tabs)')} variant="secondary" />
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.successTitle}>Revisa tu email</Text>
          <Text style={styles.successText}>
            Si existe una cuenta con {email}, recibirás un enlace para restablecer tu contraseña.
          </Text>
          <AuthButton title="Volver al login" onPress={() => router.replace('/(auth)/login')} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>
          Introduce tu email y te enviaremos un enlace para restablecer tu contraseña
        </Text>

        <View style={styles.form}>
          <AuthInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={!!error}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <AuthButton title="Enviar enlace" onPress={handleReset} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
});
