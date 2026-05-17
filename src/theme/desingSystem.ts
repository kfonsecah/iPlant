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
    logoCircle: number;
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
    fontWeight: "300" | "400" | "500" | "600" | "700";
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
    disabled: number;
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
    buttonIconSize: number;
    logoIconSize: number;
    logoCircle: { width: number; height: number };
    inputHeight: number;
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
    background: "#0A0A0A",
    backgroundCard: "rgba(255,255,255,0.05)",
    backgroundChip: "rgba(255,255,255,0.07)",
    // Semantic surfaces
    surface: "rgba(255,255,255,0.05)",
    surfaceElevated: "rgba(255,255,255,0.07)",
    // Border
    border: "rgba(255,255,255,0.08)",
    // Brand – Primary
    primary: "#4ADE80",
    primaryPressed: "#22C55E",
    primaryDisabled: "rgba(74,222,128,0.3)",
    // Brand – Secondary
    secondary: "rgba(255,255,255,0.07)",
    secondaryPressed: "rgba(255,255,255,0.1)",
    secondaryDisabled: "rgba(255,255,255,0.03)",
    // Accent (legacy alias)
    accent: "#4ADE80",
    accentDim: "rgba(74,222,128,0.1)",
    accentWithAlpha: "rgba(74,222,128,0.6)",
    // Feedback – Error
    error: "#F87171",
    errorPressed: "#EF4444",
    errorDisabled: "rgba(248,113,113,0.3)",
    errorDim: "rgba(248,113,113,0.12)",
    // Feedback – Warning
    warning: "#F59E0B",
    warningDim: "#2A1C00",
    warningWithAlpha: "#F59E0B52",
    // Feedback – Success
    success: "#4ADE80",
    successPressed: "#22C55E",
    successDisabled: "rgba(74,222,128,0.3)",
    successDim: "rgba(74,222,128,0.1)",
    // Interaction States
    disabled: "rgba(255,255,255,0.03)",
    disabledText: "rgba(255,255,255,0.3)",
    hover: "rgba(255,255,255,0.1)",
    overlay: "rgba(0,0,0,0.85)",
    // Text
    textPrimary: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.55)",
    textOnAccent: "#000000",
    // Tab Bar
    tabBarBackground: "rgba(0,0,0,0.85)",
    tabBarBorder: "rgba(255,255,255,0.08)",
    tabBarActive: "#4ADE80",
    tabBarInactive: "rgba(255,255,255,0.35)",
    tabBarCenterButton: "#4ADE80",
    chip: "rgba(255,255,255,0.07)",
};

// ─── Light Colors ─────────────────────────────────────────────────────────────
// The prompt specifies a pure dark design system everywhere, so lightColors mirrors darkColors
const lightColors: ThemeColors = {
    ...darkColors,
};

// ─── Shared Tokens ────────────────────────────────────────────────────────────

const sharedRadius: ThemeRadius = {
    pill: 20,
    sm: 12,
    md: 14,
    lg: 20,
    xl: 20,
    full: 40,
    avatar: 46,
    avatarInner: 40,
    centerButton: 32,
    logoCircle: 36,
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
        title:    { fontSize: 24, fontWeight: "300", lineHeight: 32, letterSpacing: -0.5 },
        subtitle: { fontSize: 18, fontWeight: "400", lineHeight: 26, letterSpacing: 0 },
        body:     { fontSize: 15, fontWeight: "400", lineHeight: 24, letterSpacing: 0 },
        caption:  { fontSize: 12, fontWeight: "400", lineHeight: 16, letterSpacing: 0 },
        button:   { fontSize: 14, fontWeight: "600", lineHeight: 20, letterSpacing: 0 },
        overline: { fontSize: 11, fontWeight: "500", lineHeight: 16, letterSpacing: 2 },
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
        color: "transparent",
        opacity: 0,
        radius: 0,
        offset: { width: 0, height: 0 },
        elevation: 0,
    },
    centerButton: {
        color: "transparent",
        opacity: 0,
        radius: 0,
        offset: { width: 0, height: 0 },
        elevation: 0,
    },
};

const sharedOpacity: ThemeOpacity = {
    backgroundTexture: 0.07,
    decorativeImage: 0.35,
    categoryCardIcon: 0.15,
    pressableTab: 0.7,
    pressableButton: 0.8,
    pressableCenterButton: 0.85,
    disabled: 0.5,
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
    buttonIconSize: 18,
    logoIconSize: 32,
    logoCircle: { width: 72, height: 72 },
    inputHeight: 52,
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
