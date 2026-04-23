import { StyleSheet } from "react-native";
import { useTheme } from "../../../theme/desingSystem";

export const useAiResultCardStyles = () => {
  const theme = useTheme();
  
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xxl,
      padding: 24, // Slightly more padding
      width: "100%",
      maxHeight: 500, // Increased slightly for better text fit
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
    },
    sheetHeader: {
      alignItems: "center",
      marginBottom: 12,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      marginBottom: 20,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    closeIcon: {
      padding: 4,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      width: '100%',
      marginBottom: 12,
    },
    plantName: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.textPrimary,
      paddingRight: 12,
      lineHeight: 28,
      flexWrap: 'wrap', // Ensure text wraps
      flexShrink: 1,   // Allow shrinking if needed
    },
    latinName: {
      fontSize: 15,
      fontStyle: "italic",
      color: theme.colors.primary, // Use primary color for the latin name to make it look professional
      marginTop: 2,
      fontWeight: "500",
    },
    scrollArea: {
      marginVertical: 10,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      marginBottom: 8,
    },
    sectionContent: {
      fontSize: 15,
      fontWeight: "400",
      color: theme.colors.textPrimary,
      lineHeight: 24, // Increased line height for much better readability
      textAlign: "left",
    },
    editModeContainer: {
      gap: 16,
      paddingTop: 8,
      paddingBottom: 20,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 8,
    },
    editButton: {
      flex: 1,
      padding: 16,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
    },
    confirmButton: {
      flex: 1.5,
      padding: 16,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    cancelButton: {
      width: 56,
      height: 56,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.error + "30",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontSize: 15,
      fontWeight: "700",
    },
  });
};