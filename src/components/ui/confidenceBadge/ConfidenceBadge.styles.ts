import { StyleSheet } from "react-native";

export const CONFIDENCE_COLORS = {
  high: "#22C55E",
  medium: "#EAB308",
  low: "#EF4444",
};

export const CONFIDENCE_LABELS = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

export const getConfidenceColor = (probability: number): string => {
  if (probability >= 70) return CONFIDENCE_COLORS.high;
  if (probability >= 40) return CONFIDENCE_COLORS.medium;
  return CONFIDENCE_COLORS.low;
};

export const getConfidenceLabel = (probability: number): string => {
  if (probability >= 70) return CONFIDENCE_LABELS.high;
  if (probability >= 40) return CONFIDENCE_LABELS.medium;
  return CONFIDENCE_LABELS.low;
};

export const useConfidenceBadgeStyles = () => {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 6,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    text: {
      fontSize: 14,
      fontWeight: "600",
    },
  });
};