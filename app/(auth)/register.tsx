import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TenlyLogo from '../../assets/images/tenly-logo.svg';
import AuthButton from '../../components/auth/AuthButton';
import AuthInput from '../../components/auth/AuthInput';
import { useAuth } from '../../src/contexts/AuthContext';
import { validateEmail, validatePassword } from '../../src/utils/authValidation';
import { COLORS } from '../../src/utils/constants';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, signOut, isConfigured, user, lastSignOutAt } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const AUTH_TIMEOUT_MS = 25_000;
  const RECENT_SIGNOUT_MS = 4000;
  const DELAY_AFTER_RECENT_SIGNOUT_MS = 900;

  const handleRegister = async () => {
    setError(null);
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.message ?? 'Correo no válido.');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Completa todos los campos.');
      return;
    }
    const passwordCheck = validatePassword(password, { emailForLocalPart: email.trim() });
    if (!passwordCheck.valid) {
      setError(passwordCheck.message ?? 'Contraseña no válida.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      if (user) {
        await signOut();
      }
      if (lastSignOutAt && Date.now() - lastSignOutAt < RECENT_SIGNOUT_MS) {
        await new Promise((r) => setTimeout(r, DELAY_AFTER_RECENT_SIGNOUT_MS));
      }
      const result = await Promise.race([
        signUp(email.trim(), password),
        new Promise<{ error: Error | null }>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), AUTH_TIMEOUT_MS)
        ),
      ]);
      const authError = result.error;
      if (authError) {
        const msg = authError.message;
        if (/security purposes|only request this after|seconds/i.test(msg)) setError('Demasiados intentos. Espera unos 20–30 segundos e inténtalo de nuevo.');
        else setError(msg);
        return;
      }
      setRegisteredEmail(email.trim());
      setRegistered(true);
    } catch (e: any) {
      if (e?.message === 'timeout') {
        setError('El servidor no respondió. Comprueba tu conexión e inténtalo de nuevo.');
      } else {
        setError(e?.message ?? 'Error de conexión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <TenlyLogo width={220} height={77} />
        </View>
        <Text style={styles.subtitle}>Configura Supabase para crear una cuenta</Text>
        <AuthButton title="Volver" onPress={() => router.replace('/(tabs)')} variant="secondary" />
      </View>
    );
  }

  if (registered) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.successTitle}>Revisa tu correo</Text>
          <Text style={styles.successText}>
            Hemos enviado un enlace de confirmación a {registeredEmail}. Pulsa el enlace para activar tu cuenta y luego inicia sesión.
          </Text>
          <View style={styles.successButtonWrap}>
            <AuthButton title="Ir a Iniciar sesión" onPress={() => router.replace('/(auth)/login')} />
          </View>
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.logoWrap}>
          <TenlyLogo width={220} height={77} />
        </View>
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
  successButtonWrap: {
    alignSelf: 'stretch',
    width: '100%',
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
