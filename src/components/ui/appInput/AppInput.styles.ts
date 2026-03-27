import { StyleSheet } from "react-native";
import { AppTheme } from "../../../theme/desingSystem";

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      gap: theme.scale.xs,
    },
    label: {
      fontFamily: theme.typography.fontFamily.semibold,
      fontSize: theme.typography.fontSizes["2xl"],
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.textPrimary,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      height: theme.dimensions.inputHeight,
      borderRadius: theme.radius.md,
      borderWidth: theme.borders.thin,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundChip,
      paddingHorizontal: theme.spacing.s14,
      gap: theme.spacing.s8,
    },
    // Variante multiline: sin altura fija, crece con el contenido
    inputRowMultiline: {
      flexDirection: "row",
      alignItems: "flex-start",
      minHeight: theme.dimensions.inputHeight,
      borderRadius: theme.radius.md,
      borderWidth: theme.borders.thin,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundChip,
      paddingHorizontal: theme.spacing.s14,
      paddingVertical: theme.spacing.s12,
      gap: theme.spacing.s8,
    },
    inputRowFocused: {
      borderColor: theme.colors.primary,
    },
    inputRowError: {
      borderColor: theme.colors.error,
    },
    input: {
      flex: 1,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSizes["2xl"],
      color: theme.colors.textPrimary,
      paddingVertical: 0,
    },
    // Variante multiline: el texto se ancla al top
    inputMultiline: {
      textAlignVertical: "top",
    },
    // Ícono alineado al top cuando el campo es multiline
    iconMultiline: {
      marginTop: theme.spacing.s2,
    },
    errorText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.error,
    },
  });
