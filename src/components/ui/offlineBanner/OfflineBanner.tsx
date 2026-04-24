import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConnectivity } from "../../../context/ConnectivityContext";
import { useTheme } from "../../../theme/desingSystem";
import { createStyles } from "./OfflineBanner.styles";
import { syncPlants } from "../../../services/plantService";
import { useAuth } from "../../../context/AuthContext";
import { useSync } from "../../../context/SyncContext";

export default function OfflineBanner() {
  const { isConnected } = useConnectivity();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();
  const { hasPending, isSyncing: globalIsSyncing } = useSync();
  
  const [isLocalSyncing, setIsLocalSyncing] = useState(false);

  const handleSync = async () => {
    if (!user || isLocalSyncing || globalIsSyncing) return;
    
    setIsLocalSyncing(true);
    try {
      await syncPlants(user.uid);
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      setIsLocalSyncing(false);
    }
  };

  const isSyncing = isLocalSyncing || globalIsSyncing;

  // Si estamos conectados y NO hay pendientes, ocultamos el banner
  if (isConnected && !hasPending && !isSyncing) return null;

  // El botón de sincronización se muestra si hay internet, hay pendientes y NO estamos sincronizando ya
  const showSyncButton = isConnected && hasPending && !isSyncing;

  return (
    <SafeAreaView 
      edges={["top"]} 
      style={isConnected ? styles.safeAreaInfo : styles.safeArea}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Ionicons 
            name={isConnected ? "cloud-done-outline" : "cloud-offline-outline"} 
            size={18} 
            color="#FFFFFF" 
            style={styles.icon} 
          />
          <Text style={styles.text} numberOfLines={1}>
            {isConnected 
              ? (isSyncing ? "Sincronizando cambios..." : "Conexión restaurada.") 
              : "Sin conexión. Trabajando localmente."}
          </Text>
        </View>
        
        {showSyncButton && (
          <TouchableOpacity 
            style={styles.syncButton} 
            onPress={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.syncButtonText}>Sincronizar</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
