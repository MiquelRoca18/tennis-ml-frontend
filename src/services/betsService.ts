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

export type BetStatus = 'activa' | 'cancelada' | 'completada';

export interface Bet {
  id: string;
  matchId: number;
  stakeEur: number;
  player1Name: string;
  player2Name: string;
  tournament: string;
  createdAt: string;
  /** Casa de apuestas (puede estar vacío en apuestas antiguas) */
  bookmaker: string;
  /** Cuota a la que se apostó */
  odds: number;
  /** Jugador al que se apostó */
  pickedPlayer: string;
  /** Ganancia potencial (stake × odds) si gana */
  potentialWin: number;
  /** activa | cancelada | completada */
  status: BetStatus;
}

export type BetInput = Omit<Bet, 'id' | 'createdAt'>;

type SupabaseBetRow = {
  id: string;
  match_id: number;
  stake_eur: number;
  player1_name: string | null;
  player2_name: string | null;
  tournament: string | null;
  created_at: string;
  bookmaker?: string | null;
  odds?: number | null;
  picked_player?: string | null;
  potential_win?: number | null;
  status?: string | null;
};

function mapSupabaseToBet(row: SupabaseBetRow): Bet {
  const status = (row.status === 'activa' || row.status === 'cancelada' || row.status === 'completada'
    ? row.status
    : 'activa') as BetStatus;
  const odds = row.odds != null && row.odds >= 1 ? row.odds : 0;
  const stakeEur = row.stake_eur ?? 0;
  return {
    id: row.id,
    matchId: row.match_id,
    stakeEur,
    player1Name: row.player1_name ?? '',
    player2Name: row.player2_name ?? '',
    tournament: row.tournament ?? '',
    createdAt: row.created_at,
    bookmaker: row.bookmaker ?? '',
    odds,
    pickedPlayer: row.picked_player ?? '',
    potentialWin: row.potential_win ?? (odds >= 1 ? stakeEur * odds : 0),
    status,
  };
}

/** Normaliza una apuesta leída de AsyncStorage (puede tener campos antiguos) */
function normalizeBet(b: Partial<Bet> & { id: string; matchId: number; stakeEur: number; createdAt: string }): Bet {
  const status: BetStatus = (b.status === 'activa' || b.status === 'cancelada' || b.status === 'completada'
    ? b.status
    : 'activa');
  const odds = b.odds != null && b.odds >= 1 ? b.odds : 0;
  const stakeEur = b.stakeEur ?? 0;
  return {
    id: b.id,
    matchId: b.matchId,
    stakeEur,
    player1Name: b.player1Name ?? '',
    player2Name: b.player2Name ?? '',
    tournament: b.tournament ?? '',
    createdAt: b.createdAt,
    bookmaker: b.bookmaker ?? '',
    odds,
    pickedPlayer: b.pickedPlayer ?? '',
    potentialWin: b.potentialWin ?? (odds >= 1 ? stakeEur * odds : 0),
    status,
  };
}

/** Listar apuestas del usuario (Supabase si hay userId, sino AsyncStorage). Solo activas por defecto. */
export async function getBets(
  userId?: string | null,
  options?: { activeOnly?: boolean }
): Promise<Bet[]> {
  const activeOnly = options?.activeOnly !== false;

  if (userId && isSupabaseConfigured) {
    const selectCols = 'id, match_id, stake_eur, player1_name, player2_name, tournament, created_at, bookmaker, odds, picked_player, potential_win, status';
    let query = supabase
      .from('bets')
      .select(selectCols)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500);
    if (activeOnly) {
      query = query.or('status.eq.activa,status.is.null');
    }
    const { data, error } = await query;
    if (error) {
      console.error('[Bets] Error Supabase getBets:', error.message);
      return [];
    }
    return (data ?? []).map(mapSupabaseToBet);
  }

  try {
    const json = await AsyncStorage.getItem(BETS_KEY);
    const list: unknown[] = json ? JSON.parse(json) : [];
    const bets = list.map((b) => normalizeBet(b as Partial<Bet> & { id: string; matchId: number; stakeEur: number; createdAt: string }));
    return activeOnly ? bets.filter((b) => b.status === 'activa' || !b.status) : bets;
  } catch {
    return [];
  }
}

/**
 * Registrar una apuesta:
 * 1) Valida bookmaker, odds >= 1, pickedPlayer, stake
 * 2) Comprueba bankroll en la API y resta el stake (PATCH /settings/betting)
 * 3) Inserta la apuesta en Supabase (o AsyncStorage) con casa, cuota, jugador y ganancia potencial
 */
export async function addBet(
  input: BetInput,
  userId?: string | null,
  eventKey?: string | null
): Promise<{ success: boolean; bankrollAfter?: number; error?: string }> {
  const { matchId, stakeEur, player1Name, player2Name, tournament, bookmaker, odds, pickedPlayer } = input;
  if (stakeEur <= 0) {
    return { success: false, error: 'La cantidad debe ser positiva' };
  }
  if (!bookmaker?.trim()) {
    return { success: false, error: 'Selecciona una casa de apuestas' };
  }
  if (odds == null || odds < 1) {
    return { success: false, error: 'La cuota debe ser al menos 1.00' };
  }
  if (!pickedPlayer?.trim()) {
    return { success: false, error: 'Indica el jugador al que apuestas' };
  }

  const potentialWin = stakeEur * odds;

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

  const betPayload = {
    matchId,
    stakeEur,
    player1Name: player1Name ?? '',
    player2Name: player2Name ?? '',
    tournament: tournament ?? '',
    bookmaker: bookmaker.trim(),
    odds,
    pickedPlayer: pickedPlayer.trim(),
    potentialWin,
    status: 'activa' as const,
  };

  if (userId && isSupabaseConfigured) {
    const { error } = await supabase.from('bets').insert({
      user_id: userId,
      match_id: matchId,
      stake_eur: stakeEur,
      player1_name: betPayload.player1Name || null,
      player2_name: betPayload.player2Name || null,
      tournament: betPayload.tournament || null,
      event_key: eventKey ?? null,
      bookmaker: betPayload.bookmaker || null,
      odds: betPayload.odds,
      picked_player: betPayload.pickedPlayer || null,
      potential_win: betPayload.potentialWin,
      status: betPayload.status,
    });
    if (error) {
      console.error('[Bets] Error Supabase addBet:', error.message);
      return { success: false, error: error.message, bankrollAfter: undefined };
    }
    return { success: true, bankrollAfter: await fetchBettingSettings().then((r) => r.bankroll) };
  }

  try {
    const list = await getBets(userId, { activeOnly: false });
    const newBet: Bet = {
      id: `local-${Date.now()}`,
      ...betPayload,
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

/**
 * Elimina una apuesta sin devolver el stake al bankroll.
 * Usado al liquidar: el partido terminó; si ganamos ya sumamos la ganancia al bankroll por separado.
 */
export async function deleteBetWithoutRefund(
  bet: Bet,
  userId?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (userId && isSupabaseConfigured) {
    const { error } = await supabase.from('bets').delete().eq('id', bet.id).eq('user_id', userId);
    if (error) {
      console.error('[Bets] Error Supabase deleteBetWithoutRefund:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  try {
    const list = await getBets(userId, { activeOnly: false });
    const filtered = list.filter((b) => b.id !== bet.id);
    await AsyncStorage.setItem(BETS_KEY, JSON.stringify(filtered));
    return { success: true };
  } catch (e) {
    console.error('[Bets] Error AsyncStorage deleteBetWithoutRefund:', e);
    return { success: false, error: 'No se pudo eliminar la apuesta' };
  }
}
