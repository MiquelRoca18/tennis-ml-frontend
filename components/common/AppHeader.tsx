import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/utils/constants';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  /** Muestra icono lupa y navega a /search al pulsar */
  showSearch?: boolean;
  /** Muestra icono cuenta y navega a pestaña Cuenta al pulsar */
  showAccount?: boolean;
}

export default function AppHeader({
  title = 'Tenis',
  subtitle,
  showSearch = true,
  showAccount = true,
}: AppHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle != null && subtitle !== '' && (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        )}
      </View>
      <View style={styles.actions}>
        {showSearch && (
          <TouchableOpacity
            onPress={() => router.push('/search')}
            style={styles.iconButton}
            accessibilityLabel="Buscar jugadores y torneos"
          >
            <Ionicons name="search" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
        {showAccount && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/account')}
            style={styles.iconButton}
            accessibilityLabel="Cuenta"
          >
            <Ionicons name="person-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: { flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
});
