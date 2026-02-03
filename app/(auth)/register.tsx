import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthButton from '../../components/auth/AuthButton';
import AuthInput from '../../components/auth/AuthInput';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS } from '../../src/utils/constants';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    if (!email.trim() || !password || !confirmPassword) {
      setError('Completa todos los campos');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(email.trim(), password);
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.replace('/(tabs)');
  };

  if (!isConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎾 Tennis ML</Text>
        <Text style={styles.subtitle}>Configura Supabase para crear una cuenta</Text>
        <AuthButton title="Volver" onPress={() => router.replace('/(tabs)')} variant="secondary" />
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
        <Text style={styles.title}>🎾 Tennis ML</Text>
        <Text style={styles.subtitle}>Crea una cuenta para guardar tus favoritos</Text>

        <View style={styles.form}>
          <AuthInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={!!error}
          />
          <AuthInput
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={!!error}
            textContentType="oneTimeCode"
            autoComplete="off"
          />
          <AuthInput
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={!!error}
            textContentType="oneTimeCode"
            autoComplete="off"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <AuthButton title="Registrarse" onPress={handleRegister} loading={loading} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.linkText}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  linkText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
