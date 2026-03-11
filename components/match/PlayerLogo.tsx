import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { PLAYER_LOGO_BASE_URL } from '../../src/utils/constants';

/** Convierte una URL de logo relativa (ej. "13552_t-paris.jpg") en absoluta (API-Tennis). */
function resolveLogoUrl(raw: string | null | undefined): string | null {
    if (typeof raw !== 'string' || !raw.trim()) return null;
    const trimmed = raw.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.includes('api-tennis.com')) return trimmed;
    const path = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    return `${PLAYER_LOGO_BASE_URL}/${path}`;
}

interface PlayerLogoProps {
    logo?: string;
    logoUrl?: string;  // Alternative prop name for compatibility
    name?: string;
    size?: number;
    style?: any;
}

export default function PlayerLogo({ logo, logoUrl, name = '', size = 40, style }: PlayerLogoProps) {
    const [imageError, setImageError] = useState(false);
    const rawUrl = logoUrl || logo;
    const imageUrl = resolveLogoUrl(rawUrl);

    // Get player initials for fallback
    const getInitials = (playerName: string): string => {
        const parts = playerName.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return playerName.substring(0, 2).toUpperCase();
    };

    // Generate a consistent color based on name
    const getColorFromName = (playerName: string): string => {
        const colors = [
            Colors.brand.neonGreen,
            Colors.brand.electricBlue,
            Colors.brand.gold,
            '#FF6B9D', // Pink
            '#9D50BB', // Purple
            '#6BCF7F', // Light green
        ];
        const hash = playerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    if (imageError || !imageUrl) {
        // Fallback: colored circle with initials
        return (
            <View
                style={[
                    styles.fallbackContainer,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: getColorFromName(name),
                    },
                    style,
                ]}
            >
                <Text
                    style={[
                        styles.initials,
                        {
                            fontSize: size * 0.4,
                        },
                    ]}
                >
                    {getInitials(name)}
                </Text>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                style,
            ]}
        >
            <Image
                key={imageUrl}
                source={{ uri: imageUrl }}
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                }}
                onError={() => setImageError(true)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderColor: Colors.ui.border,
        overflow: 'hidden',
    },
    fallbackContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.ui.border,
    },
    initials: {
        color: '#0A1929',
        fontWeight: '700',
        fontFamily: 'Inter-Bold',
    },
});
