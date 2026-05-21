import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Asset } from "expo-asset";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

const IMAGE_ASSETS = [
  require("../assets/images/banner.jpeg"),
  require("../assets/images/bubbles.jpeg"),
  require("../assets/images/bubblesligth.jpeg"),
  require("../assets/images/monstera.png"),
  require("../assets/images/ficus.png"),
  require("../assets/images/andrea.png"),
  require("../assets/images/strelitzia.png"),
  require("../assets/images/heliconia.png"),
  require("../assets/images/marketplacedark.png"),
  require("../assets/images/marketplacelight.png"),
];

import { AuthProvider, useAuth } from "./../src/context/AuthContext";
import { ConnectivityProvider } from "./../src/context/ConnectivityContext";
import { SyncProvider } from "./../src/context/SyncContext";
import OfflineBanner from "./../src/components/ui/offlineBanner/OfflineBanner";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Si no hay usuario y no estamos en auth, redirigir a login
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Si hay usuario y estamos en auth, redirigir a la app
      router.replace("/(app)/(tabs)/home");
    }
  }, [user, loading, segments, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <OfflineBanner />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    Asset.loadAsync(IMAGE_ASSETS)
      .catch(() => {})
      .finally(() => setAssetsLoaded(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded && assetsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, assetsLoaded]);

  if (!fontsLoaded || !assetsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConnectivityProvider>
        <AuthProvider>
          <SyncProvider>
            <RootLayoutNav />
          </SyncProvider>
        </AuthProvider>
      </ConnectivityProvider>
    </GestureHandlerRootView>
  );
}
