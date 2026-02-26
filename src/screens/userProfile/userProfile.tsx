import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserInterface } from "../../types-dtos/user.types";
import { styles } from "./UserProfile.styles";

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
    nombre: "Monstera deliciosa",
    imagen:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
  },
};

const categoryEmojis: Record<string, string> = {
  Interior: "🏡",
  Tropicales: "🌴",
  Suculentas: "🪴",
  "Aromáticas": "🌿",
  Cactus: "🌵",
};

export default function UserProfile() {
  const metrics = [
    { label: "Plantas", value: String(user.cantidadPlantas), icon: "🌿" },
    { label: "Amigos", value: String(user.cantidadAmigos), icon: "👥" },
    { label: "Racha", value: `${user.racha}d`, icon: "🔥" },
    { label: "Cumpleaños", value: user.cumpleanos, icon: "🎂" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi perfil</Text>
          <View style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={20} color="#E6EDF3" />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile card */}
          <View style={[styles.card, { marginBottom: 14 }]}>
            <View style={styles.profileRow}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: user.image }} style={styles.avatar} />
              </View>
              <View style={styles.nameBlock}>
                <Text style={styles.nameText}>{user.nombre}</Text>
                <Text style={styles.handleText}>@{user.apodo}</Text>
                <View style={styles.privacyPill}>
                  <Text style={styles.privacyText}>{user.privacidad}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.description}>{user.descripcion}</Text>
          </View>

          {/* Metrics card */}
          <View style={[styles.card, { paddingVertical: 16 }]}>
            <View style={styles.metricsRow}>
              {metrics.map((item, index) => (
                <View
                  key={item.label}
                  style={[
                    styles.metricCard,
                    index === metrics.length - 1 ? styles.metricCardLast : undefined,
                  ]}
                >
                  <Text style={styles.metricIcon}>{item.icon}</Text>
                  <Text style={styles.metricLabel}>{item.label}</Text>
                  <Text
                    style={styles.metricValue}
                    adjustsFontSizeToFit
                    numberOfLines={1}
                  >
                    {item.value}
                  </Text>
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
            <View style={styles.chipsContainer}>
              {user.categoriasPlantas.map((categoria) => (
                <View key={categoria} style={styles.chip}>
                  <Text style={styles.chipText}>
                    {categoryEmojis[categoria] ?? "🌱"} {categoria}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
