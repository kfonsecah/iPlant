import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "../global.css";

import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { ConnectivityProvider } from "../src/context/ConnectivityContext";
import OfflineBanner from "../src/components/ui/offlineBanner/OfflineBanner";

SplashScreen.preventAutoHideAsync();

// ─── Guard de rutas ───────────────────────────────────────────────────────────
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments           = useSegments();
  const router             = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Sin sesión → ir a login
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Con sesión → ir a la app
      router.replace("/(app)/(tabs)/plants");
    }
  }, [user, loading, segments]);

  return (
    <>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ConnectivityProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ConnectivityProvider>
  );
}
