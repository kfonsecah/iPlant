import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
  Platform,
  ActivityIndicator,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getPlantById, updatePlant, deletePlant, enrichPlant } from "../services/plantService";
import { PlantaCompletaInterface } from "../types-dtos/plant.types";
import { useAuth } from "../context/AuthContext";
import { useConnectivity } from "../context/ConnectivityContext";
import ConfidenceBadge from "./ui/confidenceBadge/ConfidenceBadge";
import WorldMap from "./WorldMap";
import * as Speech from "expo-speech";
import AppInput from "./ui/appInput/AppInput";
import WateringFrequencyPicker from "./ui/wateringFrequencyPicker/WateringFrequencyPicker";
import { useTheme } from "../theme/desingSystem";
import Toast from "./ui/toast/Toast";
import { calcularProximoRiego } from "../utils/wateringUtils";
import { regarPlanta } from "../utils/waterPlant";

const { height: screenHeight } = Dimensions.get("window");

interface UserPlantDetailModalProps {
  visible: boolean;
  onClose: () => void;
  plantId: string | null;
  userId: string | null;
  onRefresh: () => void;
  onDeleteSuccess?: () => void;
}

export default function UserPlantDetailModal({
  visible,
  onClose,
  plantId,
  userId,
  onRefresh,
  onDeleteSuccess,
}: UserPlantDetailModalProps) {
  const theme = useTheme();
  const { isConnected } = useConnectivity();
  
  const [plant, setPlant] = useState<PlantaCompletaInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editFreq, setEditFreq] = useState(7);
  const [isSaving, setIsSaving] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (type: "success" | "error" | "warning", msg: string) => {
    setToastType(type);
    setToastMessage(msg);
    setToastVisible(true);
  };

  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  // Track ScrollY for Parallax and 3D Pop Out Folding Effect
  const scrollY = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Load Plant Details when modal opens or plantId changes
  useEffect(() => {
    async function loadPlant() {
      if (!userId || !plantId) return;
      setLoading(true);
      try {
        const data = await getPlantById(userId, plantId, isConnected);
        setPlant(data);
        if (data) {
          setEditName(data.nombre);
          setEditCategory(data.categoria);
          setEditFreq(data.proximoRiego);

          // Self-healing: if the plant is missing enriched fields and we are online, enrich it now!
          if (isConnected && !data.commonNames) {
            console.log("Self-healing: Enriching missing botanical details for", data.nombre);
            try {
              const enriched = await enrichPlant(data.nombre, data.latinName);
              if (enriched) {
                const enrichedFields = {
                  descripcion: enriched.description || data.descripcion,
                  cuidados: (enriched.careGuide && enriched.careGuide.join("\n")) || data.cuidados,
                  latinName: enriched.latinName || data.latinName,
                  taxonomy: {
                    family: enriched.family || data.taxonomy?.family,
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
                
                // Update local state so it immediately renders
                setPlant(prev => prev ? { ...prev, ...enrichedFields } : null);
                
                // Save to Firestore
                await updatePlant(plantId, enrichedFields);
                console.log("Self-healing: Successfully enriched plant inside detail modal!");
                onRefresh(); // Refresh parent grid too
              }
            } catch (enrichErr) {
              console.warn("Self-healing enrichment failed:", enrichErr);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user plant details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (visible && plantId) {
      loadPlant();
    }
  }, [visible, plantId, userId, isConnected]);

  // Handle slide/fade animations
  useEffect(() => {
    if (visible) {
      setShowModal(true);
      fadeAnim.setValue(0);
      slideAnim.setValue(screenHeight);
      scrollY.setValue(0);

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

  // Audio narration pulse animation
  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSpeaking]);

  const animateClose = useCallback(() => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    }
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
  }, [fadeAnim, slideAnim, onClose, isSpeaking]);

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Planta",
      "¿Estás seguro de que quieres eliminar esta planta de tu jardín?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            if (!userId || !plantId) return;
            try {
              await deletePlant(userId, plantId, isConnected);
              animateClose();
              if (onDeleteSuccess) {
                onDeleteSuccess();
              }
              onRefresh();
            } catch (error) {
              console.error("Error deleting plant:", error);
              Alert.alert("Error", "No se pudo eliminar la planta.");
            }
          }
        }
      ]
    );
  };

  const isWateredToday = (): boolean => {
    if (!plant?.ultimoRiego) return false;
    const ultimo = new Date(plant.ultimoRiego);
    const hoy = new Date();
    return ultimo.toDateString() === hoy.toDateString();
  };

  const handleWatering = async () => {
    if (!plant || !userId) return;
    try {
      const freq = plant.wateringFrequencyDays ?? 7;
      const isToday = isWateredToday();
      if (isToday) return;

      // Immediately update local state for instant UI feedback
      const ahora = new Date().toISOString();
      const updatedPlant = {
        ...plant,
        ultimoRiego: ahora,
        proximoRiego: freq,
        salud: "saludable" as const,
      };
      setPlant(updatedPlant);

      // Call regarPlanta utility (handles cache, Firestore, and SyncQueue!)
      await regarPlanta(plant.id, userId, freq, isConnected);

      showToast("success", "¡Planta regada! 💧");
      onRefresh(); // Refresh parent screen lists
    } catch (error) {
      console.error("Error watering plant:", error);
      showToast("error", "No se pudo registrar el riego.");
    }
  };

  const startNarration = async () => {
    if (!plant) return;
    setIsSpeaking(true);
    
    const name = plant.nombre;
    const description = plant.descripcion || "";
    const watering = plant.cuidados || "No hay instrucciones de riego específicas.";
    const sunlight = plant.sunlight ? `Esta planta prefiere ${plant.sunlight}.` : "";
    
    const textToSpeak = `Información sobre tu ${name}. ${description} Cuidados: ${watering} ${sunlight}`;

    Speech.speak(textToSpeak, {
      language: 'es-ES',
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const toggleNarration = async () => {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking) {
      await Speech.stop();
      setIsSpeaking(false);
    } else {
      await startNarration();
    }
  };

  if (!visible && !showModal) return null;

  // 1. ANIME: Wrapper position and height to make it "fold" inside the card when scrolling
  const heroTop = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [-45, 0],
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

  // 3. ANIME: Scale on pull-down elastic bounce
  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.15, 1],
    extrapolateRight: "clamp",
  });

  // 4. ANIME: Fade out hero container when scrolled past the viewport
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 200, 240],
    outputRange: [1, 1, 0],
    extrapolate: "clamp",
  });

  // Helper mappings for UI stats
  const getLightLabel = (val?: string) => {
    if (!val) return "Media";
    const lower = val.toLowerCase();
    if (lower.includes("sombra") || lower.includes("baja")) return "Sombra";
    if (lower.includes("directa") || lower.includes("plena")) return "Directa";
    return "Indirecta";
  };

  const getWaterValueLabel = (val?: number) => {
    if (val === undefined) return "Moderado";
    if (val <= 3) return "Frecuente";
    if (val >= 10) return "Poco";
    return "Moderado";
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
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#4ade80" />
            </View>
          ) : !plant ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#f87171" />
              <Text style={styles.errorText}>No se pudo cargar la planta</Text>
              <TouchableOpacity style={styles.closeModalBtn} onPress={animateClose}>
                <Text style={{ color: "#4ade80", fontWeight: "600" }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
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
                  source={{ uri: plant.imagen }}
                  style={[
                    styles.heroImage,
                    {
                      transform: [{ translateY: baseTranslateY }, { scale: imageScale }],
                    },
                  ]}
                  resizeMode="cover"
                />
                
                <LinearGradient
                  colors={["transparent", "#0a0a0a"]}
                  style={styles.heroGradient}
                />
              </Animated.View>

              {/* Floating Header Actions inside Bottom Sheet */}
              <View style={styles.topActions}>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={animateClose}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity 
                    style={styles.editHeaderButton} 
                    onPress={() => setShowEdit(true)}
                  >
                    <Ionicons name="create-outline" size={18} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={handleDelete}
                  >
                    <Ionicons name="trash-outline" size={18} color="#f87171" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Floating Speech Narration FAB inside Bottom Sheet */}
              <Animated.View 
                style={[
                  styles.narrateFab, 
                  { 
                    backgroundColor: isSpeaking ? "rgba(255,255,255,0.08)" : "#4ade80",
                    bottom: 24,
                    transform: [{ scale: pulseAnim }],
                    borderColor: isSpeaking ? "rgba(255,255,255,0.15)" : "#4ade80",
                    borderWidth: isSpeaking ? 1 : 0
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.narrateFabContent}
                  onPress={toggleNarration}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={isSpeaking ? "stop" : "volume-high"} 
                    size={22} 
                    color={isSpeaking ? "#4ade80" : "#000"} 
                  />
                </TouchableOpacity>
              </Animated.View>

              {/* Scrollable sheet body */}
              <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: false }
                )}
              >
                {/* HERO PLACEHOLDER & TEXTS */}
                <View style={styles.heroPlaceholder}>
                  <View style={styles.heroTextContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <Text style={styles.latinName}>{plant.latinName || plant.categoria}</Text>
                      {plant.confianza && <ConfidenceBadge confidence={plant.confianza} size="small" />}
                    </View>
                    <Text style={styles.plantName}>{plant.nombre}</Text>
                  </View>
                </View>

                {/* MAIN SOLID CONTENT WRAPPER */}
                <View style={styles.mainContentContainer}>
                  {/* QUICK STATS ROW */}
                  <View style={styles.statsRow}>
                    {/* Light Pill */}
                    <View style={styles.statPill}>
                      <Ionicons name="sunny-outline" size={18} color="#fbbf24" />
                      <Text style={styles.statValue}>{getLightLabel(plant.sunlight)}</Text>
                      <Text style={styles.statLabel}>Luz</Text>
                    </View>

                    {/* Water Pill */}
                    <View style={styles.statPill}>
                      <Ionicons name="water-outline" size={18} color="#60a5fa" />
                      <Text style={styles.statValue}>{getWaterValueLabel(plant.proximoRiego)}</Text>
                      <Text style={styles.statLabel}>Riego</Text>
                    </View>

                    {/* Freq Pill */}
                    <View style={styles.statPill}>
                      <Ionicons name="calendar-outline" size={18} color="#4ade80" />
                      <Text style={styles.statValue}>Cada {plant.proximoRiego}d</Text>
                      <Text style={styles.statLabel}>Frecuencia</Text>
                    </View>

                    {/* Category Pill */}
                    <View style={styles.statPill}>
                      <Ionicons name="leaf-outline" size={18} color="#a78bfa" />
                      <Text style={[styles.statValue, { textTransform: "capitalize" }]}>
                        {plant.categoria || "Jardín"}
                      </Text>
                      <Text style={styles.statLabel}>Categoría</Text>
                    </View>
                  </View>

                  {/* ABOUT SECTION */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Sobre esta planta</Text>
                    <Text style={styles.aboutDescription}>
                      {plant.descripcion || "Esta planta ha sido agregada a tu jardín personalizado de iPlant. Puedes monitorear su riego y cuidados diarios para asegurar su óptimo crecimiento."}
                    </Text>
                  </View>

                  {/* WATERING TRACKING CARD */}
                  {(() => {
                    const freq = plant.wateringFrequencyDays ?? 7;
                    const diasRestantes = plant.ultimoRiego
                      ? calcularProximoRiego(plant.ultimoRiego, freq)
                      : (plant.proximoRiego ?? 0);
                    const isWatered = isWateredToday();

                    return (
                      <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Seguimiento de Riego</Text>
                        <View
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.04)",
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: "rgba(255, 255, 255, 0.08)",
                            padding: 16,
                            position: "relative",
                          }}
                        >
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                              <Ionicons name="water-outline" size={16} color="#60a5fa" />
                              <Text style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.6)" }}>Estado de Riego</Text>
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: "600", color: isWatered ? "#4ade80" : diasRestantes <= 0 ? "#f87171" : "#fbbf24" }}>
                              {isWatered ? "Regada hoy" : diasRestantes < 0 ? `${Math.abs(diasRestantes)}d de retraso` : diasRestantes === 0 ? "Regar hoy" : `En ${diasRestantes} días`}
                            </Text>
                          </View>

                          {/* Progress Bar showing days until next watering */}
                          <View style={{ height: 6, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                            <View
                              style={{
                                height: "100%",
                                width: `${Math.max(0, Math.min(100, (diasRestantes / freq) * 100))}%`,
                                backgroundColor: isWatered ? "#4ade80" : diasRestantes <= 0 ? "#f87171" : "#60a5fa",
                                borderRadius: 3,
                              }}
                            />
                          </View>

                          {/* Action Button */}
                          {(diasRestantes <= 2 || isWatered) ? (
                            <TouchableOpacity
                              disabled={isWatered}
                              onPress={handleWatering}
                              style={{
                                height: 40,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: isWatered ? "rgba(74, 222, 128, 0.2)" : "rgba(96, 165, 250, 0.3)",
                                backgroundColor: isWatered ? "rgba(74, 222, 128, 0.08)" : "rgba(96, 165, 250, 0.15)",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                gap: 6,
                              }}
                            >
                              <Ionicons
                                name={isWatered ? "checkmark-circle" : "water"}
                                size={16}
                                color={isWatered ? "#4ade80" : "#60a5fa"}
                              />
                              <Text style={{ fontSize: 13, fontWeight: "600", color: isWatered ? "#4ade80" : "#60a5fa" }}>
                                {isWatered ? "✓ Regada hoy" : "Regar Planta"}
                              </Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </View>
                    );
                  })()}

                  {/* CARE GUIDE */}
                  {plant.cuidados ? (
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Guía de cuidados</Text>
                      <View style={styles.careCard}>
                        <View style={styles.tipDot} />
                        <Text style={styles.tipText}>{plant.cuidados}</Text>
                      </View>
                    </View>
                  ) : null}

                  {/* COMMON NAMES */}
                  {plant.commonNames ? (
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Nombres comunes por país</Text>
                      <View style={styles.careCard}>
                        <Ionicons name="globe-outline" size={18} color="#4ade80" style={{ marginRight: 8, marginTop: 2 }} />
                        <Text style={styles.tipText}>{plant.commonNames}</Text>
                      </View>
                    </View>
                  ) : null}

                  {/* TOXICITY WARNING */}
                  {plant.toxicity ? (
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Toxicidad y Seguridad</Text>
                      <View style={[styles.careCard, { backgroundColor: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.2)", borderWidth: 1 }]}>
                        <Ionicons name="warning-outline" size={20} color="#F59E0B" style={{ marginRight: 8, marginTop: 2 }} />
                        <Text style={[styles.tipText, { color: "#F59E0B", fontWeight: "500" }]}>{plant.toxicity}</Text>
                      </View>
                    </View>
                  ) : null}

                  {/* TAXONOMY / SPEC DETAILS */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Ficha Técnica</Text>
                    
                    <View style={styles.taxonomyRow}>
                      <Text style={styles.taxonomyLabel}>Categoría</Text>
                      <Text style={styles.taxonomyValue}>{plant.categoria}</Text>
                    </View>
                    
                    <View style={styles.taxonomyRow}>
                      <Text style={styles.taxonomyLabel}>Intervalo de Riego</Text>
                      <Text style={styles.taxonomyValue}>Cada {plant.proximoRiego} días</Text>
                    </View>
                    
                    {plant.taxonomy?.family ? (
                      <View style={styles.taxonomyRow}>
                        <Text style={styles.taxonomyLabel}>Familia</Text>
                        <Text style={styles.taxonomyValue}>{plant.taxonomy.family}</Text>
                      </View>
                    ) : (plant as any).family ? (
                      <View style={styles.taxonomyRow}>
                        <Text style={styles.taxonomyLabel}>Familia</Text>
                        <Text style={styles.taxonomyValue}>{(plant as any).family}</Text>
                      </View>
                    ) : null}

                    {plant.origin ? (
                      <View style={styles.taxonomyRow}>
                        <Text style={styles.taxonomyLabel}>Origen</Text>
                        <Text style={styles.taxonomyValue}>{plant.origin}</Text>
                      </View>
                    ) : null}

                    {plant.climate ? (
                      <View style={styles.taxonomyRow}>
                        <Text style={styles.taxonomyLabel}>Clima</Text>
                        <Text style={styles.taxonomyValue}>{plant.climate}</Text>
                      </View>
                    ) : null}

                    {plant.maxHeight ? (
                      <View style={styles.taxonomyRow}>
                        <Text style={styles.taxonomyLabel}>Altura Máxima</Text>
                        <Text style={styles.taxonomyValue}>{plant.maxHeight}</Text>
                      </View>
                    ) : null}

                    {plant.bloomSeason ? (
                      <View style={styles.taxonomyRow}>
                        <Text style={styles.taxonomyLabel}>Floración</Text>
                        <Text style={styles.taxonomyValue}>{plant.bloomSeason}</Text>
                      </View>
                    ) : null}

                    {plant.wateringDetails?.max && (
                      <View style={styles.taxonomyRow}>
                        <Text style={styles.taxonomyLabel}>Cantidad de Agua</Text>
                        <Text style={styles.taxonomyValue}>{plant.wateringDetails.max}</Text>
                      </View>
                    )}
                  </View>

                  {/* WORLD MAP */}
                  {plant.countryCodes && plant.countryCodes.length > 0 ? (
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Dónde crece naturalmente</Text>
                      <WorldMap countryCodes={plant.countryCodes} />
                    </View>
                  ) : null}

                  {/* WIKIPEDIA EXTRACT */}
                  {plant.wikiExtract ? (
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Información Botánica</Text>
                      <Text style={styles.aboutDescription}>{plant.wikiExtract}</Text>
                    </View>
                  ) : null}
                </View>
              </Animated.ScrollView>
            </>
          )}
        </Animated.View>
      </View>

      {/* Edit Modal (Overlaid on top of detail sheet) */}
      <Modal visible={showEdit} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Planta</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowEdit(false)}>
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <AppInput 
                label="Nombre de la planta"
                value={editName}
                onChangeText={setEditName}
                leftIcon="leaf"
              />
              
              <View style={{ marginTop: 16 }}>
                <Text style={styles.inputLabel}>Categoría</Text>
                <View style={styles.chipsContainer}>
                  {["Suculenta", "Tropical", "Frutales", "Ornamental", "Aromática"].map(cat => (
                    <TouchableOpacity 
                      key={cat} 
                      style={[
                        styles.chip, 
                        editCategory === cat && styles.chipSelected
                      ]}
                      onPress={() => setEditCategory(cat)}
                    >
                      <Text style={[
                        styles.chipText, 
                        { color: editCategory === cat ? "#4ade80" : "rgba(255,255,255,0.4)" }
                      ]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ marginTop: 16 }}>
                <WateringFrequencyPicker 
                  value={editFreq}
                  onChange={setEditFreq}
                />
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.saveBtn}
              disabled={isSaving}
              onPress={async () => {
                if (!plant || !plantId) return;
                setIsSaving(true);
                try {
                  await updatePlant(plantId, {
                    nombre: editName,
                    categoria: editCategory,
                    proximoRiego: editFreq
                  });
                  setPlant({ ...plant, nombre: editName, categoria: editCategory, proximoRiego: editFreq });
                  setShowEdit(false);
                  onRefresh(); // Refresh parent grid immediately
                } catch (e) {
                  Alert.alert("Error", "No se pudo actualizar la planta.");
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              <Text style={styles.saveBtnText}>{isSaving ? "Guardando..." : "Guardar Cambios"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Dynamic Success/Error Toast */}
      <Toast
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        onDismiss={() => setToastVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
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
    backgroundColor: "#0a0a0a",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "visible",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    gap: 16,
    padding: 24,
  },
  errorText: {
    color: "#fff",
    fontSize: 15,
  },
  closeModalBtn: {
    padding: 12,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
    zIndex: 5,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  // HERO 3D SYSTEM
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
    resizeMode: "cover",
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  heroPlaceholder: {
    height: 240,
    position: "relative",
  },
  heroTextContainer: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
  },
  latinName: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.4)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  plantName: {
    fontSize: 26,
    fontWeight: "300",
    color: "white",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  // HEADER ACTIONS
  topActions: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.18)",
  },
  editHeaderButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  // FAB SPEECH
  narrateFab: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  narrateFabContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // SOLID CONTENT WRAPPER
  mainContentContainer: {
    backgroundColor: "#0a0a0a",
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
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "white",
    marginTop: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 9,
    color: "rgba(255, 255, 255, 0.35)",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  // CORE SECTIONS
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(255, 255, 255, 0.35)",
    marginBottom: 10,
  },
  aboutDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.65)",
    lineHeight: 22,
  },
  careCard: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
    marginTop: 7,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.65)",
    lineHeight: 22,
  },
  // TAXONOMY ROW
  taxonomyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  taxonomyLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.35)",
    flexShrink: 0,
  },
  taxonomyValue: {
    fontSize: 13,
    color: "white",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  // MODAL EDIT SYSTEM
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 12,
    gap: 16,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignSelf: "center",
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    maxHeight: 300,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 6,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  chipSelected: {
    backgroundColor: "rgba(74, 222, 128, 0.08)",
    borderColor: "#4ade80",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  saveBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveBtnText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "700",
  },
});
