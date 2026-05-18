import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
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
import { addPlant, getPlantsByUserId, updatePlant } from "../../services/plantService";
import { getUserById } from "../../services/userService";
import { AppTheme, useTheme } from "../../theme/desingSystem";
import { PlantaCompletaInterface, SaludPlanta } from "../../types-dtos/plant.types";
import { createMisPlantasStyles } from "./MisPlants.styles";
import { useAuth } from "../../context/AuthContext";
import { useSync } from "../../context/SyncContext";
import { useConnectivity } from "../../context/ConnectivityContext";
import UserPlantDetailModal from "../../components/UserPlantDetailModal";

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
  styles: ReturnType<typeof createMisPlantasStyles>;
  theme: AppTheme;
  onPress: () => void;
};

function PlantCard({ planta, styles, theme, onPress }: PlantCardProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.plantCard, animStyle]}>
      <Pressable
        style={{ flex: 1 }}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1.0,  { damping: 15, stiffness: 300 }); }}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: planta.imagen }} style={styles.plantImage} resizeMode="cover" />
          <View style={styles.plantChip}>
            <Text style={styles.plantChipText}>{planta.categoria}</Text>
          </View>

          {planta.isPending && (
            <View style={styles.pendingBadge}>
              <Ionicons name="cloud-upload-outline" size={10} color="#FFFFFF" />
              <Text style={styles.pendingText}>Pendiente</Text>
            </View>
          )}
        </View>

        <View style={styles.plantInfoContainer}>
          <Text style={styles.plantName} numberOfLines={1}>{planta.nombre}</Text>
          <View style={styles.waterRow}>
            <View style={[styles.healthDot, { backgroundColor: healthColor(planta.salud, theme) }]} />
            <Ionicons name="water" size={11} color="#4ade80" />
            <Text style={styles.waterText}>
              {planta.proximoRiego < 0
                ? `${Math.abs(planta.proximoRiego)}d retraso`
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
      const nueva = await addPlant({ userId, ...data });
      setPlantas((prev) => [...prev, nueva]);
      showToast("success", "Planta agregada correctamente");
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
              <View style={styles.emptyContainer}>
                <Ionicons name="leaf-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  {searchQuery ? "No se encontraron plantas" : "Aún no tienes plantas"}
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
