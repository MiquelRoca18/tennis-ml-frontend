import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Player } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';
import PlayerLogo from '../match/PlayerLogo';

interface PlayerHeaderProps {
    player: Player;
}

/** Formatea player_bday tipo "11.02.1996" a "11 feb 1996" */
function formatBirthday(bday: string): string {
    if (!bday || !bday.trim()) return '';
    const parts = bday.trim().split(/[.\-/]/);
    if (parts.length >= 3) {
        const [d, m, y] = parts;
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const mi = parseInt(m, 10);
        const month = mi >= 1 && mi <= 12 ? months[mi - 1] : m;
        return `${d} ${month} ${y}`;
    }
    return bday;
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
    const ranking = player.atp_ranking ?? player.wta_ranking;
    const league = player.atp_ranking != null ? 'ATP' : 'WTA';
    const country = player.player_country ?? player.country;
    const points = player.ranking_points ?? player.atp_points ?? player.wta_points;

    return (
        <View style={styles.container}>
            {/* Player Logo */}
            <View style={styles.logoContainer}>
                <PlayerLogo
                    logoUrl={typeof player.player_logo === 'string' ? player.player_logo : undefined}
                    logo={typeof player.player_logo === 'string' ? player.player_logo : undefined}
                    name={player.player_name}
                    size={100}
                />
            </View>

            {/* Player Name */}
            <Text style={styles.name}>
                {player.player_full_name || player.player_name}
            </Text>

            {/* Birthday */}
            {(player.player_bday || player.player_birthday) ? (
                <Text style={styles.birthday}>
                    Nacimiento: {formatBirthday(player.player_bday || player.player_birthday)}
                </Text>
            ) : null}

            {/* Country */}
            {country ? (
                <Text style={styles.country}>{country}</Text>
            ) : null}

            {/* Ranking Info */}
            {(ranking != null || points != null) && (
                <View style={styles.rankingContainer}>
                    {ranking != null && (
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
                    )}

                    {points != null && (
                        <View style={styles.pointsBadge}>
                            <Text style={styles.pointsValue}>
                                {Number(points).toLocaleString()}
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
    birthday: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 8,
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
