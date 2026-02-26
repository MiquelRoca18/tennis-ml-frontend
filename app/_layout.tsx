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
import 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/src/contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

// Custom Navigation Theme
const CustomDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: Colors.brand.neonGreen,
    background: Colors.background.primary,
    card: Colors.background.secondary,
    text: Colors.text.primary,
    border: Colors.ui.border,
    notification: Colors.brand.electricBlue,
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

  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationThemeProvider value={CustomDarkTheme}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: Colors.background.secondary },
              headerTintColor: Colors.text.primary,
              headerTitleStyle: { fontFamily: 'Inter-Bold' },
              contentStyle: { backgroundColor: Colors.background.primary },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="match/[id]" />
            <Stack.Screen name="player/[key]" options={{ headerShown: false }} />
            <Stack.Screen name="tournament/[key]" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ title: 'Buscar' }} />
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
      </ThemeProvider>
    </AuthProvider>
  );
}
