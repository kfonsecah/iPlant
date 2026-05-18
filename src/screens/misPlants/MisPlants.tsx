import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { z } from "zod";
import { useRouter } from "expo-router";
import AppInput from "../../components/ui/appInput/AppInput";
import Toast, { ToastType } from "../../components/ui/toast/Toast";
import WateringFrequencyPicker from "../../components/ui/wateringFrequencyPicker/WateringFrequencyPicker";
import { addPlant, getPlantsByUserId, updatePlant, enrichPlant } from "../../services/plantService";
import { getUserById } from "../../services/userService";
import { AppTheme, useTheme } from "../../theme/desingSystem";
import { PlantaCompletaInterface, SaludPlanta } from "../../types-dtos/plant.types";
import { createMisPlantasStyles } from "./MisPlants.styles";
import { useAuth } from "../../context/AuthContext";
import { useSync } from "../../context/SyncContext";
import { useConnectivity } from "../../context/ConnectivityContext";
import UserPlantDetailModal from "../../components/UserPlantDetailModal";
import WateringCard from "../../components/WateringCard";

const CATEGORIAS = ["Suculenta", "Tropical", "Frutales", "Ornamental", "Aromática"];
const SALUD_OPTS: { value: SaludPlanta; label: string }[] = [
  { value: "saludable", label: "Saludable" },
  { value: "atención",  label: "Atención"  },
  { value: "riesgo",    label: "Riesgo"    },
];

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const editPlantSchema = z.object({
  nombre:       z.string().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
  categoria:    z.string().min(1, "Selecciona una categoría"),
  salud:        z.enum(["saludable", "atención", "riesgo"]),
  proximoRiego: z.number().min(1, "Selecciona la frecuencia"),
});

type EditPlantForm = z.infer<typeof editPlantSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function healthColor(salud: SaludPlanta, theme: AppTheme) {
  if (salud === "riesgo") return theme.colors.error;
  if (salud === "atención") return theme.colors.warning;
  return theme.colors.primary;
}

// ─── PlantCard ────────────────────────────────────────────────────────────────

type PlantCardProps = {
  planta: PlantaCompletaInterface;
  styles?: ReturnType<typeof createMisPlantasStyles>;
  theme?: AppTheme;
  onPress: () => void;
};

function PlantCard({ planta, onPress }: PlantCardProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isOverdue = planta.proximoRiego < 0;
  const isToday = planta.proximoRiego === 0;
  const needsWater = isOverdue || isToday;
  const accentColor = isOverdue ? "#f87171" : "#fbbf24";

  // Urgency logic for Watering Row
  let waterIconColor = "rgba(255, 255, 255, 0.35)";
  let waterTextColor = "rgba(255, 255, 255, 0.4)";
  let waterText = `En ${planta.proximoRiego}d`;

  if (isOverdue) {
    waterIconColor = "#f87171";
    waterTextColor = "#f87171";
    waterText = "Regar ya";
  } else if (isToday) {
    waterIconColor = "#fbbf24";
    waterTextColor = "#fbbf24";
    waterText = "Hoy";
  }

  // Health dot color mapping
  let healthDotColor = "#4ade80"; // saludable
  if (planta.salud === "atención") {
    healthDotColor = "#fbbf24";
  } else if (planta.salud === "riesgo") {
    healthDotColor = "#f87171";
  }

  // Helper for category small icon
  const getCategoryIcon = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes("suculenta")) return "water-outline";
    if (lower.includes("tropical")) return "sunny-outline";
    if (lower.includes("frutal")) return "nutrition-outline";
    if (lower.includes("ornamental")) return "flower-outline";
    if (lower.includes("aromática") || lower.includes("aromatica")) return "leaf-outline";
    return "leaf-outline";
  };

  return (
    <Animated.View
      style={[
        {
          width: "48%",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 12,
          position: "relative",
        },
        animStyle,
      ]}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1.0, { damping: 15, stiffness: 300 });
        }}
      >
        {/* Urgent Watering Accent left border */}
        {needsWater && (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              backgroundColor: accentColor,
              borderTopLeftRadius: 20,
              borderBottomLeftRadius: 20,
              zIndex: 20,
            }}
          />
        )}

        {/* IMAGE CONTAINER */}
        <View
          style={{
            height: 160,
            width: "100%",
            overflow: "hidden",
            backgroundColor: "#0d1f0f",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            position: "relative",
          }}
        >
          {planta.imagen ? (
            <Image
              source={{ uri: planta.imagen }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : null}

          {/* Linear gradient at bottom of image */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={{
              height: 60,
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />

          {/* CATEGORY BADGE */}
          <View
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor: "rgba(0,0,0,0.55)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
              zIndex: 10,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: 0.5,
              }}
            >
              {planta.categoria}
            </Text>
          </View>

          {/* HEALTH DOT */}
          <View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: healthDotColor,
              borderWidth: 1.5,
              borderColor: "rgba(0,0,0,0.4)",
              zIndex: 10,
            }}
          />

          {/* PENDING SYNC BADGE */}
          {planta.isPending && (
            <View
              style={{
                position: "absolute",
                bottom: 8,
                left: 8,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.65)",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                zIndex: 15,
              }}
            >
              <Ionicons name="cloud-upload-outline" size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 9, color: "#FFFFFF", fontWeight: "600" }}>Pendiente</Text>
            </View>
          )}
        </View>

        {/* BOTTOM CONTENT */}
        <View style={{ padding: 12 }}>
          {/* Plant Name */}
          <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "white",
              marginBottom: 6,
            }}
            numberOfLines={1}
          >
            {planta.nombre}
          </Text>

          {/* Watering Row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Ionicons name="water-outline" size={12} color={waterIconColor} />
            <Text style={{ fontSize: 12, color: waterTextColor }}>
              {waterText}
            </Text>
          </View>

          {/* Bottom Row */}
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Ionicons
              name={getCategoryIcon(planta.categoria) as any}
              size={12}
              color="rgba(255,255,255,0.25)"
            />
            <Ionicons
              name="chevron-forward"
              size={12}
              color="rgba(255,255,255,0.2)"
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── EditPlantModal ───────────────────────────────────────────────────────────

function EditPlantModal({
  planta,
  onClose,
  onSaved,
  onError,
}: {
  planta: PlantaCompletaInterface;
  onClose: () => void;
  onSaved: (id: string, data: Partial<PlantaCompletaInterface>) => void;
  onError: (msg: string) => void;
}) {
  const theme = useTheme();
  const styles = createMisPlantasStyles(theme);

  const { control, handleSubmit, formState: { errors }, watch, setValue } =
    useForm<EditPlantForm>({
      resolver: zodResolver(editPlantSchema),
      defaultValues: {
        nombre:       planta.nombre,
        categoria:    planta.categoria,
        salud:        planta.salud,
        proximoRiego: planta.proximoRiego,
      },
    });

  const categoria    = watch("categoria");
  const salud        = watch("salud");
  const proximoRiego = watch("proximoRiego");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (data: EditPlantForm) => {
    setSaving(true);
    try {
      await updatePlant(planta.id, data);
      onSaved(planta.id, data);
      onClose();
    } catch {
      onError("No se pudo guardar. Verifica tu conexión.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "height" : "height"}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalCard}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar planta</Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
                  <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 340 }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={{ gap: theme.scale.lg }}>
                  {/* Nombre */}
                  <Controller
                    control={control}
                    name="nombre"
                    render={({ field: { onChange, value, onBlur } }) => (
                      <AppInput
                        label="Nombre"
                        leftIcon="leaf-outline"
                        onChangeText={onChange}
                        value={value}
                        onBlur={onBlur}
                        error={errors.nombre?.message}
                        autoCapitalize="words"
                      />
                    )}
                  />

                  {/* Categoría */}
                  <View>
                    <Text style={styles.fieldLabel}>Categoría</Text>
                    <View style={styles.chipsRow}>
                      {CATEGORIAS.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.chip, categoria === cat && styles.chipSelected]}
                          onPress={() => setValue("categoria", cat)}
                        >
                          <Text style={[styles.chipText, categoria === cat && styles.chipTextSelected]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {errors.categoria && (
                      <Text style={styles.fieldError}>{errors.categoria.message}</Text>
                    )}
                  </View>

                  {/* Salud */}
                  <View>
                    <Text style={styles.fieldLabel}>Estado de salud</Text>
                    <View style={styles.chipsRow}>
                      {SALUD_OPTS.map((op) => (
                        <TouchableOpacity
                          key={op.value}
                          style={[styles.chip, salud === op.value && styles.chipSelected]}
                          onPress={() => setValue("salud", op.value)}
                        >
                          <View
                            style={{
                              width: 8, height: 8, borderRadius: 4,
                              backgroundColor: salud === op.value
                                ? healthColor(op.value, theme)
                                : theme.colors.border,
                            }}
                          />
                          <Text style={[styles.chipText, salud === op.value && styles.chipTextSelected]}>
                            {op.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Frecuencia de riego — WateringFrequencyPicker */}
                  <WateringFrequencyPicker
                    value={proximoRiego}
                    onChange={(days) => setValue("proximoRiego", days)}
                    error={!!errors.proximoRiego}
                  />
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.7 }]}
                onPress={handleSubmit(onSubmit)}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── AddPlantModal ────────────────────────────────────────────────────────────

function AddPlantModal({
  visible,
  onClose,
  onSave,
  styles,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (planta: Omit<PlantaCompletaInterface, "id" | "userId" | "imagen" | "ultimoRiego" | "salud">) => void;
  styles: ReturnType<typeof createMisPlantasStyles>;
  theme: AppTheme;
}) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [frecuencia, setFrecuencia] = useState<number | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  const nombreError    = hasAttempted && nombre.trim().length < 2;
  const categoriaError = hasAttempted && !categoria;
  const frecuenciaError = hasAttempted && !frecuencia;

  const resetForm = () => {
    setNombre(""); setCategoria(null); setFrecuencia(null); setHasAttempted(false);
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSave = () => {
    setHasAttempted(true);
    if (nombre.trim().length < 2 || !categoria || !frecuencia) return;
    onSave({ nombre: nombre.trim(), categoria, proximoRiego: frecuencia });
    resetForm(); onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalCard}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nueva Planta</Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={handleClose}>
                  <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View>
                <AppInput
                  label="Nombre"
                  leftIcon="leaf-outline"
                  placeholder="Ej. Monstera, Cactus..."
                  value={nombre}
                  onChangeText={setNombre}
                  error={nombreError ? "Ingresa al menos 2 caracteres" : undefined}
                />
              </View>
              <View>
                <Text style={styles.fieldLabel}>Categoría</Text>
                <View style={styles.chipsRow}>
                  {CATEGORIAS.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, categoria === cat && styles.chipSelected]}
                      onPress={() => setCategoria(cat)}
                    >
                      <Text style={[styles.chipText, categoria === cat && styles.chipTextSelected]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {categoriaError && <Text style={styles.fieldError}>Selecciona una categoría</Text>}
              </View>
              <WateringFrequencyPicker value={frecuencia} onChange={setFrecuencia} error={frecuenciaError} />
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
  const theme  = useTheme();
  const styles = createMisPlantasStyles(theme);
  const router = useRouter();
  const { user: authUser } = useAuth();
  const userId = authUser?.uid ?? "";
  const { isSyncing, queueLength } = useSync(); // Get sync status and queue length
  const { isConnected } = useConnectivity(); // Get connectivity status

  const [plantas, setPlantas] = useState<PlantaCompletaInterface[]>([]);
  const [racha, setRacha] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingPlanta, setEditingPlanta] = useState<PlantaCompletaInterface | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; message: string }>({
    visible: false, type: "success", message: "",
  });

  const fetchData = useCallback(async (showLoading = true) => {
    if (!userId) return;
    if (showLoading) setLoading(true);
    try {
      const [plantasData, userData] = await Promise.all([
        getPlantsByUserId(userId, isConnected),
        getUserById(userId),
      ]);
      setPlantas(plantasData);
      if (userData) setRacha(userData.racha);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [userId, isConnected]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Re-fetch when sync status or queue length changes
  useEffect(() => {
    fetchData(false); // Silent refresh
  }, [isSyncing, queueLength, fetchData]);

  const showToast = (type: ToastType, message: string) => setToast({ visible: true, type, message });

  const handleAddPlanta = async (data: Omit<PlantaCompletaInterface, "id" | "userId" | "imagen" | "ultimoRiego" | "salud">) => {
    try {
      let enrichedFields: Partial<PlantaCompletaInterface> = {};
      if (isConnected) {
        try {
          showToast("success", "Generando ficha botánica con IA...");
          const enriched = await enrichPlant(data.nombre);
          if (enriched) {
            enrichedFields = {
              descripcion: enriched.description,
              cuidados: (enriched.careGuide && enriched.careGuide.join("\n")),
              latinName: enriched.latinName,
              taxonomy: {
                family: enriched.family,
              },
              wateringDetails: {
                max: enriched.water === 'high' ? 'Frecuente' : enriched.water === 'medium' ? 'Moderado' : 'Poco',
              },
              sunlight: enriched.light === 'low' ? 'Sombra' : enriched.light === 'medium' ? 'Luz Indirecta' : 'Luz Directa',
              countryCodes: enriched.countryCodes || [],
              commonNames: enriched.commonNames || "",
              origin: enriched.origin || "",
              climate: enriched.climate || "",
              maxHeight: enriched.maxHeight || "",
              bloomSeason: enriched.bloomSeason || "",
              toxicity: enriched.toxicity || "",
            };
          }
        } catch (enrichErr) {
          console.warn("Failed to enrich manual plant:", enrichErr);
        }
      }

      const nueva = await addPlant({ 
        userId, 
        ...data, 
        ...enrichedFields,
        identificadoConIA: true
      });
      setPlantas((prev) => [...prev, nueva]);
      showToast("success", "Planta y ficha botánica guardadas");
    } catch {
      showToast("error", "No se pudo guardar. Verifica tu conexión.");
    }
  };

  const handlePlantSaved = (id: string, data: Partial<PlantaCompletaInterface>) => {
    setPlantas((prev) => prev.map((p) => p.id === id ? { ...p, ...data } : p));
    showToast("success", "Planta actualizada correctamente");
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { alignItems: "center", justifyContent: "center" }]} edges={["top"]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const categorias = [...new Set(plantas.map((p) => p.categoria))];
  const filteredPlantas = plantas.filter(p => 
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.latinName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const alertPlantas = filteredPlantas.filter((p) => p.salud !== "saludable");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <ImageBackground
        source={require("../../../assets/images/LogInBackground.png")}
        style={styles.container}
        imageStyle={styles.bgImage}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Mis Plantas</Text>
            </View>
            <TouchableOpacity style={styles.filterBtn} onPress={() => {/* Toggle Filter Modal */}}>
              <Ionicons name="options-outline" size={theme.dimensions.settingsIconSize} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.regular }]}
              placeholder="Buscar por nombre o especie..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <WateringCard plants={plantas} />

          <Animated.View entering={FadeInUp.delay(120).duration(400)}>
            <View style={styles.summaryCard}>
              {[
                { icon: "leaf",  value: plantas.length,    label: "Plantas"    },
                { icon: "apps",  value: categorias.length, label: "Categorías" },
                { icon: "flame", value: `${racha}d`,       label: "Racha"      },
              ].map((item) => (
                <View key={item.label} style={styles.summaryItem}>
                  <Ionicons name={item.icon as any} size={18} color={theme.colors.primary} />
                  <Text style={styles.summaryValue}>{item.value}</Text>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

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

          <Animated.View entering={FadeInDown.delay(220).duration(400)}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionTitle}>Colección</Text>
            </View>
          </Animated.View>

          <Animated.View style={styles.grid} entering={FadeInUp.delay(300).duration(500)}>
            {filteredPlantas.length > 0 ? (
              filteredPlantas.map((planta) => (
                <PlantCard
                  key={planta.id}
                  planta={planta}
                  styles={styles}
                  theme={theme}
                  onPress={() => {
                    setSelectedPlantId(planta.id);
                    setShowDetailModal(true);
                  }}
                />
              ))
            ) : (
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 80,
                  paddingHorizontal: 20,
                }}
              >
                <Ionicons name="leaf-outline" size={64} color="rgba(255,255,255,0.06)" />
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "300",
                    color: "rgba(255,255,255,0.3)",
                    marginTop: 16,
                    textAlign: "center",
                  }}
                >
                  {searchQuery ? "No se encontraron plantas" : "Tu colección está vacía"}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.2)",
                    marginTop: 6,
                    textAlign: "center",
                  }}
                >
                  {searchQuery ? "Intenta con otra búsqueda" : "Agrega tu primera planta con el botón +"}
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </ImageBackground>

      <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)}>
        <Ionicons name="add" size={28} color={theme.colors.textOnAccent} />
      </TouchableOpacity>

      <AddPlantModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAddPlanta}
        styles={styles}
        theme={theme}
      />

      <UserPlantDetailModal
        visible={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPlantId(null);
        }}
        plantId={selectedPlantId}
        userId={userId}
        onRefresh={() => fetchData(false)}
      />

      {editingPlanta && (
        <EditPlantModal
          planta={editingPlanta}
          onClose={() => setEditingPlanta(null)}
          onSaved={(id, data) => {
            handlePlantSaved(id, data);
            setEditingPlanta(null);
          }}
          onError={(msg) => showToast("error", msg)}
        />
      )}
    </SafeAreaView>
  );
}
