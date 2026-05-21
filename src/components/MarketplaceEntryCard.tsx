import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme/desingSystem";

export default function MarketplaceEntryCard() {
  const theme = useTheme();
  const router = useRouter();
  const pulse = useRef(new Animated.Value(1)).current;

  const isDark = theme.mode === "dark";
  const cardBg = isDark ? "#0a0a0a" : "#ffffff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const titleColor = isDark ? "#ffffff" : "#1a1a1a";
  const subtitleColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const gradientFrom = isDark ? "#0a0a0a" : "#ffffff";
  const gradientTransparent = isDark ? "rgba(10,10,10,0)" : "rgba(255,255,255,0)";
  const image = isDark
    ? require("../../assets/images/marketplacedark.png")
    : require("../../assets/images/marketplacelight.png");

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push("/marketplace")}
      style={[styles.card, { backgroundColor: cardBg, borderColor }]}
    >
      <View style={styles.imageWrap} pointerEvents="none">
        <Image source={image} style={styles.stallImage} resizeMode="contain" />
      </View>

      <LinearGradient
        colors={[gradientFrom, gradientFrom, gradientFrom, gradientTransparent]}
        locations={[0, 0.45, 0.65, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
        pointerEvents="none"
      />

      <View style={styles.content}>
        <View style={styles.liveRow}>
          <Animated.View style={[styles.dot, { opacity: pulse }]} />
          <Text style={styles.liveLabel}>Marketplace</Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={[styles.titleLight, { color: titleColor }]}>Plantas y</Text>
          <Text style={[styles.titleBold, { color: titleColor }]}>tiendas cerca</Text>
        </View>

        <Text style={[styles.subtitle, { color: subtitleColor }]}>Explorar mercado →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    height: 130,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageWrap: {
    position: "absolute",
    right: -8,
    bottom: -8,
    width: 160,
    height: 148,
  },
  stallImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "75%",
    zIndex: 1,
  },
  content: {
    padding: 20,
    justifyContent: "center",
    flex: 1,
    zIndex: 2,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
  },
  liveLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#4ade80",
  },
  titleBlock: {
    marginTop: 6,
  },
  titleLight: {
    fontSize: 18,
    fontWeight: "300",
    lineHeight: 22,
  },
  titleBold: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
});
