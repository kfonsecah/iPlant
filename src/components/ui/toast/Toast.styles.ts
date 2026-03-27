import { StyleSheet } from "react-native";
import { AppTheme } from "../../../theme/desingSystem";

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: theme.scale.base,
      right: theme.scale.base,
      zIndex: theme.zIndex.centerButton,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.s16,
      paddingVertical: theme.spacing.s12,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.s10,
      shadowColor: theme.shadows.card.color,
      shadowOpacity: theme.shadows.card.opacity,
      shadowRadius: theme.shadows.card.radius,
      shadowOffset: theme.shadows.card.offset,
      elevation: theme.shadows.card.elevation,
    },
    success: {
      backgroundColor: theme.colors.successDim,
      borderWidth: theme.borders.thin,
      borderColor: theme.colors.primary,
    },
    error: {
      backgroundColor: theme.colors.errorDim,
      borderWidth: theme.borders.thin,
      borderColor: theme.colors.error,
    },
    warning: {
      backgroundColor: theme.colors.warningDim,
      borderWidth: theme.borders.thin,
      borderColor: theme.colors.warning,
    },
    message: {
      flex: 1,
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSizes["2xl"],
      fontWeight: theme.typography.fontWeights.medium,
    },
    messageSuccess: { color: theme.colors.primary },
    messageError:   { color: theme.colors.error },
    messageWarning: { color: theme.colors.warning },
    closeBtn: {
      padding: theme.scale.xs,
    },
  });
