import { ColorSchemeName, DimensionValue, useColorScheme } from "react-native";

type ThemeMode = "light" | "dark";

// ─── Color Interfaces ─────────────────────────────────────────────────────────

interface ThemeColors {
    // ── Backgrounds ───────────────────────────────────────────────────────────
    background: string;
    backgroundCard: string;
    backgroundChip: string;
    // ── Semantic Surfaces ─────────────────────────────────────────────────────
    surface: string;
    surfaceElevated: string;
    // ── Border ────────────────────────────────────────────────────────────────
    border: string;
    // ── Brand – Primary ───────────────────────────────────────────────────────
    primary: string;
    primaryPressed: string;
    primaryDisabled: string;
    // ── Brand – Secondary ─────────────────────────────────────────────────────
    secondary: string;
    secondaryPressed: string;
    secondaryDisabled: string;
    // ── Accent (legacy alias of primary) ──────────────────────────────────────
    accent: string;
    accentDim: string;
    accentWithAlpha: string;
    // ── Feedback – Error ──────────────────────────────────────────────────────
    error: string;
    errorPressed: string;
    errorDisabled: string;
    errorDim: string;
    // ── Feedback – Warning ───────────────────────────────────────────────────
    warning: string;
    warningDim: string;
    warningWithAlpha: string;
    // ── Feedback – Success ────────────────────────────────────────────────────
    success: string;
    successPressed: string;
    successDisabled: string;
    successDim: string;
    // ── Interaction States ────────────────────────────────────────────────────
    disabled: string;
    disabledText: string;
    hover: string;
    overlay: string;
    // ── Text ──────────────────────────────────────────────────────────────────
    textPrimary: string;
    textSecondary: string;
    textOnAccent: string;
    // ── Tab Bar ───────────────────────────────────────────────────────────────
    tabBarBackground: string;
    tabBarBorder: string;
    tabBarActive: string;
    tabBarInactive: string;
    tabBarCenterButton: string;
    // ── Backward-compatible alias ─────────────────────────────────────────────
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

// ─── Text Style Token ─────────────────────────────────────────────────────────

interface TextStyleToken {
    fontSize: number;
    fontWeight: "400" | "500" | "600" | "700";
    lineHeight: number;
    letterSpacing: number;
}

// ─── Typography Interface ─────────────────────────────────────────────────────

interface ThemeTypography {
    // Semantic font family tokens – load via expo-google-fonts or expo-font
    fontFamily: {
        regular: string;
        medium: string;
        semibold: string;
        bold: string;
    };
    // Semantic text styles (Material Design / Apple HIG inspired scale)
    textStyles: {
        title: TextStyleToken;    // 24 – screen titles, hero text
        subtitle: TextStyleToken; // 18 – section headers
        body: TextStyleToken;     // 16 – main readable content
        caption: TextStyleToken;  // 12 – metadata, helper text
        button: TextStyleToken;   // 14 – CTA labels
        overline: TextStyleToken; // 11 – category labels, tags
    };
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
        regular: "400";
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

// ─── Scale Interface ──────────────────────────────────────────────────────────
//  Semantic spacing scale following 4pt grid (Material Design / Apple HIG)

interface ThemeScale {
    xs: number;   // 4  – micro gaps, icon nudges
    sm: number;   // 8  – tight spacing between related elements
    md: number;   // 12 – compact padding inside chips / badges
    base: number; // 16 – default content padding
    lg: number;   // 24 – section separation
    xl: number;   // 32 – large section breathing room
    "2xl": number; // 40 – hero / screen-level spacing
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
    scale: ThemeScale;
    typography: ThemeTypography;
    shadows: ThemeShadows;
    opacity: ThemeOpacity;
    dimensions: ThemeDimensions;
    borders: ThemeBorders;
    zIndex: ThemeZIndex;
}

// ─── Dark Colors ──────────────────────────────────────────────────────────────

const darkColors: ThemeColors = {
    // Backgrounds
    background: "#0D1117",
    backgroundCard: "#161B22",
    backgroundChip: "#1C2128",
    // Semantic surfaces
    surface: "#161B22",
    surfaceElevated: "#1C2128",
    // Border
    border: "#21262D",
    // Brand – Primary (emerald green)
    primary: "#34D399",
    primaryPressed: "#059669",
    primaryDisabled: "#1A3D2F",
    // Brand – Secondary (mint / lighter green)
    secondary: "#86EFAC",
    secondaryPressed: "#4ADE80",
    secondaryDisabled: "#1E3A28",
    // Accent (legacy alias)
    accent: "#34D399",
    accentDim: "#163330",
    accentWithAlpha: "#34D39960",
    // Feedback – Error
    error: "#F87171",
    errorPressed: "#DC2626",
    errorDisabled: "#3D1515",
    errorDim: "#2D1515",
    // Feedback – Warning
    warning: "#F59E0B",
    warningDim: "#2A1C00",
    warningWithAlpha: "#F59E0B52",
    // Feedback – Success
    success: "#34D399",
    successPressed: "#059669",
    successDisabled: "#1A3D2F",
    successDim: "#163330",
    // Interaction States
    disabled: "#21262D",
    disabledText: "#4B5563",
    hover: "#1F2937",
    overlay: "#00000099",
    // Text
    textPrimary: "#E6EDF3",
    textSecondary: "#8B949E",
    textOnAccent: "#FFFFFF",
    // Tab Bar
    tabBarBackground: "#161B22",
    tabBarBorder: "#21262D",
    tabBarActive: "#34D399",
    tabBarInactive: "#4B5563",
    tabBarCenterButton: "#34D399",
    chip: "#1C2128",
};

// ─── Light Colors ─────────────────────────────────────────────────────────────

const lightColors: ThemeColors = {
    // Backgrounds
    background: "#FFFFFF",
    backgroundCard: "#F9FAFB",
    backgroundChip: "#F3F4F6",
    // Semantic surfaces
    surface: "#F9FAFB",
    surfaceElevated: "#FFFFFF",
    // Border
    border: "#D1D5DB",
    // Brand – Primary (deeper emerald for light bg contrast)
    primary: "#059669",
    primaryPressed: "#047857",
    primaryDisabled: "#A7F3D0",
    // Brand – Secondary
    secondary: "#10B981",
    secondaryPressed: "#059669",
    secondaryDisabled: "#D1FAE5",
    // Accent (legacy alias)
    accent: "#34D399",
    accentDim: "#ECFDF5",
    accentWithAlpha: "#34D39960",
    // Feedback – Error
    error: "#EF4444",
    errorPressed: "#DC2626",
    errorDisabled: "#FCA5A5",
    errorDim: "#FEF2F2",
    // Feedback – Warning
    warning: "#D97706",
    warningDim: "#FFFBEB",
    warningWithAlpha: "#D9770652",
    // Feedback – Success
    success: "#10B981",
    successPressed: "#059669",
    successDisabled: "#A7F3D0",
    successDim: "#ECFDF5",
    // Interaction States
    disabled: "#F3F4F6",
    disabledText: "#9CA3AF",
    hover: "#F3F4F6",
    overlay: "#00000066",
    // Text
    textPrimary: "#111827",
    textSecondary: "#4B5563",
    textOnAccent: "#FFFFFF",
    // Tab Bar
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
    // Load fonts in app entry via expo-google-fonts or expo-font.
    // Example: useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold })
    fontFamily: {
        regular:  "Inter_400Regular",
        medium:   "Inter_500Medium",
        semibold: "Inter_600SemiBold",
        bold:     "Inter_700Bold",
    },
    textStyles: {
        //                              size  weight  lineH  letterS
        title:    { fontSize: 24, fontWeight: "700", lineHeight: 32, letterSpacing: 0.3 },
        subtitle: { fontSize: 18, fontWeight: "600", lineHeight: 26, letterSpacing: 0.2 },
        body:     { fontSize: 16, fontWeight: "400", lineHeight: 24, letterSpacing: 0.1 },
        caption:  { fontSize: 12, fontWeight: "400", lineHeight: 16, letterSpacing: 0.2 },
        button:   { fontSize: 14, fontWeight: "600", lineHeight: 20, letterSpacing: 0.3 },
        overline: { fontSize: 11, fontWeight: "500", lineHeight: 16, letterSpacing: 0.8 },
    },
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
        regular:  "400",
        medium:   "500",
        semibold: "600",
        bold:     "700",
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

// Semantic spacing scale – 4pt grid (Material Design / Apple HIG)
const sharedScale: ThemeScale = {
    xs:    4,
    sm:    8,
    md:    12,
    base:  16,
    lg:    24,
    xl:    32,
    "2xl": 40,
};

const themes: Record<ThemeMode, AppTheme> = {
    light: {
        mode: "light",
        colors: lightColors,
        radius: sharedRadius,
        spacing: sharedSpacing,
        scale: sharedScale,
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
        scale: sharedScale,
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
