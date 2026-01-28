import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface BestOddsProps {
    oddsData: any;
    player1Name: string;
    player2Name: string;
}

export default function BestOdds({ oddsData, player1Name, player2Name }: BestOddsProps) {
    if (!oddsData || !oddsData.bookmakers || oddsData.bookmakers.length === 0) {
        return null;
    }

    // Find best odds for each player
    const getBestOdds = () => {
        let bestPlayer1: any = null;
        let bestPlayer2: any = null;

        oddsData.bookmakers.forEach((bookmaker: any) => {
            if (bookmaker.player1_odds) {
                if (!bestPlayer1 || bookmaker.player1_odds > bestPlayer1.odds) {
                    bestPlayer1 = {
                        bookmaker: bookmaker.bookmaker,
                        odds: bookmaker.player1_odds
                    };
                }
            }
            if (bookmaker.player2_odds) {
                if (!bestPlayer2 || bookmaker.player2_odds > bestPlayer2.odds) {
                    bestPlayer2 = {
                        bookmaker: bookmaker.bookmaker,
                        odds: bookmaker.player2_odds
                    };
                }
            }
        });

        return { bestPlayer1, bestPlayer2 };
    };

    const { bestPlayer1, bestPlayer2 } = getBestOdds();

    if (!bestPlayer1 && !bestPlayer2) {
        return null;
    }

    const OddsCard = ({ playerName, bookmaker, odds }: any) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.playerName} numberOfLines={1}>{playerName}</Text>
                <View style={styles.bestBadge}>
                    <Text style={styles.bestBadgeText}>MEJOR</Text>
                </View>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.bookmakerInfo}>
                    <Text style={styles.bookmakerIcon}>📱</Text>
                    <Text style={styles.bookmakerName}>{bookmaker}</Text>
                </View>
                <View style={styles.oddsContainer}>
                    <Text style={styles.oddsLabel}>Cuota:</Text>
                    <Text style={styles.oddsValue}>@{odds.toFixed(2)}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.icon}>⭐</Text>
                <Text style={styles.title}>Mejores Cuotas Disponibles</Text>
            </View>

            <View style={styles.cardsContainer}>
                {bestPlayer1 && (
                    <OddsCard
                        playerName={player1Name}
                        bookmaker={bestPlayer1.bookmaker}
                        odds={bestPlayer1.odds}
                    />
                )}
                {bestPlayer2 && (
                    <OddsCard
                        playerName={player2Name}
                        bookmaker={bestPlayer2.bookmaker}
                        odds={bestPlayer2.odds}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    icon: {
        fontSize: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    cardsContainer: {
        gap: 12,
    },
    card: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 14,
        borderWidth: 2,
        borderColor: COLORS.success + '40',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    playerName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textPrimary,
        flex: 1,
    },
    bestBadge: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    bestBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    cardContent: {
        gap: 8,
    },
    bookmakerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bookmakerIcon: {
        fontSize: 16,
    },
    bookmakerName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    oddsContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    oddsLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    oddsValue: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.success,
        fontFamily: 'RobotoMono-Bold',
    },
});
