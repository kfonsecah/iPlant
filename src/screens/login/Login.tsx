import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { BlurView } from "expo-blur";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import RainOnGlass from "../../components/animations/RainOnGlass";
import WaterParticles, { WaterParticlesRef } from "../../components/animations/WaterParticles";
import ParallaxBackground from "../../components/parallaxBackground/ParallaxBackground";
import Toast from "../../components/ui/toast/Toast";
import { getAuthErrorMessage, signIn, signInWithGoogle, signUp } from "../../services/authService";
import { useTheme } from "../../theme/desingSystem";
import { createStyles } from "./Login.styles";

// Necesario para cerrar el browser de OAuth al volver a la app
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = "132450203288-po37fbc43s2aacirfjmpqtg5cbdhla3p.apps.googleusercontent.com";
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
};

const loginSchema = z.object({
  email: z.string().email("Correo electrónico no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(40),
  email: z.string().email("Correo electrónico no válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showRegister, setShowRegister] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const loginTranslateY = useSharedValue(0);
  const loginOpacity = useSharedValue(1);
  const registerTranslateY = useSharedValue(-600);
  const registerOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (showRegister) {
      loginTranslateY.value = withTiming(80, { duration: 250 });
      loginOpacity.value = withTiming(0, { duration: 250 });

      registerTranslateY.value = withSpring(-70, { damping: 18, stiffness: 85 });
      registerOpacity.value = withTiming(1, { duration: 250 });
    } else {
      registerTranslateY.value = withTiming(-600, { duration: 250 });
      registerOpacity.value = withTiming(0, { duration: 250 });

      loginTranslateY.value = withSpring(0, { damping: 18, stiffness: 85 });
      loginOpacity.value = withTiming(1, { duration: 250 });
    }
  }, [showRegister]);

  const loginAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loginOpacity.value,
    transform: [{ translateY: loginTranslateY.value }],
  }));

  const registerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: registerOpacity.value,
    transform: [{ translateY: registerTranslateY.value }],
  }));

  const { control: registerControl, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors }, reset: resetRegister } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Refs para partículas
  const waterParticlesRef = useRef<WaterParticlesRef>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const loginBtnRef = useRef<View>(null);
  const googleBtnRef = useRef<View>(null);

  const triggerEffect = (ref: React.RefObject<any>, type: 'typing' | 'press') => {
    ref.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      if (type === 'typing') {
        waterParticlesRef.current?.triggerTyping(centerX, centerY);
      } else {
        waterParticlesRef.current?.triggerPress(centerX, centerY);
      }
    });
  };

  // ── Google Auth ──────────────────────────────────────────────────────────────
  const [googleRequest] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      responseType: "token id_token",
      redirectUri: "https://auth.expo.io/@kenexpo777/iPlant",
      usePKCE: false,
      extraParams: { nonce: "iplant_auth_nonce" },
    },
    GOOGLE_DISCOVERY
  );

  const onSubmit = async (data: LoginForm) => {
    triggerEffect(loginBtnRef, 'press');
    setLoading(true);
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      setToastMessage(getAuthErrorMessage(error));
      setToastVisible(true);
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    setRegisterLoading(true);
    try {
      await signUp(data.nombre, data.email, data.password);
      setShowRegister(false);
      resetRegister();
    } catch (error) {
      setToastMessage(getAuthErrorMessage(error));
      setToastVisible(true);
      setRegisterLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    triggerEffect(googleBtnRef, 'press');
    if (!googleRequest || googleLoading) return;
    setGoogleLoading(true);
    try {
      const authUrl = await googleRequest.makeAuthUrlAsync(GOOGLE_DISCOVERY);
      const returnUrl = Linking.createURL("expo-auth-session");
      const proxyUrl = `https://auth.expo.io/@kenexpo777/iPlant/start?authUrl=${encodeURIComponent(authUrl)}&returnUrl=${encodeURIComponent(returnUrl)}`;

      const result = await WebBrowser.openAuthSessionAsync(proxyUrl, returnUrl);
      if (result.type === "success") {
        const idToken = result.url.match(/[?&#]id_token=([^&#]+)/)?.[1] ?? null;
        const accessToken = result.url.match(/[?&#]access_token=([^&#]+)/)?.[1] ?? null;

        if (idToken || accessToken) {
          await signInWithGoogle(
            idToken ? decodeURIComponent(idToken) : null,
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

  return (
    <ParallaxBackground
      ambientChildren={<RainOnGlass />}
      foregroundChildren={
        <>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type="error"
            onDismiss={() => setToastVisible(false)}
          />
          <WaterParticles ref={waterParticlesRef} />
          {/* Register moved to foreground to stay on top of Layer 3 */}
          <Animated.View style={[styles.registerContainer, loginAnimatedStyle]} pointerEvents={showRegister ? "none" : "auto"}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => setShowRegister(true)}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      }
      behindForeground={
        <Animated.View style={[styles.registerFormWrapper, registerAnimatedStyle]} pointerEvents={showRegister ? "auto" : "none"}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.registerFormInner}>
            <Text style={styles.registerTitle}>Crear cuenta</Text>
            <Text style={styles.registerSubtitle}>Únete a iPlant y comienza tu jardín</Text>

            {/* Nombre */}
            <Controller
              control={registerControl}
              name="nombre"
              render={({ field: { onChange, value, onBlur } }) => (
                <View>
                  <View style={[styles.inputWrapper, focusedField === 'nombre' && styles.inputWrapperFocus]}>
                    <Ionicons name="person-outline" size={20} color={focusedField === 'nombre' ? "#4ade80" : "rgba(255,255,255,0.35)"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={() => { setFocusedField(null); onBlur(); }}
                      onFocus={() => setFocusedField('nombre')}
                      placeholder="Nombre completo"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      autoCapitalize="words"
                    />
                  </View>
                  {registerErrors.nombre && <Text style={styles.errorText}>{registerErrors.nombre.message}</Text>}
                </View>
              )}
            />

            {/* Email */}
            <Controller
              control={registerControl}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <View>
                  <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocus]}>
                    <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? "#4ade80" : "rgba(255,255,255,0.35)"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={() => { setFocusedField(null); onBlur(); }}
                      onFocus={() => setFocusedField('email')}
                      placeholder="Correo electrónico"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {registerErrors.email && <Text style={styles.errorText}>{registerErrors.email.message}</Text>}
                </View>
              )}
            />

            {/* Password */}
            <Controller
              control={registerControl}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <View>
                  <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocus]}>
                    <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? "#4ade80" : "rgba(255,255,255,0.35)"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={() => { setFocusedField(null); onBlur(); }}
                      onFocus={() => setFocusedField('password')}
                      placeholder="Contraseña"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      secureTextEntry={!showRegisterPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowRegisterPassword(!showRegisterPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showRegisterPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={focusedField === 'password' ? "#4ade80" : "rgba(255,255,255,0.35)"}
                      />
                    </TouchableOpacity>
                  </View>
                  {registerErrors.password && <Text style={styles.errorText}>{registerErrors.password.message}</Text>}
                </View>
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={registerControl}
              name="confirmPassword"
              render={({ field: { onChange, value, onBlur } }) => (
                <View>
                  <View style={[styles.inputWrapper, focusedField === 'confirmPassword' && styles.inputWrapperFocus]}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={focusedField === 'confirmPassword' ? "#4ade80" : "rgba(255,255,255,0.35)"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={onChange}
                      onBlur={() => { setFocusedField(null); onBlur(); }}
                      onFocus={() => setFocusedField('confirmPassword')}
                      placeholder="Confirmar contraseña"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      secureTextEntry={!showRegisterConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showRegisterConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={focusedField === 'confirmPassword' ? "#4ade80" : "rgba(255,255,255,0.35)"}
                      />
                    </TouchableOpacity>
                  </View>
                  {registerErrors.confirmPassword && <Text style={styles.errorText}>{registerErrors.confirmPassword.message}</Text>}
                </View>
              )}
            />

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.loginBtn, registerLoading && { opacity: 0.7 }]}
              onPress={handleRegisterSubmit(onRegisterSubmit)}
              disabled={registerLoading}
            >
              {registerLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.loginBtnText}>Registrarse</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerFooter}>
              <Text style={styles.registerText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => setShowRegister(false)}>
                <Text style={styles.registerLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>

          </View>
        </Animated.View>
      }
    >
      <Animated.View style={[styles.keyboardView, loginAnimatedStyle]} pointerEvents={showRegister ? "none" : "auto"}>
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
            <View style={styles.brandContainer}>
              <View style={styles.logoContainer}>
                <Ionicons name="leaf" size={52} color="#4ade80" />
              </View>
              <Text style={styles.brandName}>iPlant</Text>
              <Text style={styles.tagline}>Tu jardín inteligente</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Email */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.35)" style={styles.inputIcon} />
                      <TextInput
                        ref={emailRef}
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Correo electrónico"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                  </View>
                )}
              />

              {/* Password */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.35)" style={styles.inputIcon} />
                      <TextInput
                        ref={passwordRef}
                        style={styles.input}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Contraseña"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color="rgba(255,255,255,0.35)"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                  </View>
                )}
              />

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                ref={loginBtnRef}
                style={[styles.loginBtn, loading && { opacity: 0.7 }]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.loginBtnText}>Iniciar sesión</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o continúa con</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Button */}
              <TouchableOpacity
                ref={googleBtnRef}
                style={[styles.googleBtn, googleLoading && { opacity: 0.7 }]}
                onPress={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color="#fff" />
                    <Text style={styles.googleBtnText}>Continuar con Google</Text>
                  </>
                )}
              </TouchableOpacity>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </ParallaxBackground>
  );
}
