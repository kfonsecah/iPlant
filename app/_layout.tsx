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
import { SyncProvider } from "../src/context/SyncContext";
import OfflineBanner from "../src/components/ui/offlineBanner/OfflineBanner";

SplashScreen.preventAutoHideAsync();
// ... rest of imports unchanged

// ... RootLayoutNav unchanged

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
        <SyncProvider>
          <RootLayoutNav />
        </SyncProvider>
      </AuthProvider>
    </ConnectivityProvider>
  );
}
