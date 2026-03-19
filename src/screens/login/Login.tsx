import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

import { useTheme } from "../../theme/desingSystem";
import { createStyles } from "./Login.styles";

// ─── Orbe de brillo animado ───────────────────────────────────────────────────
interface GlowOrbProps {
  coreSize: number;
  color: string;
  style?: object;
  delay?: number;
  duration?: number;
}

function GlowOrb({ coreSize, color, style, delay = 0, duration = 4200 }: GlowOrbProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withRepeat(
        withTiming(1.18, { duration }),
        -1,
        true
      );
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
        {
          position: "absolute",
          width: coreSize * 3.6,
          height: coreSize * 3.6,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
        animStyle,
      ]}
    >
      {layers.map((layer, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: coreSize * layer.factor,
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
  size: number;
  color: string;
  style?: object;
  delay?: number;
  duration?: number;
}

function Spark({ size, color, style, delay = 0, duration = 2200 }: SparkProps) {
  const opacity = useSharedValue(0.12);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withRepeat(
        withTiming(0.65, { duration }),
        -1,
        true
      );
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
        animStyle,
      ]}
    />
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function LoginScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = () => {
    router.replace("/(app)/(tabs)/profile");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.background}>

        {/* ── Orbes de fondo ── */}
        <GlowOrb coreSize={130} color={theme.colors.primary}   style={styles.orb1} delay={0}    duration={4800} />
        <GlowOrb coreSize={100} color={theme.colors.secondary} style={styles.orb2} delay={1600} duration={5400} />
        <GlowOrb coreSize={70}  color={theme.colors.primary}   style={styles.orb3} delay={800}  duration={3800} />

        {/* ── Destellos ── */}
        <Spark size={5} color={theme.colors.primary}   style={styles.spark1} delay={0}    duration={2400} />
        <Spark size={3} color={theme.colors.secondary} style={styles.spark2} delay={700}  duration={1900} />
        <Spark size={4} color={theme.colors.primary}   style={styles.spark3} delay={1300} duration={2800} />
        <Spark size={3} color={theme.colors.primary}   style={styles.spark4} delay={400}  duration={2100} />
        <Spark size={5} color={theme.colors.secondary} style={styles.spark5} delay={1000} duration={3100} />
        <Spark size={3} color={theme.colors.primary}   style={styles.spark6} delay={1700} duration={2600} />
        <Spark size={4} color={theme.colors.secondary} style={styles.spark7} delay={300}  duration={2000} />
        <Spark size={3} color={theme.colors.primary}   style={styles.spark8} delay={1100} duration={2300} />

        {/* ── Contenido ── */}
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
                <Ionicons name="leaf" size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.brandName}>iPlant</Text>
              <Text style={styles.tagline}>Tu jardín, siempre contigo</Text>
            </Animated.View>

            {/* Form Card */}
            <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.card}>
              <Text style={styles.cardTitle}>Iniciar sesión</Text>
              <Text style={styles.cardSubtitle}>Bienvenido de vuelta</Text>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CORREO ELECTRÓNICO</Text>
                <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={emailFocused ? theme.colors.primary : theme.colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              {/* Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CONTRASEÑA</Text>
                <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={passwordFocused ? theme.colors.primary : theme.colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Tu contraseña"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={theme.opacity.pressableTab}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={18}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Olvidé contraseña */}
              <TouchableOpacity style={styles.forgotBtn} activeOpacity={theme.opacity.pressableTab}>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              {/* CTA principal */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleLogin}
                activeOpacity={theme.opacity.pressableButton}
              >
                <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
                <Ionicons name="arrow-forward" size={18} color={theme.colors.textOnAccent} />
              </TouchableOpacity>

              {/* Divisor */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Registro */}
              <TouchableOpacity
                style={styles.secondaryBtn}
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
