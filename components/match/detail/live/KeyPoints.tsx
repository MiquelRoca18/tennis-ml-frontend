import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface KeyPointsProps {
    matchAnalysis: any;
}

export default function KeyPoints({ matchAnalysis }: KeyPointsProps) {
    const keyPoints = matchAnalysis?.puntos_clave || [];

    if (keyPoints.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔑</Text>
                <Text style={styles.emptyText}>No hay puntos clave registrados</Text>
            </View>
        );
    }

    const getPointIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'match_point':
                return '🏆';
            case 'set_point':
                return '🎯';
            case 'break_point':
                return '💥';
            default:
                return '⚠️';
        }
    };

    const getPointLabel = (type: string) => {
        switch (type.toLowerCase()) {
            case 'match_point':
                return 'Match Point';
            case 'set_point':
                return 'Set Point';
            case 'break_point':
                return 'Break Point';
            default:
                return 'Game Point';
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>🔑 Momentos Decisivos</Text>

            {keyPoints.map((point: any, index: number) => (
                <View key={index} style={styles.pointCard}>
                    <View style={styles.pointHeader}>
                        <Text style={styles.pointIcon}>{getPointIcon(point.tipo)}</Text>
                        <View style={styles.pointHeaderText}>
                            <Text style={styles.pointType}>{getPointLabel(point.tipo)}</Text>
                            <Text style={styles.pointLocation}>
                                Set {point.set}, Game {point.juego} · {point.punto}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.pointScore}>Score: {point.marcador}</Text>
                    <Text style={styles.pointDescription}>{point.descripcion}</Text>

                    {point.convertido !== undefined && (
                        <View style={styles.resultBadge}>
                            <Text style={[
                                styles.resultText,
                                point.convertido ? styles.converted : styles.saved
                            ]}>
                                {point.convertido ? '✅ Convertido' : '❌ Salvado'}
                            </Text>
                        </View>
                    )}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 20,
    },
    pointCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    pointHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    pointIcon: {
        fontSize: 28,
    },
    pointHeaderText: {
        flex: 1,
    },
    pointType: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    pointLocation: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    pointScore: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    pointDescription: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
        lineHeight: 20,
        marginBottom: 12,
    },
    resultBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: COLORS.border,
    },
    resultText: {
        fontSize: 12,
        fontWeight: '700',
    },
    converted: {
        color: COLORS.success,
    },
    saved: {
        color: COLORS.danger,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
