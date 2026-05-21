import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme, useTheme } from "../../src/theme/desingSystem";

const FEATURES = [
  {
    icon: "heart-outline" as const,
    title: "Salud de la planta con IA",
    desc: "Análisis continuo del estado de cada planta con score y alertas.",
  },
  {
    icon: "journal-outline" as const,
    title: "Diario de salud",
    desc: "Historial completo de revisiones para detectar tendencias.",
  },
  {
    icon: "sparkles-outline" as const,
    title: "Identificación ilimitada",
    desc: "Sin límite de identificaciones mensuales con Plant.id.",
  },
  {
    icon: "notifications-outline" as const,
    title: "Alertas inteligentes",
    desc: "Recordatorios personalizados de riego y cuidado.",
  },
];

export default function PremiumScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);
  const [loading, setLoading] = useState(false);

  const handlePurchase = () => {
    setLoading(true);
    // Simulate async purchase flow
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Próximamente",
        "El plan Premium estará disponible en el lanzamiento oficial de iPlant.",
        [{ text: "Entendido", onPress: () => router.back() }]
      );
    }, 800);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={["rgba(74,222,128,0.18)", "transparent"]}
          style={styles.heroGradient}
        >
          <View style={styles.heroBadge}>
            <Ionicons name="star" size={14} color={theme.colors.textOnAccent} />
            <Text style={styles.heroBadgeText}>PREMIUM</Text>
          </View>
          <Text style={styles.heroTitle}>Cuida tus plantas{"\n"}como un experto</Text>
          <Text style={styles.heroSub}>
            Desbloquea análisis de salud con IA y herramientas avanzadas de
            seguimiento.
          </Text>
        </LinearGradient>

        {/* Features */}
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing card */}
        <View style={styles.pricingCard}>
          <View style={styles.pricingRow}>
            <Text style={styles.price}>₡2 990</Text>
            <Text style={styles.pricePer}>/mes</Text>
          </View>
          <Text style={styles.pricingNote}>Cancela cuando quieras</Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
          onPress={handlePurchase}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.ctaText}>
            {loading ? "Procesando…" : "Activar Premium"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          Al continuar aceptas los Términos de Servicio y Política de Privacidad
        </Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 8,
      alignItems: "flex-end",
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: {
      paddingBottom: 20,
    },
    heroGradient: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 32,
      gap: 12,
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: theme.colors.primary,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    heroBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: theme.colors.textOnAccent,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.textPrimary,
      lineHeight: 34,
    },
    heroSub: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    featureList: {
      paddingHorizontal: 20,
      gap: 16,
      marginBottom: 24,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    featureText: {
      flex: 1,
      gap: 2,
    },
    featureTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    featureDesc: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 17,
    },
    pricingCard: {
      marginHorizontal: 20,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 20,
      paddingVertical: 18,
      alignItems: "center",
      gap: 4,
    },
    pricingRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 4,
    },
    price: {
      fontSize: 32,
      fontWeight: "700",
      color: theme.colors.textPrimary,
    },
    pricePer: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    pricingNote: {
      fontSize: 12,
      color: theme.colors.disabledText,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    ctaBtn: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
    },
    ctaBtnDisabled: {
      opacity: 0.6,
    },
    ctaText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.textOnAccent,
    },
    footerNote: {
      fontSize: 10,
      color: theme.colors.disabledText,
      textAlign: "center",
      lineHeight: 14,
    },
  });
