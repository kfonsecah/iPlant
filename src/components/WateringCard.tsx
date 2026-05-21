import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PlantaCompletaInterface } from "../types-dtos/plant.types";
import { getPlantsNeedingWater, getWateredTodayPercentage } from "../utils/wateringUtils";
import { useTheme, AppTheme } from "../theme/desingSystem";

interface WateringCardProps {
  plants: PlantaCompletaInterface[];
}

export default function WateringCard({ plants }: WateringCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const totalPlants = plants.length;
  const needWater = getPlantsNeedingWater(plants);
  const pendingCount = needWater.length;

  const percentage = (pendingCount === 0 && totalPlants > 0)
    ? 100
    : getWateredTodayPercentage(plants);

  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const fillWidth = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  const gradientColors = theme.mode === "dark" 
    ? ["rgba(10, 10, 10, 1)", "rgba(10, 10, 10, 0)"] as const
    : ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0)"] as const;

  return (
    <View style={styles.cardContainer}>
      {/* BACKGROUND IMAGE */}
      <Image
        source={require("../../assets/images/riego.png")}
        style={styles.bgImage}
      />

      {/* LEFT GRADIENT OVER IMAGE */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientOverlay}
      />

      {/* CONTENT CONTAINER */}
      <View style={styles.contentContainer}>
        {/* TOP ROW */}
        <View style={styles.topRow}>
          <Ionicons name="water-outline" size={13} color={theme.colors.primary} />
          <Text style={styles.topLabel}>Riego pendiente</Text>
        </View>

        {/* PLANT COUNT */}
        <View style={styles.countRow}>
          {pendingCount === 0 && totalPlants > 0 ? (
            <Text style={[styles.boldNumber, { fontSize: 14, fontWeight: "500", letterSpacing: 0 }]}>
              Todas tus plantas están regadas
            </Text>
          ) : (
            <>
              <Text style={styles.boldNumber}>{pendingCount}</Text>
              <Text style={styles.countLabel}>
                {pendingCount === 1 ? " planta sin regar" : " plantas sin regar"}
              </Text>
            </>
          )}
        </View>

        {/* PROGRESS BAR OR EMPTY PLACEHOLDER */}
        {totalPlants > 0 ? (
          <View style={styles.progressContainer}>
            {/* Track */}
            <View style={styles.progressTrack}>
              {/* Fill */}
              <Animated.View style={[styles.progressFill, { width: fillWidth }]} />
            </View>

            {/* Below Bar Row */}
            <View style={styles.belowBarRow}>
              <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
              <Text style={styles.statusLabel}>regadas hoy</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noPlantsText}>
            Agrega plantas para ver tu estado de riego
          </Text>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  cardContainer: {
    marginTop: 20, // Space for the 3D pop-out image to breathe
    marginBottom: 16,
    backgroundColor: theme.colors.backgroundCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 24,
    height: 110,
    position: "relative",
    ...theme.shadows,
  },
  bgImage: {
    position: "absolute",
    right: -12,
    top: -24, // Pop out 24px above the top border!
    width: 165,
    height: 134, // Taller than the container (110px) to pop out dynamically
    resizeMode: "contain",
    opacity: 0.95,
    zIndex: 2,
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "75%",
    borderTopLeftRadius: 23,
    borderBottomLeftRadius: 23,
    zIndex: 1,
  },
  contentContainer: {
    position: "absolute",
    left: 20,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  topLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: theme.colors.primary,
    marginLeft: 5,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  boldNumber: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  countLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    marginTop: 10,
    width: 180,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    width: 180,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  belowBarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: 180,
    marginTop: 5,
  },
  percentageText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  statusLabel: {
    fontSize: 11,
    color: theme.colors.disabledText,
  },
  noPlantsText: {
    fontSize: 12,
    color: theme.colors.disabledText,
    marginTop: 10,
  },
});
