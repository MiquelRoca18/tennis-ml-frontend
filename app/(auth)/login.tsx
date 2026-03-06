import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TenlyLogo from '../../assets/images/tenly-logo.svg';
import AuthButton from '../../components/auth/AuthButton';
import AuthInput from '../../components/auth/AuthInput';
import { useAuth } from '../../src/contexts/AuthContext';
import { validateEmail } from '../../src/utils/authValidation';
import { COLORS } from '../../src/utils/constants';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signOut, isConfigured, user, lastSignOutAt } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const AUTH_TIMEOUT_MS = 25_000;
  const RECENT_SIGNOUT_MS = 4000;
  const DELAY_AFTER_RECENT_SIGNOUT_MS = 900;

  const handleLogin = async () => {
    setError(null);
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.message ?? 'Correo no válido.');
      return;
    }
    if (!password) {
      setError('Introduce tu contraseña.');
      return;
    }

    setLoading(true);
    try {
      if (__DEV__) console.log('[Login] handleLogin: user?', !!user, '-> signOut si aplica');
      if (user) {
        await signOut();
        if (__DEV__) console.log('[Login] handleLogin: signOut terminado');
      }
      if (lastSignOutAt && Date.now() - lastSignOutAt < RECENT_SIGNOUT_MS) {
        if (__DEV__) console.log('[Login] handleLogin: delay post-signOut...');
        await new Promise((r) => setTimeout(r, DELAY_AFTER_RECENT_SIGNOUT_MS));
      }
      if (__DEV__) console.log('[Login] handleLogin: llamando signIn (race 25s)...');
      const result = await Promise.race([
        signIn(email.trim(), password),
        new Promise<{ error: Error | null }>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), AUTH_TIMEOUT_MS)
        ),
      ]);
      if (__DEV__) console.log('[Login] handleLogin: signIn devolvió. result.error?', !!result?.error);
      const authError = result.error;
      if (authError) {
        const msg = authError.message;
        if (msg === 'Invalid login credentials') setError('Email o contraseña incorrectos');
        else if (/security purposes|only request this after|seconds/i.test(msg)) setError('Demasiados intentos. Espera unos segundos e inténtalo de nuevo.');
        else setError(msg);
        return;
      }
      router.replace('/(tabs)');
    } catch (e: any) {
      if (__DEV__) console.log('[Login] handleLogin: catch', e?.message);
      if (e?.message === 'timeout') {
        setError('El servidor no respondió. Comprueba tu conexión e inténtalo de nuevo.');
      } else {
        setError(e?.message ?? 'Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      if (__DEV__) console.log('[Login] handleLogin: finally');
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <TenlyLogo width={220} height={77} />
        </View>
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.logoWrap}>
          <TenlyLogo width={220} height={77} />
        </View>
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
  logoWrap: {
    marginTop: 24,
    marginBottom: 28,
    alignItems: 'center',
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
  devLink: {
    marginTop: 16,
    alignSelf: 'center',
  },
  devLinkText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
