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
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import LiquidationOnAppOpen from '@/components/LiquidationOnAppOpen';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { BankrollProvider } from '@/src/contexts/BankrollContext';
import { DialogProvider } from '@/src/contexts/DialogContext';

SplashScreen.preventAutoHideAsync();

// Tema de navegación (chrome de React Navigation). Estos hex se mantienen
// exactamente como estaban para no alterar la apariencia de la app.
const CustomDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: '#00FF88', // verde neón (acento)
    background: '#0A1929', // fondo del contenedor de navegación
    card: '#132F4C',
    text: '#FFFFFF',
    border: '#2D3843',
    notification: '#D4A84B', // dorado Tenly
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // We map the font names used in Typography.ts to the loaded fonts
    'Inter-Regular': Inter_400Regular,
    'Inter_600SemiBold': Inter_600SemiBold, // Keep original name just in case
    'Inter-Semibold': Inter_600SemiBold, // Map to what we might use
    'Inter-Bold': Inter_700Bold,
    'Inter-Black': Inter_900Black,
    'RobotoMono-Bold': RobotoMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const content = (
    <>
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
            />          </Stack>
          <StatusBar style="light" />
        </NavigationThemeProvider>
        </DialogProvider>
      </BankrollProvider>
    </AuthProvider>
    </>
  );

  return Platform.OS === 'web' ? (
    <View style={{ flex: 1 }}>{content}</View>
  ) : (
    <GestureHandlerRootView style={{ flex: 1 }}>{content}</GestureHandlerRootView>
  );
}
