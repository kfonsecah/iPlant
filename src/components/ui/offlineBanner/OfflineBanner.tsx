import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConnectivity } from "../../../context/ConnectivityContext";
import { useTheme } from "../../../theme/desingSystem";
import { createStyles } from "./OfflineBanner.styles";

export default function OfflineBanner() {
  const { isConnected } = useConnectivity();
  const theme = useTheme();
  const styles = createStyles(theme);

  if (isConnected) return null;

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: theme.colors.warning }}>
      <View style={styles.container}>
        <Ionicons 
          name="cloud-offline-outline" 
          size={18} 
          color="#FFFFFF" 
          style={styles.icon} 
        />
        <Text style={styles.text}>
          Sin conexión a internet. Trabajando en modo local.
        </Text>
      </View>
    </SafeAreaView>
  );
}
