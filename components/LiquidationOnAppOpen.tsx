/**
 * Ejecuta la liquidación de apuestas (partidos terminados → sumar ganancias al bankroll)
 * al abrir la app y al volver al primer plano. Así el bankroll está actualizado aunque
 * el usuario no entre en "Mis apuestas".
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { useBankroll } from '../src/contexts/BankrollContext';
import { liquidateSettledBets } from '../src/services/betsService';

export default function LiquidationOnAppOpen() {
  const { user } = useAuth();
  const { refreshBankroll } = useBankroll();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const runLiquidation = useCallback(async () => {
    if (!user?.id) return;
    try {
      await liquidateSettledBets(user.id);
      await refreshBankroll(true);
    } catch (e) {
      if (__DEV__) console.warn('[LiquidationOnAppOpen]', e);
    }
  }, [user?.id, refreshBankroll]);

  useEffect(() => {
    runLiquidation();
  }, [runLiquidation]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const wasBackground = appStateRef.current === 'background' || appStateRef.current === 'inactive';
      appStateRef.current = nextState;
      if (wasBackground && nextState === 'active') {
        runLiquidation();
      }
    });
    return () => sub.remove();
  }, [runLiquidation]);

  return null;
}
