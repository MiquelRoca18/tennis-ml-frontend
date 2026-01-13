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
import { Match } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';

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
}

export default function TournamentSection({
    tournamentName,
    surface,
    matches,
    renderMatch,
    initiallyExpanded = false,
}: TournamentSectionProps) {
    const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    // Count live matches
    const liveCount = matches.filter(m => m.estado === 'en_juego').length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <TouchableOpacity
                style={styles.header}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <View style={styles.headerLeft}>
                    <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
                    <View style={styles.tournamentInfo}>
                        <Text style={styles.tournamentName} numberOfLines={1}>
                            {tournamentName}
                        </Text>
                        <Text style={styles.surface}>{surface}</Text>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    {liveCount > 0 && (
                        <View style={[styles.badge, styles.badgeLive]}>
                            <Text style={styles.badgeText}>{liveCount} 🔴</Text>
                        </View>
                    )}
                    <View style={styles.badge}>
                        <Text style={styles.badgeTextSecondary}>{matches.length}</Text>
                    </View>
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
        marginBottom: 8,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        overflow: 'hidden',
        marginHorizontal: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    chevron: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginRight: 8,
        width: 16,
    },
    tournamentInfo: {
        flex: 1,
    },
    tournamentName: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    surface: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    badge: {
        backgroundColor: COLORS.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 28,
        alignItems: 'center',
    },
    badgeLive: {
        backgroundColor: '#FF444410',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FF4444',
    },
    badgeTextSecondary: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    matchesContainer: {
        backgroundColor: COLORS.background,
    },
});
