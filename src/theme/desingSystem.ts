import { ColorSchemeName, DimensionValue, useColorScheme } from "react-native";

type ThemeMode = "light" | "dark";

// ─── Color Interfaces ─────────────────────────────────────────────────────────

interface ThemeColors {
    // Backgrounds
    background: string;
    backgroundCard: string;
    backgroundChip: string;
    // Border
    border: string;
    // Accent
    accent: string;
    accentDim: string;
    accentWithAlpha: string;
    // Text
    textPrimary: string;
    textSecondary: string;
    textOnAccent: string;
    // Tab Bar
    tabBarBackground: string;
    tabBarBorder: string;
    tabBarActive: string;
    tabBarInactive: string;
    tabBarCenterButton: string;
    // Backward-compatible alias
    chip: string;
}

// ─── Radius Interface ─────────────────────────────────────────────────────────

interface ThemeRadius {
    pill: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
    avatar: number;
    avatarInner: number;
    centerButton: number;
}

// ─── Spacing Interface ────────────────────────────────────────────────────────

interface ThemeSpacing {
    s0: number;
    s2: number;
    s3: number;
    s4: number;
    s6: number;
    s8: number;
    s9: number;
    s10: number;
    s12: number;
    s14: number;
    s16: number;
    s18: number;
    s20: number;
    s22: number;
    s29: number;
    s44: number;
}

// ─── Typography Interface ─────────────────────────────────────────────────────

interface ThemeTypography {
    fontSizes: {
        xs: number;
        sm: number;
        base: number;
        md: number;
        lg: number;
        xl: number;
        "2xl": number;
        "3xl": number;
        "4xl": number;
        "5xl": number;
        "6xl": number;
        "7xl": number;
    };
    fontWeights: {
        medium: "500";
        semibold: "600";
        bold: "700";
    };
    lineHeights: {
        tight: number;
        normal: number;
        relaxed: number;
        loose: number;
    };
    letterSpacing: {
        none: number;
        xs: number;
        sm: number;
        md: number;
        lg: number;
    };
}

// ─── Shadow Interface ─────────────────────────────────────────────────────────

interface ShadowConfig {
    color: string;
    opacity: number;
    radius: number;
    offset: { width: number; height: number };
    elevation: number;
}

interface ThemeShadows {
    card: ShadowConfig;
    centerButton: ShadowConfig;
}

// ─── Borders Interface ───────────────────────────────────────────────────────

interface ThemeBorders {
    thin: number;
    avatarRing: number;
    none: number;
}

// ─── ZIndex Interface ─────────────────────────────────────────────────────────

interface ThemeZIndex {
    arc: number;
    centerButton: number;
}

// ─── Opacity Interface ────────────────────────────────────────────────────────

interface ThemeOpacity {
    backgroundTexture: number;
    decorativeImage: number;
    categoryCardIcon: number;
    pressableTab: number;
    pressableButton: number;
    pressableCenterButton: number;
}

// ─── Dimensions Interface ─────────────────────────────────────────────────────

interface ThemeDimensions {
    avatar: { width: number; height: number };
    bannerHeight: number;
    settingsButton: { width: number; height: number };
    shareButton: { width: number; height: number };
    centerButton: { width: number; height: number };
    arcBump: { width: number; height: number };
    metricDecorImage: { width: number; height: number };
    favoritePlantImage: { width: DimensionValue; height: number };
    categoryCard: { width: DimensionValue; height: number };
    tabBarIconSize: number;
    cameraIconSize: number;
    categoryIconSize: number;
    settingsIconSize: number;
    shareIconSize: number;
}

// ─── App Theme ────────────────────────────────────────────────────────────────

export interface AppTheme {
    mode: ThemeMode;
    colors: ThemeColors;
    radius: ThemeRadius;
    spacing: ThemeSpacing;
    typography: ThemeTypography;
    shadows: ThemeShadows;
    opacity: ThemeOpacity;
    dimensions: ThemeDimensions;
    borders: ThemeBorders;
    zIndex: ThemeZIndex;
}

// ─── Dark Colors ──────────────────────────────────────────────────────────────

const darkColors: ThemeColors = {
    background: "#0D1117",
    backgroundCard: "#161B22",
    backgroundChip: "#1C2128",
    border: "#21262D",
    accent: "#34D399",
    accentDim: "#163330",
    accentWithAlpha: "#34D39960",
    textPrimary: "#E6EDF3",
    textSecondary: "#8B949E",
    textOnAccent: "#FFFFFF",
    tabBarBackground: "#161B22",
    tabBarBorder: "#21262D",
    tabBarActive: "#34D399",
    tabBarInactive: "#4B5563",
    tabBarCenterButton: "#34D399",
    chip: "#1C2128",
};

// ─── Light Colors ─────────────────────────────────────────────────────────────

const lightColors: ThemeColors = {
    background: "#FFFFFF",
    backgroundCard: "#F9FAFB",
    backgroundChip: "#F3F4F6",
    border: "#D1D5DB",
    accent: "#34D399",
    accentDim: "#ECFDF5",
    accentWithAlpha: "#34D39960",
    textPrimary: "#111827",
    textSecondary: "#4B5563",
    textOnAccent: "#FFFFFF",
    tabBarBackground: "#FFFFFF",
    tabBarBorder: "#E5E7EB",
    tabBarActive: "#34D399",
    tabBarInactive: "#9CA3AF",
    tabBarCenterButton: "#34D399",
    chip: "#F3F4F6",
};

// ─── Shared Tokens ────────────────────────────────────────────────────────────

const sharedRadius: ThemeRadius = {
    pill: 20,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    full: 40,
    avatar: 46,
    avatarInner: 40,
    centerButton: 32,
};

const sharedSpacing: ThemeSpacing = {
    s0: 0,
    s2: 2,
    s3: 3,
    s4: 4,
    s6: 6,
    s8: 8,
    s9: 9,
    s10: 10,
    s12: 12,
    s14: 14,
    s16: 16,
    s18: 18,
    s20: 20,
    s22: 22,
    s29: 29,
    s44: 44,
};

const sharedTypography: ThemeTypography = {
    fontSizes: {
        xs: 10,
        sm: 11,
        base: 12,
        md: 13,
        lg: 14,
        xl: 15,
        "2xl": 16,
        "3xl": 17,
        "4xl": 18,
        "5xl": 20,
        "6xl": 22,
        "7xl": 24,
    },
    fontWeights: {
        medium: "500",
        semibold: "600",
        bold: "700",
    },
    lineHeights: {
        tight: 15,
        normal: 20,
        relaxed: 21,
        loose: 26,
    },
    letterSpacing: {
        none: 0,
        xs: 0.1,
        sm: 0.2,
        md: 0.3,
        lg: 0.4,
    },
};

const sharedShadows: ThemeShadows = {
    card: {
        color: "#000000",
        opacity: 0.3,
        radius: 16,
        offset: { width: 0, height: 8 },
        elevation: 8,
    },
    centerButton: {
        color: "#34D399",
        opacity: 0.45,
        radius: 12,
        offset: { width: 0, height: 2 },
        elevation: 12,
    },
};

const sharedOpacity: ThemeOpacity = {
    backgroundTexture: 0.07,
    decorativeImage: 0.35,
    categoryCardIcon: 0.15,
    pressableTab: 0.7,
    pressableButton: 0.8,
    pressableCenterButton: 0.85,
};

const sharedBorders: ThemeBorders = {
    thin: 1,
    avatarRing: 2.5,
    none: 0,
};

const sharedZIndex: ThemeZIndex = {
    arc: 2,
    centerButton: 10,
};

const sharedDimensions: ThemeDimensions = {
    avatar: { width: 80, height: 80 },
    bannerHeight: 130,
    settingsButton: { width: 40, height: 40 },
    shareButton: { width: 42, height: 42 },
    centerButton: { width: 64, height: 64 },
    arcBump: { width: 80, height: 40 },
    metricDecorImage: { width: 58, height: 58 },
    favoritePlantImage: { width: "100%", height: 170 },
    categoryCard: { width: "47%", height: 90 },
    tabBarIconSize: 23,
    cameraIconSize: 28,
    categoryIconSize: 68,
    settingsIconSize: 20,
    shareIconSize: 20,
};

// ─── Themes ───────────────────────────────────────────────────────────────────

const themes: Record<ThemeMode, AppTheme> = {
    light: {
        mode: "light",
        colors: lightColors,
        radius: sharedRadius,
        spacing: sharedSpacing,
        typography: sharedTypography,
        shadows: sharedShadows,
        opacity: sharedOpacity,
        dimensions: sharedDimensions,
        borders: sharedBorders,
        zIndex: sharedZIndex,
    },
    dark: {
        mode: "dark",
        colors: darkColors,
        radius: sharedRadius,
        spacing: sharedSpacing,
        typography: sharedTypography,
        shadows: sharedShadows,
        opacity: sharedOpacity,
        dimensions: sharedDimensions,
        borders: sharedBorders,
        zIndex: sharedZIndex,
    },
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export function getTheme(mode: ColorSchemeName): AppTheme {
    return themes[mode === "dark" ? "dark" : "light"];
}

export function useTheme(): AppTheme {
    const mode = useColorScheme();
    return getTheme(mode);
}
