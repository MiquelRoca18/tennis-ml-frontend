import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import PlayerHeader from '../../components/player/PlayerHeader';
import PlayerStats from '../../components/player/PlayerStats';
import RecentMatches from '../../components/player/RecentMatches';
import { usePlayer } from '../../src/hooks/usePlayer';
import { usePlayerMatches } from '../../src/hooks/usePlayerMatches';
import { fetchPlayerStats } from '../../src/services/api/playerService';
import { PlayerStatsResponse } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';

export default function PlayerProfilePage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const playerKey = parseInt(params.key as string);

    const { player, loading: playerLoading, error: playerError } = usePlayer(playerKey);
    const { data: matchesData, loading: matchesLoading } = usePlayerMatches(playerKey, 15);

    const [stats, setStats] = useState<PlayerStatsResponse[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            if (!playerKey) return;

            setStatsLoading(true);
            try {
                // Fetch stats for each surface
                const surfaces = ['Hard', 'Clay', 'Grass'];
                const statsPromises = surfaces.map(surface =>
                    fetchPlayerStats(playerKey, surface).catch(() => null)
                );

                const results = await Promise.all(statsPromises);
                const validStats = results.filter(s => s !== null) as PlayerStatsResponse[];
                setStats(validStats);
            } catch (err) {
                console.error('Error loading stats:', err);
            } finally {
                setStatsLoading(false);
            }
        }

        loadStats();
    }, [playerKey]);

    if (playerLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    if (playerError || !player) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>
                    {playerError?.message || 'Jugador no encontrado'}
                </Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                    <Text style={styles.headerBackText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil del Jugador</Text>
                <View style={styles.headerBackButton} />
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Player Header */}
                <PlayerHeader player={player} />

                {/* Player Stats */}
                {statsLoading ? (
                    <View style={styles.sectionLoading}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
                    </View>
                ) : (
                    <PlayerStats stats={stats} />
                )}

                {/* Recent Matches */}
                {matchesLoading ? (
                    <View style={styles.sectionLoading}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Cargando partidos...</Text>
                    </View>
                ) : matchesData ? (
                    <RecentMatches
                        matches={matchesData.matches}
                        playerName={player.player_name}
                    />
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    headerBackButton: {
        width: 80,
    },
    headerBackText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    sectionLoading: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
        alignItems: 'center',
        gap: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
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
        marginBottom: 24,
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
