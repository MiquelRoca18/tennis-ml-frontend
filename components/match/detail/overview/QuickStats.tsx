import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../../src/utils/constants';

interface QuickStatsProps {
    matchDetails: any;
    player1Name: string;
    player2Name: string;
}

export default function QuickStats({ matchDetails, player1Name, player2Name }: QuickStatsProps) {
    const stats = matchDetails?.estadisticas_basicas;

    if (!stats) {
        return null;
    }

    const {
        sets_ganados_jugador1 = 0,
        sets_ganados_jugador2 = 0,
        juegos_ganados_jugador1 = 0,
        juegos_ganados_jugador2 = 0
    } = stats;

    // Get break points from advanced stats if available
    const advancedStats = matchDetails?.estadisticas_avanzadas;
    const breakPoints1 = advancedStats?.jugador1?.break_points_convertidos || 0;
    const breakPointsTotal1 = advancedStats?.jugador1?.break_points_a_favor || 0;
    const breakPoints2 = advancedStats?.jugador2?.break_points_convertidos || 0;
    const breakPointsTotal2 = advancedStats?.jugador2?.break_points_a_favor || 0;

    const StatColumn = ({ icon, label, value1, value2, subtitle1, subtitle2 }: any) => (
        <View style={styles.statColumn}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={styles.statLabel}>{label}</Text>
            <View style={styles.statValues}>
                <View style={styles.statValueContainer}>
                    <Text style={styles.statValue}>{value1}</Text>
                    {subtitle1 && <Text style={styles.statSubtitle}>{subtitle1}</Text>}
                </View>
                <Text style={styles.statSeparator}>-</Text>
                <View style={styles.statValueContainer}>
                    <Text style={styles.statValue}>{value2}</Text>
                    {subtitle2 && <Text style={styles.statSubtitle}>{subtitle2}</Text>}
                </View>
            </View>
            <View style={styles.playerNames}>
                <Text style={styles.playerNameShort} numberOfLines={1}>{player1Name.split(' ').pop()}</Text>
                <Text style={styles.playerNameShort} numberOfLines={1}>{player2Name.split(' ').pop()}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatColumn
                icon="🏆"
                label="Sets"
                value1={sets_ganados_jugador1}
                value2={sets_ganados_jugador2}
            />

            <View style={styles.verticalDivider} />

            <StatColumn
                icon="🎾"
                label="Games"
                value1={juegos_ganados_jugador1}
                value2={juegos_ganados_jugador2}
            />

            <View style={styles.verticalDivider} />

            <StatColumn
                icon="💥"
                label="Break Pts"
                value1={breakPoints1}
                value2={breakPoints2}
                subtitle1={breakPointsTotal1 > 0 ? `/${breakPointsTotal1}` : ''}
                subtitle2={breakPointsTotal2 > 0 ? `/${breakPointsTotal2}` : ''}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statColumn: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    statIcon: {
        fontSize: 28,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValues: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statValueContainer: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontFamily: 'RobotoMono-Bold',
    },
    statSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        fontFamily: 'RobotoMono-Regular',
    },
    statSeparator: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    playerNames: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 4,
    },
    playerNameShort: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textSecondary,
        flex: 1,
        textAlign: 'center',
    },
    verticalDivider: {
        width: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 8,
    },
});
