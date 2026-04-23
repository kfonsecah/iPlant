import { StyleSheet } from "react-native";
import { AppTheme } from "../../../theme/desingSystem";

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.warning,
      paddingVertical: theme.spacing.s8,
      paddingHorizontal: theme.spacing.s16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    text: {
      color: "#FFFFFF", // High contrast for warning background
      fontSize: theme.typography.fontSizes.base,
      fontFamily: theme.typography.fontFamily.medium,
      marginLeft: theme.spacing.s8,
    },
    icon: {
      marginRight: theme.spacing.s4,
    },
  });
