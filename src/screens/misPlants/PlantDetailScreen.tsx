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
  Modal
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
import { narratePlantCare, stopNarration } from '../../utils/narrationUtils';
import * as Speech from 'expo-speech';
import AppInput from '../../components/ui/appInput/AppInput';
import WateringFrequencyPicker from '../../components/ui/wateringFrequencyPicker/WateringFrequencyPicker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.45;

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

  const scrollY = useRef(new Animated.Value(0)).current;

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

  // Narration with callbacks for UI state sync
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

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT * 0.3],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0],
    outputRange: [1.5, 1],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.textPrimary }]}>No se encontró la planta</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ color: theme.colors.primary }}>Volver a mis plantas</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Animated.View 
        style={[
          styles.header, 
          { 
            height: HEADER_HEIGHT,
            transform: [{ translateY: headerTranslateY }] 
          }
        ]}
      >
        <Animated.View style={{ flex: 1, transform: [{ scale: imageScale }] }}>
          <Image 
            source={{ uri: plant.imagen }} 
            style={styles.image} 
            contentFit="cover"
          />
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent']} style={styles.topGradient} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.bottomGradient} />
        </Animated.View>
      </Animated.View>

      <View style={[styles.topActions, { top: insets.top + 10 }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: 'rgba(255,0,0,0.3)' }]} 
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.editHeaderButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]} 
          onPress={() => setShowEdit(true)}
        >
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Animated.View 
        style={[
          styles.narrateFab, 
          { 
            backgroundColor: isSpeaking ? theme.colors.secondary : theme.colors.primary,
            bottom: insets.bottom + 20,
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.narrateFabContent}
          onPress={toggleNarration}
        >
          <Ionicons 
            name={isSpeaking ? "stop-circle" : "volume-high"} 
            size={28} 
            color="white" 
          />
          {isSpeaking && (
             <View style={styles.speakingIndicator} />
          )}
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 32 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
            styles.sheet, 
            { 
                backgroundColor: theme.colors.background,
                minHeight: SCREEN_HEIGHT - (HEADER_HEIGHT - 32)
            }
        ]}>
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          
          <View style={styles.headerInfo}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.plantName, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold }]}>
                {plant.nombre}
              </Text>
              {plant.latinName && (
                <Text style={[styles.latinName, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium }]}>
                  {plant.latinName}
                </Text>
              )}
            </View>
            {plant.confianza && <ConfidenceBadge confidence={plant.confianza} size="large" />}
          </View>

          <View style={styles.vitalsContainer}>
            <View style={[styles.vitalItem, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="water" size={20} color={theme.colors.primary} />
              <Text style={[styles.vitalLabel, { color: theme.colors.textPrimary }]}>RIEGO</Text>
              <Text style={[styles.vitalValue, { color: theme.colors.textPrimary }]}>
                {plant.wateringDetails?.max || 'Media'}
              </Text>
            </View>
            <View style={[styles.vitalItem, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="leaf" size={20} color="#10B981" />
              <Text style={[styles.vitalLabel, { color: theme.colors.textPrimary }]}>FAMILIA</Text>
              <Text style={[styles.vitalValue, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {plant.taxonomy?.family || 'Botánica'}
              </Text>
            </View>
            <View style={[styles.vitalItem, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="calendar-outline" size={20} color="#F59E0B" />
              <Text style={[styles.vitalLabel, { color: theme.colors.textPrimary }]}>PRÓXIMO</Text>
              <Text style={[styles.vitalValue, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {plant.proximoRiego}d
              </Text>
            </View>
          </View>

          <View style={styles.contentBody}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold }]}>
                Acerca de esta planta
              </Text>
              <Text style={[styles.sectionContent, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}>
                {plant.descripcion || "No hay descripción disponible."}
              </Text>
            </View>

            {plant.cuidados ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold }]}>
                  Guía de Cuidados
                </Text>
                <View style={[styles.careCard, { backgroundColor: theme.colors.surface }]}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Ionicons name="water" size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.sectionContent, { color: theme.colors.textSecondary, flex: 1, fontSize: 14 }]}>
                    {plant.cuidados}
                  </Text>
                </View>
              </View>
            ) : null}

            {plant.sunlight ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold }]}>
                  Luz Solar
                </Text>
                <View style={[styles.careCard, { backgroundColor: theme.colors.surface }]}>
                  <View style={[styles.iconCircle, { backgroundColor: '#F59E0B20' }]}>
                    <Ionicons name="sunny" size={20} color="#F59E0B" />
                  </View>
                  <Text style={[styles.sectionContent, { color: theme.colors.textSecondary, flex: 1, fontSize: 14 }]}>
                    {plant.sunlight}
                  </Text>
                </View>
              </View>
            ) : null}

            {plant.wikiExtract ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold }]}>
                  Información Botánica
                </Text>
                <Text style={[styles.sectionContent, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}>
                  {plant.wikiExtract}
                </Text>
              </View>
            ) : null}

            <View style={{ height: 100 }} />
          </View>
        </View>
      </Animated.ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEdit} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Editar Planta</Text>
              <TouchableOpacity onPress={() => setShowEdit(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <AppInput 
                label="Nombre de la planta"
                value={editName}
                onChangeText={setEditName}
                leftIcon="leaf"
              />
              
              <View style={{ marginTop: 20 }}>
                <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>Categoría</Text>
                <View style={styles.chipsContainer}>
                  {["Interior", "Tropicales", "Suculentas", "Aromáticas", "Cactus"].map(cat => (
                    <TouchableOpacity 
                      key={cat} 
                      style={[
                        styles.chip, 
                        { backgroundColor: theme.colors.surface },
                        editCategory === cat && { borderColor: theme.colors.primary, borderWidth: 1 }
                      ]}
                      onPress={() => setEditCategory(cat)}
                    >
                      <Text style={[
                        styles.chipText, 
                        { color: editCategory === cat ? theme.colors.primary : theme.colors.textSecondary }
                      ]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ marginTop: 20 }}>
                <WateringFrequencyPicker 
                  value={editFreq}
                  onChange={setEditFreq}
                />
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
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
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  backBtn: {
    padding: 12,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  topActions: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  narrateFab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },
  narrateFabContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakingIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalScroll: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    position: 'absolute',
    top: 10,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 8,
  },
  vitalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  vitalItem: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  vitalLabel: {
    fontSize: 9,
    fontWeight: '700',
    opacity: 0.5,
    letterSpacing: 1,
  },
  vitalValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  plantName: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 4,
  },
  latinName: {
    fontSize: 16,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  contentBody: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
  },
  careCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
