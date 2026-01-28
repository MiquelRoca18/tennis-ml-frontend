import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface Point {
    id: number;
    match_id: number;
    set_number: string;
    game_number: number;
    point_number: number;
    server: string;
    score: string;
    is_break_point: boolean;
    is_set_point: boolean;
    is_match_point: boolean;
}

interface PointByPointViewProps {
    matchId: number;
    points: Point[];
    player1Name: string;
    player2Name: string;
}

export default function PointByPointView({ matchId, points, player1Name, player2Name }: PointByPointViewProps) {
    const [selectedSet, setSelectedSet] = useState<string | null>(null);

    if (!points || points.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🎾</Text>
                <Text style={styles.emptyText}>No hay datos punto por punto disponibles</Text>
            </View>
        );
    }

    // Group points by set and game
    const pointsBySet = points.reduce((acc, point) => {
        if (!acc[point.set_number]) {
            acc[point.set_number] = {};
        }
        if (!acc[point.set_number][point.game_number]) {
            acc[point.set_number][point.game_number] = [];
        }
        acc[point.set_number][point.game_number].push(point);
        return acc;
    }, {} as Record<string, Record<number, Point[]>>);

    const sets = Object.keys(pointsBySet).sort();
    const displaySet = selectedSet || sets[0];

    const getPointIcon = (point: Point) => {
        if (point.is_match_point) return '🏆';
        if (point.is_set_point) return '🎯';
        if (point.is_break_point) return '💥';
        return '•';
    };

    const getPointStyle = (point: Point) => {
        if (point.is_match_point) return styles.matchPoint;
        if (point.is_set_point) return styles.setPoint;
        if (point.is_break_point) return styles.breakPoint;
        return null;
    };

    return (
        <View style={styles.container}>
            {/* Set Selector */}
            <View style={styles.setSelector}>
                {sets.map((set) => (
                    <TouchableOpacity
                        key={set}
                        style={[
                            styles.setButton,
                            displaySet === set && styles.setButtonActive
                        ]}
                        onPress={() => setSelectedSet(set)}
                    >
                        <Text style={[
                            styles.setButtonText,
                            displaySet === set && styles.setButtonTextActive
                        ]}>
                            Set {set}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Points List */}
            <ScrollView style={styles.pointsList} showsVerticalScrollIndicator={false}>
                {Object.entries(pointsBySet[displaySet] || {})
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([gameNum, gamePoints]) => (
                        <View key={gameNum} style={styles.gameSection}>
                            <View style={styles.gameHeader}>
                                <Text style={styles.gameTitle}>Juego {gameNum}</Text>
                                <Text style={styles.gameServer}>
                                    Saca: {gamePoints[0]?.server === 'First Player' ? player1Name.split(' ').pop() : player2Name.split(' ').pop()}
                                </Text>
                            </View>

                            <View style={styles.pointsContainer}>
                                {gamePoints.map((point, idx) => (
                                    <View
                                        key={point.id}
                                        style={[
                                            styles.pointRow,
                                            getPointStyle(point)
                                        ]}
                                    >
                                        <View style={styles.pointInfo}>
                                            <Text style={styles.pointIcon}>{getPointIcon(point)}</Text>
                                            <Text style={styles.pointNumber}>Punto {point.point_number}</Text>
                                        </View>
                                        <Text style={styles.pointScore}>{point.score}</Text>
                                        {(point.is_break_point || point.is_set_point || point.is_match_point) && (
                                            <View style={styles.specialBadge}>
                                                <Text style={styles.specialBadgeText}>
                                                    {point.is_match_point ? 'MP' : point.is_set_point ? 'SP' : 'BP'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
            </ScrollView>

            {/* Legend */}
            <View style={styles.legend}>
                <Text style={styles.legendTitle}>Leyenda:</Text>
                <View style={styles.legendItems}>
                    <View style={styles.legendItem}>
                        <Text style={styles.legendIcon}>🏆</Text>
                        <Text style={styles.legendText}>Match Point</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <Text style={styles.legendIcon}>🎯</Text>
                        <Text style={styles.legendText}>Set Point</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <Text style={styles.legendIcon}>💥</Text>
                        <Text style={styles.legendText}>Break Point</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    setSelector: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    setButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    setButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    setButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    setButtonTextActive: {
        color: '#FFFFFF',
    },
    pointsList: {
        flex: 1,
        padding: 16,
    },
    gameSection: {
        marginBottom: 20,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    gameHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: COLORS.surfaceElevated,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    gameTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    gameServer: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    pointsContainer: {
        padding: 8,
    },
    pointRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        marginBottom: 4,
        borderRadius: 6,
        backgroundColor: COLORS.background,
    },
    breakPoint: {
        backgroundColor: COLORS.danger + '15',
        borderLeftWidth: 3,
        borderLeftColor: COLORS.danger,
    },
    setPoint: {
        backgroundColor: COLORS.warning + '15',
        borderLeftWidth: 3,
        borderLeftColor: COLORS.warning,
    },
    matchPoint: {
        backgroundColor: COLORS.success + '15',
        borderLeftWidth: 3,
        borderLeftColor: COLORS.success,
    },
    pointInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    pointIcon: {
        fontSize: 16,
    },
    pointNumber: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    pointScore: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontFamily: 'RobotoMono-Bold',
        marginRight: 8,
    },
    specialBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    specialBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    legend: {
        padding: 16,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    legendTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    legendItems: {
        flexDirection: 'row',
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendIcon: {
        fontSize: 14,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
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
