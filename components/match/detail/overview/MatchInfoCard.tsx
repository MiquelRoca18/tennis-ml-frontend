import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';
import { parseLocalDate } from '../../../../src/utils/dateUtils';

interface MatchInfoCardProps {
    match: any;
    matchDetails: any;
}

export default function MatchInfoCard({ match, matchDetails }: MatchInfoCardProps) {
    const { torneo, ronda, superficie, fecha_partido, hora_inicio } = match;
    const duracion = matchDetails?.duracion_estimada;

    const getSurfaceIcon = (surface: string) => {
        switch (surface?.toLowerCase()) {
            case 'hard':
                return '🏟️';
            case 'clay':
                return '🟫';
            case 'grass':
                return '🌱';
            case 'carpet':
                return '🔵';
            default:
                return '🎾';
        }
    };

    const getSurfaceColor = (surface: string) => {
        switch (surface?.toLowerCase()) {
            case 'hard':
                return '#3B82F6';
            case 'clay':
                return '#DC2626';
            case 'grass':
                return '#10B981';
            case 'carpet':
                return '#8B5CF6';
            default:
                return COLORS.textSecondary;
        }
    };

    const formatDate = (date: string) => {
        if (!date) return '';
        const d = parseLocalDate(date);
        return d.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ℹ️ Información del Partido</Text>

            <View style={styles.infoGrid}>
                {/* Tournament */}
                <View style={styles.infoRow}>
                    <View style={styles.infoLabel}>
                        <Text style={styles.labelIcon}>🏆</Text>
                        <Text style={styles.labelText}>Torneo</Text>
                    </View>
                    <Text style={styles.infoValue} numberOfLines={2}>{torneo}</Text>
                </View>

                {/* Round */}
                <View style={styles.infoRow}>
                    <View style={styles.infoLabel}>
                        <Text style={styles.labelIcon}>📍</Text>
                        <Text style={styles.labelText}>Ronda</Text>
                    </View>
                    <Text style={styles.infoValue} numberOfLines={2}>{ronda}</Text>
                </View>

                {/* Surface */}
                <View style={styles.infoRow}>
                    <View style={styles.infoLabel}>
                        <Text style={styles.labelIcon}>{getSurfaceIcon(superficie)}</Text>
                        <Text style={styles.labelText}>Superficie</Text>
                    </View>
                    <View style={styles.surfaceContainer}>
                        <View style={[styles.surfaceDot, { backgroundColor: getSurfaceColor(superficie) }]} />
                        <Text style={[styles.infoValue, { color: getSurfaceColor(superficie) }]}>
                            {superficie}
                        </Text>
                    </View>
                </View>

                {/* Date */}
                <View style={styles.infoRow}>
                    <View style={styles.infoLabel}>
                        <Text style={styles.labelIcon}>📅</Text>
                        <Text style={styles.labelText}>Fecha</Text>
                    </View>
                    <Text style={styles.infoValue}>{formatDate(fecha_partido)}</Text>
                </View>

                {/* Time */}
                {hora_inicio && (
                    <View style={styles.infoRow}>
                        <View style={styles.infoLabel}>
                            <Text style={styles.labelIcon}>🕐</Text>
                            <Text style={styles.labelText}>Hora</Text>
                        </View>
                        <Text style={styles.infoValue}>{hora_inicio}</Text>
                    </View>
                )}

                {/* Duration */}
                {duracion && (
                    <View style={styles.infoRow}>
                        <View style={styles.infoLabel}>
                            <Text style={styles.labelIcon}>⏱️</Text>
                            <Text style={styles.labelText}>Duración</Text>
                        </View>
                        <Text style={styles.infoValue}>{duracion}</Text>
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
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    infoGrid: {
        gap: 14,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    infoLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    labelIcon: {
        fontSize: 18,
    },
    labelText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        textAlign: 'right',
        flex: 1,
    },
    surfaceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        justifyContent: 'flex-end',
    },
    surfaceDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
