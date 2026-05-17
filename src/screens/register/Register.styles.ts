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
      paddingTop: theme.spacing.s14,
      paddingBottom: theme.spacing.s20,
      justifyContent: "center",
    },

    // ── Orbes de luz ───────────────────────────────────────
    orb1: { top: -80,    right: -90 },
    orb2: { bottom: -60, left: -80  },
    orb3: { top: "38%",  left: -50  },

    // ── Destellos ──────────────────────────────────────────
    spark1: { top: "10%", left: "18%"  },
    spark2: { top: "7%",  right: "22%" },
    spark3: { top: "18%", right: "10%" },
    spark4: { top: "28%", left: "8%"   },
    spark5: { top: "50%", right: "6%"  },
    spark6: { top: "62%", left: "14%"  },
    spark7: { top: "75%", right: "18%" },
    spark8: { top: "85%", left: "40%"  },

    // ── Brand ─────────────────────────────────────────────
    brandContainer: {
      alignItems: "center",
      marginBottom: theme.spacing.s18,
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
      marginBottom: theme.spacing.s12,
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
      fontSize: theme.typography.fontSizes.md,
      marginTop: theme.spacing.s2,
      letterSpacing: theme.typography.letterSpacing.xs,
    },

    // ── Card ──────────────────────────────────────────────
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      paddingHorizontal: theme.spacing.s20,
      paddingTop: theme.spacing.s20,
      paddingBottom: theme.spacing.s22,
      borderWidth: theme.borders.thin,
      borderColor: theme.colors.border,
      gap: theme.spacing.s12,
      shadowColor: theme.shadows.card.color,
      shadowOpacity: theme.shadows.card.opacity,
      shadowRadius: theme.shadows.card.radius,
      shadowOffset: theme.shadows.card.offset,
      elevation: theme.shadows.card.elevation,
    },
    cardHeader: {
      gap: theme.spacing.s2,
      marginBottom: theme.spacing.s4,
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
    },

    // ── Olvidé contraseña ─────────────────────────────────
    forgotBtn: {
      alignSelf: "flex-end",
      marginTop: -theme.spacing.s4,
    },
    forgotText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSizes.sm,
      letterSpacing: theme.typography.letterSpacing.xs,
    },

    // ── Botón principal ────────────────────────────────────
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      height: 52,
      gap: theme.spacing.s8,
      marginTop: theme.spacing.s4,
    },
    primaryBtnText: {
      color: "#000000",
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.bold,
      letterSpacing: theme.typography.letterSpacing.md,
    },

    // ── Divisor ───────────────────────────────────────────
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    dividerLine: {
      flex: 1,
      height: theme.borders.thin,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      color: theme.colors.textSecondary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSizes.sm,
      marginHorizontal: theme.spacing.s12,
    },

    // ── Google ────────────────────────────────────────────
    googleBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      height: 52,
      gap: theme.spacing.s10,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      backgroundColor: "rgba(255,255,255,0.07)",
    },
    googleBtnText: {
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.semibold,
      fontSize: theme.typography.fontSizes["2xl"],
      fontWeight: theme.typography.fontWeights.semibold,
    },

    // ── Crear cuenta ──────────────────────────────────────
    secondaryBtn: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      height: 52,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      backgroundColor: "rgba(255,255,255,0.07)",
    },
    secondaryBtnText: {
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fontFamily.semibold,
      fontSize: theme.typography.fontSizes["2xl"],
      fontWeight: theme.typography.fontWeights.semibold,
      letterSpacing: theme.typography.letterSpacing.xs,
    },
  });
