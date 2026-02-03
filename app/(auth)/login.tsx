import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AuthButton from '../../components/auth/AuthButton';
import AuthInput from '../../components/auth/AuthInput';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS } from '../../src/utils/constants';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Introduce email y contraseña');
      return;
    }

    setLoading(true);
    const { error: authError } = await signIn(email.trim(), password);
    setLoading(false);

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : authError.message);
      return;
    }

    router.replace('/(tabs)');
  };

  if (!isConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎾 Tennis ML</Text>
        <Text style={styles.subtitle}>Configura Supabase para acceder a tu cuenta</Text>
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
        <Text style={styles.subtitle}>Inicia sesión para sincronizar tus favoritos</Text>

        <View style={styles.form}>
          <AuthInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={!!error}
          />
          <AuthInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={!!error}
            textContentType="oneTimeCode"
            autoComplete="off"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={styles.forgotLink}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <AuthButton title="Iniciar sesión" onPress={handleLogin} loading={loading} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.linkText}>Regístrate</Text>
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
  forgotLink: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
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
