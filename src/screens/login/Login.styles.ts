import { StyleSheet } from "react-native";
import { AppTheme } from "../../theme/desingSystem";

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    // ── Fondo animado ──────────────────────────────────────
    background: {
      flex: 1,
      backgroundColor: theme.colors.background,
      overflow: "hidden",
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.s20,
      paddingTop: theme.spacing.s29,
      paddingBottom: theme.spacing.s20,
      justifyContent: "center",
    },

    // ── Orbes de luz ───────────────────────────────────────
    orb1: {
      top: -80,
      right: -90,
    },
    orb2: {
      bottom: -60,
      left: -80,
    },
    orb3: {
      top: "38%",
      left: -50,
    },

    // ── Destellos ──────────────────────────────────────────
    spark1: { top: "10%",  left: "18%"  },
    spark2: { top: "7%",   right: "22%" },
    spark3: { top: "18%",  right: "10%" },
    spark4: { top: "28%",  left: "8%"   },
    spark5: { top: "50%",  right: "6%"  },
    spark6: { top: "62%",  left: "14%"  },
    spark7: { top: "75%",  right: "18%" },
    spark8: { top: "85%",  left: "40%"  },

    // ── Brand ─────────────────────────────────────────────
    brandContainer: {
      alignItems: "center",
      marginBottom: theme.spacing.s29,
    },
    logoCircle: {
      width: theme.dimensions.logoCircle.width,
      height: theme.dimensions.logoCircle.height,
      borderRadius: theme.radius.logoCircle,
      backgroundColor: theme.colors.accentDim,
      borderWidth: theme.borders.avatarRing,
      borderColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.s16,
      shadowColor: theme.shadows.centerButton.color,
      shadowOpacity: theme.shadows.centerButton.opacity,
      shadowRadius: theme.shadows.centerButton.radius,
      shadowOffset: theme.shadows.centerButton.offset,
      elevation: theme.shadows.centerButton.elevation,
    },
    brandName: {
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSizes["7xl"],
      fontWeight: theme.typography.fontWeights.bold,
      letterSpacing: theme.typography.letterSpacing.lg,
    },
    tagline: {
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSizes.lg,
      marginTop: theme.spacing.s4,
      letterSpacing: theme.typography.letterSpacing.xs,
    },

    // ── Card ──────────────────────────────────────────────
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.s20,
      borderWidth: theme.borders.thin,
      borderColor: theme.colors.border,
      shadowColor: theme.shadows.card.color,
      shadowOpacity: theme.shadows.card.opacity,
      shadowRadius: theme.shadows.card.radius,
      shadowOffset: theme.shadows.card.offset,
      elevation: theme.shadows.card.elevation,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSizes["6xl"],
      fontWeight: theme.typography.fontWeights.bold,
      letterSpacing: theme.typography.letterSpacing.sm,
    },
    cardSubtitle: {
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSizes.md,
      marginTop: theme.spacing.s4,
      marginBottom: theme.spacing.s20,
    },

    // ── Inputs ────────────────────────────────────────────
    inputGroup: {
      marginBottom: theme.spacing.s16,
    },
    inputLabel: {
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSizes.base,
      letterSpacing: theme.typography.letterSpacing.md,
      marginBottom: theme.spacing.s6,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.backgroundChip,
      borderRadius: theme.radius.sm,
      borderWidth: theme.borders.thin,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.s14,
      height: theme.dimensions.inputHeight,
    },
    inputWrapperFocused: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.accentDim,
    },
    inputIcon: {
      marginRight: theme.spacing.s10,
    },
    input: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSizes.lg,
      height: "100%",
    },
    eyeBtn: {
      padding: theme.spacing.s6,
    },

    // ── Acciones ──────────────────────────────────────────
    forgotBtn: {
      alignSelf: "flex-end",
      marginTop: -theme.spacing.s6,
      marginBottom: theme.spacing.s20,
    },
    forgotText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSizes.sm,
      letterSpacing: theme.typography.letterSpacing.xs,
    },
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.s14,
      gap: theme.spacing.s8,
      shadowColor: theme.shadows.centerButton.color,
      shadowOpacity: theme.shadows.centerButton.opacity,
      shadowRadius: theme.shadows.centerButton.radius,
      shadowOffset: theme.shadows.centerButton.offset,
      elevation: theme.shadows.centerButton.elevation,
    },
    primaryBtnText: {
      color: theme.colors.textOnAccent,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.bold,
      letterSpacing: theme.typography.letterSpacing.md,
    },

    // ── Divisor ───────────────────────────────────────────
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.s18,
    },
    dividerLine: {
      flex: 1,
      height: theme.borders.thin,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSizes.base,
      marginHorizontal: theme.spacing.s12,
    },

    // ── Registro ──────────────────────────────────────────
    secondaryBtn: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.sm,
      paddingVertical: theme.spacing.s14,
      borderWidth: theme.borders.thin,
      borderColor: theme.colors.accentWithAlpha,
      backgroundColor: theme.colors.accentDim,
    },
    secondaryBtnText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semibold,
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.semibold,
      letterSpacing: theme.typography.letterSpacing.sm,
    },
  });
