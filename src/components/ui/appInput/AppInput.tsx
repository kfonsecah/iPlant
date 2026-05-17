import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "../../../theme/desingSystem";
import { createStyles } from "./AppInput.styles";

// ─── Props ────────────────────────────────────────────────────────────────────
// Extiende TextInputProps para ser compatible con react-hook-form (onChangeText,
// value, onBlur) y cualquier prop nativa de TextInput.

export interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: React.ComponentProps<typeof Ionicons>["name"];
}

// ─── AppInput ─────────────────────────────────────────────────────────────────

export default function AppInput({
  label,
  error,
  leftIcon,
  onFocus,
  onBlur,
  multiline,
  numberOfLines,
  style,
  ...rest
}: AppInputProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          multiline ? styles.inputRowMultiline : styles.inputRow,
          focused && styles.inputRowFocused,
          !!error && styles.inputRowError,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            style={multiline && styles.iconMultiline}
            color={error ? theme.colors.error : focused ? theme.colors.primary : theme.colors.textSecondary}
          />
        )}

        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, style]}
          placeholderTextColor="rgba(255,255,255,0.3)"
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
