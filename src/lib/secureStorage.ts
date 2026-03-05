/**
 * Adaptador de almacenamiento seguro para Supabase Auth.
 * Usa expo-secure-store para tokens y sesión (no AsyncStorage).
 */
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  getItem: (key: string): Promise<string | null> => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string): Promise<void> => SecureStore.setItemAsync(key, value),
  removeItem: (key: string): Promise<void> => SecureStore.deleteItemAsync(key),
};
