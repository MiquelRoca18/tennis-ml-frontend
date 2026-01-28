import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface PredictionHeaderProps {
    prediction: any;
}

export default function PredictionHeader({ prediction }: PredictionHeaderProps) {
    if (!prediction) return null;

    const { timestamp, version } = prediction;

    // Format timestamp
    const formatTimestamp = (ts: string) => {
        if (!ts) return 'No disponible';
        const date = new Date(ts);
        return date.toLocaleString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>🤖</Text>
            </View>
            <Text style={styles.title}>Predicción con Inteligencia Artificial</Text>
            <View style={styles.metaContainer}>
                <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Última actualización:</Text>
                    <Text style={styles.metaValue}>{formatTimestamp(timestamp)}</Text>
                </View>
                {version && (
                    <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Versión del modelo:</Text>
                        <Text style={styles.metaValue}>v{version}</Text>
                    </View>
                )}
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
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    icon: {
        fontSize: 32,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
    },
    metaContainer: {
        width: '100%',
        gap: 8,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    metaValue: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
});
