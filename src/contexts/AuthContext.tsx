/**
 * AuthContext - Gestión de autenticación con Supabase
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { clearLocalFavorites } from '../services/favoritesService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  lastSignOutAt: number;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SIGN_OUT_SETTLE_MS = 600;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSignOutAt, setLastSignOutAt] = useState(0);

  // Un solo listener de onAuthStateChange, en un efecto global. Limpieza al desmontar.
  // Evitar múltiples instancias de Supabase y múltiples suscripciones (evita que el 2º login se cuelgue).
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) console.error('[Auth] getSession:', error.message);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user?.id) {
        await clearLocalFavorites();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (__DEV__) console.log('[Auth] onAuthStateChange', event, session?.user?.email ?? 'null');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        void clearLocalFavorites();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      if (__DEV__) console.error('[Auth] signIn: Supabase no configurado');
      return { error: new Error('Supabase no configurado') };
    }
    if (__DEV__) console.log('[Auth] signIn intentando...', email);
    const SIGNIN_DEADLOCK_MS = 10_000;
    const signInPromise = supabase.auth.signInWithPassword({ email, password });
    const timeoutPromise = new Promise<{ error: Error }>((resolve) => {
      if (__DEV__) console.log('[Auth] signIn: timeout programado en', SIGNIN_DEADLOCK_MS, 'ms');
      setTimeout(() => {
        if (__DEV__) console.log('[Auth] signIn: timeout disparado');
        resolve({ error: new Error('signin_timeout') });
      }, SIGNIN_DEADLOCK_MS);
    });
    if (__DEV__) console.log('[Auth] signIn: esperando Promise.race (signInWithPassword vs timeout)...');
    const result = await Promise.race([signInPromise, timeoutPromise]);
    if (__DEV__) console.log('[Auth] signIn: Promise.race resuelto. result.error?', !!result.error, result.error?.message ?? 'ok');
    if (result.error) {
      if (result.error.message === 'signin_timeout') {
        if (__DEV__) console.log('[Auth] signIn: branch timeout, llamando getSession...');
        const { data: { session } } = await supabase.auth.getSession();
        if (__DEV__) console.log('[Auth] signIn: getSession devuelto. session?', !!session, session?.user?.email);
        if (session?.user?.email?.toLowerCase() === email.toLowerCase()) {
          if (__DEV__) console.log('[Auth] signIn OK (recuperado tras timeout)');
          return { error: null };
        }
        if (__DEV__) console.warn('[Auth] signIn timeout sin sesión');
        return { error: new Error('El servidor tardó demasiado. Inténtalo de nuevo.') };
      }
      if (__DEV__) console.error('[Auth] signIn error:', result.error.message);
      return { error: result.error };
    }
    if (__DEV__) console.log('[Auth] signIn: retornando éxito');
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      if (__DEV__) console.error('[Auth] signUp: Supabase no configurado');
      return { error: new Error('Supabase no configurado') };
    }
    if (__DEV__) console.log('[Auth] signUp intentando...', email);
    const redirectTo = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL ?? 'tennismlfrontend://auth/callback';
    const SIGNUP_DEADLOCK_MS = 10_000;
    const signUpPromise = supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
    const timeoutPromise = new Promise<{ error: Error }>((resolve) => {
      if (__DEV__) console.log('[Auth] signUp: timeout programado en', SIGNUP_DEADLOCK_MS, 'ms');
      setTimeout(() => {
        if (__DEV__) console.log('[Auth] signUp: timeout disparado');
        resolve({ error: new Error('signup_timeout') });
      }, SIGNUP_DEADLOCK_MS);
    });
    if (__DEV__) console.log('[Auth] signUp: esperando Promise.race...');
    const result = await Promise.race([signUpPromise, timeoutPromise]);
    if (__DEV__) console.log('[Auth] signUp: Promise.race resuelto. result.error?', !!result.error, result.error?.message ?? 'ok');
    if (result.error) {
      if (result.error.message === 'signup_timeout') {
        if (__DEV__) console.log('[Auth] signUp: branch timeout, llamando getSession...');
        const { data: { session } } = await supabase.auth.getSession();
        if (__DEV__) console.log('[Auth] signUp: getSession devuelto. session?', !!session);
        if (session?.user?.email?.toLowerCase() === email.toLowerCase()) {
          if (__DEV__) console.log('[Auth] signUp OK (recuperado tras timeout)');
          return { error: null };
        }
        if (__DEV__) console.warn('[Auth] signUp timeout sin sesión');
        return { error: new Error('El servidor tardó demasiado. Inténtalo de nuevo.') };
      }
      if (__DEV__) console.error('[Auth] signUp error:', result.error.message);
      return { error: result.error };
    }
    if (__DEV__) console.log('[Auth] signUp: retornando éxito');
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    if (__DEV__) console.log('[Auth] signOut...');
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setLastSignOutAt(Date.now());
    await new Promise((r) => setTimeout(r, SIGN_OUT_SETTLE_MS));
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      if (__DEV__) console.error('[Auth] resetPassword: Supabase no configurado');
      return { error: new Error('Supabase no configurado') };
    }
    if (__DEV__) console.log('[Auth] resetPassword enviando email a...', email);
    const redirectTo = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL ?? 'tennismlfrontend://auth/callback';
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (__DEV__ && error) console.error('[Auth] resetPassword error:', error.message);
    return { error };
  }, []);

  const deleteAccount = useCallback(async (): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured) {
      if (__DEV__) console.error('[Auth] deleteAccount: Supabase no configurado');
      return { error: new Error('Supabase no configurado') };
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      if (__DEV__) console.error('[Auth] deleteAccount: No hay sesión');
      return { error: new Error('No hay sesión activa') };
    }

    if (__DEV__) console.log('[Auth] deleteAccount llamando Edge Function...');
    const { data, error } = await supabase.functions.invoke('delete-account', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) {
      if (__DEV__) console.error('[Auth] deleteAccount invoke error:', error.message);
      return { error: new Error(error.message || 'Error al borrar la cuenta') };
    }
    if (data?.error) {
      if (__DEV__) console.error('[Auth] deleteAccount function error:', data.error);
      return { error: new Error(typeof data.error === 'string' ? data.error : data.error?.message || 'Error al borrar') };
    }

    if (__DEV__) console.log('[Auth] deleteAccount éxito, cerrando sesión...');
    await supabase.auth.signOut();
    return { error: null };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isConfigured: isSupabaseConfigured,
    lastSignOutAt,
    signIn,
    signUp,
    signOut,
    resetPassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
