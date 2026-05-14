import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import AppInput from "../../components/ui/appInput/AppInput";
import Toast, { ToastType } from "../../components/ui/toast/Toast";
import { getUserById, updateUser } from "../../services/userService";
import { useTheme } from "../../theme/desingSystem";
import { PrivacidadPerfil, UserInterface } from "../../types-dtos/user.types";
import { createStyles } from "./userProfile.styles";
import { useAuth } from "../../context/AuthContext";
import { logOut } from "../../services/authService";

const IMG_GRASS = require("../../../assets/images/icon_grass_transparent.png");
const IMG_USERS = require("../../../assets/images/icon_users_transparent.png");
const IMG_FIRE  = require("../../../assets/images/icon_fire_transaprent.png");

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const editUserSchema = z.object({
  nombre:      z.string().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
  apodo:       z.string().min(2, "Mínimo 2 caracteres").max(30, "Máximo 30 caracteres"),
  descripcion: z.string().max(200, "Máximo 200 caracteres"),
  privacidad:  z.enum(["Público", "Privado"]),
});

type EditUserForm = z.infer<typeof editUserSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

type CategoryMeta = {
  sub: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

const categoryMeta: Record<string, CategoryMeta> = {
  Interior:     { sub: "Plantas de hogar", icon: "home"         },
  Tropicales:   { sub: "Climas cálidos",   icon: "leaf"         },
  Suculentas:   { sub: "Bajo riego",       icon: "sunny"        },
  "Aromáticas": { sub: "Sabor y aroma",    icon: "flower"       },
  Cactus:       { sub: "Alta resistencia", icon: "leaf-outline" },
};

type Logro = {
  id: string;
  nombre: string;
  sub: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  unlocked: boolean;
};

function buildLogros(user: UserInterface): Logro[] {
  return [
    { id: "1", nombre: "Primera Detección", sub: "Identificaste tu primera planta",  icon: "leaf",           unlocked: true },
    { id: "2", nombre: "Identificador Pro", sub: "10+ identificaciones",              icon: "scan-outline",   unlocked: user.detecciones >= 10 },
    { id: "3", nombre: "Coleccionista",     sub: "10+ plantas en colección",          icon: "apps",           unlocked: user.cantidadPlantas >= 10 },
    { id: "4", nombre: "Racha Constante",   sub: "7 días seguidos cuidando",          icon: "flame",          unlocked: user.racha >= 7 },
    { id: "5", nombre: "Explorador",        sub: "5 categorías distintas",            icon: "compass-outline",unlocked: user.categoriasPlantas.length >= 5 },
    { id: "6", nombre: "Social Verde",      sub: "50+ amigos planteros",              icon: "people-outline", unlocked: user.cantidadAmigos >= 50 },
  ];
}

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
  const theme = useTheme();
  const styles = createStyles(theme);

  const { control, handleSubmit, formState: { errors }, reset, watch, setValue } =
    useForm<EditUserForm>({
      resolver: zodResolver(editUserSchema),
      defaultValues: {
        nombre:      user.nombre,
        apodo:       user.apodo,
        descripcion: user.descripcion,
        privacidad:  user.privacidad,
      },
    });

  const privacidad = watch("privacidad");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      reset({
        nombre:      user.nombre,
        apodo:       user.apodo,
        descripcion: user.descripcion,
        privacidad:  user.privacidad,
      });
    }
  }, [visible]);

  const onSubmit = async (data: EditUserForm) => {
    setSaving(true);
    try {
      await updateUser(userId, data);
      onSaved(data);
      onClose();
    } catch {
      onError("No se pudo guardar. Verifica tu conexión.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalCard}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar perfil</Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
                  <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                <View style={{ gap: theme.scale.lg }}>
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
                        label="Descripción"
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
                      {(["Público", "Privado"] as PrivacidadPerfil[]).map((op) => (
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
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── UserProfile ──────────────────────────────────────────────────────────────

export default function UserProfile() {
  const theme    = useTheme();
  const styles   = createStyles(theme);
  const { user: authUser } = useAuth();
  const userId = authUser?.uid ?? "";

  const [user, setUser] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; type: ToastType; message: string }>({
    visible: false, type: "success", message: "",
  });

  useEffect(() => {
    if (!userId) return;
    getUserById(userId)
      .then((data) => setUser(data))
      .finally(() => setLoading(false));
  }, [userId]);

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
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, { alignItems: "center", justifyContent: "center" }]} edges={["top"]}>
        <Text style={{ color: theme.colors.error }}>No se pudo cargar el perfil.</Text>
      </SafeAreaView>
    );
  }

  const logros = buildLogros(user);
  const bannerUri = user.bannerImage ?? "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80";

  const metrics = [
    { label: "Plantas",    value: String(user.cantidadPlantas), decor: IMG_GRASS },
    { label: "Amigos",     value: String(user.cantidadAmigos),  decor: IMG_USERS },
    { label: "Racha",      value: `${user.racha}d`,             decor: IMG_FIRE  },
    { label: "Detectadas", value: String(user.detecciones),     decor: null      },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* Toast — parte superior, fuera del scroll */}
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi perfil</Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            activeOpacity={theme.opacity.pressableTab}
            onPress={() => logOut()}
          >
            <Ionicons name="log-out-outline" size={theme.dimensions.settingsIconSize} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile card */}
          <Animated.View style={styles.cardNoPadding} entering={FadeInDown.duration(500)}>
            <View style={styles.bannerContainer}>
              <Image source={{ uri: bannerUri }} style={styles.bannerImage} resizeMode="cover" />
              <View style={styles.bannerOverlay} />
            </View>
            <View style={styles.avatarOuter}>
              <Animated.View style={styles.avatarWrapperCenter} entering={ZoomIn.delay(300).duration(400)}>
                <Image source={{ uri: user.image }} style={styles.avatar} />
              </Animated.View>
            </View>
            <View style={styles.profileInfoCenter}>
              <Text style={styles.nameCentered}>{user.nombre}</Text>
              <Text style={styles.handleCentered}>@{user.apodo}</Text>
              <View style={styles.privacyPillCenter}>
                <Text style={styles.privacyText}>{user.privacidad}</Text>
              </View>
              <Text style={styles.descriptionCentered}>{user.descripcion}</Text>
            </View>
            <View style={styles.profileDivider} />
            <View style={styles.profileActionRow}>
              <TouchableOpacity
                style={styles.editBtn}
                activeOpacity={theme.opacity.pressableTab}
                onPress={() => setShowEdit(true)}
              >
                <Text style={styles.editBtnText}>Editar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} activeOpacity={theme.opacity.pressableButton}>
                <Ionicons name="share-social-outline" size={theme.dimensions.shareIconSize} color={theme.colors.textOnAccent} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Metrics */}
          <Animated.View style={styles.cardMetrics} entering={FadeInUp.delay(150).duration(500)}>
            <View style={styles.metricsRow}>
              {metrics.map((item, index) => (
                <View
                  key={item.label}
                  style={[styles.metricCard, index === metrics.length - 1 ? styles.metricCardLast : undefined]}
                >
                  <Text style={styles.metricLabel}>{item.label}</Text>
                  <Text style={styles.metricValue} adjustsFontSizeToFit numberOfLines={1}>
                    {item.value}
                  </Text>
                  {item.decor && (
                    <Image source={item.decor} style={styles.metricGrassImage} resizeMode="contain" />
                  )}
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Planta favorita */}
          <Animated.View style={styles.card} entering={FadeInDown.delay(250).duration(500)}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionTitle}>Planta favorita</Text>
            </View>
            <View style={styles.favoriteImageWrapper}>
              {user.plantaFavorita.imagen ? (
                <Image source={{ uri: user.plantaFavorita.imagen }} style={styles.favoriteImageFull} resizeMode="cover" />
              ) : (
                <View style={styles.favoriteImageFull} />
              )}
              <View style={styles.favoriteOverlay}>
                <Text style={styles.favoriteSubOnImage}>Siempre en el centro de atención</Text>
                <Text style={styles.favoriteNameOnImage}>{user.plantaFavorita.nombre}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Categorías */}
          <Animated.View style={styles.card} entering={FadeInUp.delay(350).duration(500)}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionTitle}>Categorías</Text>
            </View>
            <View style={styles.categoryGrid}>
              {user.categoriasPlantas.map((categoria, index) => {
                const meta = categoryMeta[categoria] ?? { sub: "", icon: "leaf" as const };
                const isLast = index === user.categoriasPlantas.length - 1;
                const isOdd = user.categoriasPlantas.length % 2 !== 0;
                return (
                  <View
                    key={categoria}
                    style={[styles.categoryCardItem, isLast && isOdd && styles.categoryCardItemFull]}
                  >
                    <Text style={styles.categoryCardTitle}>{categoria}</Text>
                    <Text style={styles.categoryCardSub}>{meta.sub}</Text>
                    <View style={styles.categoryCardIcon}>
                      <Ionicons name={meta.icon} size={theme.dimensions.categoryIconSize} color={theme.colors.accent} />
                    </View>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* Logros */}
          <Animated.View style={styles.card} entering={FadeInUp.delay(450).duration(500)}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionTitle}>Logros</Text>
            </View>
            <View style={styles.badgesRow}>
              {logros.map((logro) => (
                <View key={logro.id} style={[styles.badgeItem, !logro.unlocked && styles.badgeItemLocked]}>
                  <View style={[styles.badgeIconWrap, !logro.unlocked && styles.badgeIconWrapLocked]}>
                    <Ionicons
                      name={logro.unlocked ? logro.icon : "lock-closed-outline"}
                      size={16}
                      color={logro.unlocked ? theme.colors.primary : theme.colors.textSecondary}
                    />
                  </View>
                  <View style={styles.badgeTexts}>
                    <Text style={[styles.badgeName, !logro.unlocked && styles.badgeNameLocked]} numberOfLines={1}>
                      {logro.nombre}
                    </Text>
                    <Text style={styles.badgeSub} numberOfLines={1}>{logro.sub}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </ImageBackground>

      {/* Modal editar perfil */}
      {user && (
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
