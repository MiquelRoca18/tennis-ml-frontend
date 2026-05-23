import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../src/utils/constants';

export type CircuitFilterValue = 'ALL' | 'atp' | 'wta' | 'challenger';

interface CircuitToggleProps {
  selected: CircuitFilterValue;
  onChange: (value: CircuitFilterValue) => void;
  counts: { all: number; atp: number; wta: number; challenger: number };
}

const CIRCUITS: Array<{ key: CircuitFilterValue; label: string }> = [
  { key: 'ALL', label: 'Todos' },
  { key: 'atp', label: 'ATP' },
  { key: 'wta', label: 'WTA' },
  { key: 'challenger', label: 'Challenger' },
];

export default function CircuitToggle({ selected, onChange, counts }: CircuitToggleProps) {
  return (
    <View style={styles.container}>
      {CIRCUITS.map((item) => {
        const isActive = selected === item.key;
        const count =
          item.key === 'ALL'
            ? counts.all
            : item.key === 'atp'
              ? counts.atp
              : item.key === 'wta'
                ? counts.wta
                : counts.challenger;

        // Hide circuit tab when there are no matches for it
        if (item.key !== 'ALL' && count === 0) return null;

        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onChange(item.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
            <View style={[styles.badge, isActive && styles.badgeActive]}>
              <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>{count}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.primary + '18',
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  badgeActive: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  badgeTextActive: {
    color: '#FFF',
  },
});
