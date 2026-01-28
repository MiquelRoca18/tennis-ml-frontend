import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../../src/utils/constants';

interface LiveBadgeProps {
    style?: any;
}

export default function LiveBadge({ style }: LiveBadgeProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Pulse animation
        scale.value = withRepeat(
            withSequence(
                withTiming(1.15, {
                    duration: 800,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                }),
                withTiming(1, {
                    duration: 800,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                })
            ),
            -1,
            false
        );

        opacity.value = withRepeat(
            withSequence(
                withTiming(0.6, {
                    duration: 800,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                }),
                withTiming(1, {
                    duration: 800,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                })
            ),
            -1,
            false
        );
    }, []);

    const animatedDotStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <View style={[styles.container, style]}>
            {/* Animated pulse dot */}
            <Animated.View style={[styles.pulseDot, animatedDotStyle]} />

            {/* Static dot */}
            <View style={styles.staticDot} />

            {/* LIVE text */}
            <Text style={styles.text}>LIVE</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.liveRed,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 6,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.neonGreen,
        position: 'absolute',
        left: 8,
    },
    staticDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.neonGreen,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
