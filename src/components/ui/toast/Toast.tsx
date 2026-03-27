import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../theme/desingSystem";
import { createStyles } from "./Toast.styles";

// ─── Props ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning";

export interface ToastProps {
  visible: boolean;
  type: ToastType;
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number; // por defecto 3000ms
}

// Ubicación: parte superior de la pantalla, debajo del status bar.
// Justificación UX: visible sin desplazarse, fuera de la zona de pulgar,
// no bloquea el contenido principal. Se cierra automáticamente (3s) para
// mensajes transitorios, y con botón X para que el usuario pueda leerlo
// sin prisa si lo necesita.

export default function Toast({
  visible,
  type,
  message,
  onDismiss,
  autoDismissMs = 3000,
}: ToastProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [visible, autoDismissMs]);

  if (!visible) return null;

  const iconMap: Record<ToastType, React.ComponentProps<typeof Ionicons>["name"]> = {
    success: "checkmark-circle",
    error:   "close-circle",
    warning: "warning",
  };

  const colorMap: Record<ToastType, string> = {
    success: theme.colors.primary,
    error:   theme.colors.error,
    warning: theme.colors.warning,
  };

  const msgStyleMap = {
    success: styles.messageSuccess,
    error:   styles.messageError,
    warning: styles.messageWarning,
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(250)}
      style={[styles.container, styles[type], { top: insets.top + 8 }]}
    >
      <Ionicons name={iconMap[type]} size={20} color={colorMap[type]} />
      <Text style={[styles.message, msgStyleMap[type]]}>{message}</Text>
      <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
        <Ionicons name="close" size={16} color={colorMap[type]} />
      </TouchableOpacity>
    </Animated.View>
  );
}
