/**
 * Adaptador de almacenamiento seguro para Supabase Auth.
 * - Móvil: expo-secure-store (más seguro).
 * - Web: AsyncStorage (localStorage). En SSR (Node) no hay window, se usa un no-op para que el export estático no falle.
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEB_STORAGE_KEY_PREFIX = '@tenly_supabase_';

const isWebBrowser = typeof window !== 'undefined';

async function getItemWeb(key: string): Promise<string | null> {
  if (!isWebBrowser) return null;
  return AsyncStorage.getItem(WEB_STORAGE_KEY_PREFIX + key);
}

async function setItemWeb(key: string, value: string): Promise<void> {
  if (!isWebBrowser) return;
  await AsyncStorage.setItem(WEB_STORAGE_KEY_PREFIX + key, value);
}

async function removeItemWeb(key: string): Promise<void> {
  if (!isWebBrowser) return;
  await AsyncStorage.removeItem(WEB_STORAGE_KEY_PREFIX + key);
}

function createWebStorage() {
  return {
    getItem: getItemWeb,
    setItem: setItemWeb,
    removeItem: removeItemWeb,
  };
}

function createNativeStorage() {
  const SecureStore = require('expo-secure-store').default;
  return {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
}

export const secureStorage =
  Platform.OS === 'web' ? createWebStorage() : createNativeStorage();
