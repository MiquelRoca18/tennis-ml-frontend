import { Stack } from 'expo-router';
import React from 'react';

export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#161B22' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '600', fontSize: 18 },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Explorar' }} />
      <Stack.Screen name="rankings" options={{ title: 'Ranking ATP (individual masculino)' }} />
      <Stack.Screen name="tournaments" options={{ title: 'Torneos' }} />
    </Stack>
  );
}
