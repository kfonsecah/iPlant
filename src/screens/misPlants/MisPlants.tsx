import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme, useTheme } from "../../theme/desingSystem";
import { createMisPlantasStyles } from "./MisPlants.styles";

type Planta = {
  id: string;
  nombre: string;
  categoria: string;
  imagen: string;
  ultimoRiego: string;
  salud: "saludable" | "atención" | "riesgo";
  proximoRiego: number; // days: positive = future, 0 = today, negative = overdue
};

const plantas: Planta[] = [
  {
    id: "1",
    nombre: "Monstera Deliciosa",
    categoria: "Interior",
    imagen: "https://images.unsplash.com/photo-1567173780793-b4f4f43e839c?auto=format&fit=crop&w=500&q=80",
    ultimoRiego: "Hoy",
    salud: "saludable",
    proximoRiego: 3,
  },
  {
    id: "2",
    nombre: "Cactus Barrel",
    categoria: "Cactus",
    imagen: "https://images.unsplash.com/photo-1525498128493-380d1990a112?auto=format&fit=crop&w=500&q=80",
    ultimoRiego: "3d",
    salud: "atención",
    proximoRiego: 0,
  },
  {
    id: "3",
    nombre: "Pothos Dorado",
    categoria: "Interior",
    imagen: "https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=500&q=80",
    ultimoRiego: "5d",
    salud: "riesgo",
    proximoRiego: -2,
  },
  {
    id: "4",
    nombre: "Lavanda",
    categoria: "Aromáticas",
    imagen: "https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=500&q=80",
    ultimoRiego: "1d",
    salud: "saludable",
    proximoRiego: 5,
  },
  {
    id: "5",
    nombre: "Echeveria Rosa",
    categoria: "Suculentas",
    imagen: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=500&q=80",
    ultimoRiego: "6d",
    salud: "atención",
    proximoRiego: -1,
  },
  {
    id: "6",
    nombre: "Bambú de Suerte",
    categoria: "Tropicales",
    imagen: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=500&q=80",
    ultimoRiego: "Hoy",
    salud: "saludable",
    proximoRiego: 2,
  },
];

const rachaDias = 27;

function healthColor(salud: Planta["salud"], theme: AppTheme) {
  if (salud === "riesgo") return theme.colors.error;
  if (salud === "atención") return theme.colors.warning;
  return theme.colors.primary;
}

// ─── PlantCard ────────────────────────────────────────────────────────────────

type PlantCardProps = {
  planta: Planta;
  styles: ReturnType<typeof createMisPlantasStyles>;
  theme: AppTheme;
};

function PlantCard({ planta, styles, theme }: PlantCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.plantCard, animStyle]}>
      <Pressable
        className="flex-1"
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 15, stiffness: 300 }); }}
      >
        {/* Imagen a pantalla completa */}
        <Image source={{ uri: planta.imagen }} style={styles.plantImage} resizeMode="cover" />

        {/* Chip de categoría flotante — top left */}
        <View
          className="absolute top-2 left-2 rounded-full flex-row items-center"
          style={styles.plantChip}
        >
          <Text style={styles.plantChipText}>{planta.categoria}</Text>
        </View>

        {/* Overlay con nombre y riego en la parte inferior */}
        <View className="absolute bottom-0 left-0 right-0" style={styles.plantCardOverlay}>
          <Text style={styles.plantName} numberOfLines={1}>{planta.nombre}</Text>
          <View style={styles.waterRow}>
            <View style={[styles.healthDot, { backgroundColor: healthColor(planta.salud, theme) }]} />
            <Ionicons name="water" size={11} color={theme.colors.primary} />
            <Text style={styles.waterText}>
              {planta.proximoRiego < 0
                ? `${Math.abs(planta.proximoRiego)}d de retraso`
                : planta.proximoRiego === 0
                ? "Regar hoy"
                : `En ${planta.proximoRiego}d`}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── MisPlants ────────────────────────────────────────────────────────────────

export default function MisPlants() {
  const theme = useTheme();
  const styles = createMisPlantasStyles(theme);

  const categorias = [...new Set(plantas.map((p) => p.categoria))];
  const alertPlantas = plantas.filter((p) => p.salud !== "saludable");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <ImageBackground
        source={require("../../../assets/images/LogInBackground.png")}
        style={styles.container}
        imageStyle={styles.bgImage}
      >
        {/* Header con entrada desde arriba */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mis Plantas</Text>
            <View style={styles.filterBtn}>
              <Ionicons
                name="options-outline"
                size={theme.dimensions.settingsIconSize}
                color={theme.colors.textPrimary}
              />
            </View>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary bar con entrada desde abajo */}
          <Animated.View entering={FadeInUp.delay(120).duration(400)}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Ionicons name="leaf" size={18} color={theme.colors.primary} />
                <Text style={styles.summaryValue}>{plantas.length}</Text>
                <Text style={styles.summaryLabel}>Plantas</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="apps" size={18} color={theme.colors.primary} />
                <Text style={styles.summaryValue}>{categorias.length}</Text>
                <Text style={styles.summaryLabel}>Categorías</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="flame" size={18} color={theme.colors.primary} />
                <Text style={styles.summaryValue}>{rachaDias}d</Text>
                <Text style={styles.summaryLabel}>Racha</Text>
              </View>
            </View>
          </Animated.View>

          {/* Alert de plantas que necesitan atención */}
          {alertPlantas.length > 0 && (
            <Animated.View entering={FadeInDown.delay(170).duration(400)}>
              <View style={styles.alertBanner}>
                <View style={styles.alertHeader}>
                  <Ionicons name="warning" size={14} color={theme.colors.warning} />
                  <Text style={styles.alertTitle}>
                    {alertPlantas.length} {alertPlantas.length === 1 ? "planta necesita" : "plantas necesitan"} atención
                  </Text>
                </View>
                {alertPlantas.map((p) => (
                  <View key={p.id} style={styles.alertItem}>
                    <View style={[styles.healthDot, { backgroundColor: healthColor(p.salud, theme) }]} />
                    <Text style={styles.alertPlantName} numberOfLines={1}>{p.nombre}</Text>
                    <Text style={styles.alertWaterText}>
                      {p.proximoRiego < 0 ? `${Math.abs(p.proximoRiego)}d de retraso` : "Regar hoy"}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Título de sección */}
          <Animated.View entering={FadeInDown.delay(220).duration(400)}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionTitle}>Colección</Text>
            </View>
          </Animated.View>

          {/* Grilla de plantas con entrada suave */}
          <Animated.View style={styles.grid} entering={FadeInUp.delay(300).duration(500)}>
            {plantas.map((planta) => (
              <PlantCard
                key={planta.id}
                planta={planta}
                styles={styles}
                theme={theme}
              />
            ))}
          </Animated.View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}
