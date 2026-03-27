import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../../theme/desingSystem";
import { createStyles } from "./WateringFrequencyPicker.styles";

// ─── Frequency Options ────────────────────────────────────────────────────────

interface FrequencyOption {
  days: number;
  label: string;
  sublabel: string;
  filledDots: number; // 0-3 — visual water level (más lleno = más frecuente)
}

const FREQUENCIES: FrequencyOption[] = [
  { days: 1,  label: "1d",  sublabel: "Diario",    filledDots: 3 },
  { days: 2,  label: "2d",  sublabel: "Cada 2d",   filledDots: 3 },
  { days: 3,  label: "3d",  sublabel: "Cada 3d",   filledDots: 2 },
  { days: 5,  label: "5d",  sublabel: "Cada 5d",   filledDots: 2 },
  { days: 7,  label: "7d",  sublabel: "Semanal",   filledDots: 1 },
  { days: 14, label: "14d", sublabel: "Quincenal", filledDots: 1 },
  { days: 30, label: "30d", sublabel: "Mensual",   filledDots: 0 },
];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WateringFrequencyPickerProps {
  value: number | null;
  onChange: (days: number) => void;
  error?: boolean;
  label?: string;
}

// ─── FrequencyCard ────────────────────────────────────────────────────────────

function FrequencyCard({
  option,
  selected,
  onPress,
}: {
  option: FrequencyOption;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.06 : 1.0, { damping: 12, stiffness: 200 });
  }, [selected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(selected ? 1.06 : 1.0, { damping: 12, stiffness: 200 });
  };

  const dotFilledColor = selected ? "rgba(255,255,255,0.9)" : theme.colors.primary;
  const dotEmptyColor  = selected ? "rgba(255,255,255,0.25)" : theme.colors.border;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.card, selected && styles.cardSelected, animStyle]}>
        {/* Ícono de gota */}
        <Ionicons
          name={selected ? "water" : "water-outline"}
          size={26}
          color={selected ? theme.colors.textOnAccent : theme.colors.primary}
        />

        {/* Indicadores de nivel de agua */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i < option.filledDots ? dotFilledColor : dotEmptyColor },
              ]}
            />
          ))}
        </View>

        {/* Número de días */}
        <Text style={[styles.daysLabel, selected && styles.daysLabelSelected]}>
          {option.label}
        </Text>

        {/* Etiqueta descriptiva */}
        <Text style={[styles.sublabel, selected && styles.sublabelSelected]}>
          {option.sublabel}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── WateringFrequencyPicker ──────────────────────────────────────────────────

export default function WateringFrequencyPicker({
  value,
  onChange,
  error = false,
  label = "Frecuencia de riego",
}: WateringFrequencyPickerProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.wrapper, error && styles.wrapperError]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {FREQUENCIES.map((option) => (
            <FrequencyCard
              key={option.days}
              option={option}
              selected={value === option.days}
              onPress={() => onChange(option.days)}
            />
          ))}
        </ScrollView>
      </View>

      {error && (
        <Text style={styles.errorText}>Selecciona la frecuencia de riego</Text>
      )}
    </View>
  );
}
