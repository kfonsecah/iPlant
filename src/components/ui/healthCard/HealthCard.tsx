import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppTheme, useTheme } from "../../../theme/desingSystem";

interface HealthCardProps {
  score: number | null;
  lastUpdated: string | null;
  isPremium: boolean;
  onPress: () => void;
  onUpgrade: () => void;
}

export function getHealthScoreColor(score: number): string {
  if (score >= 70) return "#4ADE80";
  if (score >= 40) return "#F59E0B";
  return "#F87171";
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 70) return "Saludable";
  if (score >= 40) return "Atención";
  return "Riesgo";
}

function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
  });
}

export default function HealthCard({
  score,
  lastUpdated,
  isPremium,
  onPress,
  onUpgrade,
}: HealthCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const hasData = score !== null;
  const scoreColor = hasData
    ? getHealthScoreColor(score as number)
    : theme.colors.disabledText;

  return (
    // Outer wrapper allows image to bleed above the card
    <View style={styles.outerContainer}>
      {/* CARD */}
      <TouchableOpacity
        style={styles.card}
        onPress={isPremium ? onPress : undefined}
        activeOpacity={isPremium ? 0.8 : 1}
      >
        {/* LEFT CONTENT */}
        <View style={styles.left}>
          <View style={styles.labelRow}>
            <Ionicons
              name="heart-outline"
              size={10}
              color={theme.colors.disabledText}
            />
            <Text style={styles.cardLabel}>Salud de la planta</Text>
          </View>

          {hasData ? (
            <>
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                  {score}
                </Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${score}%` as any,
                      backgroundColor: scoreColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: scoreColor }]}>
                {getHealthScoreLabel(score as number)}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.noDataDash}>—</Text>
              <Text style={styles.noDataHint}>
                Sin datos · agrega tu primera revisión
              </Text>
            </>
          )}

          {lastUpdated && (
            <Text style={styles.dateText}>
              Actualizado {formatShortDate(lastUpdated)}
            </Text>
          )}
        </View>

        {/* LOCK OVERLAY (non-premium) */}
        {!isPremium && (
          <BlurView
            intensity={22}
            tint={theme.mode === "dark" ? "dark" : "light"}
            style={styles.lockOverlay}
          >
            <View style={styles.lockLeft}>
              <Ionicons
                name="lock-closed"
                size={16}
                color={theme.colors.textPrimary}
              />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.lockTitle}>Solo Premium</Text>
                <Text style={styles.lockSub}>
                  Analiza la salud de tus plantas con IA
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.upgradeBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={onUpgrade}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.upgradeBtnText,
                  { color: theme.colors.textOnAccent },
                ]}
              >
                Upgrade →
              </Text>
            </TouchableOpacity>
          </BlurView>
        )}
      </TouchableOpacity>

      {/* IMAGE — only visible in premium (avoids overexposure over lock overlay) */}
      {isPremium && (
        <View style={styles.imageWrap} pointerEvents="none">
          <Image
            source={require("../../../../assets/images/healthplant.png")}
            style={styles.image}
            contentFit="contain"
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    outerContainer: {
      marginHorizontal: 20,
      marginTop: 12,
      height: 112,
    },
    card: {
      flex: 1,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: "row",
      overflow: "hidden",
      ...theme.shadows,
    },
    left: {
      flex: 1,
      paddingLeft: 16,
      paddingVertical: 12,
      justifyContent: "center",
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 6,
    },
    cardLabel: {
      fontSize: 9,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: theme.colors.disabledText,
    },
    scoreRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 3,
    },
    scoreNumber: {
      fontSize: 34,
      fontWeight: "300",
      lineHeight: 38,
    },
    scoreMax: {
      fontSize: 12,
      color: theme.colors.disabledText,
    },
    barTrack: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      width: "65%",
      marginTop: 5,
      overflow: "hidden",
    },
    barFill: {
      height: 4,
      borderRadius: 2,
    },
    barLabel: {
      fontSize: 10,
      marginTop: 3,
      fontWeight: "500",
    },
    noDataDash: {
      fontSize: 30,
      fontWeight: "300",
      color: theme.colors.disabledText,
      lineHeight: 36,
    },
    noDataHint: {
      fontSize: 9,
      color: theme.colors.disabledText,
      lineHeight: 13,
      marginTop: 2,
      maxWidth: "75%",
    },
    dateText: {
      fontSize: 9,
      color: theme.colors.disabledText,
      marginTop: 4,
    },
    // Image positioned as sibling of card, bleeds 20px above
    imageWrap: {
      position: "absolute",
      right: -20,
      top: -9,
      width: 150,
      height: 155,
      zIndex: 2,
    },
    image: {
      width: 120,
      height: 125,
    },
    // Lock overlay covers entire card
    lockOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      overflow: "hidden",
    },
    lockLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: 12,
    },
    lockTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textPrimary,
      marginBottom: 2,
    },
    lockSub: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      lineHeight: 14,
    },
    upgradeBtn: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      flexShrink: 0,
    },
    upgradeBtnText: {
      fontSize: 12,
      fontWeight: "600",
    },
  });
