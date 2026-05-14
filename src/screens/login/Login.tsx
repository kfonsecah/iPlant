import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from "react-native";
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
import ParallaxBackground from "../../components/parallaxBackground/ParallaxBackground";
import { signIn, signInWithGoogle, getAuthErrorMessage } from "../../services/authService";
import Toast from "../../components/ui/toast/Toast";

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
    setLoading(true);
    try {
      await signIn(data.email, data.password);
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
      foregroundChildren={
        <>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type="error"
            onDismiss={() => setToastVisible(false)}
          />
        </>
      }
    >
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

            {/* Register */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register" as any)}>
                <Text style={styles.registerLink}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ParallaxBackground>
  );
}
