import { Dimensions } from 'react-native';

export const Spacing = {
    xs: 4,      // Muy pequeño
    sm: 8,      // Pequeño
    md: 16,     // Medio (más usado)
    lg: 24,     // Grande
    xl: 32,     // Extra grande
    xxl: 48,    // Muy grande
    xxxl: 64,   // Máximo
};

export const Layout = {
    // Padding de pantalla
    screenPadding: 20,

    // Márgenes entre elementos
    cardMargin: 16,
    sectionMargin: 24,

    // Alturas específicas
    headerHeight: 60,
    tabBarHeight: 70,
    cardHeight: 120,

    // Anchos
    screenWidth: Dimensions.get('window').width,
    cardWidth: Dimensions.get('window').width - 40, // Screen padding * 2
};
