import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  TouchableOpacity, 
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/desingSystem';
import { PlantIdentificationResult } from '../../../types-dtos/plant.types';
import ConfidenceBadge from '../confidenceBadge/ConfidenceBadge';
import AppInput from '../appInput/AppInput';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.45; // Reducido un poco para dar más aire al card

export interface PlantEditData {
  nombre: string;
  categoria: string;
  descripcion: string;
  cuidados: string;
  frecuenciaRiego: string;
  confidence: number;
  imagen?: string;
}

interface PlantDetailViewProps {
  result: PlantIdentificationResult;
  imageUri: string;
  onConfirm: (confirmedData: PlantEditData) => void;
  onCancel: () => void;
}

const PlantDetailView = ({ result, imageUri, onConfirm, onCancel }: PlantDetailViewProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isEditing, setIsEditing] = useState(false);
  
  const [editData, setEditData] = useState<PlantEditData>({
    nombre: result.plantName,
    categoria: "",
    descripcion: result.description || result.wikiDescription?.extract || "",
    cuidados: result.careInstructions || "",
    frecuenciaRiego: "7",
    confidence: result.probability,
  });

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

  const handleConfirm = () => {
    onConfirm(editData);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* 1. HEADER: Imagen al fondo (sin zIndex alto) */}
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
            source={{ uri: imageUri }} 
            style={styles.image} 
            contentFit="cover"
          />
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent']} style={styles.topGradient} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={styles.bottomGradient} />
        </Animated.View>
      </Animated.View>

      {/* 2. BOTONES FIJOS: Encima de todo */}
      <View style={[styles.topActions, { top: insets.top + 10 }]}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]} 
            onPress={onCancel}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
      </View>

      {/* 3. CONTENIDO: ScrollView que se desliza SOBRE la imagen */}
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
                {editData.nombre}
              </Text>
              {result.latinName && (
                <Text style={[styles.latinName, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium }]}>
                  {result.latinName}
                </Text>
              )}
            </View>
            <ConfidenceBadge confidence={result.probability} size="large" />
          </View>

          {/* NUEVA SECCIÓN: Botany Vitals (Info Profesional) */}
          <View style={styles.vitalsContainer}>
            <View style={[styles.vitalItem, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="water" size={20} color={theme.colors.primary} />
              <Text style={[styles.vitalLabel, { color: theme.colors.textPrimary }]}>RIEGO</Text>
              <Text style={[styles.vitalValue, { color: theme.colors.textPrimary }]}>
                {result.watering?.max || 'Media'}
              </Text>
            </View>
            <View style={[styles.vitalItem, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="leaf" size={20} color="#10B981" />
              <Text style={[styles.vitalLabel, { color: theme.colors.textPrimary }]}>FAMILIA</Text>
              <Text style={[styles.vitalValue, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {result.taxonomy?.family || 'Botánica'}
              </Text>
            </View>
            <View style={[styles.vitalItem, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="git-branch" size={20} color="#F59E0B" />
              <Text style={[styles.vitalLabel, { color: theme.colors.textPrimary }]}>PROPAGACIÓN</Text>
              <Text style={[styles.vitalValue, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {result.propagationMethods?.[0] || 'Semillas'}
              </Text>
            </View>
          </View>

          <View style={styles.contentBody}>
              {isEditing ? (
                <View style={styles.editForm}>
                  <AppInput
                    label="Nombre"
                    value={editData.nombre}
                    onChangeText={(text) => setEditData({ ...editData, nombre: text })}
                    placeholder="Nombre de la planta"
                  />
                  <AppInput
                    label="Categoría"
                    value={editData.categoria}
                    onChangeText={(text) => setEditData({ ...editData, categoria: text })}
                    placeholder="Ej: Interior, Exterior, Suculenta..."
                  />
                  <AppInput
                    label="Descripción"
                    value={editData.descripcion}
                    onChangeText={(text) => setEditData({ ...editData, descripcion: text })}
                    placeholder="Descripción de la planta"
                    multiline
                    numberOfLines={4}
                  />
                  <AppInput
                    label="Frecuencia de Riego (días)"
                    value={editData.frecuenciaRiego}
                    onChangeText={(text) => setEditData({ ...editData, frecuenciaRiego: text })}
                    placeholder="7"
                    keyboardType="numeric"
                  />
                </View>
              ) : (
                <>
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold }]}>
                      Acerca de esta planta
                    </Text>
                    <Text style={[styles.sectionContent, { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.regular }]}>
                      {editData.descripcion || "No hay descripción disponible para esta especie."}
                    </Text>
                  </View>

                  {editData.cuidados ? (
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold }]}>
                        Guía de Riego
                      </Text>
                      <View style={[styles.careCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                           <Ionicons name="water" size={20} color={theme.colors.primary} />
                        </View>
                        <Text style={[styles.sectionContent, { color: theme.colors.textSecondary, flex: 1, fontSize: 14 }]}>
                          {editData.cuidados}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {result.sunlight ? (
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold }]}>
                        Luz Solar
                      </Text>
                      <View style={[styles.careCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={[styles.iconCircle, { backgroundColor: '#F59E0B20' }]}>
                           <Ionicons name="sunny" size={20} color="#F59E0B" />
                        </View>
                        <Text style={[styles.sectionContent, { color: theme.colors.textSecondary, flex: 1, fontSize: 14 }]}>
                          {result.sunlight}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {result.pruning ? (
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold }]}>
                        Consejos de Poda
                      </Text>
                      <View style={[styles.careCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={[styles.iconCircle, { backgroundColor: '#10B98120' }]}>
                           <Ionicons name="cut" size={20} color="#10B981" />
                        </View>
                        <Text style={[styles.sectionContent, { color: theme.colors.textSecondary, flex: 1, fontSize: 14 }]}>
                          {result.pruning}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {result.soil ? (
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold }]}>
                        Tipo de Suelo Ideal
                      </Text>
                      <View style={[styles.careCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={[styles.iconCircle, { backgroundColor: '#78350F20' }]}>
                           <Ionicons name="leaf" size={20} color="#78350F" />
                        </View>
                        <Text style={[styles.sectionContent, { color: theme.colors.textSecondary, flex: 1, fontSize: 14 }]}>
                          {result.soil}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                  
                  <View style={{ height: 160 }} />
                </>
              )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* 4. FOOTER: Pegado abajo */}
      <View style={[
          styles.footer, 
          { 
            backgroundColor: theme.colors.background, 
            paddingBottom: Math.max(insets.bottom, 20),
            borderTopColor: theme.colors.border 
          }
      ]}>
        {!isEditing ? (
          <>
            <TouchableOpacity 
              style={[styles.btnSecondary, { borderColor: theme.colors.border }]} 
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color={theme.colors.textPrimary} />
              <Text style={[styles.btnText, { color: theme.colors.textPrimary }]}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnPrimary, { backgroundColor: theme.colors.primary }]} 
              onPress={handleConfirm}
            >
              <Text style={[styles.btnText, { color: 'white', fontWeight: 'bold' }]}>Guardar en mi Jardín</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.btnPrimary, { backgroundColor: theme.colors.primary, width: '100%' }]} 
            onPress={() => setIsEditing(false)}
          >
            <Text style={[styles.btnText, { color: 'white', fontWeight: 'bold' }]}>Finalizar Edición</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    zIndex: 100,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24, // Aumentado para evitar recorte
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
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
    marginTop: 8, // Espacio extra después del handle
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
  editForm: {
    gap: 20,
    paddingBottom: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
    zIndex: 90,
    borderTopWidth: 1,
  },
  btnPrimary: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    fontSize: 16,
  }
});

export default PlantDetailView;
