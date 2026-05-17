import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Video, ResizeMode } from "expo-av";
import { useAuth } from "../../../src/context/AuthContext";
import { useSync } from "../../../src/context/SyncContext";
import { useConnectivity } from "../../../src/context/ConnectivityContext";
import { getPlantsByUserId } from "../../../src/services/plantService";
import { PlantaCompletaInterface } from "../../../src/types-dtos/plant.types";
import PlantOfDayCard from "../../../src/components/PlantOfDayCard";

export default function HomeIndex() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const userId = authUser?.uid ?? "";
  const { isSyncing, queueLength } = useSync();
  const { isConnected } = useConnectivity();

  const [plantas, setPlantas] = useState<PlantaCompletaInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async (showLoading = true) => {
    if (!userId) return;
    if (showLoading) setLoading(true);
    try {
      const plantasData = await getPlantsByUserId(userId, isConnected);
      setPlantas(plantasData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [userId, isConnected]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    fetchData(false);
  }, [isSyncing, queueLength, fetchData]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  const filteredPlantas = plantas.filter((p) =>
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const alertPlantas = filteredPlantas.filter((p) => p.salud !== "saludable");

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ScrollView 
        style={{ flex: 1, backgroundColor: "#000" }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER BANNER */}
        <View style={{ position: "relative", width: "100%", height: 220, overflow: "hidden", borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
          <Image 
            source={require("../../../assets/images/banner.jpeg")} 
            style={{ width: "100%", height: "100%", resizeMode: "cover", position: "absolute" }} 
          />

          <View style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 22, fontWeight: "600", color: "#fff", textShadowColor: "rgba(0,0,0,0.4)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}>
                  Hola, {authUser?.displayName || "Usuario"}!
                </Text>
                
                <View>
                  {authUser?.photoURL ? (
                    <Image 
                      source={{ uri: authUser.photoURL }} 
                      style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: "#fff" }} 
                    />
                  ) : (
                    <Ionicons name="person-circle-outline" size={42} color="#fff" />
                  )}
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 4 }}>
                <Ionicons name="partly-sunny-outline" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Nublado 22°</Text>
              </View>
            </View>

            {/* SEARCH BAR inside the banner */}
            <BlurView
              intensity={20}
              tint="light"
              style={{ 
                backgroundColor: "transparent", 
                borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", 
                borderRadius: 14, height: 44, 
                flexDirection: "row", alignItems: "center",
                overflow: "hidden"
              }}
            >
              <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.8)" style={{ paddingLeft: 14, marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, color: "#fff", fontSize: 14 }}
                placeholder="Buscar plantas..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} style={{ paddingRight: 14 }}>
                  <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              )}
            </BlurView>
          </View>
        </View>

        {/* AI ASSISTANT BANNER CARD */}
        <ImageBackground 
          source={require("../../../assets/images/bubbles.jpeg")}
          style={{ 
            marginHorizontal: 20, marginTop: 24, 
            borderWidth: 1, borderColor: "rgba(74,222,128,0.2)", 
            borderRadius: 20, padding: 24, minHeight: 140,
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            overflow: "hidden"
          }}
          imageStyle={{ borderRadius: 20 }}
        >
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)" }} />
          
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Pregúntale a tu</Text>
            <Text style={{ fontSize: 19, fontWeight: "700", color: "#4ade80", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>Asistente IA</Text>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Identifica plantas, revisa su salud</Text>
            <TouchableOpacity style={{ backgroundColor: "#4ade80", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 12, alignSelf: "flex-start" }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#000" }}>Chatear</Text>
            </TouchableOpacity>
          </View>
          <Video 
            source={require("../../../assets/images/cara.mp4")} 
            style={[{ width: 150, height: 150, marginVertical: -40, marginRight: -16 }, { mixBlendMode: "screen" } as any]} 
            resizeMode={ResizeMode.CONTAIN} 
            shouldPlay 
            isLooping 
            isMuted 
          />
        </ImageBackground>

        {/* PLANT OF DAY SECTION */}
        <View style={{ marginHorizontal: 20, marginTop: 24, marginBottom: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 17, fontWeight: "500", color: "#fff" }}>Destacada hoy</Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 13, color: "#4ade80" }}>Ver colección</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
        >
          <PlantOfDayCard
            name="Monstera Deliciosa"
            description="Perfecta para interiores con poca luz. Purifica el aire."
            image={require("../../../assets/images/monstera.png")}
          />
          
          <PlantOfDayCard
            name="Ficus Lyrata"
            description="Elegante y dramática. Ideal para espacios con luz indirecta."
            image={require("../../../assets/images/ficus.png")}
            imageStyle={{ width: 130, height: 160, marginTop: 20, marginLeft: 15 }}
          />

          <PlantOfDayCard
            name="Anthurium Andreanum"
            description="Flores exóticas de larga duración. Símbolo de hospitalidad y abundancia."
            image={require("../../../assets/images/andrea.png")}
          />

          <PlantOfDayCard
            name="Strelitzia Reginae"
            description="Ave del paraíso. Flores dramáticas en naranja y azul eléctrico."
            image={require("../../../assets/images/strelitzia.png")}
            imageStyle={{ bottom: -20 }}
          />
        </ScrollView>

        {/* MY PLANTS SECTION */}
        <View style={{ marginHorizontal: 20, marginTop: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 17, fontWeight: "500", color: "#fff" }}>Mis Plantas</Text>
          <TouchableOpacity onPress={() => router.push("/(app)/(tabs)/plants")}>
            <Text style={{ fontSize: 13, color: "#4ade80" }}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {filteredPlantas.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 20, marginTop: 12, gap: 12 }}
          >
            {filteredPlantas.map((planta) => (
              <TouchableOpacity
                key={planta.id}
                activeOpacity={0.8}
                style={{ width: 155, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}
                onPress={() => router.push(`/(app)/plants/${planta.id}`)}
              >
                <Image source={{ uri: planta.imagen }} style={{ width: 155, height: 100, borderTopLeftRadius: 20, borderTopRightRadius: 20, objectFit: "cover" }} />
                
                <View style={{ padding: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: "#fff", marginBottom: 6 }} numberOfLines={1}>{planta.nombre}</Text>
                  
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: planta.salud === "saludable" ? "#4ade80" : planta.salud === "atención" ? "#fbbf24" : "#f87171", marginRight: 6 }} />
                    <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                      {planta.salud === "saludable" ? "Saludable" : planta.salud === "atención" ? "Atención" : "Riesgo"}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="water-outline" size={11} color="#4ade80" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      {planta.proximoRiego < 0
                        ? `${Math.abs(planta.proximoRiego)}d de retraso`
                        : planta.proximoRiego === 0
                        ? "Regar hoy"
                        : `En ${planta.proximoRiego}d`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={{ alignItems: "center", marginTop: 32, marginBottom: 16 }}>
            <Ionicons name="leaf-outline" size={56} color="rgba(255,255,255,0.1)" />
            <Text style={{ fontSize: 16, fontWeight: "300", color: "rgba(255,255,255,0.35)", marginTop: 12 }}>Aún no tienes plantas</Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>Agrega tu primera planta con el botón +</Text>
          </View>
        )}

        {/* HISTORY / RECENT ACTIVITY SECTION */}
        <View style={{ marginHorizontal: 20, marginTop: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 17, fontWeight: "500", color: "#fff" }}>Actividad Reciente</Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 13, color: "#4ade80" }}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginHorizontal: 20 }}>
          {alertPlantas.length > 0 ? alertPlantas.map((p) => (
            <View key={`act-${p.id}`} style={{ 
              backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14, marginBottom: 8, 
              borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", 
              flexDirection: "row", alignItems: "center" 
            }}>
              <Image source={{ uri: p.imagen }} style={{ width: 48, height: 48, borderRadius: 12, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "500", color: "#fff" }}>{p.nombre}</Text>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                  {p.salud === "atención" ? "Necesita atención" : "En riesgo"}
                </Text>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>Hace 1 hora</Text>
              </View>
              <TouchableOpacity style={{ backgroundColor: "rgba(74,222,128,0.12)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 12, color: "#4ade80", fontWeight: "500" }}>Revisar</Text>
              </TouchableOpacity>
            </View>
          )) : (
            <View style={{ alignItems: "center", marginTop: 16 }}>
               <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>Sin actividad reciente</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
