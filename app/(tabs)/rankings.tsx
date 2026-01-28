import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import PlayerLogo from '../../components/match/PlayerLogo';
import { useRankings } from '../../src/hooks/useRankings';
import { Player } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';

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

interface RankingRowProps {
    player: Player;
    onPress: () => void;
}

function RankingRow({ player, onPress }: RankingRowProps) {
    const ranking = player.atp_ranking || player.wta_ranking;

    return (
        <TouchableOpacity
            style={styles.rankingRow}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Ranking Number */}
            <View style={styles.rankingNumber}>
                <Text style={styles.rankingText}>#{ranking}</Text>
            </View>

            {/* Player Info */}
            <PlayerLogo logo={player.player_logo} name={player.player_name} size={40} />

            <View style={styles.playerInfo}>
                <Text style={styles.playerName} numberOfLines={1}>
                    {player.player_name}
                </Text>
                {player.player_country && (
                    <Text style={styles.country} numberOfLines={1}>
                        {player.player_country}
                    </Text>
                )}
            </View>

            {/* Points */}
            <View style={styles.pointsContainer}>
                <Text style={styles.points}>
                    {player.ranking_points?.toLocaleString() || '0'}
                </Text>
                <Text style={styles.pointsLabel}>pts</Text>
            </View>

            {/* Movement */}
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
        </TouchableOpacity>
    );
}

export default function RankingsPage() {
    const router = useRouter();
    const { data, loading, error } = useRankings('ATP', 100);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Rankings ATP</Text>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Cargando rankings...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>
                        No se pudieron cargar los rankings
                    </Text>
                </View>
            ) : data && data.players.length > 0 ? (
                <FlatList
                    data={data.players}
                    keyExtractor={(item) => item.player_key.toString()}
                    renderItem={({ item }) => (
                        <RankingRow
                            player={item}
                            onPress={() => router.push(`/player/${item.player_key}` as any)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No hay rankings disponibles
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    listContent: {
        padding: 16,
        gap: 8,
    },
    rankingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    rankingNumber: {
        width: 40,
    },
    rankingText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    playerInfo: {
        flex: 1,
        gap: 2,
    },
    playerName: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    country: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    pointsContainer: {
        alignItems: 'flex-end',
        marginRight: 8,
    },
    points: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    pointsLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    movementBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    movementIcon: {
        fontSize: 14,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
