import type { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark"

interface Theme {
  mode: ThemeMode;
  colors: {
    background: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    border: string;
    chip: string;
  };
}

interface ThemeRadius {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
}

interface ThemeColors {
    background: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    border: string;
    chip: string;
}

interface ThemeSpacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
}

export interface AppTheme {
    mode: ThemeMode;
    colors: ThemeColors;
    radius: ThemeRadius;
    spacing: ThemeSpacing;
}

const lightColors: ThemeColors = {
    background: "#FFFFFF",
    textPrimary: "#000000",
    textSecondary: "#4B5563",
    accent: "#34D399",
    border: "#D1D5DB",
    chip: "#F3F4F6",
};

const darkColors: ThemeColors = {
    background: "#0D1117",
    textPrimary: "#E6EDF3",
    textSecondary: "#8B949E",
    accent: "#34D399",
    border: "#21262D",
    chip: "#1C2128",
};

const sharedRadius: ThemeRadius = {
    xs: 8,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
};

const sharedSpacing: ThemeSpacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
};

const themes: Record<ThemeMode, AppTheme> = {
    light: {
        mode: "light",
        colors: lightColors,
        radius: sharedRadius,
        spacing: sharedSpacing,
    },
    dark: {
        mode: "dark",
        colors: darkColors,
        radius: sharedRadius,
        spacing: sharedSpacing,
    },
};

export function getAppTheme(): AppTheme {
    const mode = useColorScheme();
    return getAppTheme(mode);
    
}
