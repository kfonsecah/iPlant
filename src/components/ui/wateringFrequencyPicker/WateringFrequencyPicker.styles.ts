import { StyleSheet } from "react-native";
import { AppTheme } from "../../../theme/desingSystem";

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    label: {
      fontFamily: theme.typography.fontFamily.semibold,
      fontSize: theme.typography.fontSizes["2xl"],
      color: theme.colors.textPrimary,
      fontWeight: theme.typography.fontWeights.semibold,
      marginBottom: theme.scale.sm,
    },
    wrapper: {
      borderRadius: theme.radius.lg,
      borderWidth: theme.borders.thin,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    wrapperError: {
      borderColor: theme.colors.error,
    },
    scrollContent: {
      paddingVertical: theme.scale.sm,
      paddingHorizontal: theme.scale.sm,
      gap: theme.scale.sm,
    },
    card: {
      width: 74,
      paddingVertical: theme.scale.md,
      paddingHorizontal: theme.scale.xs,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.backgroundChip,
      borderWidth: theme.borders.thin,
      borderColor: theme.colors.border,
      alignItems: "center",
      gap: theme.scale.xs,
    },
    cardSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.45,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    dotsRow: {
      flexDirection: "row",
      gap: 3,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
    daysLabel: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSizes["4xl"],
      color: theme.colors.textPrimary,
      fontWeight: theme.typography.fontWeights.bold,
      lineHeight: 24,
    },
    daysLabelSelected: {
      color: theme.colors.textOnAccent,
    },
    sublabel: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSizes.xs,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    sublabelSelected: {
      color: theme.colors.textOnAccent,
    },
    errorText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.error,
      marginTop: theme.scale.xs,
    },
  });
