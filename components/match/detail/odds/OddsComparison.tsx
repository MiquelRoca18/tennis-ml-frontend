import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface OddsComparisonProps {
    oddsData: any;
    player1Name: string;
    player2Name: string;
}

export default function OddsComparison({ oddsData, player1Name, player2Name }: OddsComparisonProps) {
    const [selectedPlayer, setSelectedPlayer] = useState<1 | 2>(1);

    if (!oddsData || !oddsData.bookmakers || oddsData.bookmakers.length === 0) {
        return null;
    }

    // Get and sort odds for selected player
    const getPlayerOdds = (playerIndex: 1 | 2) => {
        const oddsField = playerIndex === 1 ? 'player1_odds' : 'player2_odds';

        return oddsData.bookmakers
            .filter((b: any) => b[oddsField] !== undefined && b[oddsField] !== null)
            .map((b: any) => ({
                bookmaker: b.bookmaker,
                odds: b[oddsField]
            }))
            .sort((a: any, b: any) => b.odds - a.odds); // Sort descending
    };

    const playerOdds = getPlayerOdds(selectedPlayer);
    const playerName = selectedPlayer === 1 ? player1Name : player2Name;

    // Get medal for top 3
    const getMedal = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return null;
    };

    return (
        <View style={styles.container}>
            {/* Player Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedPlayer === 1 && styles.activeTab]}
                    onPress={() => setSelectedPlayer(1)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, selectedPlayer === 1 && styles.activeTabText]}>
                        {player1Name.split(' ').pop()}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedPlayer === 2 && styles.activeTab]}
                    onPress={() => setSelectedPlayer(2)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, selectedPlayer === 2 && styles.activeTabText]}>
                        {player2Name.split(' ').pop()}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{playerName}</Text>
                <Text style={styles.subtitle}>{playerOdds.length} bookmakers</Text>
            </View>

            {/* Odds List */}
            <ScrollView
                style={styles.oddsList}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
            >
                {playerOdds.map((item: any, index: number) => {
                    const medal = getMedal(index);
                    const isBest = index === 0;

                    return (
                        <View
                            key={`${item.bookmaker}-${index}`}
                            style={[styles.oddsRow, isBest && styles.bestOddsRow]}
                        >
                            <View style={styles.bookmakerContainer}>
                                {medal && <Text style={styles.medal}>{medal}</Text>}
                                <Text style={styles.bookmakerName}>{item.bookmaker}</Text>
                                {isBest && (
                                    <View style={styles.bestBadge}>
                                        <Text style={styles.bestBadgeText}>Mejor</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[styles.oddsValue, isBest && styles.bestOddsValue]}>
                                @{item.odds.toFixed(2)}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.background,
        padding: 4,
        gap: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    header: {
        padding: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    oddsList: {
        maxHeight: 300,
    },
    oddsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    bestOddsRow: {
        backgroundColor: COLORS.success + '10',
    },
    bookmakerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    medal: {
        fontSize: 16,
    },
    bookmakerName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        flex: 1,
    },
    bestBadge: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    bestBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    oddsValue: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontFamily: 'RobotoMono-Bold',
    },
    bestOddsValue: {
        color: COLORS.success,
        fontSize: 18,
    },
});
