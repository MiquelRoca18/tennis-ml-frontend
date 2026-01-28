import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface AnimatedCardProps {
    children: React.ReactNode;
    delay?: number;
}

/**
 * Card with fade-in and slide-up animation
 */
export function AnimatedCard({ children, delay = 0 }: AnimatedCardProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    React.useEffect(() => {
        setTimeout(() => {
            opacity.value = withTiming(1, { duration: 400 });
            translateY.value = withSpring(0, { damping: 15 });
        }, delay);
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

/**
 * Pulsing dot animation
 */
export function PulsingDot({ size = 8, color = '#00FF41' }: { size?: number; color?: string }) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    React.useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.5, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            false
        );
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.5, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.dot,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                },
                animatedStyle,
            ]}
        />
    );
}

/**
 * Bounce animation for buttons
 */
export function BounceView({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 10 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10 });
        onPress?.();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View
            style={animatedStyle}
            onTouchStart={handlePressIn}
            onTouchEnd={handlePressOut}
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    dot: {
        // Base styles for pulsing dot
    },
});
