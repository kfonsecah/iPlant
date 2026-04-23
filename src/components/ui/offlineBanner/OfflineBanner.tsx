import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConnectivity } from "../../../context/ConnectivityContext";
import { useTheme } from "../../../theme/desingSystem";
import { createStyles } from "./OfflineBanner.styles";
import { getQueue } from "../../../services/syncService";
import { syncPlants } from "../../../services/plantService";
import { useAuth } from "../../../context/AuthContext";

export default function OfflineBanner() {
  const { isConnected } = useConnectivity();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();
  
  const [hasPending, setHasPending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkQueue = async () => {
      if (user) {
        const queue = await getQueue(user.uid);
        setHasPending(queue.length > 0);
      }
    };
    
    checkQueue();
    // Re-check periodically or on connection change
    const interval = setInterval(checkQueue, 5000);
    return () => clearInterval(interval);
  }, [user, isConnected]);

  const handleSync = async () => {
    if (!user || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await syncPlants(user.uid);
      setHasPending(false);
    } catch (error) {
      console.error("Manual sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isConnected && !hasPending) return null;

  const showSyncButton = isConnected && hasPending;

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
              ? "Conexión restaurada. Tienes cambios pendientes." 
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
