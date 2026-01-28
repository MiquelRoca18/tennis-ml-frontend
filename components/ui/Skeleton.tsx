import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../../src/utils/constants';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
    const opacity = useSharedValue(0.3);

    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800 }),
                withTiming(0.3, { duration: 800 })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                },
                animatedStyle,
                style,
            ]}
        />
    );
}

export function MatchCardSkeleton() {
    return (
        <View style={styles.matchCard}>
            {/* Header */}
            <View style={styles.matchHeader}>
                <Skeleton width={120} height={14} />
                <Skeleton width={60} height={14} />
            </View>

            {/* Player 1 */}
            <View style={styles.playerRow}>
                <Skeleton width={40} height={40} borderRadius={20} />
                <View style={styles.playerInfo}>
                    <Skeleton width={150} height={16} style={{ marginBottom: 4 }} />
                    <Skeleton width={40} height={12} />
                </View>
                <Skeleton width={50} height={24} borderRadius={6} />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Player 2 */}
            <View style={styles.playerRow}>
                <Skeleton width={40} height={40} borderRadius={20} />
                <View style={styles.playerInfo}>
                    <Skeleton width={150} height={16} style={{ marginBottom: 4 }} />
                    <Skeleton width={40} height={12} />
                </View>
                <Skeleton width={50} height={24} borderRadius={6} />
            </View>
        </View>
    );
}

export function MatchDetailSkeleton() {
    return (
        <View style={styles.detailContainer}>
            {/* Header */}
            <View style={styles.detailHeader}>
                <Skeleton width={200} height={18} style={{ marginBottom: 8 }} />
                <Skeleton width={120} height={14} />
            </View>

            {/* Players */}
            <View style={styles.playersContainer}>
                <View style={styles.playerDetailRow}>
                    <Skeleton width={60} height={60} borderRadius={30} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Skeleton width="80%" height={18} style={{ marginBottom: 6 }} />
                        <Skeleton width={60} height={14} />
                    </View>
                </View>
                <View style={styles.vsRow}>
                    <Skeleton width={40} height={16} />
                </View>
                <View style={styles.playerDetailRow}>
                    <Skeleton width={60} height={60} borderRadius={30} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Skeleton width="80%" height={18} style={{ marginBottom: 6 }} />
                        <Skeleton width={60} height={14} />
                    </View>
                </View>
            </View>

            {/* Content Cards */}
            <View style={styles.contentCards}>
                <Skeleton width="100%" height={120} borderRadius={12} style={{ marginBottom: 12 }} />
                <Skeleton width="100%" height={200} borderRadius={12} style={{ marginBottom: 12 }} />
                <Skeleton width="100%" height={150} borderRadius={12} />
            </View>
        </View>
    );
}

export function StatsSkeleton() {
    return (
        <View style={styles.statsContainer}>
            <Skeleton width={180} height={18} style={{ marginBottom: 16 }} />
            {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={styles.statRow}>
                    <Skeleton width={100} height={14} />
                    <Skeleton width="60%" height={8} borderRadius={4} />
                    <Skeleton width={100} height={14} />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: COLORS.surfaceElevated,
    },
    matchCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    playerInfo: {
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 12,
    },
    detailContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    detailHeader: {
        padding: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    playersContainer: {
        padding: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    playerDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vsRow: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    contentCards: {
        padding: 16,
    },
    statsContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
});
