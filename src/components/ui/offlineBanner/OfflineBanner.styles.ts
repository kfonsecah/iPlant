import { StyleSheet } from "react-native";
import { AppTheme } from "../../../theme/desingSystem";

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: theme.colors.warning,
    },
    safeAreaInfo: {
      backgroundColor: theme.colors.secondary,
    },
    container: {
      paddingVertical: theme.spacing.s8,
      paddingHorizontal: theme.spacing.s16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    content: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    text: {
      color: "#FFFFFF",
      fontSize: 13,
      fontFamily: theme.typography.fontFamily.medium,
      marginLeft: theme.spacing.s6,
    },
    syncButton: {
      backgroundColor: "rgba(255,255,255,0.25)",
      paddingHorizontal: theme.spacing.s12,
      paddingVertical: theme.spacing.s4,
      borderRadius: theme.radius.sm,
      borderWidth: theme.borders.thin,
      borderColor: "rgba(255,255,255,0.4)",
    },
    syncButtonText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontFamily: theme.typography.fontFamily.bold,
    },
    icon: {
      marginRight: theme.spacing.s4,
    },
  });
