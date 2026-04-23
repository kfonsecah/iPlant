import React from "react";
import { View, Text } from "react-native";
import { 
  useConfidenceBadgeStyles, 
  getConfidenceColor, 
  getConfidenceLabel 
} from "./ConfidenceBadge.styles";

interface ConfidenceBadgeProps {
  confidence: number;
  showLabel?: boolean;
  size?: "small" | "medium" | "large";
}

const sizeStyles = {
  small: { container: { paddingHorizontal: 8, paddingVertical: 4 }, text: 12, dot: 6 },
  medium: { container: {}, text: 14, dot: 8 },
  large: { container: { paddingHorizontal: 16, paddingVertical: 8 }, text: 16, dot: 10 },
};

export default function ConfidenceBadge({ 
  confidence, 
  showLabel = true,
  size = "medium" 
}: ConfidenceBadgeProps) {
  const styles = useConfidenceBadgeStyles();
  
  const color = getConfidenceColor(confidence);
  const label = getConfidenceLabel(confidence);
  const sizeConfig = sizeStyles[size];
  
  return (
    <View 
      style={[
        styles.container, 
        sizeConfig.container,
        { backgroundColor: color + "20" }
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color, width: sizeConfig.dot, height: sizeConfig.dot }]} />
      <Text style={[styles.text, { color, fontSize: sizeConfig.text }]}>
        {confidence}%{showLabel ? ` · ${label}` : ""}
      </Text>
    </View>
  );
}