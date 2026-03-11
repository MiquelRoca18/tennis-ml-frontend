import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { FavoritesProvider } from '../../src/contexts/FavoritesContext';
import { FavoritesRefreshProvider, useFavoritesRefresh } from '../../src/contexts/FavoritesRefreshContext';
import { useFavorites } from '../../src/hooks/useFavorites';
import { COLORS } from '../../src/utils/constants';

/** Etiqueta corta para el tab Cuenta cuando hay sesión (ej. "miquel" o "miquel…") */
function getAccountTabLabel(email: string | undefined): string {
  if (!email?.trim()) return 'Cuenta';
  const part = email.split('@')[0]?.trim() || '';
  if (part.length <= 10) return part;
  return part.slice(0, 8) + '…';
}

function TabsWithBadge() {
  const { user } = useAuth();
  const { favorites, refresh } = useFavorites();
  const { refreshTrigger } = useFavoritesRefresh();
  const favoritesCount = favorites?.length ?? 0;
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const prevRefreshTrigger = useRef(refreshTrigger);

  // Solo refrescar cuando refreshTrigger cambie (p. ej. al volver a Favoritos), no en montaje inicial.
  // El montaje inicial ya carga favoritos en FavoritesContext.
  useEffect(() => {
    if (prevRefreshTrigger.current === refreshTrigger) return;
    prevRefreshTrigger.current = refreshTrigger;
    refreshRef.current();
  }, [refreshTrigger]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Partidos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="tennisball" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bets"
        options={{
          title: 'Mis apuestas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Torneos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star" size={size} color={color} />
          ),
          tabBarBadge: favoritesCount > 0 ? favoritesCount : undefined,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: getAccountTabLabel(user?.email ?? undefined),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <FavoritesRefreshProvider>
      <FavoritesProvider>
        <TabsWithBadge />
      </FavoritesProvider>
    </FavoritesRefreshProvider>
  );
}
