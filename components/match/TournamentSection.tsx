import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Match } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';
import { isMatchStarted } from '../../src/utils/dateUtils';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TournamentSectionProps {
    tournamentName: string;
    surface: string;
    matches: Match[];
    renderMatch: (match: Match) => React.ReactNode;
    initiallyExpanded?: boolean;
    /** Si se pasa, el encabezado del torneo es clicable y navega al detalle */
    tournamentKey?: string | null;
}

export default function TournamentSection({
    tournamentName,
    surface,
    matches,
    renderMatch,
    initiallyExpanded = false,
    tournamentKey = null,
}: TournamentSectionProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const goToTournament = () => {
        if (tournamentKey) {
            router.push({ pathname: '/tournament/[key]', params: { key: tournamentKey, name: tournamentName } } as any);
        }
    };

    // Count live matches (con datos API o ya empezados sin datos)
    const liveCount = matches.filter(m =>
        m.estado === 'en_juego' || (isMatchStarted(m.fecha_partido, m.hora_inicio) && m.estado === 'pendiente')
    ).length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <TouchableOpacity
                style={styles.header}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <View style={styles.headerTopRow}>
                    <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
                    <Text style={styles.tournamentName} numberOfLines={1}>
                        {tournamentName}
                    </Text>
                    <View style={styles.headerRightGroup}>
                        {tournamentKey ? (
                            <TouchableOpacity
                                onPress={(e) => { e?.stopPropagation?.(); goToTournament(); }}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                style={styles.tournamentLink}
                                activeOpacity={0.8}
                            >
                                <View style={styles.tournamentLinkContent}>
                                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={styles.trophyIcon}>
                                        <Path d="M8 21l8 0" />
                                        <Path d="M12 17l0 4" />
                                        <Path d="M7 4l10 0" />
                                        <Path d="M17 4v8a5 5 0 0 1 -10 0v-8" />
                                        <Path d="M3 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                        <Path d="M17 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                                    </Svg>
                                    <Text style={styles.tournamentLinkText}>Ver torneo</Text>
                                </View>
                            </TouchableOpacity>
                        ) : null}
                        {liveCount > 0 && (
                            <View style={[styles.badge, styles.badgeLive]}>
                                <Text style={styles.badgeText}>{liveCount} 🔴</Text>
                            </View>
                        )}
                        <View style={styles.badge}>
                            <Text style={styles.badgeTextSecondary}>{matches.length}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.headerBottomRow}>
                    <View style={styles.chevronSpacer} />
                    <Text style={styles.surface}>{surface}</Text>
                </View>
            </TouchableOpacity>

            {/* Matches List */}
            {isExpanded && (
                <View style={styles.matchesContainer}>
                    {matches.map((match) => (
                        <View key={match.id}>
                            {renderMatch(match)}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        marginHorizontal: 16,
        backgroundColor: 'transparent',
    },
    header: {
        paddingVertical: 10,
        paddingHorizontal: 0,
        marginBottom: 8,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
    },
    chevron: {
        fontSize: 12,
        color: COLORS.textSecondary,
        width: 16,
        textAlign: 'center',
    },
    tournamentName: {
        flex: 1,
        minWidth: 0,
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    headerRightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
    },
    tournamentLink: {
        height: 32,
        paddingHorizontal: 12,
        backgroundColor: COLORS.primary + '18',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.primary + '50',
        justifyContent: 'center',
    },
    tournamentLinkContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trophyIcon: {},
    tournamentLinkText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '700',
    },
    headerBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    chevronSpacer: {
        width: 26,
    },
    surface: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    badge: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: 10,
        borderRadius: 16,
        minWidth: 36,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    badgeLive: {
        backgroundColor: '#FF444410',
        borderColor: '#FF444440',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FF4444',
    },
    badgeTextSecondary: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    matchesContainer: {
        backgroundColor: 'transparent',
    },
});
