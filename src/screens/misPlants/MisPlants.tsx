import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
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
import WateringFrequencyPicker from "../../components/ui/wateringFrequencyPicker/WateringFrequencyPicker";
import { getPlantsByUserId } from "../../services/plantService";
import { getUserById } from "../../services/userService";
import { AppTheme, useTheme } from "../../theme/desingSystem";
import { PlantaInterface } from "../../types-dtos/plant.types";
import { createMisPlantasStyles } from "./MisPlants.styles";

// ID del usuario activo — se reemplazará con auth real
const CURRENT_USER_ID = "user-1";

const CATEGORIAS = ["Suculenta", "Tropical", "Frutales", "Ornamental", "Aromática"];

function healthColor(salud: PlantaInterface["salud"], theme: AppTheme) {
  if (salud === "riesgo") return theme.colors.error;
  if (salud === "atención") return theme.colors.warning;
  return theme.colors.primary;
}

// ─── PlantCard ────────────────────────────────────────────────────────────────

type PlantCardProps = {
  planta: PlantaInterface;
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
        <Image source={{ uri: planta.imagen }} style={styles.plantImage} resizeMode="cover" />
        <View className="absolute top-2 left-2 rounded-full flex-row items-center" style={styles.plantChip}>
          <Text style={styles.plantChipText}>{planta.categoria}</Text>
        </View>
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

// ─── AddPlantModal ────────────────────────────────────────────────────────────

type AddPlantModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (planta: Omit<PlantaInterface, "id" | "userId" | "imagen" | "ultimoRiego" | "salud">) => void;
  styles: ReturnType<typeof createMisPlantasStyles>;
  theme: AppTheme;
};

function AddPlantModal({ visible, onClose, onSave, styles, theme }: AddPlantModalProps) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [frecuencia, setFrecuencia] = useState<number | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  const nombreError    = hasAttempted && nombre.trim().length < 2;
  const categoriaError = hasAttempted && !categoria;
  const frecuenciaError = hasAttempted && !frecuencia;

  const resetForm = () => {
    setNombre("");
    setCategoria(null);
    setFrecuencia(null);
    setHasAttempted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    setHasAttempted(true);
    if (nombre.trim().length < 2 || !categoria || !frecuencia) return;

    onSave({
      nombre: nombre.trim(),
      categoria,
      proximoRiego: frecuencia,
    });
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalCard}>
              {/* Handle */}
              <View style={styles.modalHandle} />

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nueva Planta</Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={handleClose}>
                  <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Nombre */}
              <View>
                <Text style={styles.fieldLabel}>Nombre</Text>
                <TextInput
                  style={[styles.textInput, nombreError && styles.textInputError]}
                  placeholder="Ej. Monstera, Cactus..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={nombre}
                  onChangeText={setNombre}
                  maxLength={40}
                />
                {nombreError && (
                  <Text style={styles.fieldError}>Ingresa al menos 2 caracteres</Text>
                )}
              </View>

              {/* Categoría */}
              <View>
                <Text style={styles.fieldLabel}>Categoría</Text>
                <View style={[styles.chipsRow, categoriaError && { opacity: 1 }]}>
                  {CATEGORIAS.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, categoria === cat && styles.chipSelected]}
                      onPress={() => setCategoria(cat)}
                    >
                      <Text style={[styles.chipText, categoria === cat && styles.chipTextSelected]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {categoriaError && (
                  <Text style={styles.fieldError}>Selecciona una categoría</Text>
                )}
              </View>

              {/* WateringFrequencyPicker — componente principal de la tarea */}
              <WateringFrequencyPicker
                value={frecuencia}
                onChange={setFrecuencia}
                error={frecuenciaError}
              />

              {/* Botón guardar */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar planta</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── MisPlants ────────────────────────────────────────────────────────────────

export default function MisPlants() {
  const theme = useTheme();
  const styles = createMisPlantasStyles(theme);

  const [plantas, setPlantas] = useState<PlantaInterface[]>([]);
  const [racha, setRacha] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Promise.all([
      getPlantsByUserId(CURRENT_USER_ID),
      getUserById(CURRENT_USER_ID),
    ]).then(([plantasData, userData]) => {
      setPlantas(plantasData);
      if (userData) setRacha(userData.racha);
    }).finally(() => setLoading(false));
  }, []);

  const handleAddPlanta = (data: Omit<PlantaInterface, "id" | "userId" | "imagen" | "ultimoRiego" | "salud">) => {
    const nueva: PlantaInterface = {
      id: `local-${Date.now()}`,
      userId: CURRENT_USER_ID,
      nombre: data.nombre,
      categoria: data.categoria,
      imagen: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
      ultimoRiego: "Hoy",
      salud: "saludable",
      proximoRiego: data.proximoRiego,
    };
    setPlantas((prev) => [...prev, nueva]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { alignItems: "center", justifyContent: "center" }]} edges={["top"]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

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
          {/* Summary */}
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
                <Text style={styles.summaryValue}>{racha}d</Text>
                <Text style={styles.summaryLabel}>Racha</Text>
              </View>
            </View>
          </Animated.View>

          {/* Alertas */}
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

          {/* Título sección */}
          <Animated.View entering={FadeInDown.delay(220).duration(400)}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionTitle}>Colección</Text>
            </View>
          </Animated.View>

          {/* Grilla */}
          <Animated.View style={styles.grid} entering={FadeInUp.delay(300).duration(500)}>
            {plantas.map((planta) => (
              <PlantCard key={planta.id} planta={planta} styles={styles} theme={theme} />
            ))}
          </Animated.View>
        </ScrollView>
      </ImageBackground>

      {/* FAB — Agregar planta */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color={theme.colors.textOnAccent} />
      </TouchableOpacity>

      {/* Modal con el formulario */}
      <AddPlantModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddPlanta}
        styles={styles}
        theme={theme}
      />
    </SafeAreaView>
  );
}
