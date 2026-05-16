import { StyleSheet, Dimensions } from "react-native";
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
      paddingBottom: 40,
    },
    
    // ── Brand ─────────────────────────────────────────────
    brandContainer: {
      alignItems: "center",
      marginBottom: 48,
    },
    logoContainer: {
      marginBottom: 12,
      shadowColor: "#4ade80",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 10,
    },
    brandName: {
      fontSize: 38,
      fontWeight: "300",
      color: "#fff",
      letterSpacing: -1,
    },
    tagline: {
      fontSize: 13,
      color: "rgba(255,255,255,0.5)",
      letterSpacing: 3,
      textTransform: "uppercase",
      marginTop: 4,
    },

    // ── Form ──────────────────────────────────────────────
    formContainer: {
      gap: 16,
    },
    inputWrapper: {
      backgroundColor: "rgba(255,255,255,0.12)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)",
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
      color: "#fff",
      fontSize: 16,
      height: "100%",
    },
    eyeIcon: {
      padding: 4,
    },
    errorText: {
      color: "#f87171",
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    forgotBtn: {
      alignSelf: "flex-end",
      marginTop: -4,
    },
    forgotText: {
      color: "rgba(255,255,255,0.45)",
      fontSize: 14,
    },

    // ── Buttons ───────────────────────────────────────────
    loginBtn: {
      backgroundColor: "#4ade80",
      borderRadius: 14,
      height: 52,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
      shadowColor: "#4ade80",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    loginBtnText: {
      color: "#000",
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
      backgroundColor: "rgba(255,255,255,0.12)",
    },
    dividerText: {
      color: "rgba(255,255,255,0.35)",
      fontSize: 12,
      marginHorizontal: 16,
    },

    googleBtn: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
      borderRadius: 14,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    googleBtnText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "500",
    },

    registerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 20,
    },
    registerText: {
      color: "rgba(255,255,255,0.85)",
      fontSize: 15,
    },
    registerLink: {
      color: "#4ade80",
      fontWeight: "700",
      fontSize: 15,
    },
  });

