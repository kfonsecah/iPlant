import { StyleSheet } from "react-native";
import { AppTheme } from "../../theme/desingSystem";

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

