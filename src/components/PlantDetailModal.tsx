import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { FeaturedPlant } from "../data/featuredPlants";
import WorldMap from "./WorldMap";
import { AppTheme, useTheme } from "../theme/desingSystem";

interface PlantDetailModalProps {
  visible: boolean;
  onClose: () => void;
  plant: FeaturedPlant | null;
}

const { height: screenHeight } = Dimensions.get("window");

export default function PlantDetailModal({ visible, onClose, plant }: PlantDetailModalProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  // Track ScrollY for Parallax and 3D Pop Out Folding Effect
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      fadeAnim.setValue(0);
      slideAnim.setValue(screenHeight);
      scrollY.setValue(0); // Reset scroll offset

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, scrollY]);

  const animateClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 280,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
    ]).start(() => {
      setShowModal(false);
      onClose();
    });
  }, [fadeAnim, slideAnim, onClose]);

  if (!plant) return null;

  const customScale = plant.modalImageScale ?? 1;
  const customTranslateY = plant.modalImageTranslateY ?? 0;

  // 1. ANIME: Wrapper position and height to make it "fold" inside the card when scrolling
  const heroTop = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [-40, 0],
    extrapolate: "clamp",
  });

  const heroHeight = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [320, 280],
    extrapolate: "clamp",
  });

  // 2. ANIME: Image translation inside the wrapper to scroll at 1:1 speed after folding
  const baseTranslateY = scrollY.interpolate({
    inputRange: [0, 40, 280],
    outputRange: [0, 0, -240],
    extrapolate: "clamp",
  });
  const imageTranslateY = Animated.add(baseTranslateY, new Animated.Value(customTranslateY));

  // 3. ANIME: Scale on pull-down elastic bounce
  const baseScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.15, 1],
    extrapolateRight: "clamp",
  });
  const imageScale = Animated.multiply(baseScale, new Animated.Value(customScale));

  // 4. ANIME: Fade out hero container when scrolled past the viewport to avoid rounded border sub-pixel bleed
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 200, 240],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });

  // Helper mappings for STATS
  const getLightLabel = (val: string) => {
    if (val === "low") return "Sombra";
    if (val === "medium") return "Indirecta";
    return "Directa";
  };

  const getWaterLabel = (val: string) => {
    if (val === "low") return "Poco";
    if (val === "medium") return "Moderado";
    return "Frecuente";
  };

  const getHumidityLabel = (val: string) => {
    if (val === "low") return "Baja";
    if (val === "medium") return "Media";
    return "Alta";
  };

  return (
    <Modal
      transparent
      visible={showModal}
      animationType="none"
      onRequestClose={animateClose}
      statusBarTranslucent
    >
      <View style={styles.mainOverlay}>
        {/* Backdrop overlay */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.backdropPressable}
            activeOpacity={1}
            onPress={animateClose}
          />
        </Animated.View>

        {/* Bottom sheet container */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* 3D POP-OUT HERO CONTAINER (Rendered absolutely behind the ScrollView) */}
          <Animated.View
            style={[
              styles.heroContainer,
              {
                top: heroTop,
                height: heroHeight,
                opacity: heroOpacity,
              },
            ]}
          >
            <Animated.Image
              source={plant.image}
              style={[
                styles.heroImage,
                {
                  transform: [{ translateY: imageTranslateY }, { scale: imageScale }],
                },
              ]}
              resizeMode="contain"
            />
            
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.55)"]}
              style={styles.heroGradient}
            />
          </Animated.View>

          {/* SCROLLVIEW RENDERED ABOVE THE HERO */}
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false } // Required to animate top & height properties on scroll
            )}
          >
            {/* HERO PLACEHOLDER & TEXTS */}
            <View style={styles.heroPlaceholder}>
              <View style={styles.heroTextContainer}>
                <Text style={[styles.latinName, { color: "rgba(255,255,255,0.85)", textShadowColor: "rgba(0,0,0,0.6)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }]}>{plant.latinName}</Text>
                <Text style={[styles.plantName, { color: "#FFFFFF", textShadowColor: "rgba(0,0,0,0.6)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }]}>{plant.name}</Text>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={animateClose}>
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>

            {/* MAIN SOLID CONTENT WRAPPER */}
            <View style={styles.mainContentContainer}>
              {/* SECTION 2 — QUICK STATS ROW */}
              <View style={styles.statsRow}>
                {/* Light Pill */}
                <View style={styles.statPill}>
                  <Ionicons name="sunny-outline" size={22} color="#fbbf24" />
                  <Text style={styles.statValue}>{getLightLabel(plant.light)}</Text>
                  <Text style={styles.statLabel}>Luz</Text>
                </View>

                {/* Water Pill */}
                <View style={styles.statPill}>
                  <Ionicons name="water-outline" size={22} color="#60a5fa" />
                  <Text style={styles.statValue}>{getWaterLabel(plant.water)}</Text>
                  <Text style={styles.statLabel}>Riego</Text>
                </View>

                {/* Humidity Pill */}
                <View style={styles.statPill}>
                  <Ionicons name="leaf-outline" size={22} color="#4ade80" />
                  <Text style={styles.statValue}>{getHumidityLabel(plant.humidity)}</Text>
                  <Text style={styles.statLabel}>Humedad</Text>
                </View>

                {/* Difficulty Pill */}
                <View style={styles.statPill}>
                  <Ionicons name="stats-chart-outline" size={22} color="#a78bfa" />
                  <Text style={[styles.statValue, { textTransform: "capitalize" }]}>
                    {plant.difficulty}
                  </Text>
                  <Text style={styles.statLabel}>Dificultad</Text>
                </View>
              </View>

              {/* SECTION 3 — ABOUT */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Sobre esta planta</Text>
                <Text style={styles.aboutDescription}>{plant.description}</Text>
                
                <View style={styles.funFactCard}>
                  <Text style={styles.funFactTitle}>✦ Dato curioso</Text>
                  <Text style={styles.funFactText}>{plant.funFact}</Text>
                </View>
              </View>

              {/* SECTION 4 — CARE GUIDE */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Guía de cuidados</Text>
                {plant.careGuide.map((tip, index) => (
                  <View key={`tip-${index}`} style={styles.tipRow}>
                    <View style={styles.tipDot} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              {/* SECTION 5 — TAXONOMY */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Taxonomía</Text>
                
                <View style={styles.taxonomyRow}>
                  <Text style={styles.taxonomyLabel}>Familia</Text>
                  <Text style={styles.taxonomyValue}>{plant.family}</Text>
                </View>
                
                <View style={styles.taxonomyRow}>
                  <Text style={styles.taxonomyLabel}>Origen</Text>
                  <Text style={styles.taxonomyValue}>{plant.origin}</Text>
                </View>
                
                <View style={styles.taxonomyRow}>
                  <Text style={styles.taxonomyLabel}>Clima</Text>
                  <Text style={styles.taxonomyValue}>{plant.climate}</Text>
                </View>

                <View style={styles.taxonomyRow}>
                  <Text style={styles.taxonomyLabel}>Altura máxima</Text>
                  <Text style={styles.taxonomyValue}>{plant.maxHeight}</Text>
                </View>

                <View style={styles.taxonomyRow}>
                  <Text style={styles.taxonomyLabel}>Floración</Text>
                  <Text style={styles.taxonomyValue}>{plant.bloomSeason}</Text>
                </View>
              </View>

              {/* SECTION 6 — WORLD MAP */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Dónde crece naturalmente</Text>
                <WorldMap countryCodes={plant.countryCodes} />
              </View>

              {/* SECTION 7 — ADDITIONAL INFO ROW */}
              <View style={[styles.sectionContainer, styles.additionalInfoRow]}>
                {/* Left Card - Max Height */}
                <View style={styles.infoCard}>
                  <Ionicons name="arrow-up-outline" size={20} color="#4ade80" />
                  <Text style={styles.infoCardValue}>{plant.maxHeight}</Text>
                  <Text style={styles.infoCardLabel}>Altura máxima</Text>
                </View>

                {/* Right Card - Bloom Season */}
                <View style={styles.infoCard}>
                  <Ionicons name="flower-outline" size={20} color="#fbbf24" />
                  <Text style={[styles.infoCardValue, { fontSize: 16 }]}>{plant.bloomSeason}</Text>
                  <Text style={styles.infoCardLabel}>Floración</Text>
                </View>
              </View>
            </View>
          </Animated.ScrollView>

          {/* BOTTOM CTA */}
          <View style={styles.bottomCtaContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.ctaButton, Platform.OS === "android" ? styles.androidShadow : styles.iosShadow]}
              onPress={() => console.log("add plant — connect to addPlant logic later")}
            >
              <Text style={styles.ctaButtonText}>Agregar a mis plantas</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  mainOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  backdropPressable: {
    flex: 1,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "88%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "visible", // Enable overflow so 3D image can pop out of the top!
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginTop: 12,
    alignSelf: "center",
    zIndex: 100, // Stay on top of absolutely positioned items
  },
  scrollView: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden", // Force content to clip at the card border when scrolling!
    backgroundColor: "transparent",
    zIndex: 5,
  },
  scrollContent: {
    paddingBottom: 120, // Keep space for the fixed CTA button at the bottom
  },
  // HERO SECTION
  heroContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    overflow: "hidden",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: 1,
  },
  heroImage: {
    width: "100%",
    height: 320,
    resizeMode: "contain",
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  heroPlaceholder: {
    height: 240, // Height matching visible image area inside bottomSheet initially
    position: "relative",
  },
  heroTextContainer: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
  },
  latinName: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  plantName: {
    fontSize: 28,
    fontWeight: "300",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
    padding: 8,
    zIndex: 50,
  },
  mainContentContainer: {
    backgroundColor: theme.colors.background,
    paddingTop: 12,
  },
  // STATS SECTION
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 8,
    gap: 8,
  },
  statPill: {
    flex: 1,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.textPrimary,
    marginTop: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  // CORE SECTIONS
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },
  aboutDescription: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  funFactCard: {
    backgroundColor: theme.colors.successDim,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  funFactTitle: {
    fontSize: 11,
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: 6,
    fontWeight: "600",
  },
  funFactText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  // CARE GUIDE ROW
  tipRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: 10,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  // TAXONOMY ROW
  taxonomyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  taxonomyLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  taxonomyValue: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  // ADDITIONAL INFO CARDS
  additionalInfoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 16,
    flex: 1,
  },
  infoCardValue: {
    fontSize: 20,
    fontWeight: "300",
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  infoCardLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  // BOTTOM CTA CONTAINER
  bottomCtaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
    zIndex: 10,
  },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    height: 52,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  ctaButtonText: {
    color: theme.colors.textOnAccent,
    fontSize: 16,
    fontWeight: "600",
  },
  androidShadow: {
    elevation: 6,
  },
  iosShadow: {
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
});
