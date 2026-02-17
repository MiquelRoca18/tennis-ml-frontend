/**
 * Bets Service - Apuestas en Supabase (igual que favoritos)
 * - Usuario logueado: Supabase
 * - Usuario anónimo: AsyncStorage (local)
 * Al registrar una apuesta también se actualiza el bankroll en el backend (API).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { fetchBettingSettings, updateBettingBankroll } from './api/matchService';

const BETS_KEY = '@tennis_bets';

export interface Bet {
  id: string;
  matchId: number;
  stakeEur: number;
  player1Name: string;
  player2Name: string;
  tournament: string;
  createdAt: string;
}

type BetInput = Omit<Bet, 'id' | 'createdAt'>;

function mapSupabaseToBet(row: {
  id: string;
  match_id: number;
  stake_eur: number;
  player1_name: string | null;
  player2_name: string | null;
  tournament: string | null;
  created_at: string;
}): Bet {
  return {
    id: row.id,
    matchId: row.match_id,
    stakeEur: row.stake_eur,
    player1Name: row.player1_name ?? '',
    player2Name: row.player2_name ?? '',
    tournament: row.tournament ?? '',
    createdAt: row.created_at,
  };
}

/** Listar apuestas del usuario (Supabase si hay userId, sino AsyncStorage) */
export async function getBets(userId?: string | null): Promise<Bet[]> {
  if (userId && isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('bets')
      .select('id, match_id, stake_eur, player1_name, player2_name, tournament, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error('[Bets] Error Supabase getBets:', error.message);
      return [];
    }
    return (data ?? []).map(mapSupabaseToBet);
  }

  try {
    const json = await AsyncStorage.getItem(BETS_KEY);
    const list = json ? JSON.parse(json) : [];
    return list;
  } catch {
    return [];
  }
}

/**
 * Registrar una apuesta:
 * 1) Comprueba bankroll en la API y resta el stake (PATCH /settings/betting)
 * 2) Inserta la apuesta en Supabase (o AsyncStorage si no hay usuario)
 * Así el siguiente cálculo de Kelly usará (bankroll - stake).
 */
export async function addBet(
  input: BetInput,
  userId?: string | null,
  eventKey?: string | null
): Promise<{ success: boolean; bankrollAfter?: number; error?: string }> {
  const { matchId, stakeEur, player1Name, player2Name, tournament } = input;
  if (stakeEur <= 0) {
    return { success: false, error: 'Stake debe ser positivo' };
  }

  try {
    const settings = await fetchBettingSettings();
    const bankroll = settings.bankroll ?? 0;
    if (bankroll < stakeEur) {
      return {
        success: false,
        error: `Bankroll insuficiente (tienes ${bankroll.toFixed(0)}€, apuesta ${stakeEur.toFixed(2)}€)`,
      };
    }
    const newBankroll = bankroll - stakeEur;
    await updateBettingBankroll(newBankroll);
  } catch (e: any) {
    const msg = e.response?.data?.detail ?? e.message ?? 'No se pudo actualizar el bankroll';
    return { success: false, error: msg };
  }

  if (userId && isSupabaseConfigured) {
    const { error } = await supabase.from('bets').insert({
      user_id: userId,
      match_id: matchId,
      stake_eur: stakeEur,
      player1_name: player1Name ?? null,
      player2_name: player2Name ?? null,
      tournament: tournament ?? null,
      event_key: eventKey ?? null,
    });
    if (error) {
      console.error('[Bets] Error Supabase addBet:', error.message);
      return { success: false, error: error.message, bankrollAfter: undefined };
    }
    return { success: true, bankrollAfter: await fetchBettingSettings().then((r) => r.bankroll) };
  }

  try {
    const list = await getBets();
    const newBet: Bet = {
      id: `local-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newBet);
    await AsyncStorage.setItem(BETS_KEY, JSON.stringify(list.slice(0, 500)));
    return { success: true };
  } catch (e) {
    console.error('[Bets] Error AsyncStorage addBet:', e);
    return { success: false, error: 'No se pudo guardar la apuesta' };
  }
}

/**
 * Borrar/cancelar una apuesta: se elimina de Supabase/AsyncStorage y se suma el stake de nuevo al bankroll.
 */
export async function removeBet(
  bet: Bet,
  userId?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await fetchBettingSettings();
    const bankroll = settings.bankroll ?? 0;
    await updateBettingBankroll(bankroll + bet.stakeEur);
  } catch (e: any) {
    const msg = e.response?.data?.detail ?? e.message ?? 'No se pudo devolver el stake al bankroll';
    return { success: false, error: msg };
  }

  if (userId && isSupabaseConfigured) {
    const { error } = await supabase.from('bets').delete().eq('id', bet.id).eq('user_id', userId);
    if (error) {
      console.error('[Bets] Error Supabase removeBet:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  try {
    const list = await getBets();
    const filtered = list.filter((b) => b.id !== bet.id);
    await AsyncStorage.setItem(BETS_KEY, JSON.stringify(filtered));
    return { success: true };
  } catch (e) {
    console.error('[Bets] Error AsyncStorage removeBet:', e);
    return { success: false, error: 'No se pudo borrar la apuesta' };
  }
}
