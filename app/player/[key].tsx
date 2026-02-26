import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PlayerHeader from '../../components/player/PlayerHeader';
import PlayerStatsFromApi from '../../components/player/PlayerStatsFromApi';
import PlayerTournaments from '../../components/player/PlayerTournaments';
import RecentMatches from '../../components/player/RecentMatches';
import UpcomingMatches from '../../components/player/UpcomingMatches';
import { usePlayer } from '../../src/hooks/usePlayer';
import { usePlayerMatches } from '../../src/hooks/usePlayerMatches';
import { usePlayerUpcoming } from '../../src/hooks/usePlayerUpcoming';
import { COLORS } from '../../src/utils/constants';

type TabId = 'Temporada' | 'Torneos' | 'Partidos';

export default function PlayerProfilePage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const rawKey = params.key as string | undefined;
    const playerKey = rawKey ? parseInt(rawKey, 10) : NaN;
    const validKey = Number.isFinite(playerKey) ? playerKey : null;

    const { player, loading: playerLoading, error: playerError } = usePlayer(validKey);
    const { data: matchesData, loading: matchesLoading } = usePlayerMatches(validKey, 15);
    const { data: upcomingData, loading: upcomingLoading } = usePlayerUpcoming(validKey, 14);
    const [activeTab, setActiveTab] = useState<TabId>('Temporada');

    if (validKey == null) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Jugador no válido</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (playerLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    if (playerError || !player) {
        const message = playerError?.message;
        const friendlyMessage = !message || message === 'Recurso no encontrado.'
            ? 'Jugador no encontrado'
            : message;
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>
                    {friendlyMessage}
                </Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const hasStats = Boolean(player.stats && player.stats.length > 0);
    const hasTournaments = Boolean(player.tournaments && player.tournaments.length > 0);

    const tabs: { id: TabId; label: string }[] = [
        { id: 'Temporada', label: 'TEMPORADA' },
        { id: 'Torneos', label: 'TORNEOS' },
        { id: 'Partidos', label: 'PARTIDOS' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Temporada':
                return hasStats ? (
                    <PlayerStatsFromApi stats={player.stats!} />
                ) : (
                    <View style={styles.emptyTab}>
                        <Text style={styles.emptyTabText}>No hay estadísticas por temporada</Text>
                    </View>
                );
            case 'Torneos':
                return hasTournaments ? (
                    <PlayerTournaments tournaments={player.tournaments!} />
                ) : (
                    <View style={styles.emptyTab}>
                        <Text style={styles.emptyTabText}>No hay torneos disponibles</Text>
                    </View>
                );
            case 'Partidos':
                return matchesLoading ? (
                    <View style={styles.sectionLoading}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Cargando partidos...</Text>
                    </View>
                ) : matchesData ? (
                    <RecentMatches
                        matches={matchesData.matches}
                        playerName={player.player_name}
                        playerLogo={player.player_logo}
                    />
                ) : (
                    <View style={styles.emptyTab}>
                        <Text style={styles.emptyTabText}>No hay partidos recientes</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: Math.max(16, insets.top) }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                    <Text style={styles.headerBackText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil del Jugador</Text>
                <View style={styles.headerBackButton} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
            >
                <PlayerHeader player={player} />

                {upcomingLoading ? (
                    <View style={styles.sectionLoading}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Cargando próximos partidos...</Text>
                    </View>
                ) : upcomingData ? (
                    <UpcomingMatches upcoming={upcomingData.upcoming} playerName={player.player_name} />
                ) : null}

                <View style={styles.tabBar}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Text style={[
                                styles.tabLabel,
                                activeTab === tab.id && styles.tabLabelActive,
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.tabContent}>
                    {renderTabContent()}
                </View>
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
    scrollContent: {
        paddingBottom: 40,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingHorizontal: 8,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabItemActive: {
        borderBottomWidth: 3,
        borderBottomColor: COLORS.primary,
        marginBottom: -1,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: COLORS.textSecondary,
    },
    tabLabelActive: {
        color: COLORS.primary,
    },
    tabContent: {
        minHeight: 200,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    emptyTab: {
        padding: 24,
        alignItems: 'center',
    },
    emptyTabText: {
        fontSize: 14,
        color: COLORS.textSecondary,
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
