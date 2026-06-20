/**
 * Layout solo para web. No importa react-native-gesture-handler ni reanimated
 * para evitar que intercepten eventos y dejen la app congelada.
 * Deshabilitamos react-native-screens en web para usar fallback sin native views.
 */
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
  useFonts,
} from '@expo-google-fonts/inter';
import { RobotoMono_700Bold } from '@expo-google-fonts/roboto-mono';
import { DarkTheme as NavigationDarkTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { enableScreens } from 'react-native-screens';

import LiquidationOnAppOpen from '@/components/LiquidationOnAppOpen';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { BankrollProvider } from '@/src/contexts/BankrollContext';
import { DialogProvider } from '@/src/contexts/DialogContext';

// En web, desactivar native screens para evitar bloqueos de eventos/touch
enableScreens(false);

SplashScreen.preventAutoHideAsync();

class WebErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null; errorInfo: ErrorInfo | null }
> {
  state = { error: null as Error | null, errorInfo: null as ErrorInfo | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('[WebErrorBoundary]', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Error en la app</Text>
          <Text style={errorStyles.message}>{this.state.error.message}</Text>
          {__DEV__ && this.state.errorInfo?.componentStack && (
            <Text style={errorStyles.stack} numberOfLines={20}>
              {this.state.errorInfo.componentStack}
            </Text>
          )}
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
    padding: 24,
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#FF4444', marginBottom: 8 },
  message: { fontSize: 14, color: '#B2BAC2', marginBottom: 16 },
  stack: { fontSize: 11, color: '#B2BAC2', fontFamily: 'monospace' },
});

// Tema de navegación (chrome). Hex preservados tal cual para no alterar la apariencia.
const CustomDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: '#00FF88',
    background: '#0A1929',
    card: '#132F4C',
    text: '#FFFFFF',
    border: '#2D3843',
    notification: '#D4A84B',
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter_600SemiBold': Inter_600SemiBold,
    'Inter-Semibold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-Black': Inter_900Black,
    'RobotoMono-Bold': RobotoMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Diagnóstico: ver si los clics llegan al document (solo en web)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onDocClick = () => console.log('[Web] Document click recibido');
    const onDocPointerDown = () => console.log('[Web] Document pointerdown recibido');
    document.addEventListener('click', onDocClick, true);
    document.addEventListener('pointerdown', onDocPointerDown, true);
    return () => {
      document.removeEventListener('click', onDocClick, true);
      document.removeEventListener('pointerdown', onDocPointerDown, true);
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <WebErrorBoundary>
    <View style={{ flex: 1 }} pointerEvents="box-none" collapsable={false}>
      <AuthProvider>
        <BankrollProvider>
          <DialogProvider>
            <LiquidationOnAppOpen />
              <NavigationThemeProvider value={CustomDarkTheme}>
                <Stack
                  screenOptions={{
                    headerStyle: { backgroundColor: '#132F4C' },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: { fontFamily: 'Inter-Bold' },
                    contentStyle: { backgroundColor: '#0A1929' },
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="match/[id]" />
                  <Stack.Screen name="player/[key]" options={{ headerShown: false }} />
                  <Stack.Screen name="tournament/[key]" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="search"
                    options={{
                      title: 'Buscar',
                      headerBackTitle: 'Atrás',
                    }}
                  />
                  <Stack.Screen
                    name="settings"
                    options={{
                      title: 'Configuración',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
                <StatusBar style="light" />
              </NavigationThemeProvider>
          </DialogProvider>
        </BankrollProvider>
      </AuthProvider>
    </View>
    </WebErrorBoundary>
  );
}
