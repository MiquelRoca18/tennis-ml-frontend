/**
 * AuthContext - Gestión de autenticación con Supabase
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { migrateLocalFavoritesToSupabase } from '../services/favoritesService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const hasMigratedRef = useRef<string | null>(null);

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
      if (session?.user?.id && hasMigratedRef.current !== session.user.id) {
        hasMigratedRef.current = session.user.id;
        await migrateLocalFavoritesToSupabase(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Migrar favoritos locales a Supabase al hacer login (solo una vez por sesión)
      if (session?.user?.id && hasMigratedRef.current !== session.user.id) {
        hasMigratedRef.current = session.user.id;
        await migrateLocalFavoritesToSupabase(session.user.id);
      } else if (!session) {
        hasMigratedRef.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      if (__DEV__) console.error('[Auth] signIn: Supabase no configurado');
      return { error: new Error('Supabase no configurado') };
    }
    if (__DEV__) console.log('[Auth] signIn intentando...', email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (__DEV__ && error) console.error('[Auth] signIn error:', error.message);
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      if (__DEV__) console.error('[Auth] signUp: Supabase no configurado');
      return { error: new Error('Supabase no configurado') };
    }
    if (__DEV__) console.log('[Auth] signUp intentando...', email);
    const { error } = await supabase.auth.signUp({ email, password });
    if (__DEV__ && error) console.error('[Auth] signUp error:', error.message);
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    if (__DEV__) console.log('[Auth] signOut...');
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      if (__DEV__) console.error('[Auth] resetPassword: Supabase no configurado');
      return { error: new Error('Supabase no configurado') };
    }
    if (__DEV__) console.log('[Auth] resetPassword enviando email a...', email);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
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
