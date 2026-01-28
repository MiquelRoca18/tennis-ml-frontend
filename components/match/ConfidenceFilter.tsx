import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ConfidenceLevel } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';

interface ConfidenceFilterProps {
    selectedFilter: 'ALL' | ConfidenceLevel;
    onFilterChange: (filter: 'ALL' | ConfidenceLevel) => void;
    counts: {
        all: number;
        HIGH: number;
        MEDIUM: number;
        LOW: number;
    };
}

export default function ConfidenceFilter({ selectedFilter, onFilterChange, counts }: ConfidenceFilterProps) {
    const filters: Array<{ key: 'ALL' | ConfidenceLevel; label: string; icon: string }> = [
        { key: 'ALL', label: 'Todos', icon: '🎾' },
        { key: 'HIGH', label: 'Alta', icon: '✅' },
        { key: 'MEDIUM', label: 'Media', icon: '⚠️' },
        { key: 'LOW', label: 'Baja', icon: '❌' },
    ];

    const getCount = (key: 'ALL' | ConfidenceLevel) => {
        if (key === 'ALL') return counts.all;
        if (key === 'UNKNOWN') return 0; // UNKNOWN not tracked in counts
        return counts[key];
    };

    const getButtonColor = (key: 'ALL' | ConfidenceLevel) => {
        if (key === 'ALL') return COLORS.primary;
        if (key === 'HIGH') return COLORS.success;
        if (key === 'MEDIUM') return COLORS.warning;
        return COLORS.danger;
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {filters.map((filter) => {
                    const isActive = selectedFilter === filter.key;
                    const color = getButtonColor(filter.key);
                    const count = getCount(filter.key);

                    return (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterButton,
                                isActive && { backgroundColor: color + '20', borderColor: color },
                            ]}
                            onPress={() => onFilterChange(filter.key)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.icon}>{filter.icon}</Text>
                            <Text
                                style={[
                                    styles.label,
                                    isActive && { color, fontWeight: '700' },
                                ]}
                            >
                                {filter.label}
                            </Text>
                            <View style={[styles.countBadge, isActive && { backgroundColor: color }]}>
                                <Text style={[styles.count, isActive && { color: COLORS.background }]}>
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
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingVertical: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
        gap: 6,
    },
    icon: {
        fontSize: 14,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    countBadge: {
        backgroundColor: COLORS.border,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
    },
    count: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
});
