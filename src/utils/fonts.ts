import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';

export function useCustomFonts() {
    const [fontsLoaded] = useFonts({
        'Poppins-Regular': Poppins_400Regular,
        'Poppins-SemiBold': Poppins_600SemiBold,
        'Poppins-Bold': Poppins_700Bold,
        'Inter-Regular': Inter_400Regular,
        'Inter-SemiBold': Inter_600SemiBold,
        'Inter-Bold': Inter_700Bold,
    });

    return fontsLoaded;
}

export const FONTS = {
    // Headings (Poppins)
    h1: {
        fontFamily: 'Poppins-Bold',
        fontSize: 24,
        lineHeight: 32,
    },
    h2: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 20,
        lineHeight: 28,
    },
    h3: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        lineHeight: 24,
    },

    // Body (Inter)
    body: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        lineHeight: 20,
    },
    bodySemiBold: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        lineHeight: 20,
    },
    bodyBold: {
        fontFamily: 'Inter-Bold',
        fontSize: 14,
        lineHeight: 20,
    },

    // Small
    caption: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        lineHeight: 16,
    },
    captionBold: {
        fontFamily: 'Inter-Bold',
        fontSize: 12,
        lineHeight: 16,
    },

    // Stats/Numbers
    stat: {
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        lineHeight: 24,
    },
};
