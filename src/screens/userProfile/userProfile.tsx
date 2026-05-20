import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Animated,
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

import AppInput from "../../components/ui/appInput/AppInput";
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
  onClose,
  onSaved,
  onError,
}: {
  visible:  boolean;
  user:     UserInterface;
  userId:   string;
  onClose:  () => void;
  onSaved:  (updated: Partial<UserInterface>) => void;
  onError:  (msg: string) => void;
}) {
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
      const bannerImage = ""; // Clear custom URL since local selection is preferred when index is set or cleared
      const bannerIdentifier = selectedBannerIndex === 0 ? "" : `local:banner${selectedBannerIndex}`;

      const updatedData = {
        ...data,
        privacidad: data.privacidad as PrivacidadPerfil,
        bannerImage,
        bannerIdentifier,
      };
      await updateUser(userId, updatedData);
      onSaved(updatedData);
      onClose();
    } catch {
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
            <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width: "100%" }}>
              <Animated.View style={[styles.modalCard, { transform: [{ translateY }] }]}>
                {/* Drag handle at the top */}
                <View style={styles.modalHandle} {...panResponder.panHandlers} />

                <View style={styles.modalHeader} {...panResponder.panHandlers}>
                  <Text style={styles.modalTitle}>Editar perfil</Text>
                  <TouchableOpacity style={styles.modalCloseBtn} onPress={handleClose}>
                    <Ionicons name="close" size={18} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                  <View style={{ gap: 16 }}>
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
                              color={privacidad === op ? "#4ade80" : "rgba(255,255,255,0.4)"}
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
            </TouchableOpacity>
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
          handleIndicatorStyle={{ backgroundColor: "rgba(255,255,255,0.2)" }}
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
                  <Ionicons name="checkmark" size={12} color="#000" />
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
                      <Ionicons name="checkmark" size={12} color="#000" />
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
      <SafeAreaView style={[styles.safeArea, { alignItems: "center", justifyContent: "center" }]} edges={["top"]}>
        <ActivityIndicator size="large" color="#4ade80" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, { alignItems: "center", justifyContent: "center" }]} edges={["top"]}>
        <Text style={{ color: "#f87171" }}>No se pudo cargar el perfil.</Text>
      </SafeAreaView>
    );
  }

  // Count plants by health status
  const healthyCount = plants.filter(p => p.salud === "saludable").length;
  const attentionCount = plants.filter(p => p.salud === "atención").length;
  const riskCount = plants.filter(p => p.salud === "riesgo").length;

  // Grid logic
  const hasMore = plants.length > 6;
  const displayedPlants = plants.slice(0, hasMore ? 5 : 6);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

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
            colors={["transparent", "#000000"]}
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
              <Ionicons name="person-circle" size={86} color="#4ade80" />
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
                    color="rgba(255,255,255,0.4)"
                  />
                  <Text style={styles.infoChipText}>{user.privacidad}</Text>
                </View>

                {!!user.cumpleanos && (
                  <View style={styles.infoChip}>
                    <Ionicons name="gift-outline" size={10} color="rgba(255,255,255,0.4)" />
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
                <Ionicons name="share-outline" size={16} color="white" />
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
            <Ionicons name="leaf-outline" color="#4ade80" size={14} />
            <Text style={styles.statValue}>{user.cantidadPlantas}</Text>
            <Text style={styles.statLabel}>Plantas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="people-outline" color="white" size={14} />
            <Text style={styles.statValue}>{user.cantidadAmigos}</Text>
            <Text style={styles.statLabel}>Amigos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="flame" color="#fbbf24" size={14} />
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
                <Text style={styles.favTitle}>Favorita</Text>
                <Text style={styles.favName} numberOfLines={1}>{user.plantaFavorita.nombre}</Text>
                {!!user.plantaFavorita.imagen && (
                  <Image source={{ uri: user.plantaFavorita.imagen }} style={styles.favImage} resizeMode="contain" />
                )}
              </>
            ) : (
              <View style={styles.favEmpty}>
                <Ionicons name="leaf-outline" size={28} color="rgba(74,222,128,0.2)" />
                <Text style={styles.favEmptyText}>Sin favorita</Text>
              </View>
            )}
          </View>

          <View style={styles.streakCard}>
            <Ionicons name="flame" size={24} color="#fbbf24" />
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
              <View style={[styles.healthPill, { backgroundColor: "rgba(74,222,128,0.08)", borderColor: "rgba(74,222,128,0.18)" }]}>
                <Ionicons name="checkmark-circle-outline" color="#4ade80" size={13} />
                <Text style={[styles.healthText, { color: "#4ade80" }]}>{healthyCount} Sanas</Text>
              </View>
              <View style={[styles.healthPill, { backgroundColor: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.18)" }]}>
                <Ionicons name="warning-outline" color="#fbbf24" size={13} />
                <Text style={[styles.healthText, { color: "#fbbf24" }]}>{attentionCount} Atencion</Text>
              </View>
              <View style={[styles.healthPill, { backgroundColor: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.18)" }]}>
                <Ionicons name="alert-circle-outline" color="#f87171" size={13} />
                <Text style={[styles.healthText, { color: "#f87171" }]}>{riskCount} Riesgo</Text>
              </View>
            </View>

            {/* Plants Mini Grid */}
            {(() => {
              if (plants.length === 0) {
                return (
                  <View style={styles.emptyGardenCard}>
                    <Ionicons name="leaf-outline" size={24} color="rgba(255,255,255,0.15)" />
                    <Text style={styles.emptyGardenText}>Aun no tienes plantas</Text>
                  </View>
                );
              }

              const itemsToRender: Array<
                | { type: "plant"; data: PlantaCompletaInterface; globalIndex: number }
                | { type: "more"; data: null; globalIndex: number }
              > = plants.slice(0, hasMore ? 5 : 6).map((plant, idx) => ({
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
                              colors={["transparent", "rgba(0,0,0,0.6)"]}
                              style={styles.plantCellOverlay}
                            />
                            <View
                              style={[
                                styles.plantCellDot,
                                {
                                  backgroundColor:
                                    plant.salud === "riesgo"
                                      ? "#f87171"
                                      : plant.salud === "atención"
                                      ? "#fbbf24"
                                      : "#4ade80",
                                },
                              ]}
                            />
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
                            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.5)" />
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
                              colors={["transparent", "rgba(0,0,0,0.6)"]}
                              style={styles.plantCellOverlay}
                            />
                            <View
                              style={[
                                styles.plantCellDot,
                                {
                                  backgroundColor:
                                    plant.salud === "riesgo"
                                      ? "#f87171"
                                      : plant.salud === "atención"
                                      ? "#fbbf24"
                                      : "#4ade80",
                                },
                              ]}
                            />
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
                            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.5)" />
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
            <Ionicons name="pricetag-outline" size={36} color="rgba(255,255,255,0.1)" />
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
          onClose={() => setShowEdit(false)}
          onSaved={handleSaved}
          onError={(msg) => showToast("error", msg)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#0a0a0a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
    color: "white",
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
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
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalChipSelected: {
    backgroundColor: "rgba(74, 222, 128, 0.08)",
    borderColor: "#4ade80",
  },
  modalChipText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  modalChipTextSelected: {
    color: "#4ade80",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#4ade80",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#000",
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
    borderColor: "#4ade80",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  avatarInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: "#000",
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
    color: "white",
  },
  apodo: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.4)",
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
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  infoChipText: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.4)",
  },
  identityRight: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editBtnText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  shareBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 10,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    lineHeight: 19,
    marginTop: 10,
  },
  statsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 19,
    fontWeight: "600",
    color: "white",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.35)",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
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
    backgroundColor: "rgba(74, 222, 128, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.1)",
    borderRadius: 18,
    padding: 14,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    minHeight: 110,
  },
  favTitle: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#4ade80",
  },
  favName: {
    fontSize: 15,
    fontWeight: "500",
    color: "white",
    marginTop: 4,
    paddingRight: 60,
  },
  favImage: {
    position: "absolute",
    right: -10,
    bottom: -10,
    width: 80,
    height: 80,
    opacity: 0.85,
  },
  favEmpty: {
    flexDirection: "column",
    gap: 6,
    alignItems: "flex-start",
  },
  favEmptyText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.25)",
  },
  streakCard: {
    flex: 1,
    backgroundColor: "rgba(251, 191, 36, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.1)",
    borderRadius: 18,
    padding: 14,
    justifyContent: "center",
    minHeight: 110,
  },
  streakValue: {
    fontSize: 22,
    fontWeight: "600",
    color: "white",
    marginTop: 4,
  },
  streakLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.35)",
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
    color: "rgba(255, 255, 255, 0.3)",
    marginBottom: 8,
  },
  categoryScroll: {
    flexDirection: "row",
  },
  categoryChip: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  tabContainer: {
    marginHorizontal: 20,
    marginTop: 22,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.07)",
  },
  tabButton: {
    flex: 1,
    paddingBottom: 12,
    alignItems: "center",
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#4ade80",
  },
  tabText: {
    fontSize: 14,
  },
  tabTextActive: {
    fontWeight: "500",
    color: "white",
  },
  tabTextInactive: {
    color: "rgba(255, 255, 255, 0.3)",
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
    height: "40%",
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
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  moreCellText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
  },
  emptyGardenCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 14,
    height: 100,
  },
  emptyGardenText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.25)",
    marginTop: 6,
  },
  salesEmptyCard: {
    height: 180,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  salesEmptyTitle: {
    fontSize: 15,
    fontWeight: "300",
    color: "rgba(255, 255, 255, 0.3)",
  },
  salesEmptySub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.2)",
  },
  salesPill: {
    backgroundColor: "rgba(74, 222, 128, 0.07)",
    borderColor: "rgba(74, 222, 128, 0.15)",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  salesPillText: {
    fontSize: 11,
    color: "rgba(74, 222, 128, 0.7)",
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
    backgroundColor: "#0a0a0a",
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
    color: "white",
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
    borderColor: "#4ade80",
  },
  bannerOptionGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  optionLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    textAlign: "left",
    marginTop: 4,
    paddingLeft: 4,
  },
  optionLabelSelected: {
    color: "#4ade80",
    fontWeight: "500",
  },
  checkmarkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4ade80",
    borderRadius: 12,
    padding: 4,
    zIndex: 10,
  },
  applyButton: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#4ade80",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
});
