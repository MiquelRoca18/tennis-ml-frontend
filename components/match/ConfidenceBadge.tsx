import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Confidence, ConfidenceLevel } from '../../src/types/api';
import { COLORS, CONFIDENCE_DESCRIPTIONS } from '../../src/utils/constants';

interface ConfidenceBadgeProps {
    confidence?: Confidence;
    confidenceLevel?: ConfidenceLevel;
    showDescription?: boolean;
    detailed?: boolean;
    player1Known?: boolean;
    player2Known?: boolean;
}

export default function ConfidenceBadge({
    confidence,
    confidenceLevel,
    showDescription = false,
    detailed = false,
    player1Known,
    player2Known,
}: ConfidenceBadgeProps) {
    // Determine which format to use (prefer new format)
    const level = confidenceLevel || mapOldToNew(confidence);

    const getConfidenceStyle = () => {
        switch (level) {
            case 'HIGH':
                return { color: COLORS.success, icon: '✅', text: 'Alta Confianza' };
            case 'MEDIUM':
                return { color: COLORS.warning, icon: '⚠️', text: 'Confianza Media' };
            case 'LOW':
                return { color: COLORS.danger, icon: '❌', text: 'Baja Confianza' };
            case 'UNKNOWN':
                return { color: COLORS.textSecondary, icon: '❓', text: 'Desconocida' };
            default:
                return { color: COLORS.textSecondary, icon: '❓', text: 'Desconocida' };
        }
    };

    const { color, icon, text } = getConfidenceStyle();
    const description = CONFIDENCE_DESCRIPTIONS[level];

    return (
        <View style={styles.container}>
            <View style={styles.badge}>
                <Text style={[styles.icon, { color }]}>{icon}</Text>
                <Text style={[styles.text, { color }]}>{text}</Text>
            </View>
            {showDescription && description && (
                <Text style={styles.description}>{description}</Text>
            )}
            {detailed && player1Known !== undefined && player2Known !== undefined && (
                <View style={styles.detailContainer}>
                    <Text style={styles.detailText}>
                        Jugador 1: {player1Known ? '✓ Conocido' : '✗ Desconocido'}
                    </Text>
                    <Text style={styles.detailText}>
                        Jugador 2: {player2Known ? '✓ Conocido' : '✗ Desconocido'}
                    </Text>
                </View>
            )}
        </View>
    );
}

// Helper function to map old confidence format to new
function mapOldToNew(confidence?: Confidence): ConfidenceLevel {
    switch (confidence) {
        case 'Alta':
            return 'HIGH';
        case 'Media':
            return 'MEDIUM';
        case 'Baja':
            return 'LOW';
        default:
            return 'UNKNOWN';
    }
}

const styles = StyleSheet.create({
    container: {
        gap: 4,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    icon: {
        fontSize: 14,
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
    },
    description: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    detailContainer: {
        marginTop: 4,
        gap: 2,
    },
    detailText: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
});
