/**
 * User settings en Supabase (bankroll por usuario).
 * Caché en memoria 30s para reducir llamadas a Supabase.
 */
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const BANKROLL_KEY = 'bankroll';
const DEFAULT_BANKROLL = 1000;
const CACHE_TTL_MS = 30_000;

let bankrollCache: { userId: string; value: number; ts: number } | null = null;

export function invalidateBankrollCache(userId?: string | null): void {
  if (!userId) {
    bankrollCache = null;
    return;
  }
  if (bankrollCache?.userId === userId) bankrollCache = null;
}

export async function getUserBankroll(
  userId: string,
  options?: { forceRefresh?: boolean }
): Promise<number> {
  if (!userId || !isSupabaseConfigured) return DEFAULT_BANKROLL;
  if (!options?.forceRefresh && bankrollCache?.userId === userId && Date.now() - bankrollCache.ts < CACHE_TTL_MS) {
    return bankrollCache.value;
  }
  const { data, error } = await supabase
    .from('user_settings')
    .select('value')
    .eq('user_id', userId)
    .eq('key', BANKROLL_KEY)
    .maybeSingle();
  if (error) {
    console.error('[UserSettings] getBankroll:', error.message);
    return bankrollCache?.userId === userId ? bankrollCache.value : DEFAULT_BANKROLL;
  }
  if (!data?.value) {
    const out = DEFAULT_BANKROLL;
    bankrollCache = { userId, value: out, ts: Date.now() };
    return out;
  }
  const num = parseFloat(data.value);
  const value = Number.isFinite(num) && num >= 0 ? num : DEFAULT_BANKROLL;
  bankrollCache = { userId, value, ts: Date.now() };
  return value;
}

export async function setUserBankroll(userId: string, bankroll: number): Promise<void> {
  if (!userId || !isSupabaseConfigured) return;
  const value = String(Math.max(0, bankroll));
  const { error } = await supabase
    .from('user_settings')
    .upsert(
      { user_id: userId, key: BANKROLL_KEY, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );
  if (error) {
    console.error('[UserSettings] setBankroll:', error.message);
    throw error;
  }
  invalidateBankrollCache(userId);
}
