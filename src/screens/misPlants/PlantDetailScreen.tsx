import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  TouchableOpacity, 
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/desingSystem';
import { updatePlant, getPlantById, deletePlant } from '../../services/plantService';
import { useAuth } from '../../context/AuthContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { PlantaCompletaInterface } from '../../types-dtos/plant.types';
import ConfidenceBadge from '../../components/ui/confidenceBadge/ConfidenceBadge';
import WorldMap from '../../components/WorldMap';
import * as Speech from 'expo-speech';
import AppInput from '../../components/ui/appInput/AppInput';
import WateringFrequencyPicker from '../../components/ui/wateringFrequencyPicker/WateringFrequencyPicker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
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

  // Track ScrollY for Parallax and 3D Pop Out Folding Effect
  const scrollY = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function loadPlant() {
      if (!user || !id) return;
      try {
        const data = await getPlantById(user.uid, id as string, isConnected);
        setPlant(data);
        if (data) {
          setEditName(data.nombre);
          setEditCategory(data.categoria);
          setEditFreq(data.proximoRiego);
        }
      } catch (error) {
        console.error("Error loading plant details:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPlant();
  }, [id, user, isConnected]);

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
            if (!user || !id) return;
            try {
              await deletePlant(user.uid, id as string, isConnected);
              router.back();
            } catch (error) {
              console.error("Error deleting plant:", error);
              Alert.alert("Error", "No se pudo eliminar la planta.");
            }
          }
        }
      ]
    );
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

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#0A0A0A' }]}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: '#0A0A0A' }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#f87171" />
        <Text style={[styles.errorText, { color: '#FFFFFF' }]}>No se encontró la planta</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ color: '#4ade80' }}>Volver a mis plantas</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
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

      {/* Floating Header Actions */}
      <View style={[styles.topActions, { top: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="white" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity 
            style={styles.editHeaderButton} 
            onPress={() => setShowEdit(true)}
          >
            <Ionicons name="create-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Speech Narration FAB */}
      <Animated.View 
        style={[
          styles.narrateFab, 
          { 
            backgroundColor: isSpeaking ? "rgba(255,255,255,0.08)" : "#4ade80",
            bottom: insets.bottom + 20,
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
            size={24} 
            color={isSpeaking ? "#4ade80" : "#000"} 
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Main scrollable view structured exactly like the featured modal */}
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
              <Ionicons name="sunny-outline" size={20} color="#fbbf24" />
              <Text style={styles.statValue}>{getLightLabel(plant.sunlight)}</Text>
              <Text style={styles.statLabel}>Luz</Text>
            </View>

            {/* Water Pill */}
            <View style={styles.statPill}>
              <Ionicons name="water-outline" size={20} color="#60a5fa" />
              <Text style={styles.statValue}>{getWaterValueLabel(plant.proximoRiego)}</Text>
              <Text style={styles.statLabel}>Riego</Text>
            </View>

            {/* Freq Pill */}
            <View style={styles.statPill}>
              <Ionicons name="calendar-outline" size={20} color="#4ade80" />
              <Text style={styles.statValue}>Cada {plant.proximoRiego}d</Text>
              <Text style={styles.statLabel}>Frecuencia</Text>
            </View>

            {/* Category Pill */}
            <View style={styles.statPill}>
              <Ionicons name="leaf-outline" size={20} color="#a78bfa" />
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
            
            {plant.taxonomy?.family && (
              <View style={styles.taxonomyRow}>
                <Text style={styles.taxonomyLabel}>Familia</Text>
                <Text style={styles.taxonomyValue}>{plant.taxonomy.family}</Text>
              </View>
            )}

            {plant.wateringDetails?.max && (
              <View style={styles.taxonomyRow}>
                <Text style={styles.taxonomyLabel}>Cantidad de Agua</Text>
                <Text style={styles.taxonomyValue}>{plant.wateringDetails.max}</Text>
              </View>
            )}
          </View>

          {/* WORLD MAP (If country codes exist) */}
          {plant.countryCodes && plant.countryCodes.length > 0 ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Dónde crece naturalmente</Text>
              <WorldMap countryCodes={plant.countryCodes} />
            </View>
          ) : null}

          {/* WIKIPEDIA EXTRACT (If botani details exist) */}
          {plant.wikiExtract ? (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Información Botánica</Text>
              <Text style={styles.aboutDescription}>{plant.wikiExtract}</Text>
            </View>
          ) : null}
        </View>
      </Animated.ScrollView>

      {/* Edit Modal */}
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
                if (!plant || !id) return;
                setIsSaving(true);
                try {
                  await updatePlant(id as string, {
                    nombre: editName,
                    categoria: editCategory,
                    proximoRiego: editFreq
                  });
                  setPlant({ ...plant, nombre: editName, categoria: editCategory, proximoRiego: editFreq });
                  setShowEdit(false);
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  backBtn: {
    padding: 12,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
    zIndex: 5,
  },
  scrollContent: {
    paddingBottom: 120, // Space for floating buttons/tabbar
  },
  // HERO 3D SYSTEM
  heroContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
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
    height: 240, // Height matching visible image area
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(248, 113, 113, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.15)",
  },
  editHeaderButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  // FAB SPEECH
  narrateFab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
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
