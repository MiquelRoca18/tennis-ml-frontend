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
        marginBottom: 24,
        backgroundColor: 'transparent', // Let matches have their own cards or wrap them? 
        // Guide shows "Matches" organized in cards. 
        // If TournamentSection wraps matches, maybe the section header is just a title?
        // But the current implementation is an accordion.
        // Let's keep the accordion style but make it look cleaner.
        marginHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        // backgroundColor: COLORS.surface, // Remove background from header to make it float? Or keep it?
        // Let's make the header stand out less as a box, more as a title.
        marginBottom: 8,
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
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    surface: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        backgroundColor: COLORS.surface, // Background for badge
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 32,
        alignItems: 'center',
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
