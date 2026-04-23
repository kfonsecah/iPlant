import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { File, Directory, Paths } from "expo-file-system";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/desingSystem";
import { identifyPlant, addPlant } from "../../services/plantService";
import { PlantIdentificationResult, PlantAIFields } from "../../types-dtos/plant.types";
import { useAuth } from "../../context/AuthContext";
import AiResultCard, { PlantEditData } from "../../components/ui/aiResultCard/AiResultCard";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<"on" | "off">("off");
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [aiResult, setAiResult] = useState<PlantIdentificationResult | null>(null);
  const [identificationError, setIdentificationError] = useState<string | null>(null);

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: "center", alignItems: "center", padding: 20 }]}>
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.surface, justifyContent: "center", alignItems: "center", marginBottom: 32 }}>
          <Ionicons name="camera-outline" size={56} color={theme.colors.primary} />
        </View>
        <Text style={{ 
          color: theme.colors.textPrimary, 
          fontSize: 22, 
          fontFamily: theme.typography.fontFamily.bold, 
          textAlign: "center",
          marginBottom: 12
        }}>
          Acceso a la cámara
        </Text>
        <Text style={{ 
          color: theme.colors.textSecondary, 
          fontSize: 16, 
          fontFamily: theme.typography.fontFamily.regular, 
          textAlign: "center", 
          paddingHorizontal: 20,
          marginBottom: 40,
          lineHeight: 24
        }}>
          iPlant necesita usar la cámara para identificar tus plantas. Toca el botón de abajo para activar el permiso.
        </Text>
        <TouchableOpacity 
           style={{ 
             width: "100%",
             padding: 18, 
             backgroundColor: theme.colors.primary, 
             borderRadius: theme.radius.xl,
             alignItems: "center",
             shadowColor: theme.colors.primary,
             shadowOffset: { width: 0, height: 4 },
             shadowOpacity: 0.3,
             shadowRadius: 8,
             elevation: 5,
             marginBottom: 12
           }}
           onPress={requestPermission}
        >
          <Text style={{ color: "white", fontSize: 16, fontFamily: theme.typography.fontFamily.bold }}>
            Activar Cámara
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
           style={{ padding: 10 }}
           onPress={() => router.back()}
        >
          <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium }}>
            Ahora no
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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

  const savePhoto = async () => {
    if (!previewUri) return;
    try {
        const photosDir = new Directory(Paths.document, 'photos');
        if (!photosDir.exists) {
            await photosDir.create();
        }
        const tempFile = new File(previewUri);
        const newFile = new File(photosDir, `${Date.now()}.jpg`);
        await tempFile.move(newFile);
        console.log("Photo saved to:", newFile.uri);
        router.back();
    } catch (error) {
        console.error("Failed to save photo:", error);
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
    
    setIsIdentifying(true);
    setIdentificationError(null);
    
    try {
      const result = await identifyPlant(previewUri);
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
        imagen: previewUri,
        confianza: editData.confidence,
        descripcion: editData.descripcion,
        cuidados: editData.cuidados,
        identificadoConIA: true,
      });
      
      router.back();
    } catch (error) {
      console.error("Save failed:", error);
      setIdentificationError("Error al guardar la planta");
    }
  };

  // ─── Preview UI ─────────────────────────────────────────────────────────────
  if (previewUri) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" hidden />
        <Image 
          source={{ uri: previewUri }} 
          style={styles.camera} 
          contentFit="cover"
        />
        
        {/* Overlay con gradiente visual (falso gradiente con fondo semi-transparente) */}
        <SafeAreaView style={styles.previewOverlay}>
          {/* Header de la vista previa */}
          <View style={styles.previewHeader}>
             <Text style={[styles.previewTitle, { fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textOnAccent }]}>
                ¿Te gusta esta foto?
             </Text>
          </View>
          
          {/* Footer con botones del sistema */}
          {(!aiResult && !identificationError) && (
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
                  {isIdentifying ? "Identificando..." : "Identificar"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* AI Results Display - AiResultCard handles edit/confirm */}
          {aiResult && (
            <View style={styles.aiResultContainer}>
              <AiResultCard 
                result={aiResult}
                onEdit={() => {}}
                onConfirm={handleSavePlant}
                onCancel={() => setAiResult(null)}
              />
            </View>
          )}

          {identificationError && !aiResult && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.error }]}>
              <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.errorText, { color: theme.colors.textPrimary, fontWeight: '600' }]}>
                  Error de Identificación
                </Text>
                <Text style={[styles.errorText, { color: theme.colors.textSecondary, fontSize: 13 }]}>
                  {identificationError}
                </Text>
              </View>
              <TouchableOpacity 
                style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                onPress={handleIdentify}
              >
                <Text style={{ color: "white", fontSize: 12, fontWeight: '700' }}>Reintentar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ marginLeft: 8 }}
                onPress={() => setIdentificationError(null)}
              >
                <Ionicons name="close-circle" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
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
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  errorRetry: {
    fontSize: 14,
    fontWeight: "700",
  },
});
