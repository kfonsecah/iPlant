import { StyleSheet } from "react-native";
import { AppTheme } from "../../../theme/desingSystem";

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: 20,
      right: 20,
      zIndex: theme.zIndex.centerButton,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      shadowColor: "#000",
      shadowOpacity: 0.5,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
      overflow: "hidden",
    },
    success: {
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      borderWidth: 1,
      borderColor: "rgba(74, 222, 128, 0.25)",
    },
    error: {
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      borderWidth: 1,
      borderColor: "rgba(248, 113, 113, 0.25)",
    },
    warning: {
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      borderWidth: 1,
      borderColor: "rgba(250, 204, 21, 0.25)",
    },
    message: {
      flex: 1,
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: 14,
      fontWeight: "500",
    },
    messageSuccess: { color: "#fff" },
    messageError:   { color: "#fff" },
    messageWarning: { color: "#fff" },
    closeBtn: {
      padding: theme.scale.xs,
    },
  });
