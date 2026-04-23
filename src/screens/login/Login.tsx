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

import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { useTheme } from "../../theme/desingSystem";
import { createStyles } from "./Login.styles";
import AppInput from "../../components/ui/appInput/AppInput";
import Toast from "../../components/ui/toast/Toast";
import { signIn, signInWithGoogle, getAuthErrorMessage } from "../../services/authService";

// Necesario para cerrar el browser de OAuth al volver a la app
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = "132450203288-po37fbc43s2aacirfjmpqtg5cbdhla3p.apps.googleusercontent.com";

// Color de marca de Google — constante externa, no pertenece al design system
const GOOGLE_BRAND_COLOR = "#4285F4";

// Endpoint de autorización de Google
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
};

// ─── Schema de validación ─────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email("Correo electrónico no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

// ─── Orbe de brillo animado ───────────────────────────────────────────────────
interface GlowOrbProps {
  coreSize:  number;
  color:     string;
  style?:    object;
  delay?:    number;
  duration?: number;
}

function GlowOrb({ coreSize, color, style, delay = 0, duration = 4200 }: GlowOrbProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withRepeat(withTiming(1.18, { duration }), -1, true);
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const layers = [
    { factor: 3.6, opacity: 0.028 },
    { factor: 2.4, opacity: 0.055 },
    { factor: 1.6, opacity: 0.10  },
    { factor: 1.0, opacity: 0.22  },
  ];

  return (
    <Animated.View
      style={[
        { position: "absolute", width: coreSize * 3.6, height: coreSize * 3.6, alignItems: "center", justifyContent: "center" },
        style,
        animStyle,
      ]}
    >
      {layers.map((layer, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width:  coreSize * layer.factor,
            height: coreSize * layer.factor,
            borderRadius: (coreSize * layer.factor) / 2,
            backgroundColor: color,
            opacity: layer.opacity,
          }}
        />
      ))}
    </Animated.View>
  );
}

// ─── Destello / partícula flotante ────────────────────────────────────────────
interface SparkProps {
  size:      number;
  color:     string;
  style?:    object;
  delay?:    number;
  duration?: number;
}

function Spark({ size, color, style, delay = 0, duration = 2200 }: SparkProps) {
  const opacity = useSharedValue(0.12);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withRepeat(withTiming(0.65, { duration }), -1, true);
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
        animStyle,
      ]}
    />
  );
}

// ─── Pantalla de Login ────────────────────────────────────────────────────────
export default function LoginScreen() {
  const theme  = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const [loading,      setLoading]      = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // ── Google Auth ──────────────────────────────────────────────────────────────
  // El proxy de Expo requiere un flujo de dos pasos:
  //   1. Abrir la URL /start?authUrl=GOOGLE_URL&returnUrl=EXPO_URL
  //   2. El proxy redirige a Google, Google vuelve al proxy, el proxy
  //      redirige al returnUrl (exp://) que Expo Go puede interceptar.
  const [googleRequest] = AuthSession.useAuthRequest(
    {
      clientId:     GOOGLE_WEB_CLIENT_ID,
      scopes:       ["openid", "profile", "email"],
      responseType: "token id_token",
      redirectUri:  "https://auth.expo.io/@kenexpo777/iPlant",
      usePKCE:      false,
      extraParams:  { nonce: "iplant_auth_nonce" },
    },
    GOOGLE_DISCOVERY
  );

  // ── Handlers ────────────────────────────────────────────────────────────────
  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      // onAuthStateChanged en AuthContext detecta el cambio → guard redirige
    } catch (error) {
      setToastMessage(getAuthErrorMessage(error));
      setToastVisible(true);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!googleRequest || googleLoading) return;
    setGoogleLoading(true);
    try {
      // Construir la URL de OAuth de Google con todos los parámetros
      const authUrl   = await googleRequest.makeAuthUrlAsync(GOOGLE_DISCOVERY);
      // URL a la que el proxy redirigirá de vuelta (esquema exp:// que Expo Go intercepta)
      const returnUrl = Linking.createURL("expo-auth-session");
      // URL de inicio del proxy — le pasa authUrl y returnUrl
      const proxyUrl  = `https://auth.expo.io/@kenexpo777/iPlant/start?authUrl=${encodeURIComponent(authUrl)}&returnUrl=${encodeURIComponent(returnUrl)}`;

      const result = await WebBrowser.openAuthSessionAsync(proxyUrl, returnUrl);
      console.log("[Google] result.type:", result.type);
      if (result.type === "success") console.log("[Google] result.url:", result.url);

      if (result.type === "success") {
        const idToken     = result.url.match(/[?&#]id_token=([^&#]+)/)?.[1]     ?? null;
        const accessToken = result.url.match(/[?&#]access_token=([^&#]+)/)?.[1] ?? null;
        console.log("[Google] idToken:", idToken ? "✓" : "NULL", "| accessToken:", accessToken ? "✓" : "NULL");

        if (idToken || accessToken) {
          await signInWithGoogle(
            idToken     ? decodeURIComponent(idToken)     : null,
            accessToken ? decodeURIComponent(accessToken) : null,
          );
        } else {
          setToastMessage("No se pudo obtener el token de Google");
          setToastVisible(true);
        }
      }
    } catch (err) {
      setToastMessage(getAuthErrorMessage(err));
      setToastVisible(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.background}>

        {/* Orbes de fondo */}
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

        {/* Toast de error */}
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
              <Text style={styles.tagline}>Tu jardín, siempre contigo</Text>
            </Animated.View>

            {/* Form Card */}
            <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.card}>

              {/* Header */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Iniciar sesión</Text>
                <Text style={styles.cardSubtitle}>Bienvenido de vuelta</Text>
              </View>

              {/* Email */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value, onBlur } }) => (
                  <AppInput
                    label="Correo electrónico"
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
                    label="Contraseña"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Tu contraseña"
                    leftIcon="lock-closed-outline"
                    secureTextEntry
                    autoCapitalize="none"
                    error={errors.password?.message}
                  />
                )}
              />

              {/* Olvidé contraseña */}
              <TouchableOpacity
                style={styles.forgotBtn}
                activeOpacity={theme.opacity.pressableTab}
              >
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              {/* CTA principal */}
              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: theme.opacity.disabled }]}
                onPress={handleSubmit(onSubmit)}
                activeOpacity={theme.opacity.pressableButton}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.textOnAccent} />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
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

              {/* Google Sign-In */}
              <TouchableOpacity
                style={[styles.googleBtn, googleLoading && { opacity: theme.opacity.disabled }]}
                onPress={handleGoogleSignIn}
                activeOpacity={theme.opacity.pressableButton}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color={theme.colors.textPrimary} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={theme.dimensions.buttonIconSize} color={GOOGLE_BRAND_COLOR} />
                    <Text style={styles.googleBtnText}>Continuar con Google</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Ir a registro */}
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.push("/(auth)/register" as any)}
                activeOpacity={theme.opacity.pressableButton}
              >
                <Text style={styles.secondaryBtnText}>Crear cuenta nueva</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
