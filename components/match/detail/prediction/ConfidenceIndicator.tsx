import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface ConfidenceIndicatorProps {
    prediction: any;
}

export default function ConfidenceIndicator({ prediction }: ConfidenceIndicatorProps) {
    if (!prediction) return null;

    const confidence = prediction.confianza || prediction.confidence_level || 'Media';

    // Map confidence to level (1-5)
    const getConfidenceLevel = (conf: string): number => {
        const confLower = conf.toLowerCase();
        if (confLower.includes('alta') || confLower === 'high') return 5;
        if (confLower.includes('media') || confLower === 'medium') return 3;
        if (confLower.includes('baja') || confLower === 'low') return 1;
        return 3; // default
    };

    // Get color based on confidence
    const getConfidenceColor = (conf: string): string => {
        const confLower = conf.toLowerCase();
        if (confLower.includes('alta') || confLower === 'high') return COLORS.success;
        if (confLower.includes('media') || confLower === 'medium') return COLORS.warning;
        if (confLower.includes('baja') || confLower === 'low') return COLORS.danger;
        return COLORS.warning;
    };

    const level = getConfidenceLevel(confidence);
    const color = getConfidenceColor(confidence);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Nivel de Confianza</Text>

            <View style={styles.confidenceContainer}>
                <Text style={[styles.confidenceText, { color }]}>
                    {confidence.toUpperCase()}
                </Text>

                <View style={styles.dotsContainer}>
                    {[1, 2, 3, 4, 5].map((dot) => (
                        <View
                            key={dot}
                            style={[
                                styles.dot,
                                dot <= level && { backgroundColor: color }
                            ]}
                        />
                    ))}
                </View>

                <Text style={styles.levelText}>({level}/5)</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    confidenceContainer: {
        alignItems: 'center',
        gap: 12,
    },
    confidenceText: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 1,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.border,
    },
    levelText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
});
