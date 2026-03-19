import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ImageBackground, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/desingSystem";
import { getUserById } from "../../services/userService";
import { UserInterface } from "../../types-dtos/user.types";
import { createStyles } from "./UserProfile.styles";

const IMG_GRASS = require("../../../assets/images/icon_grass_transparent.png");
const IMG_USERS = require("../../../assets/images/icon_users_transparent.png");
const IMG_FIRE  = require("../../../assets/images/icon_fire_transaprent.png");

// ID del usuario activo — se reemplazará con auth real
const CURRENT_USER_ID = "user-1";

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

export default function UserProfile() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [user, setUser] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserById(CURRENT_USER_ID)
      .then((data) => setUser(data))
      .finally(() => setLoading(false));
  }, []);

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
      <ImageBackground
        source={require("../../../assets/images/LogInBackground.png")}
        style={styles.container}
        imageStyle={styles.bgImage}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi perfil</Text>
          <View style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={theme.dimensions.settingsIconSize} color={theme.colors.textPrimary} />
          </View>
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
              <TouchableOpacity style={styles.editBtn} activeOpacity={theme.opacity.pressableTab}>
                <Text style={styles.editBtnText}>Editar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} activeOpacity={theme.opacity.pressableButton}>
                <Ionicons name="share-social-outline" size={theme.dimensions.shareIconSize} color={theme.colors.textOnAccent} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Metrics card */}
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
    </SafeAreaView>
  );
}
