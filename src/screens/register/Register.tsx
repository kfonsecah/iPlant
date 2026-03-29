import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useTheme } from "../../theme/desingSystem";
import { createStyles } from "../login/Login.styles";
import AppInput from "../../components/ui/appInput/AppInput";
import Toast from "../../components/ui/toast/Toast";
import { signUp, getAuthErrorMessage } from "../../services/authService";

// ─── Schema de validación ─────────────────────────────────────────────────────
const registerSchema = z
  .object({
    nombre:          z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(40),
    email:           z.string().email("Correo electrónico no válido"),
    password:        z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path:    ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

// ─── Orbe de brillo ───────────────────────────────────────────────────────────
function GlowOrb({
  coreSize, color, style, delay = 0, duration = 4200,
}: { coreSize: number; color: string; style?: object; delay?: number; duration?: number }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    const t = setTimeout(() => {
      scale.value = withRepeat(withTiming(1.18, { duration }), -1, true);
    }, delay);
    return () => clearTimeout(t);
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const layers = [
    { factor: 3.6, opacity: 0.028 },
    { factor: 2.4, opacity: 0.055 },
    { factor: 1.6, opacity: 0.10  },
    { factor: 1.0, opacity: 0.22  },
  ];
  return (
    <Animated.View style={[{ position: "absolute", width: coreSize * 3.6, height: coreSize * 3.6, alignItems: "center", justifyContent: "center" }, style, animStyle]}>
      {layers.map((l, i) => (
        <View key={i} style={{ position: "absolute", width: coreSize * l.factor, height: coreSize * l.factor, borderRadius: (coreSize * l.factor) / 2, backgroundColor: color, opacity: l.opacity }} />
      ))}
    </Animated.View>
  );
}

// ─── Destello ─────────────────────────────────────────────────────────────────
function Spark({
  size, color, style, delay = 0, duration = 2200,
}: { size: number; color: string; style?: object; delay?: number; duration?: number }) {
  const opacity = useSharedValue(0.12);
  useEffect(() => {
    const t = setTimeout(() => {
      opacity.value = withRepeat(withTiming(0.65, { duration }), -1, true);
    }, delay);
    return () => clearTimeout(t);
  }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style, animStyle]} />
  );
}

// ─── Pantalla de Registro ─────────────────────────────────────────────────────
export default function RegisterScreen() {
  const theme  = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const [loading,      setLoading]      = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await signUp(data.nombre, data.email, data.password);
      // onAuthStateChanged detecta el nuevo usuario → guard redirige a la app
    } catch (error) {
      setToastMessage(getAuthErrorMessage(error));
      setToastVisible(true);
      setLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.background}>

        {/* Orbes */}
        <GlowOrb coreSize={130} color={theme.colors.primary}   style={styles.orb1} delay={0}    duration={4800} />
        <GlowOrb coreSize={100} color={theme.colors.secondary} style={styles.orb2} delay={1600} duration={5400} />
        <GlowOrb coreSize={70}  color={theme.colors.primary}   style={styles.orb3} delay={800}  duration={3800} />

        {/* Destellos */}
        <Spark size={5} color={theme.colors.primary}   style={styles.spark1} delay={0}    duration={2400} />
        <Spark size={3} color={theme.colors.secondary} style={styles.spark2} delay={700}  duration={1900} />
        <Spark size={4} color={theme.colors.primary}   style={styles.spark3} delay={1300} duration={2800} />
        <Spark size={3} color={theme.colors.primary}   style={styles.spark4} delay={400}  duration={2100} />
        <Spark size={5} color={theme.colors.secondary} style={styles.spark5} delay={1000} duration={3100} />
        <Spark size={3} color={theme.colors.primary}   style={styles.spark6} delay={1700} duration={2600} />
        <Spark size={4} color={theme.colors.secondary} style={styles.spark7} delay={300}  duration={2000} />
        <Spark size={3} color={theme.colors.primary}   style={styles.spark8} delay={1100} duration={2300} />

        {/* Toast */}
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type="error"
          onDismiss={() => setToastVisible(false)}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Brand */}
            <Animated.View entering={FadeInDown.delay(80).duration(600)} style={styles.brandContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="leaf" size={theme.dimensions.logoIconSize} color={theme.colors.primary} />
              </View>
              <Text style={styles.brandName}>iPlant</Text>
              <Text style={styles.tagline}>Crea tu cuenta gratis</Text>
            </Animated.View>

            {/* Form Card */}
            <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.card}>
              <Text style={styles.cardTitle}>Crear cuenta</Text>
              <Text style={styles.cardSubtitle}>Únete a la comunidad iPlant</Text>

              {/* Nombre */}
              <Controller
                control={control}
                name="nombre"
                render={({ field: { onChange, value, onBlur } }) => (
                  <AppInput
                    label="NOMBRE COMPLETO"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Tu nombre"
                    leftIcon="person-outline"
                    autoCapitalize="words"
                    error={errors.nombre?.message}
                  />
                )}
              />

              {/* Email */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value, onBlur } }) => (
                  <AppInput
                    label="CORREO ELECTRÓNICO"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="ejemplo@correo.com"
                    leftIcon="mail-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={errors.email?.message}
                  />
                )}
              />

              {/* Contraseña */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value, onBlur } }) => (
                  <AppInput
                    label="CONTRASEÑA"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Mínimo 6 caracteres"
                    leftIcon="lock-closed-outline"
                    secureTextEntry
                    autoCapitalize="none"
                    error={errors.password?.message}
                  />
                )}
              />

              {/* Confirmar contraseña */}
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value, onBlur } }) => (
                  <AppInput
                    label="CONFIRMAR CONTRASEÑA"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Repite tu contraseña"
                    leftIcon="shield-checkmark-outline"
                    secureTextEntry
                    autoCapitalize="none"
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              {/* CTA principal */}
              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: theme.spacing.s6 }, loading && { opacity: theme.opacity.disabled }]}
                onPress={handleSubmit(onSubmit)}
                activeOpacity={theme.opacity.pressableButton}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.textOnAccent} />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Crear cuenta</Text>
                    <Ionicons name="arrow-forward" size={theme.dimensions.buttonIconSize} color={theme.colors.textOnAccent} />
                  </>
                )}
              </TouchableOpacity>

              {/* Divisor */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Volver al login */}
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.back()}
                activeOpacity={theme.opacity.pressableButton}
              >
                <Text style={styles.secondaryBtnText}>Ya tengo una cuenta</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
