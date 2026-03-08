import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Image,
    ImageBackground,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomTabBar from "../../components/bottomTabBar/BottomTabBar";
import { useTheme } from "../../theme/desingSystem";
import { createMisPlantasStyles } from "./MisPlants.styles";

type Planta = {
  id: string;
  nombre: string;
  categoria: string;
  imagen: string;
  ultimoRiego: string;
};

const plantas: Planta[] = [
  {
    id: "1",
    nombre: "Monstera Deliciosa",
    categoria: "Interior",
    imagen:
      "https://images.unsplash.com/photo-1614594895807-d68e0f42a7be?auto=format&fit=crop&w=400&q=80",
    ultimoRiego: "Hoy",
  },
  {
    id: "2",
    nombre: "Cactus Barrel",
    categoria: "Cactus",
    imagen:
      "https://images.unsplash.com/photo-1550679040-a9a6c1de1b68?auto=format&fit=crop&w=400&q=80",
    ultimoRiego: "3d",
  },
  {
    id: "3",
    nombre: "Pothos Dorado",
    categoria: "Interior",
    imagen:
      "https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=400&q=80",
    ultimoRiego: "2d",
  },
  {
    id: "4",
    nombre: "Lavanda",
    categoria: "Aromáticas",
    imagen:
      "https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&w=400&q=80",
    ultimoRiego: "1d",
  },
  {
    id: "5",
    nombre: "Echeveria Rosa",
    categoria: "Suculentas",
    imagen:
      "https://images.unsplash.com/photo-1521044956456-e9e59b239e3e?auto=format&fit=crop&w=400&q=80",
    ultimoRiego: "5d",
  },
  {
    id: "6",
    nombre: "Bambú de Suerte",
    categoria: "Tropicales",
    imagen:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80",
    ultimoRiego: "Hoy",
  },
];

const rachaDias = 27;

export default function MisPlants() {
  const theme = useTheme();
  const styles = createMisPlantasStyles(theme);

  const categorias = [...new Set(plantas.map((p) => p.categoria))];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <ImageBackground
        source={require("../../../assets/images/LogInBackground.png")}
        style={styles.container}
        imageStyle={styles.bgImage}
      >
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

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary bar */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{plantas.length}</Text>
              <Text style={styles.summaryLabel}>Plantas</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{categorias.length}</Text>
              <Text style={styles.summaryLabel}>Categorías</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{rachaDias}d</Text>
              <Text style={styles.summaryLabel}>Racha</Text>
            </View>
          </View>

          {/* Plant grid */}
          <Text style={styles.sectionTitle}>Colección</Text>
          <View style={styles.grid}>
            {plantas.map((planta) => (
              <TouchableOpacity
                key={planta.id}
                style={styles.plantCard}
                activeOpacity={theme.opacity.pressableButton}
              >
                <Image
                  source={{ uri: planta.imagen }}
                  style={styles.plantImage}
                  resizeMode="cover"
                />
                <View style={styles.plantCardBody}>
                  <View style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>{planta.categoria}</Text>
                  </View>
                  <Text style={styles.plantName} numberOfLines={1}>
                    {planta.nombre}
                  </Text>
                  <View style={styles.waterRow}>
                    <Ionicons
                      name="water-outline"
                      size={theme.dimensions.settingsIconSize}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.waterText}>{planta.ultimoRiego}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <BottomTabBar />
      </ImageBackground>
    </SafeAreaView>
  );
}
