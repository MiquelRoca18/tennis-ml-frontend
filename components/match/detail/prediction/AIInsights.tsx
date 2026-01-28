import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface AIInsightsProps {
    prediction?: any;
    match?: any;
}

export default function AIInsights({ prediction, match }: AIInsightsProps) {
    const [expanded, setExpanded] = useState(false);

    // Generate insights based on available data
    const generateInsights = () => {
        const insights: string[] = [];

        if (prediction) {
            const prob1 = prediction.jugador1_probabilidad;
            const prob2 = prediction.jugador2_probabilidad;
            const diff = Math.abs(prob1 - prob2);

            if (diff < 0.1) {
                insights.push('Partido muy equilibrado según el modelo');
            } else if (diff > 0.3) {
                insights.push('Favorito claro según las probabilidades');
            }

            if (prediction.jugador1_ev > 0 || prediction.jugador2_ev > 0) {
                insights.push('Hay valor positivo en al menos una opción');
            } else {
                insights.push('Cuotas reflejan la probabilidad real del modelo');
            }

            const confidence = (prediction.confianza || prediction.confidence_level || '').toLowerCase();
            if (confidence.includes('alta') || confidence === 'high') {
                insights.push('Alta confianza en la predicción');
            } else if (confidence.includes('baja') || confidence === 'low') {
                insights.push('Confianza limitada - factores impredecibles');
            }
        }

        if (match) {
            if (match.superficie) {
                insights.push(`Superficie ${match.superficie} puede influir en el resultado`);
            }
        }

        // Add default insights if none generated
        if (insights.length === 0) {
            insights.push('Análisis basado en datos históricos');
            insights.push('Modelo considera múltiples factores');
        }

        return insights;
    };

    const insights = generateInsights();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>🧠 Factores Clave del Modelo</Text>
                <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>

            {expanded && (
                <View style={styles.content}>
                    {insights.map((insight, index) => (
                        <View key={index} style={styles.insightRow}>
                            <Text style={styles.bullet}>▸</Text>
                            <Text style={styles.insightText}>{insight}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    expandIcon: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    content: {
        padding: 16,
        paddingTop: 0,
        gap: 12,
    },
    insightRow: {
        flexDirection: 'row',
        gap: 8,
    },
    bullet: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    insightText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
});
