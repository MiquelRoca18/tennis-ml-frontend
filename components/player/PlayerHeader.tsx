import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Player } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';
import PlayerLogo from '../match/PlayerLogo';

interface PlayerHeaderProps {
    player: Player;
}

function getRankingMovementIcon(movement: 'up' | 'down' | 'same' | null) {
    switch (movement) {
        case 'up':
            return '↑';
        case 'down':
            return '↓';
        case 'same':
            return '→';
        default:
            return '';
    }
}

function getRankingMovementColor(movement: 'up' | 'down' | 'same' | null) {
    switch (movement) {
        case 'up':
            return COLORS.success;
        case 'down':
            return COLORS.danger;
        case 'same':
            return COLORS.textSecondary;
        default:
            return COLORS.textSecondary;
    }
}

export default function PlayerHeader({ player }: PlayerHeaderProps) {
    const ranking = player.atp_ranking || player.wta_ranking;
    const league = player.atp_ranking ? 'ATP' : 'WTA';

    return (
        <View style={styles.container}>
            {/* Player Logo */}
            <View style={styles.logoContainer}>
                <PlayerLogo
                    logo={player.player_logo}
                    name={player.player_name}
                    size={100}
                />
            </View>

            {/* Player Name */}
            <Text style={styles.name}>{player.player_name}</Text>

            {/* Country */}
            {player.player_country && (
                <Text style={styles.country}>{player.player_country}</Text>
            )}

            {/* Ranking Info */}
            {ranking && (
                <View style={styles.rankingContainer}>
                    <View style={styles.rankingBadge}>
                        <Text style={styles.rankingLabel}>{league} Ranking</Text>
                        <View style={styles.rankingRow}>
                            <Text style={styles.rankingNumber}>#{ranking}</Text>
                            {player.ranking_movement && (
                                <View style={[
                                    styles.movementBadge,
                                    { backgroundColor: getRankingMovementColor(player.ranking_movement) + '20' }
                                ]}>
                                    <Text style={[
                                        styles.movementIcon,
                                        { color: getRankingMovementColor(player.ranking_movement) }
                                    ]}>
                                        {getRankingMovementIcon(player.ranking_movement)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {player.ranking_points && (
                        <View style={styles.pointsBadge}>
                            <Text style={styles.pointsValue}>
                                {player.ranking_points.toLocaleString()}
                            </Text>
                            <Text style={styles.pointsLabel}>puntos</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    logoContainer: {
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    country: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    rankingContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    rankingBadge: {
        backgroundColor: COLORS.primary + '15',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
        alignItems: 'center',
        minWidth: 120,
    },
    rankingLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    rankingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rankingNumber: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.primary,
    },
    movementBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    movementIcon: {
        fontSize: 16,
        fontWeight: '700',
    },
    pointsBadge: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        minWidth: 100,
    },
    pointsValue: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    pointsLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
});
