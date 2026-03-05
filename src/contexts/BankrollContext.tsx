/**
 * BankrollContext - Bankroll por usuario (Supabase) y sincronización con el backend.
 * Al iniciar sesión se carga el bankroll del usuario desde Supabase y se envía al backend.
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { updateBettingBankroll } from '../services/api/matchService';
import { getUserBankroll, setUserBankroll } from '../services/userSettingsService';
import { useAuth } from './AuthContext';

interface BankrollContextType {
  /** Bankroll del usuario actual (desde Supabase). null si no hay usuario o aún cargando. */
  bankroll: number | null;
  loading: boolean;
  /** Guardar bankroll en Supabase y sincronizar con el backend. */
  saveBankroll: (value: number) => Promise<void>;
  /** Recargar bankroll desde Supabase (p. ej. tras cambiar de cuenta). forceRefresh=true ignora caché. */
  refreshBankroll: (forceRefresh?: boolean) => Promise<void>;
}

const BankrollContext = createContext<BankrollContextType | undefined>(undefined);

export function BankrollProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bankroll, setBankroll] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBankroll = useCallback(async (forceRefresh?: boolean) => {
    if (!user?.id) {
      setBankroll(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const value = await getUserBankroll(user.id, { forceRefresh });
      setBankroll(value);
      await updateBettingBankroll(value);
    } catch (e) {
      console.warn('[Bankroll] Error loading:', e);
      setBankroll(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setBankroll(null);
      setLoading(false);
      return;
    }
    refreshBankroll();
  }, [user?.id, refreshBankroll]);

  const saveBankroll = useCallback(
    async (value: number) => {
      if (!user?.id) return;
      const num = Math.max(0, value);
      await setUserBankroll(user.id, num);
      setBankroll(num);
      await updateBettingBankroll(num);
    },
    [user?.id]
  );

  const value: BankrollContextType = {
    bankroll,
    loading,
    saveBankroll,
    refreshBankroll,
  };

  return <BankrollContext.Provider value={value}>{children}</BankrollContext.Provider>;
}

export function useBankroll() {
  const context = useContext(BankrollContext);
  if (context === undefined) {
    throw new Error('useBankroll must be used within a BankrollProvider');
  }
  return context;
}
