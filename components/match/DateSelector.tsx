import React, { useEffect, useRef } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS } from '../../src/utils/constants';
import { formatDateShort, isToday } from '../../src/utils/dateUtils';

interface DateSelectorProps {
    dates: string[];
    selectedDate: string;
    onDateSelect: (date: string) => void;
}

export default function DateSelector({ dates, selectedDate, onDateSelect }: DateSelectorProps) {
    const scrollViewRef = useRef<ScrollView>(null);

    // Auto-scroll to selected date on mount
    useEffect(() => {
        const selectedIndex = dates.indexOf(selectedDate);
        if (selectedIndex !== -1 && scrollViewRef.current) {
            // Scroll to center the selected date
            const offset = selectedIndex * 60 - 150; // 60 is item width, adjust to center
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ x: Math.max(0, offset), animated: true });
            }, 100);
        }
    }, [dates, selectedDate]);

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {dates.map((date) => {
                    const { dayName, dayNumber } = formatDateShort(date);
                    const isSelected = date === selectedDate;
                    const isTodayDate = isToday(date);

                    return (
                        <TouchableOpacity
                            key={date}
                            style={[
                                styles.dateItem,
                                isSelected && styles.dateItemSelected,
                                isTodayDate && !isSelected && styles.dateItemToday,
                            ]}
                            onPress={() => onDateSelect(date)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.dayName,
                                    isSelected && styles.dayNameSelected,
                                    isTodayDate && !isSelected && styles.dayNameToday,
                                ]}
                            >
                                {dayName}
                            </Text>
                            <Text
                                style={[
                                    styles.dayNumber,
                                    isSelected && styles.dayNumberSelected,
                                    isTodayDate && !isSelected && styles.dayNumberToday,
                                ]}
                            >
                                {dayNumber}
                            </Text>
                            {isTodayDate && (
                                <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />
                            )}
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
    },
    scrollContent: {
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
    dateItem: {
        width: 56,
        height: 64,
        marginHorizontal: 4,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        position: 'relative',
    },
    dateItemSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    dateItemToday: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    dayName: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    dayNameSelected: {
        color: '#FFFFFF',
    },
    dayNameToday: {
        color: COLORS.primary,
    },
    dayNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    dayNumberSelected: {
        color: '#FFFFFF',
    },
    dayNumberToday: {
        color: COLORS.primary,
    },
    todayDot: {
        position: 'absolute',
        bottom: 6,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
    },
    todayDotSelected: {
        backgroundColor: '#FFFFFF',
    },
});
