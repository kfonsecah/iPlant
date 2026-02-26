import React from "react";
import { Image, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserInterface } from "../../types-dtos/user.types";
import { styles } from "./UserProfile.styles";

const user: UserInterface = {
  nombre: "Valeria Campos",
  apodo: "valcam",
  image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80",
  descripcion: "Curadora de selva urbana. Me gustan los rincones verdes, las hojas enormes y las macetas con personalidad.",
  privacidad: "Privado",
  cumpleanos: "12/04",
  racha: 27,
  cantidadPlantas: 18,
  cantidadAmigos: 142,
  categoriasPlantas: ["Interior", "Tropicales", "Suculentas", "Aromáticas", "Cactus"],
  plantaFavorita: {
    nombre: "Monstera deliciosa",
    imagen: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80",
  },
};

export default function UserProfile(): JSX.Element {
  const metrics = [
    { label: "Plantas", value: user.cantidadPlantas },
    { label: "Amigos", value: user.cantidadAmigos },
    { label: "Racha", value: `${user.racha} días` },
    { label: "Cumpleaños", value: user.cumpleanos },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi perfil</Text>
          <View style={styles.settingsIcon}>
            <Text style={styles.settingsText}>⚙︎</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { marginBottom: 20 }]}>
            <View style={styles.profileRow}>
              <Image source={{ uri: user.image }} style={styles.avatar} />
              <View style={styles.nameBlock}>
                <View style={styles.nameRow}>
                  <Text style={styles.nameText}>{user.nombre}</Text>
                  <Text style={styles.handleText}>@{user.apodo}</Text>
                </View>
                <View style={styles.privacyPill}>
                  <Text style={styles.privacyText}>{user.privacidad}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.description}>{user.descripcion}</Text>
          </View>

          <View style={[styles.card, { paddingTop: 14, paddingBottom: 14 }]}>
            <View style={styles.metricsRow}>
              {metrics.map((item, index) => (
                <View
                  key={item.label}
                  style={[styles.metricCard, index === metrics.length - 1 ? styles.metricCardLast : undefined]}
                >
                  <Text style={styles.metricLabel}>{item.label}</Text>
                  <Text style={styles.metricValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Planta favorita</Text>
            <View style={styles.favoriteRow}>
              {user.plantaFavorita.imagen ? (
                <Image source={{ uri: user.plantaFavorita.imagen }} style={styles.favoriteImage} />
              ) : (
                <View style={styles.favoriteImage} />
              )}
              <View style={styles.favoriteInfo}>
                <Text style={styles.favoriteLabel}>Siempre en el centro de atención</Text>
                <Text style={styles.favoriteName}>{user.plantaFavorita.nombre}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Categorías</Text>
            <View style={styles.chipsContainer}>
              {user.categoriasPlantas.map((categoria) => (
                <View key={categoria} style={styles.chip}>
                  <Text style={styles.chipText}>{categoria}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
