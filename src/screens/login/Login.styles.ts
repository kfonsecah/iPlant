import { Dimensions, Platform, StyleSheet } from "react-native";
import { AppTheme } from "../../theme/desingSystem";

const { width: W, height: H } = Dimensions.get("window");

export const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingBottom: 100, // Increased to account for the fixed register label
    },

    // ── Brand ─────────────────────────────────────────────
    brandContainer: {
      alignItems: "center",
      marginBottom: 48,
    },
    logoContainer: {
      marginBottom: 12,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 10,
    },
    brandName: {
      fontSize: 38,
      fontWeight: "300",
      color: theme.colors.textPrimary,
      letterSpacing: -1,
    },
    tagline: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      letterSpacing: 3,
      textTransform: "uppercase",
      marginTop: 4,
    },

    // ── Form ──────────────────────────────────────────────
    formContainer: {
      gap: 16,
    },
    inputWrapper: {
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 16,
      height: "100%",
    },
    eyeIcon: {
      padding: 4,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    forgotBtn: {
      alignSelf: "flex-end",
      marginTop: -4,
    },
    forgotText: {
      color: theme.colors.disabledText,
      fontSize: 14,
    },

    // ── Buttons ───────────────────────────────────────────
    loginBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    loginBtnText: {
      color: theme.colors.textOnAccent,
      fontSize: 16,
      fontWeight: "600",
    },

    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      color: theme.colors.disabledText,
      fontSize: 12,
      marginHorizontal: 16,
    },

    googleBtn: {
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    googleBtnText: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: "500",
    },

    registerContainer: {
      position: "absolute",
      bottom: Platform.OS === "ios" ? 140 : 110,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      zIndex: 21,
      elevation: 21,
    },
    registerText: {
      color: theme.colors.textSecondary,
      fontSize: 15,
    },
    registerLink: {
      color: theme.colors.primary,
      fontWeight: "700",
      fontSize: 15,
    },

    registerFormWrapper: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 24,
      marginHorizontal: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    registerFormInner: {
      padding: 28,
      gap: 16,
    },
    registerTitle: {
      color: theme.colors.textPrimary,
      fontSize: 28,
      fontWeight: "700",
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    registerSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginBottom: 16,
    },
    inputWrapperFocus: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.mode === 'dark' ? "rgba(74, 222, 128, 0.08)" : "rgba(74, 222, 128, 0.12)",
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    registerFooter: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },
  });
