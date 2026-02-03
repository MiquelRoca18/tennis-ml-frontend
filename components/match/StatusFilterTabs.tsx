import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../src/utils/constants';

export type StatusFilterValue = 'ALL' | 'completado' | 'pendiente' | 'en_juego';

interface StatusFilterTabsProps {
  selectedFilter: StatusFilterValue;
  onFilterChange: (filter: StatusFilterValue) => void;
  counts: {
    all: number;
    completado: number;
    pendiente: number;
    en_juego: number;
  };
}

const TABS: Array<{ key: StatusFilterValue; label: string; icon: string }> = [
  { key: 'ALL', label: 'Todos', icon: '🎾' },
  { key: 'completado', label: 'Finalizados', icon: '✅' },
  { key: 'pendiente', label: 'Por jugar', icon: '⏳' },
  { key: 'en_juego', label: 'En directo', icon: '🔴' },
];

export default function StatusFilterTabs({
  selectedFilter,
  onFilterChange,
  counts,
}: StatusFilterTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TABS.map((tab) => {
          const isActive = selectedFilter === tab.key;
          const count = counts[tab.key];

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive && styles.tabSelected,
                tab.key === 'en_juego' && count > 0 && !isActive && styles.tabLive,
              ]}
              onPress={() => onFilterChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.label,
                  isActive && styles.labelSelected,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
              <View style={[styles.countBadge, isActive && styles.countBadgeSelected]}>
                <Text style={[styles.count, isActive && styles.countSelected]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  tabSelected: {
    backgroundColor: COLORS.primary + '18',
    borderColor: COLORS.primary,
  },
  tabLive: {
    borderColor: '#FF4444' + '60',
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    maxWidth: 72,
  },
  labelSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  countBadgeSelected: {
    backgroundColor: COLORS.primary,
  },
  count: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  countSelected: {
    color: '#FFF',
  },
});
