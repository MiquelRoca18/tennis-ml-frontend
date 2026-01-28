import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface StatComparisonBarProps {
    label: string;
    value1: number;
    value2: number;
    max?: number;
    player1Name: string;
    player2Name: string;
    formatValue?: (value: number) => string;
    showPercentage?: boolean;
}

export default function StatComparisonBar({
    label,
    value1,
    value2,
    max,
    player1Name,
    player2Name,
    formatValue,
    showPercentage = false
}: StatComparisonBarProps) {
    // Calculate max value if not provided
    const maxValue = max || Math.max(value1, value2) || 1;

    // Calculate percentages for bar width
    const percentage1 = (value1 / maxValue) * 100;
    const percentage2 = (value2 / maxValue) * 100;

    // Format display values
    const displayValue1 = formatValue ? formatValue(value1) : value1.toString();
    const displayValue2 = formatValue ? formatValue(value2) : value2.toString();

    return (
        <View style={styles.container}>
            {/* Label */}
            <Text style={styles.label}>{label}</Text>

            {/* Comparison Bar */}
            <View style={styles.barContainer}>
                {/* Player 1 Side */}
                <View style={styles.player1Container}>
                    <Text style={styles.player1Name} numberOfLines={1}>{player1Name}</Text>
                    <View style={styles.player1BarWrapper}>
                        <View style={[styles.player1Bar, { width: `${percentage1}%` }]} />
                    </View>
                    <Text style={styles.player1Value}>{displayValue1}</Text>
                </View>

                {/* Center Divider */}
                <View style={styles.divider} />

                {/* Player 2 Side */}
                <View style={styles.player2Container}>
                    <Text style={styles.player2Value}>{displayValue2}</Text>
                    <View style={styles.player2BarWrapper}>
                        <View style={[styles.player2Bar, { width: `${percentage2}%` }]} />
                    </View>
                    <Text style={styles.player2Name} numberOfLines={1}>{player2Name}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
        textAlign: 'center',
    },
    barContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    player1Container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    player1Name: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        width: 40,
        textAlign: 'right',
    },
    player1BarWrapper: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    player1Bar: {
        height: '100%',
        backgroundColor: COLORS.primary,
        alignSelf: 'flex-end',
        borderRadius: 4,
    },
    player1Value: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontFamily: 'RobotoMono-Bold',
        minWidth: 45,
        textAlign: 'left',
    },
    divider: {
        width: 2,
        height: 24,
        backgroundColor: COLORS.border,
    },
    player2Container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    player2Value: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontFamily: 'RobotoMono-Bold',
        minWidth: 45,
        textAlign: 'right',
    },
    player2BarWrapper: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    player2Bar: {
        height: '100%',
        backgroundColor: COLORS.success,
        alignSelf: 'flex-start',
        borderRadius: 4,
    },
    player2Name: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        width: 40,
        textAlign: 'left',
    },
});
