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
  /**
   * Cargamos expo-secure-store de forma segura:
   * - En entornos nativos, usamos SecureStore.
   * - Si por cualquier motivo el require falla o no expone los métodos,
   *   hacemos fallback a AsyncStorage para no romper el flujo de auth.
   */
  let SecureStore: any = null;
  try {
    // Puede exportar directamente el objeto o vía .default según el bundler
    const mod = require('expo-secure-store');
    SecureStore = mod?.default ?? mod;
  } catch (e) {
    console.warn(
      '[secureStorage] expo-secure-store no disponible, usando AsyncStorage como fallback',
      e
    );
  }

  const hasSecureStoreMethods =
    SecureStore &&
    typeof SecureStore.getItemAsync === 'function' &&
    typeof SecureStore.setItemAsync === 'function' &&
    typeof SecureStore.deleteItemAsync === 'function';

  if (!hasSecureStoreMethods) {
    console.warn(
      '[secureStorage] Métodos de expo-secure-store no disponibles, usando AsyncStorage como fallback'
    );
    return {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      removeItem: (key: string) => AsyncStorage.removeItem(key),
    };
  }

  return {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
}

export const secureStorage =
  Platform.OS === 'web' ? createWebStorage() : createNativeStorage();
