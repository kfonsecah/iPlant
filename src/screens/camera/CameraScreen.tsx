import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  AppState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/desingSystem";
import { identifyPlant, addPlant, enrichPlant } from "../../services/plantService";
import { PlantIdentificationResult } from "../../types-dtos/plant.types";
import { useAuth } from "../../context/AuthContext";
import { useConnectivity } from "../../context/ConnectivityContext";
import IdentificationAnimation from "../../components/ui/identificationAnimation/IdentificationAnimation";
import PlantDetailView, { PlantEditData } from "../../components/ui/plantDetailView/PlantDetailView";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<"on" | "off">("off");
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { isConnected } = useConnectivity();
  
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [aiResult, setAiResult] = useState<PlantIdentificationResult | null>(null);
  const [identificationError, setIdentificationError] = useState<string | null>(null);
  const [showManualSave, setShowManualSave] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        getPermission();
      }
    });
    return () => subscription.remove();
  }, [getPermission]);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
        try {
            const photo = await cameraRef.current.takePictureAsync();
            if (photo) {
                setPreviewUri(photo.uri);
            }
        } catch (error) {
            console.error("Failed to take picture:", error);
        }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setPreviewUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Failed to pick image:", error);
    }
  };

  const handleRetake = () => {
    setPreviewUri(null);
    setAiResult(null);
    setIdentificationError(null);
  };

  const handleIdentify = async () => {
    console.log("DEBUG: handleIdentify button pressed!");
    if (!previewUri || !user) {
      console.log("DEBUG: Missing previewUri or user!", { hasUri: !!previewUri, hasUser: !!user });
      return;
    }

    if (!isConnected) {
      setIdentificationError("Modo offline. La identificación por IA requiere internet.");
      setShowManualSave(true);
      return;
    }
    
    setIsIdentifying(true);
    setIdentificationError(null);
    setShowManualSave(false);
    
    try {
      const result = await identifyPlant(previewUri);
      
      // Enrich plant details with Gemini
      try {
        console.log("Enriching plant with Gemini...");
        const enriched = await enrichPlant(result.plantName, result.latinName);
        if (enriched) {
          result.description = enriched.description || result.description;
          result.sunlight = enriched.light 
            ? (enriched.light === 'low' ? 'Sombra' : enriched.light === 'medium' ? 'Luz Indirecta' : 'Luz Directa') 
            : result.sunlight;
          result.careInstructions = (enriched.careGuide && enriched.careGuide.join("\n")) || result.careInstructions;
          
          if (enriched.family) {
            result.taxonomy = {
              ...result.taxonomy,
              family: enriched.family,
            };
          }
          if (enriched.water) {
            result.watering = {
              ...result.watering,
              max: enriched.water === 'high' ? 'Frecuente' : enriched.water === 'medium' ? 'Moderado' : 'Poco',
            };
          }
          
          result.countryCodes = enriched.countryCodes || [];
          result.commonNames = enriched.commonNames || "";
          result.origin = enriched.origin || "";
          result.climate = enriched.climate || "";
          result.maxHeight = enriched.maxHeight || "";
          result.bloomSeason = enriched.bloomSeason || "";
          result.toxicity = enriched.toxicity || "";
          result.category = enriched.category || "";
          result.wateringFrequencyDays = enriched.wateringFrequencyDays || 7;
        }
      } catch (geminiErr) {
        console.warn("Gemini enrichment failed, using basic Plant.id details:", geminiErr);
      }

      setAiResult(result);
    } catch (error) {
      console.error("Identification failed:", error);
      setIdentificationError(
        error instanceof Error ? error.message : "Error al identificar la planta"
      );
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleSavePlant = async (editData: PlantEditData) => {
    if (!user || !previewUri) return;
    
    try {
      await addPlant({
        userId: user.uid,
        nombre: editData.nombre,
        categoria: editData.categoria || "Sin categoría",
        proximoRiego: parseInt(editData.frecuenciaRiego, 10) || 7,
        wateringFrequencyDays: parseInt(editData.frecuenciaRiego, 10) || 7,
        imagen: previewUri,
        confianza: editData.confidence,
        descripcion: editData.descripcion,
        cuidados: editData.cuidados,
        identificadoConIA: !!aiResult && (aiResult.probability > 0),
        latinName: editData.latinName,
        taxonomy: editData.taxonomy,
        wateringDetails: editData.wateringDetails,
        sunlight: editData.sunlight,
        pruning: editData.pruning,
        soil: editData.soil,
        propagationMethods: editData.propagationMethods,
        wikiExtract: editData.wikiExtract,
        countryCodes: editData.countryCodes,
        commonNames: editData.commonNames,
        origin: editData.origin,
        climate: editData.climate,
        maxHeight: editData.maxHeight,
        bloomSeason: editData.bloomSeason,
        toxicity: editData.toxicity,
      });
      
      router.back();
    } catch (error) {
      console.error("Save failed:", error);
      setIdentificationError("Error al guardar la planta");
    }
  };

  const handleManualSave = () => {
    // Show a basic result object for manual editing
    setAiResult({
      plantName: "Nueva Planta",
      probability: 0,
    });
  };

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  if (!permission.granted) {
    const isPermanentlyDenied = !permission.canAskAgain && permission.status === 'denied';

    return (
      <View 
        style={{ backgroundColor: theme.colors.background }}
        className="flex-1 justify-center items-center p-6"
      >
        <View 
          style={{ backgroundColor: theme.colors.surface }}
          className="w-28 h-28 rounded-full justify-center items-center mb-8"
        >
          <Ionicons 
            name={isPermanentlyDenied ? "alert-circle-outline" : "camera-outline"} 
            size={56} 
            color={isPermanentlyDenied ? theme.colors.error : theme.colors.primary} 
          />
        </View>
        
        <Text 
          style={{ 
            color: theme.colors.textPrimary, 
            fontFamily: theme.typography.fontFamily.bold 
          }}
          className="text-2xl text-center mb-3"
        >
          {isPermanentlyDenied ? "Permiso Denegado" : "Acceso a la cámara"}
        </Text>
        
        <Text 
          style={{ 
            color: theme.colors.textSecondary, 
            fontFamily: theme.typography.fontFamily.regular, 
          }}
          className="text-base text-center px-5 mb-10 leading-6"
        >
          {isPermanentlyDenied 
            ? "Parece que has desactivado el acceso a la cámara permanentemente. Para identificar plantas, debes habilitarlo desde los ajustes de tu sistema."
            : "iPlant necesita usar la cámara para identificar tus plantas. Toca el botón de abajo para activar el permiso y comenzar el escaneo."
          }
        </Text>

        <TouchableOpacity 
           style={{ 
             backgroundColor: isPermanentlyDenied ? theme.colors.error : theme.colors.primary,
             shadowColor: isPermanentlyDenied ? theme.colors.error : theme.colors.primary,
             shadowOffset: { width: 0, height: 4 },
             shadowOpacity: 0.3,
             shadowRadius: 8,
             elevation: 5,
           }}
           className="w-full p-5 rounded-2xl items-center mb-4"
           onPress={isPermanentlyDenied ? Linking.openSettings : requestPermission}
        >
          <Text 
            style={{ fontFamily: theme.typography.fontFamily.bold }}
            className="text-white text-base"
          >
            {isPermanentlyDenied ? "Ir a Configuración" : "Solicitar Permiso"}
          </Text>
        </TouchableOpacity>

        {!isPermanentlyDenied && (
          <TouchableOpacity 
            style={{ marginBottom: 20 }}
            onPress={() => {
              // Forced check
              getPermission();
            }}
          >
             <Text style={{ color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium }}>
               ¿Ya lo activaste? Refrescar estado
             </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
           style={{ 
             backgroundColor: theme.colors.surfaceElevated,
             borderWidth: 1,
             borderColor: theme.colors.border
           }}
           className="w-full p-5 rounded-2xl items-center mb-6 flex-row justify-center gap-2"
           onPress={pickImage}
        >
          <Ionicons name="images-outline" size={20} color={theme.colors.textPrimary} />
          <Text 
            style={{ 
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontFamily.bold 
            }}
            className="text-base"
          >
            Usar Galería
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
           onPress={() => router.back()}
           className="p-2"
        >
          <Text 
            style={{ 
              color: theme.colors.textSecondary, 
              fontFamily: theme.typography.fontFamily.medium 
            }}
          >
            Volver atrás
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Preview UI ─────────────────────────────────────────────────────────────
  if (previewUri) {
    if (aiResult) {
      return (
        <PlantDetailView 
          result={aiResult}
          imageUri={previewUri}
          onConfirm={handleSavePlant}
          onCancel={() => setAiResult(null)}
        />
      );
    }

    return (
      <View style={styles.container}>
        <StatusBar style="light" hidden />
        <Image 
          source={{ uri: previewUri }} 
          style={styles.camera} 
          contentFit="cover"
        />
        
        {isIdentifying && <IdentificationAnimation />}

        {/* Overlay con gradiente visual (falso gradiente con fondo semi-transparente) */}
        <View style={styles.previewOverlay}>
          <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
            {/* Header de la vista previa */}
            <View style={styles.previewHeader}>
               {!isIdentifying && (
                 <Text style={[styles.previewTitle, { fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textOnAccent }]}>
                    ¿Te gusta esta foto?
                 </Text>
               )}
            </View>
            
            {identificationError && !aiResult && !isIdentifying ? (
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.error, flexDirection: 'column', alignItems: 'stretch' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: showManualSave ? 12 : 0 }}>
                  <Ionicons name="alert-circle" size={24} color={theme.colors.error} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.errorText, { color: theme.colors.textPrimary, fontWeight: '700', fontSize: 14 }]}>
                      {showManualSave ? "Modo Offline" : "Error de Identificación"}
                    </Text>
                    <Text style={[styles.errorText, { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }]}>
                      {identificationError}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={{ marginLeft: 8, padding: 4 }}
                    onPress={() => {
                      setIdentificationError(null);
                      setShowManualSave(false);
                    }}
                  >
                    <Ionicons name="close-circle" size={22} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {showManualSave ? (
                  <TouchableOpacity 
                    style={{ backgroundColor: theme.colors.secondary, padding: 12, borderRadius: 10, alignItems: 'center', width: '100%' }}
                    onPress={handleManualSave}
                  >
                    <Text style={{ color: "white", fontSize: 14, fontWeight: '700' }}>Guardar Manualmente</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={{ backgroundColor: theme.colors.primary, padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 }}
                    onPress={handleIdentify}
                  >
                    <Text style={{ color: "white", fontSize: 14, fontWeight: '700' }}>Reintentar Identificación</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              /* Footer con botones del sistema */
              (!aiResult && !isIdentifying) && (
                <View style={styles.previewFooter}>
                  <TouchableOpacity 
                    style={[styles.systemButtonSecondary, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]} 
                    onPress={handleRetake}
                    activeOpacity={theme.opacity.pressableButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                    <Text style={[styles.systemButtonText, { color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semibold }]}>
                      Descartar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.identifyButton, { backgroundColor: theme.colors.secondary }]} 
                    onPress={handleIdentify}
                    disabled={isIdentifying}
                    activeOpacity={theme.opacity.pressableButton}
                  >
                    <Ionicons name="leaf" size={20} color="white" />
                    <Text style={[styles.systemButtonText, { color: "white", fontFamily: theme.typography.fontFamily.bold }]}>
                      Identificar
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </SafeAreaView>
        </View>
      </View>
    );
  }

  // ─── Camera UI ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden />
      <CameraView 
        style={styles.camera} 
        facing={facing} 
        flash={flash}
        ref={cameraRef}
      >
        <SafeAreaView style={styles.overlay}>
          {/* Header de la cámara */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={[styles.glassButton, { backgroundColor: theme.colors.overlay }]} 
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={26} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.glassButton, { backgroundColor: theme.colors.overlay }]} 
              onPress={toggleFlash}
            >
              <Ionicons 
                name={flash === "on" ? "flash" : "flash-off"} 
                size={22} 
                color="white" 
              />
            </TouchableOpacity>
          </View>

          {/* Footer de la cámara */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.glassButton, { backgroundColor: theme.colors.overlay }]} 
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse-outline" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.captureButton, { borderColor: "rgba(255,255,255,0.4)" }]} 
              onPress={takePicture}
              activeOpacity={0.8}
            >
              <View style={[styles.captureButtonInner, { backgroundColor: "white" }]} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.glassButton, { backgroundColor: theme.colors.overlay }]} 
              onPress={pickImage}
            >
              <Ionicons name="images-outline" size={26} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  previewHeader: {
    alignItems: "center",
    marginTop: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  previewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    gap: 16,
  },
  glassButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  previewTitle: {
    fontSize: 24,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  systemButtonPrimary: {
    flex: 1.3,
    flexDirection: "row",
    height: 60,
    borderRadius: 100, // Equivale a theme.radius.pill
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  systemButtonSecondary: {
    flex: 1,
    flexDirection: "row",
    height: 60,
    borderRadius: 100, // Equivale a theme.radius.pill
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  systemButtonText: {
    fontSize: 16,
  },
  identifyButton: {
    flexDirection: "row",
    height: 60,
    borderRadius: 100,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    flex: 1,
  },
  aiResultContainer: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20, // Espacio respecto al borde inferior o elementos adyacentes
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  errorRetry: {
    fontSize: 14,
    fontWeight: "700",
  },
});
