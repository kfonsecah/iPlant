import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { z } from "zod";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView, TouchableOpacity as GHTouchableOpacity } from "react-native-gesture-handler";

import * as ImagePicker from "expo-image-picker";
import AppInput from "../../components/ui/appInput/AppInput";
import { AppTheme, useTheme } from "../../theme/desingSystem";
import Toast, { ToastType } from "../../components/ui/toast/Toast";
import { useAuth } from "../../context/AuthContext";
import { useConnectivity } from "../../context/ConnectivityContext";
import { getUserById, updateUser } from "../../services/userService";
import { getPlantsByUserId } from "../../services/plantService";
import { logOut } from "../../services/authService";
import { PrivacidadPerfil, UserInterface } from "../../types-dtos/user.types";
import { PlantaCompletaInterface } from "../../types-dtos/plant.types";

const LOCAL_BANNERS = [
  null, // default gradient
  require("../../../assets/images/banner1.jpeg"),
  require("../../../assets/images/banner2.jpeg"),
  require("../../../assets/images/banner3.jpeg"),
  require("../../../assets/images/banner4.jpeg"),
  require("../../../assets/images/banner5.jpeg"),
];

const LOCAL_BANNER_NAMES = [
  "Por defecto",
  "Bosque",
  "Gotas",
  "Raíces",
  "Flores",
  "Jardín",
];

// ─── Zod Schema ───────────────────────────────────────────────────────────────
const editUserSchema = z.object({
  nombre:      z.string().min(2, "Minimo 2 caracteres").max(50, "Maximo 50 caracteres"),
  apodo:       z.string().min(2, "Minimo 2 caracteres").max(30, "Maximo 30 caracteres"),
  descripcion: z.string().max(200, "Maximo 200 caracteres"),
  privacidad:  z.enum(["Público", "Privado"]),
});

type EditUserForm = z.infer<typeof editUserSchema>;

// ─── EditProfileModal ─────────────────────────────────────────────────────────
function EditProfileModal({
  visible,
  user,
  userId,
  plants,
  onClose,
  onSaved,
  onError,
}: {
  visible:  boolean;
  user:     UserInterface;
  userId:   string;
  plants:   PlantaCompletaInterface[];
  onClose:  () => void;
  onSaved:  (updated: Partial<UserInterface>) => void;
  onError:  (msg: string) => void;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { control, handleSubmit, formState: { errors }, reset, watch, setValue } =
    useForm<EditUserForm>({
      resolver: zodResolver(editUserSchema),
      defaultValues: {
        nombre:      user.nombre,
        apodo:       user.apodo,
        descripcion: user.descripcion,
        privacidad:  user.privacidad === "Privado" ? "Privado" : "Público",
      },
    });

  const privacidad = watch("privacidad");
  const [saving, setSaving] = useState(false);
  const [selectedAvatarUri, setSelectedAvatarUri] = useState<string | null>(null);

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const b64 = result.assets[0].base64;
      if (b64) {
        setSelectedAvatarUri(`data:image/jpeg;base64,${b64}`);
      } else {
        setSelectedAvatarUri(result.assets[0].uri);
      }
    }
  };

  // Banner states
  const getInitialBannerIndex = () => {
    if (user.bannerIdentifier && user.bannerIdentifier.startsWith("local:banner")) {
      const num = parseInt(user.bannerIdentifier.split("banner")[1]);
      if (num >= 1 && num <= 5) return num;
    }
    return 0;
  };

  const [selectedBannerIndex, setSelectedBannerIndex] = useState<number>(getInitialBannerIndex());
  const [tempBannerIndex, setTempBannerIndex] = useState<number>(getInitialBannerIndex());
  const [selectedFavPlant, setSelectedFavPlant] = useState<{ nombre: string; imagen?: string } | null>(
    user.plantaFavorita?.nombre ? user.plantaFavorita : null
  );

  // Bottom Sheet references
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [450], []);

  const translateY = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      reset({
        nombre:      user.nombre,
        apodo:       user.apodo,
        descripcion: user.descripcion,
        privacidad:  user.privacidad === "Privado" ? "Privado" : "Público",
      });
      const initialIdx = getInitialBannerIndex();
      setSelectedBannerIndex(initialIdx);
      setTempBannerIndex(initialIdx);
      setSelectedAvatarUri(null);
      setSelectedFavPlant(user.plantaFavorita?.nombre ? user.plantaFavorita : null);

      translateY.setValue(600);
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, reset, user]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: 600,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: 600,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const onSubmit = async (data: EditUserForm) => {
    setSaving(true);
    try {
      const bannerIdentifier = selectedBannerIndex === 0 ? "" : `local:banner${selectedBannerIndex}`;

      const updatedData = {
        ...data,
        privacidad: data.privacidad as PrivacidadPerfil,
        bannerImage: "",
        bannerIdentifier,
        image: selectedAvatarUri ?? user.image,
        plantaFavorita: selectedFavPlant ?? { nombre: "", imagen: "" },
      };
      await updateUser(userId, updatedData);
      onSaved(updatedData);
      onClose();
    } catch (e) {
      console.error("[EditProfile] onSubmit error:", e);
      onError("No se pudo guardar. Verifica tu conexion.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPicker = () => {
    Keyboard.dismiss();
    setTempBannerIndex(selectedBannerIndex);
    bottomSheetRef.current?.expand();
  };

  const handleSelectBanner = (num: number) => {
    setSelectedBannerIndex(num);
    setTempBannerIndex(num);
    bottomSheetRef.current?.close();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
            <View style={{ width: "100%" }}>
              <Animated.View style={[styles.modalCard, { transform: [{ translateY }] }]}>
                {/* Drag handle at the top */}
                <View style={styles.modalHandle} {...panResponder.panHandlers} />

                <View style={styles.modalHeader} {...panResponder.panHandlers}>
                  <Text style={styles.modalTitle}>Editar perfil</Text>
                  <TouchableOpacity style={styles.modalCloseBtn} onPress={handleClose}>
                    <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: Dimensions.get("window").height * 0.55 }}
                >
                  <View style={{ gap: 16 }}>
                    {/* AVATAR SECTION */}
                    <View style={styles.avatarEditRow}>
                      <TouchableOpacity style={styles.avatarEditWrapper} onPress={handlePickAvatar} activeOpacity={0.8}>
                        {(selectedAvatarUri || user.image) ? (
                          <Image
                            source={{ uri: selectedAvatarUri || user.image }}
                            style={styles.avatarEditImage}
                          />
                        ) : (
                          <View style={styles.avatarEditPlaceholder}>
                            <Ionicons name="person" size={32} color={theme.colors.textSecondary} />
                          </View>
                        )}
                        <View style={styles.avatarEditCameraBadge}>
                          <Ionicons name="camera" size={13} color="#fff" />
                        </View>
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.avatarEditLabel}>Foto de perfil</Text>
                        <Text style={styles.avatarEditSub}>Toca para cambiar</Text>
                      </View>
                    </View>

                    {/* BANNER PREVIEW SECTION */}
                    <View style={styles.bannerPreviewContainer}>
                      {selectedBannerIndex > 0 ? (
                        <Image source={LOCAL_BANNERS[selectedBannerIndex]} style={styles.bannerPreviewImage} resizeMode="cover" />
                      ) : user.bannerImage ? (
                        <Image source={{ uri: user.bannerImage }} style={styles.bannerPreviewImage} resizeMode="cover" />
                      ) : (
                        <LinearGradient
                          colors={["#0d2018", "#1a3a2a"]}
                          style={styles.bannerPreviewGradient}
                        />
                      )}

                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.6)"]}
                        style={styles.bannerPreviewOverlay}
                      />

                      <TouchableOpacity style={styles.changeBannerBtn} onPress={handleOpenPicker}>
                        <Ionicons name="images-outline" size={13} color="white" />
                        <Text style={styles.changeBannerText}>Cambiar banner</Text>
                      </TouchableOpacity>
                    </View>

                    <Controller
                      control={control}
                      name="nombre"
                      render={({ field: { onChange, value, onBlur } }) => (
                        <AppInput
                          label="Nombre"
                          leftIcon="person-outline"
                          onChangeText={onChange}
                          value={value}
                          onBlur={onBlur}
                          error={errors.nombre?.message}
                          autoCapitalize="words"
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="apodo"
                      render={({ field: { onChange, value, onBlur } }) => (
                        <AppInput
                          label="Apodo"
                          leftIcon="at-outline"
                          onChangeText={onChange}
                          value={value}
                          onBlur={onBlur}
                          error={errors.apodo?.message}
                          autoCapitalize="none"
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="descripcion"
                      render={({ field: { onChange, value, onBlur } }) => (
                        <AppInput
                          label="Descripcion"
                          leftIcon="pencil-outline"
                          onChangeText={onChange}
                          value={value}
                          onBlur={onBlur}
                          error={errors.descripcion?.message}
                          multiline
                          numberOfLines={3}
                        />
                      )}
                    />

                    {/* Planta favorita */}
                    {plants.length > 0 && (
                      <View>
                        <Text style={styles.fieldLabel}>Planta favorita</Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
                        >
                          {/* Opción "Ninguna" */}
                          <TouchableOpacity
                            style={[styles.favPlantCard, !selectedFavPlant && styles.favPlantCardSelected]}
                            onPress={() => setSelectedFavPlant(null)}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.favPlantImgBox, !selectedFavPlant && styles.favPlantImgBoxSelected]}>
                              <Ionicons name="ban-outline" size={22} color={!selectedFavPlant ? theme.colors.primary : theme.colors.textSecondary} />
                            </View>
                            <Text style={[styles.favPlantName, !selectedFavPlant && styles.favPlantNameSelected]} numberOfLines={1}>
                              Ninguna
                            </Text>
                          </TouchableOpacity>

                          {plants.map((p) => {
                            const isSelected = selectedFavPlant?.nombre === p.nombre;
                            return (
                              <TouchableOpacity
                                key={p.id}
                                style={[styles.favPlantCard, isSelected && styles.favPlantCardSelected]}
                                onPress={() => setSelectedFavPlant({ nombre: p.nombre, imagen: p.imagen })}
                                activeOpacity={0.7}
                              >
                                <View style={[styles.favPlantImgBox, isSelected && styles.favPlantImgBoxSelected]}>
                                  {p.imagen ? (
                                    <Image source={{ uri: p.imagen }} style={styles.favPlantImg} />
                                  ) : (
                                    <Ionicons name="leaf" size={22} color={isSelected ? theme.colors.primary : theme.colors.textSecondary} />
                                  )}
                                </View>
                                <Text style={[styles.favPlantName, isSelected && styles.favPlantNameSelected]} numberOfLines={1}>
                                  {p.nombre}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}

                    {/* Privacidad — chips */}
                    <View>
                      <Text style={styles.fieldLabel}>Privacidad</Text>
                      <View style={styles.chipsRow}>
                        {(["Público", "Privado"] as const).map((op) => (
                          <TouchableOpacity
                            key={op}
                            style={[styles.modalChip, privacidad === op && styles.modalChipSelected]}
                            onPress={() => setValue("privacidad", op)}
                          >
                            <Ionicons
                              name={op === "Público" ? "globe-outline" : "lock-closed-outline"}
                              size={13}
                              color={privacidad === op ? theme.colors.primary : theme.colors.textSecondary}
                            />
                            <Text style={[styles.modalChipText, privacidad === op && styles.modalChipTextSelected]}>
                              {op}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
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
              </Animated.View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>

        {/* BANNER PICKER BOTTOM SHEET */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          enablePanDownToClose={true}
          enableContentPanningGesture={false}
          enableHandlePanningGesture={true}
          enableOverDrag={false}
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
        >
          <Text style={styles.sheetHeader}>Elige tu banner</Text>

          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            style={styles.sheetScrollView}
            contentContainerStyle={styles.sheetScrollContent}
          >
            {/* Sin banner option */}
            <View style={styles.optionWrapper}>
              <GHTouchableOpacity
                style={[styles.bannerOption, tempBannerIndex === 0 && styles.bannerOptionSelected]}
                onPress={() => handleSelectBanner(0)}
              >
                <LinearGradient
                  colors={["#0d2018", "#1a3a2a"]}
                  style={styles.bannerOptionGradient}
                >
                  <Ionicons name="leaf-outline" size={20} color="rgba(74,222,128,0.4)" />
                </LinearGradient>
              </GHTouchableOpacity>
              <Text style={[styles.optionLabel, tempBannerIndex === 0 && styles.optionLabelSelected]}>
                Por defecto
              </Text>
              {tempBannerIndex === 0 && (
                <View style={styles.checkmarkBadge}>
                  <Ionicons name="checkmark" size={12} color={theme.colors.textOnAccent} />
                </View>
              )}
            </View>

            {/* Banners 1 to 5 options */}
            {[1, 2, 3, 4, 5].map((num) => {
              const bannerSource = LOCAL_BANNERS[num];
              const name = LOCAL_BANNER_NAMES[num];
              const isSelected = tempBannerIndex === num;

              return (
                <View key={num} style={styles.optionWrapper}>
                  <GHTouchableOpacity
                    style={[styles.bannerOption, isSelected && styles.bannerOptionSelected]}
                    onPress={() => handleSelectBanner(num)}
                  >
                    {bannerSource && (
                      <Image source={bannerSource} style={styles.bannerPreviewImage} resizeMode="cover" />
                    )}
                  </GHTouchableOpacity>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {name}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmarkBadge}>
                      <Ionicons name="checkmark" size={12} color={theme.colors.textOnAccent} />
                    </View>
                  )}
                </View>
              );
            })}
          </BottomSheetScrollView>
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
}

// ─── UserProfile ──────────────────────────────────────────────────────────────
export default function UserProfile() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: authUser } = useAuth();
  const userId = authUser?.uid ?? "";
  const { isConnected } = useConnectivity();

  const [user, setUser] = useState<UserInterface | null>(null);
  const [plants, setPlants] = useState<PlantaCompletaInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<'jardin' | 'ventas'>('jardin');
  const [healthFilter, setHealthFilter] = useState<'saludable' | 'atención' | 'riesgo' | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; message: string }>({
    visible: false, type: "success", message: "",
  });

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      getUserById(userId),
      getPlantsByUserId(userId, isConnected),
    ])
      .then(([userData, plantsData]) => {
        if (userData) setUser(userData);
        if (plantsData) setPlants(plantsData);
      })
      .catch((err) => {
        console.error("Error cargando datos de perfil:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, isConnected]);

  const showToast = (type: ToastType, message: string) => {
    setToast({ visible: true, type, message });
  };

  const handleSaved = (updated: Partial<UserInterface>) => {
    setUser((prev) => prev ? { ...prev, ...updated } : prev);
    showToast("success", "Perfil actualizado correctamente");
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.safeArea, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: "#f87171" }}>No se pudo cargar el perfil.</Text>
      </View>
    );
  }

  // Count plants by health status
  const healthyCount = plants.filter(p => p.salud === "saludable").length;
  const attentionCount = plants.filter(p => p.salud === "atención").length;
  const riskCount = plants.filter(p => p.salud === "riesgo").length;

  // Grid logic
  const filteredPlants = healthFilter ? plants.filter(p => p.salud === healthFilter) : plants;
  const hasMore = filteredPlants.length > 6;

  const handleHealthFilter = (status: 'saludable' | 'atención' | 'riesgo') => {
    setHealthFilter(prev => prev === status ? null : status);
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar translucent barStyle={theme.mode === "dark" ? "light-content" : "dark-content"} backgroundColor="transparent" />

      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* PART 1 — BANNER + AVATAR HERO */}
        <View style={styles.bannerContainer}>
          {user.bannerIdentifier && user.bannerIdentifier.startsWith("local:banner") ? (() => {
            const idx = parseInt(user.bannerIdentifier.split("banner")[1]);
            const bannerSource = LOCAL_BANNERS[idx];
            return bannerSource ? (
              <Image source={bannerSource} style={styles.bannerImage} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={["#0a1f0f", "#1a3a2a", "#000000"]}
                style={styles.bannerGradient}
              />
            );
          })() : user.bannerImage ? (
            <Image source={{ uri: user.bannerImage }} style={styles.bannerImage} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={["#0a1f0f", "#1a3a2a", "#000000"]}
              style={styles.bannerGradient}
            />
          )}

          {/* Bottom Gradient overlay */}
          <LinearGradient
            colors={["transparent", theme.colors.background]}
            style={styles.bannerOverlay}
          />

          {/* Top bar inside banner */}
          <View style={[styles.topBar, { top: insets.top + 8 }]}>
            <View />
            <View style={styles.topBarRight}>
              <TouchableOpacity onPress={() => setShowEdit(true)}>
                <Ionicons name="create-outline" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => logOut()}>
                <Ionicons name="settings-outline" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Avatar absolute container */}
          <View style={styles.avatarOuter}>
            {user.image ? (
              <Image source={{ uri: user.image }} style={styles.avatarInner} />
            ) : (
              <Ionicons name="person-circle" size={86} color={theme.colors.primary} />
            )}
          </View>
        </View>

        {/* PART 2 — IDENTITY SECTION */}
        <View style={styles.identityContainer}>
          <View style={styles.identityRow}>
            <View style={styles.identityLeft}>
              <Text style={styles.name}>{user.nombre}</Text>
              <Text style={styles.apodo}>@{user.apodo}</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoChip}>
                  <Ionicons
                    name={user.privacidad === "Privado" ? "lock-closed" : "globe-outline"}
                    size={10}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.infoChipText}>{user.privacidad}</Text>
                </View>

                {!!user.cumpleanos && (
                  <View style={styles.infoChip}>
                    <Ionicons name="gift-outline" size={10} color={theme.colors.textSecondary} />
                    <Text style={styles.infoChipText}>{user.cumpleanos}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.identityRight}>
              <TouchableOpacity style={styles.editBtn} onPress={() => setShowEdit(true)}>
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={() => showToast("success", "Enlace copiado")}>
                <Ionicons name="share-outline" size={16} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {!!user.descripcion && (
            <Text style={styles.description}>{user.descripcion}</Text>
          )}
        </View>

        {/* PART 3 — STATS ROW */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="leaf-outline" color={theme.colors.primary} size={14} />
            <Text style={styles.statValue}>{user.cantidadPlantas}</Text>
            <Text style={styles.statLabel}>Plantas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="people-outline" color={theme.colors.textPrimary} size={14} />
            <Text style={styles.statValue}>{user.cantidadAmigos}</Text>
            <Text style={styles.statLabel}>Amigos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="flame" color={theme.colors.warning} size={14} />
            <Text style={styles.statValue}>{user.racha}</Text>
            <Text style={styles.statLabel}>Racha</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="scan-outline" color="#60a5fa" size={14} />
            <Text style={styles.statValue}>{user.detecciones}</Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
        </View>

        {/* PART 4 — PLANTA FAVORITA + STREAK CARDS ROW */}
        <View style={styles.rowCards}>
          <View style={styles.favCard}>
            {user.plantaFavorita?.nombre ? (
              <>
                {!!user.plantaFavorita.imagen && (
                  <Image
                    source={{ uri: user.plantaFavorita.imagen }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                )}
                <LinearGradient
                  colors={[
                    theme.mode === "dark" ? "rgba(10,22,14,1)" : "rgba(240,253,244,1)",
                    theme.mode === "dark" ? "rgba(10,22,14,0.9)" : "rgba(240,253,244,0.9)",
                    "transparent",
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.favTitle}>Favorita</Text>
                <Text style={styles.favName} numberOfLines={1}>{user.plantaFavorita.nombre}</Text>
              </>
            ) : (
              <View style={styles.favEmpty}>
                <Ionicons name="leaf-outline" size={28} color={theme.colors.primary + "40"} />
                <Text style={styles.favEmptyText}>Sin favorita</Text>
              </View>
            )}
          </View>

          <View style={styles.streakCard}>
            <Ionicons name="flame" size={24} color={theme.colors.warning} />
            <Text style={styles.streakValue}>{user.racha}</Text>
            <Text style={styles.streakLabel}>dias de racha</Text>
          </View>
        </View>

        {/* PART 5 — CATEGORIES CHIPS ROW */}
        {!!user.categoriasPlantas && user.categoriasPlantas.length > 0 && (
          <View style={styles.categoriesContainer}>
            <Text style={styles.categoriesTitle}>Mis categorias</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {user.categoriasPlantas.map((cat, idx) => (
                <View key={idx} style={styles.categoryChip}>
                  <Text style={styles.categoryChipText}>{cat}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* PART 6 — TAB SWITCHER */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "jardin" && styles.tabButtonActive]}
            onPress={() => setActiveTab("jardin")}
          >
            <Text style={[styles.tabText, activeTab === "jardin" ? styles.tabTextActive : styles.tabTextInactive]}>
              Mi Jardin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "ventas" && styles.tabButtonActive]}
            onPress={() => setActiveTab("ventas")}
          >
            <Text style={[styles.tabText, activeTab === "ventas" ? styles.tabTextActive : styles.tabTextInactive]}>
              En Venta
            </Text>
          </TouchableOpacity>
        </View>

        {/* PART 7A — MI JARDÍN TAB */}
        {activeTab === "jardin" && (
          <View>
            {/* Health Summary Pills */}
            <View style={styles.healthSummary}>
              <TouchableOpacity
                style={[styles.healthPill, {
                  backgroundColor: healthFilter === "saludable"
                    ? "rgba(74,222,128,0.2)"
                    : theme.mode === "dark" ? "rgba(74,222,128,0.08)" : "rgba(74,222,128,0.12)",
                  borderColor: healthFilter === "saludable"
                    ? theme.colors.primary
                    : theme.mode === "dark" ? "rgba(74,222,128,0.18)" : "rgba(74,222,128,0.3)"
                }]}
                onPress={() => handleHealthFilter("saludable")}
                activeOpacity={0.7}
              >
                <Ionicons name="checkmark-circle-outline" color={theme.colors.primary} size={13} />
                <Text style={[styles.healthText, { color: theme.colors.primary }]}>{healthyCount} Sanas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.healthPill, {
                  backgroundColor: healthFilter === "atención"
                    ? "rgba(251,191,36,0.2)"
                    : theme.mode === "dark" ? "rgba(251,191,36,0.08)" : "rgba(251,191,36,0.12)",
                  borderColor: healthFilter === "atención"
                    ? theme.colors.warning
                    : theme.mode === "dark" ? "rgba(251,191,36,0.18)" : "rgba(251,191,36,0.3)"
                }]}
                onPress={() => handleHealthFilter("atención")}
                activeOpacity={0.7}
              >
                <Ionicons name="warning-outline" color={theme.colors.warning} size={13} />
                <Text style={[styles.healthText, { color: theme.colors.warning }]}>{attentionCount} Atencion</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.healthPill, {
                  backgroundColor: healthFilter === "riesgo"
                    ? "rgba(248,113,113,0.2)"
                    : theme.mode === "dark" ? "rgba(248,113,113,0.08)" : "rgba(248,113,113,0.12)",
                  borderColor: healthFilter === "riesgo"
                    ? theme.colors.error
                    : theme.mode === "dark" ? "rgba(248,113,113,0.18)" : "rgba(248,113,113,0.3)"
                }]}
                onPress={() => handleHealthFilter("riesgo")}
                activeOpacity={0.7}
              >
                <Ionicons name="alert-circle-outline" color={theme.colors.error} size={13} />
                <Text style={[styles.healthText, { color: theme.colors.error }]}>{riskCount} Riesgo</Text>
              </TouchableOpacity>
            </View>

            {/* Plants Mini Grid */}
            {(() => {
              if (filteredPlants.length === 0) {
                return (
                  <View style={styles.emptyGardenCard}>
                    <Ionicons name="leaf-outline" size={24} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyGardenText}>
                      {healthFilter ? "Sin plantas en esta categoría" : "Aun no tienes plantas"}
                    </Text>
                  </View>
                );
              }

              const itemsToRender: Array<
                | { type: "plant"; data: PlantaCompletaInterface; globalIndex: number }
                | { type: "more"; data: null; globalIndex: number }
              > = filteredPlants.slice(0, hasMore ? 5 : 6).map((plant, idx) => ({
                type: "plant",
                data: plant,
                globalIndex: idx,
              }));

              if (hasMore) {
                itemsToRender.push({
                  type: "more",
                  data: null,
                  globalIndex: 5,
                });
              }

              const col1 = itemsToRender.filter((_, idx) => idx % 2 === 0);
              const col2 = itemsToRender.filter((_, idx) => idx % 2 !== 0);

              const getCellHeight = (globalIdx: number) => {
                switch (globalIdx) {
                  case 0:
                    return 200;
                  case 1:
                    return 140;
                  case 2:
                    return 140;
                  case 3:
                    return 200;
                  case 4:
                    return 170;
                  case 5:
                  default:
                    return 120;
                }
              };

              return (
                <View style={styles.plantsGrid}>
                  {/* Column 1 */}
                  <View style={styles.gridColumn}>
                    {col1.map((item) => {
                      const cellHeight = getCellHeight(item.globalIndex);
                      if (item.type === "plant") {
                        const plant = item.data;
                        return (
                          <View key={plant.id} style={[styles.plantCell, { height: cellHeight }]}>
                            {!!plant.imagen && (
                              <Image source={{ uri: plant.imagen }} style={styles.plantCellImage} resizeMode="cover" />
                            )}
                            <LinearGradient
                              colors={["transparent", "rgba(0,0,0,0.85)"]}
                              style={styles.plantCellOverlay}
                            />
                            <View
                              style={[
                                styles.plantCellDot,
                                {
                                  backgroundColor:
                                    plant.salud === "riesgo"
                                      ? theme.colors.error
                                      : plant.salud === "atención"
                                      ? theme.colors.warning
                                      : theme.colors.primary,
                                },
                              ]}
                            />
                            <View style={styles.plantCellInfo}>
                              <Text style={styles.plantCellName} numberOfLines={1}>
                                {plant.nombre}
                              </Text>
                            </View>
                          </View>
                        );
                      } else {
                        return (
                          <TouchableOpacity
                            key="more-btn"
                            style={[styles.moreCell, { height: cellHeight }]}
                            onPress={() => router.push("/plants")}
                          >
                            <Text style={styles.moreCellText}>Ver todas</Text>
                            <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
                          </TouchableOpacity>
                        );
                      }
                    })}
                  </View>

                  {/* Column 2 */}
                  <View style={styles.gridColumn}>
                    {col2.map((item) => {
                      const cellHeight = getCellHeight(item.globalIndex);
                      if (item.type === "plant") {
                        const plant = item.data;
                        return (
                          <View key={plant.id} style={[styles.plantCell, { height: cellHeight }]}>
                            {!!plant.imagen && (
                              <Image source={{ uri: plant.imagen }} style={styles.plantCellImage} resizeMode="cover" />
                            )}
                            <LinearGradient
                              colors={["transparent", "rgba(0,0,0,0.85)"]}
                              style={styles.plantCellOverlay}
                            />
                            <View
                              style={[
                                styles.plantCellDot,
                                {
                                  backgroundColor:
                                    plant.salud === "riesgo"
                                      ? theme.colors.error
                                      : plant.salud === "atención"
                                      ? theme.colors.warning
                                      : theme.colors.primary,
                                },
                              ]}
                            />
                            <View style={styles.plantCellInfo}>
                              <Text style={styles.plantCellName} numberOfLines={1}>
                                {plant.nombre}
                              </Text>
                            </View>
                          </View>
                        );
                      } else {
                        return (
                          <TouchableOpacity
                            key="more-btn"
                            style={[styles.moreCell, { height: cellHeight }]}
                            onPress={() => router.push("/plants")}
                          >
                            <Text style={styles.moreCellText}>Ver todas</Text>
                            <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
                          </TouchableOpacity>
                        );
                      }
                    })}
                  </View>
                </View>
              );
            })()}
          </View>
        )}

        {/* PART 7B — EN VENTA TAB */}
        {activeTab === "ventas" && (
          <View style={styles.salesEmptyCard}>
            <Ionicons name="pricetag-outline" size={36} color={theme.colors.textSecondary} />
            <Text style={styles.salesEmptyTitle}>Proximamente</Text>
            <Text style={styles.salesEmptySub}>Pronto podras vender tus plantas</Text>
            <View style={styles.salesPill}>
              <Text style={styles.salesPillText}>Marketplace de plantas</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      {showEdit && (
        <EditProfileModal
          visible={showEdit}
          user={user}
          userId={userId}
          plants={plants}
          onClose={() => setShowEdit(false)}
          onSaved={handleSaved}
          onError={(msg) => showToast("error", msg)}
        />
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: theme.mode === "dark" ? "rgba(14, 26, 18, 0.97)" : "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarEditWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    position: "relative",
  },
  avatarEditImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarEditPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEditCameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.mode === "dark" ? "rgba(14,26,18,0.97)" : "#FFFFFF",
  },
  avatarEditLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  avatarEditSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  favPlantCard: {
    width: 76,
    alignItems: "center",
    gap: 6,
  },
  favPlantCardSelected: {},
  favPlantImgBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBackground,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  favPlantImgBoxSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(74,222,128,0.08)",
  },
  favPlantImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  favPlantName: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: "center",
    width: 72,
  },
  favPlantNameSelected: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
  fieldLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  modalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.backgroundChip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalChipSelected: {
    backgroundColor: theme.colors.accentDim,
    borderColor: theme.colors.primary,
  },
  modalChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  modalChipTextSelected: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: theme.colors.textOnAccent,
    fontSize: 15,
    fontWeight: "600",
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  bannerContainer: {
    height: 220,
    width: "100%",
    position: "relative",
  },
  bannerImage: {
    height: 220,
    width: "100%",
  },
  bannerGradient: {
    height: 220,
    width: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 20,
  },
  topBarRight: {
    flexDirection: "row",
    gap: 14,
  },
  avatarOuter: {
    position: "absolute",
    bottom: -45,
    left: 20,
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 2.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  avatarInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  identityContainer: {
    marginTop: 54,
    paddingHorizontal: 20,
  },
  identityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  identityLeft: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  apodo: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  infoRow: {
    marginTop: 6,
    flexDirection: "row",
    gap: 8,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.backgroundChip,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  infoChipText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  identityRight: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editBtnText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  shareBtn: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 19,
    marginTop: 10,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: theme.colors.backgroundCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    shadowColor: theme.shadows.card.color,
    shadowOpacity: theme.shadows.card.opacity,
    shadowRadius: theme.shadows.card.radius,
    shadowOffset: theme.shadows.card.offset,
    elevation: theme.shadows.card.elevation,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 19,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
  },
  rowCards: {
    marginHorizontal: 20,
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  favCard: {
    flex: 1.4,
    backgroundColor: theme.colors.successDim,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: 14,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    minHeight: 110,
    shadowColor: theme.shadows.card.color,
    shadowOpacity: theme.shadows.card.opacity,
    shadowRadius: theme.shadows.card.radius,
    shadowOffset: theme.shadows.card.offset,
    elevation: theme.shadows.card.elevation,
  },
  favTitle: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: theme.colors.primary,
  },
  favName: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.textPrimary,
    marginTop: 4,
    paddingRight: 60,
  },
  favImage: {},
  favEmpty: {
    flexDirection: "column",
    gap: 6,
    alignItems: "flex-start",
  },
  favEmptyText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  streakCard: {
    flex: 1,
    backgroundColor: theme.colors.warningDim,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: 14,
    justifyContent: "center",
    minHeight: 110,
    shadowColor: theme.shadows.card.color,
    shadowOpacity: theme.shadows.card.opacity,
    shadowRadius: theme.shadows.card.radius,
    shadowOffset: theme.shadows.card.offset,
    elevation: theme.shadows.card.elevation,
  },
  streakValue: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  streakLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  categoriesContainer: {
    marginHorizontal: 20,
    marginTop: 14,
  },
  categoriesTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  categoryScroll: {
    flexDirection: "row",
  },
  categoryChip: {
    backgroundColor: theme.colors.backgroundChip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tabContainer: {
    marginHorizontal: 20,
    marginTop: 22,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    paddingBottom: 12,
    alignItems: "center",
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
  },
  tabTextActive: {
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  tabTextInactive: {
    color: theme.colors.textSecondary,
  },
  healthSummary: {
    marginTop: 16,
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 20,
  },
  healthPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  healthText: {
    fontSize: 11,
    fontWeight: "500",
  },
  plantsGrid: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 14,
  },
  gridColumn: {
    flex: 1,
    gap: 8,
  },
  plantCell: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  plantCellImage: {
    width: "100%",
    height: "100%",
  },
  plantCellOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
  },
  plantCellInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    paddingBottom: 10,
  },
  plantCellName: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  plantCellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreCell: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: theme.colors.backgroundChip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  moreCellText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  emptyGardenCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 14,
    height: 100,
  },
  emptyGardenText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  salesEmptyCard: {
    height: 180,
    backgroundColor: theme.colors.backgroundCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...theme.shadows.card,
  },
  salesEmptyTitle: {
    fontSize: 15,
    fontWeight: "300",
    color: theme.colors.textSecondary,
  },
  salesEmptySub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  salesPill: {
    backgroundColor: theme.colors.successDim,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  salesPillText: {
    fontSize: 11,
    color: theme.colors.primary,
  },
  // Banner Preview Styles
  bannerPreviewContainer: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 20,
  },
  bannerPreviewImage: {
    width: "100%",
    height: "100%",
  },
  bannerPreviewGradient: {
    width: "100%",
    height: "100%",
  },
  bannerPreviewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  changeBannerBtn: {
    position: "absolute",
    alignSelf: "center",
    top: "35%",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changeBannerText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },

  // Bottom Sheet Styles
  bottomSheetBackground: {
    backgroundColor: theme.mode === "dark" ? "rgba(14, 26, 18, 0.97)" : "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  sheetHeader: {
    fontSize: 16,
    fontWeight: "300",
    color: theme.colors.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sheetScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sheetScrollContent: {
    gap: 16,
    flexDirection: "column",
    paddingBottom: 120,
  },
  optionWrapper: {
    width: "100%",
    position: "relative",
  },
  bannerOption: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerOptionSelected: {
    borderColor: theme.colors.primary,
  },
  bannerOptionGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "left",
    marginTop: 4,
    paddingLeft: 4,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
  checkmarkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 4,
    zIndex: 10,
  },
  applyButton: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textOnAccent,
  },
});
