import React, { createContext, useContext } from 'react';
import { Colors, Spacing, Typography } from '../constants';

// Define the shape of the context
interface ThemeContextType {
    colors: typeof Colors;
    typography: typeof Typography;
    spacing: typeof Spacing;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
    colors: Colors,
    typography: Typography,
    spacing: Spacing,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
    <ThemeContext.Provider value={{
        colors: Colors,
        typography: Typography,
        spacing: Spacing,
    }}>
        {children}
    </ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
