import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from 'react-native-reanimated';
import { COLORS } from '../../src/utils/constants';

interface FavoriteButtonProps {
    isFavorite: boolean;
    onPress: () => void;
    size?: number;
    /** Cuando true, muestra la estrella con opacidad reducida (evita salto de layout mientras carga) */
    dimmed?: boolean;
}

export default function FavoriteButton({ isFavorite, onPress, size = 24, dimmed = false }: FavoriteButtonProps) {
    const scale = useSharedValue(1);

    const handlePress = () => {
        // Animate on press
        scale.value = withSequence(
            withSpring(1.3, { damping: 10 }),
            withSpring(1, { damping: 10 })
        );
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            style={styles.container}
            disabled={dimmed}
        >
            <Animated.Text style={[styles.icon, { fontSize: size, opacity: dimmed ? 0.45 : 1 }, animatedStyle]}>
                {isFavorite ? '⭐' : '☆'}
            </Animated.Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 4,
    },
    icon: {
        color: COLORS.warning,
    },
});
