import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { featuredPlants, FeaturedPlant } from "../data/featuredPlants";
import { AppTheme, useTheme } from "../theme/desingSystem";
import { PlantaCompletaInterface } from "../types-dtos/plant.types";

interface SearchShortcut {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  bg: string;
}

const SHORTCUTS: SearchShortcut[] = [
  {
    id: "plants",
    label: "Mis Plantas",
    icon: "leaf",
    route: "/(app)/(tabs)/plants",
    color: "#4ADE80",
    bg: "rgba(74,222,128,0.12)",
  },
  {
    id: "camera",
    label: "Identificar",
    icon: "camera",
    route: "/(app)/camera",
    color: "#60A5FA",
    bg: "rgba(96,165,250,0.12)",
  },
  {
    id: "assistant",
    label: "Asistente IA",
    icon: "chatbubble-ellipses",
    route: "/(app)/(tabs)/asistente",
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.12)",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: "storefront",
    route: "/(app)/marketplace",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
  },
  {
    id: "home",
    label: "Inicio",
    icon: "home",
    route: "/(app)/(tabs)/home",
    color: "#34D399",
    bg: "rgba(52,211,153,0.12)",
  },
  {
    id: "profile",
    label: "Perfil",
    icon: "person",
    route: "/(app)/(tabs)/profile",
    color: "#FB923C",
    bg: "rgba(251,146,60,0.12)",
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  userPlants: PlantaCompletaInterface[];
  onSelectUserPlant: (id: string) => void;
  onSelectFeaturedPlant: (plant: FeaturedPlant) => void;
}

export default function SearchModal({
  visible,
  onClose,
  userPlants,
  onSelectUserPlant,
  onSelectFeaturedPlant,
}: Props) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setQuery("");
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start(() => {
        inputRef.current?.focus();
      });
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      slideAnim.setValue(-20);
    }
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleShortcut = (shortcut: SearchShortcut) => {
    handleClose();
    setTimeout(() => {
      router.push(shortcut.route as any);
    }, 150);
  };

  const handleUserPlant = (id: string) => {
    handleClose();
    setTimeout(() => onSelectUserPlant(id), 150);
  };

  const handleFeaturedPlant = (plant: FeaturedPlant) => {
    handleClose();
    setTimeout(() => onSelectFeaturedPlant(plant), 150);
  };

  const trimmed = query.trim().toLowerCase();

  const matchedUserPlants = trimmed
    ? userPlants.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(trimmed) ||
          p.categoria?.toLowerCase().includes(trimmed)
      )
    : [];

  const matchedFeatured = trimmed
    ? featuredPlants.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.latinName.toLowerCase().includes(trimmed) ||
          p.family.toLowerCase().includes(trimmed)
      )
    : [];

  const hasResults = matchedUserPlants.length > 0 || matchedFeatured.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <BlurView
          intensity={theme.mode === "dark" ? 60 : 80}
          tint={theme.mode === "dark" ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons
              name="search"
              size={17}
              color={theme.colors.textSecondary}
              style={{ marginRight: 8 }}
            />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Buscar plantas, secciones..."
              placeholderTextColor={theme.colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={17} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.results}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {!trimmed ? (
            /* ── Shortcuts grid ── */
            <View>
              <Text style={styles.sectionLabel}>Accesos rápidos</Text>
              <View style={styles.shortcutsGrid}>
                {SHORTCUTS.map((shortcut) => (
                  <TouchableOpacity
                    key={shortcut.id}
                    style={[styles.shortcutTile, { backgroundColor: shortcut.bg, borderColor: shortcut.color + "30" }]}
                    onPress={() => handleShortcut(shortcut)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.shortcutIconBg, { backgroundColor: shortcut.color + "22" }]}>
                      <Ionicons name={shortcut.icon} size={20} color={shortcut.color} />
                    </View>
                    <Text style={[styles.shortcutLabel, { color: theme.colors.textPrimary }]}>
                      {shortcut.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : hasResults ? (
            /* ── Search results ── */
            <View>
              {matchedUserPlants.length > 0 && (
                <View>
                  <Text style={styles.sectionLabel}>Mis Plantas</Text>
                  {matchedUserPlants.map((plant) => (
                    <TouchableOpacity
                      key={plant.id}
                      style={styles.resultRow}
                      onPress={() => handleUserPlant(plant.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.resultIconBg}>
                        <Ionicons name="leaf" size={16} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultTitle} numberOfLines={1}>
                          {plant.nombre}
                        </Text>
                        {plant.categoria ? (
                          <Text style={styles.resultSub} numberOfLines={1}>
                            {plant.categoria}
                          </Text>
                        ) : null}
                      </View>
                      <Ionicons name="chevron-forward" size={15} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {matchedFeatured.length > 0 && (
                <View style={{ marginTop: matchedUserPlants.length > 0 ? 16 : 0 }}>
                  <Text style={styles.sectionLabel}>Plantas destacadas</Text>
                  {matchedFeatured.map((plant) => (
                    <TouchableOpacity
                      key={plant.id}
                      style={styles.resultRow}
                      onPress={() => handleFeaturedPlant(plant)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.resultIconBg, { backgroundColor: "rgba(74,222,128,0.1)" }]}>
                        <Ionicons name="flower" size={16} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultTitle} numberOfLines={1}>
                          {plant.name}
                        </Text>
                        <Text style={styles.resultSub} numberOfLines={1}>
                          {plant.latinName}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={15} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            /* ── No results ── */
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={36} color={theme.colors.disabledText} />
              <Text style={styles.emptyText}>Sin resultados para "{query}"</Text>
              <Text style={styles.emptySubText}>Intenta con otro nombre o categoría</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        theme.mode === "dark" ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.25)",
    },
    container: {
      marginTop: Platform.OS === "ios" ? 54 : 40,
      marginHorizontal: 12,
      borderRadius: 20,
      backgroundColor:
        theme.mode === "dark" ? "rgba(14,26,18,0.96)" : "rgba(255,255,255,0.97)",
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
      maxHeight: "78%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 16,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 12,
      gap: 10,
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.inputBackground,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 42,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.textPrimary,
      paddingVertical: 0,
    },
    cancelBtn: {
      paddingVertical: 6,
    },
    cancelText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "500",
    },
    results: {
      paddingHorizontal: 14,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 10,
      marginTop: 4,
    },
    shortcutsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    shortcutTile: {
      width: "30.5%",
      borderRadius: 14,
      borderWidth: 1,
      paddingVertical: 14,
      paddingHorizontal: 10,
      alignItems: "center",
      gap: 8,
    },
    shortcutIconBg: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    shortcutLabel: {
      fontSize: 12,
      fontWeight: "500",
      textAlign: "center",
    },
    resultRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 11,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    resultIconBg: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: theme.colors.inputBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    resultTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.textPrimary,
    },
    resultSub: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
      gap: 8,
    },
    emptyText: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    emptySubText: {
      fontSize: 13,
      color: theme.colors.disabledText,
      textAlign: "center",
    },
  });
