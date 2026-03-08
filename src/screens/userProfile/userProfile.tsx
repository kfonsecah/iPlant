import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ImageBackground, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/desingSystem";
import { UserInterface } from "../../types-dtos/user.types";
import { createStyles } from "./UserProfile.styles";

const IMG_GRASS = require("../../../assets/images/icon_grass_transparent.png");
const IMG_USERS = require("../../../assets/images/icon_users_transparent.png");
const IMG_FIRE  = require("../../../assets/images/icon_fire_transaprent.png");

const user: UserInterface = {
  nombre: "Valeria Campos",
  apodo: "valcam",
  image:
    "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80",
  descripcion:
    "Curadora de selva urbana. Me gustan los rincones verdes, las hojas enormes y las macetas con personalidad.",
  privacidad: "Privado",
  cumpleanos: "12/04",
  racha: 27,
  cantidadPlantas: 18,
  cantidadAmigos: 142,
  categoriasPlantas: ["Interior", "Tropicales", "Suculentas", "Aromáticas", "Cactus"],
  plantaFavorita: {
    nombre: "Canabis Sativa",
    imagen:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
  },
};

type CategoryMeta = {
  sub: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

const categoryMeta: Record<string, CategoryMeta> = {
  Interior:    { sub: "Plantas de hogar",  icon: "home"         },
  Tropicales:  { sub: "Climas cálidos",    icon: "leaf"         },
  Suculentas:  { sub: "Bajo riego",        icon: "sunny"        },
  "Aromáticas":{ sub: "Sabor y aroma",     icon: "flower"       },
  Cactus:      { sub: "Alta resistencia",  icon: "leaf-outline" },
};

const BANNER_URI =
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80";

export default function UserProfile() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const metrics = [
    { label: "Plantas",    value: String(user.cantidadPlantas), decor: IMG_GRASS },
    { label: "Amigos",     value: String(user.cantidadAmigos),  decor: IMG_USERS },
    { label: "Racha",      value: `${user.racha}d`,             decor: IMG_FIRE  },
    { label: "Cumpleaños", value: user.cumpleanos,              decor: null      },
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
          <View style={styles.cardNoPadding}>
            {/* Banner */}
            <View style={styles.bannerContainer}>
              <Image source={{ uri: BANNER_URI }} style={styles.bannerImage} resizeMode="cover" />
            </View>

            {/* Avatar centrado sobre el banner */}
            <View style={styles.avatarOuter}>
              <View style={styles.avatarWrapperCenter}>
                <Image source={{ uri: user.image }} style={styles.avatar} />
              </View>
            </View>

            {/* Info centrada */}
            <View style={styles.profileInfoCenter}>
              <Text style={styles.nameCentered}>{user.nombre}</Text>
              <Text style={styles.handleCentered}>@{user.apodo}</Text>
              <View style={styles.privacyPillCenter}>
                <Text style={styles.privacyText}>{user.privacidad}</Text>
              </View>
              <Text style={styles.descriptionCentered}>{user.descripcion}</Text>
            </View>

            {/* Divisor */}
            <View style={styles.profileDivider} />

            {/* Acciones */}
            <View style={styles.profileActionRow}>
              <TouchableOpacity style={styles.editBtn} activeOpacity={theme.opacity.pressableTab}>
                <Text style={styles.editBtnText}>Editar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} activeOpacity={theme.opacity.pressableButton}>
                <Ionicons name="share-social-outline" size={theme.dimensions.shareIconSize} color={theme.colors.textOnAccent} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Metrics card */}
          <View style={styles.cardMetrics}>
            <View style={styles.metricsRow}>
              {metrics.map((item, index) => (
                <View
                  key={item.label}
                  style={[
                    styles.metricCard,
                    index === metrics.length - 1 ? styles.metricCardLast : undefined,
                  ]}
                >
                  <Text style={styles.metricLabel}>{item.label}</Text>
                  <Text
                    style={styles.metricValue}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                  >
                    {item.value}
                  </Text>
                  {item.decor && (
                    <Image
                      source={item.decor}
                      style={styles.metricGrassImage}
                      resizeMode="contain"
                    />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Favorite plant card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Planta favorita</Text>
            {user.plantaFavorita.imagen ? (
              <Image
                source={{ uri: user.plantaFavorita.imagen }}
                style={styles.favoriteImageFull}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.favoriteImageFull} />
            )}
            <Text style={styles.favoriteSubLabel}>Siempre en el centro de atención</Text>
            <Text style={styles.favoriteName}>{user.plantaFavorita.nombre}</Text>
          </View>

          {/* Categories card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Categorías</Text>
            <View style={styles.categoryGrid}>
              {user.categoriasPlantas.map((categoria, index) => {
                const meta = categoryMeta[categoria] ?? { sub: "", icon: "leaf" as const };
                const isLast = index === user.categoriasPlantas.length - 1;
                const isOdd = user.categoriasPlantas.length % 2 !== 0;
                return (
                  <View
                    key={categoria}
                    style={[
                      styles.categoryCardItem,
                      isLast && isOdd && styles.categoryCardItemFull,
                    ]}
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
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}
