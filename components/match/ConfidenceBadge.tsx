import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Confidence } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';

interface ConfidenceBadgeProps {
    confidence: Confidence;
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
    const getConfidenceStyle = () => {
        switch (confidence) {
            case 'Alta':
                return { color: COLORS.success, stars: '⭐⭐⭐' };
            case 'Media':
                return { color: COLORS.warning, stars: '⭐⭐' };
            case 'Baja':
                return { color: COLORS.textSecondary, stars: '⭐' };
        }
    };

    const { color, stars } = getConfidenceStyle();

    return (
        <View style={styles.container}>
            <Text style={[styles.text, { color }]}>
                {stars} {confidence}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
    },
});
