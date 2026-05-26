import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MarketplaceEntryCard from "../../../src/components/MarketplaceEntryCard";
import PlantDetailModal from "../../../src/components/PlantDetailModal";
import SearchModal from "../../../src/components/SearchModal";
import UserPlantDetailModal from "../../../src/components/UserPlantDetailModal";
import PlantOfDayCard from "../../../src/components/PlantOfDayCard";
import { useAuth } from "../../../src/context/AuthContext";
import { useConnectivity } from "../../../src/context/ConnectivityContext";
import { useSync } from "../../../src/context/SyncContext";
import { FeaturedPlant, featuredPlants } from "../../../src/data/featuredPlants";
import { getPlantsByUserId } from "../../../src/services/plantService";
import { getUserById } from "../../../src/services/userService";
import { AppTheme, useTheme } from "../../../src/theme/desingSystem";
import { PlantaCompletaInterface } from "../../../src/types-dtos/plant.types";
import { UserInterface } from "../../../src/types-dtos/user.types";

export default function HomeIndex() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { user: authUser } = useAuth();
  const userId = authUser?.uid ?? "";
  const { isSyncing, queueLength } = useSync();
  const { isConnected } = useConnectivity();

  const [plantas, setPlantas] = useState<PlantaCompletaInterface[]>([]);
  const [userProfile, setUserProfile] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState(true);

  const carouselRef = useRef<ScrollView>(null);
  const activeIndexRef = useRef(0);
  const timerRef = useRef<any>(null);
  const hasLoadedOnce = useRef(false);

  const [selectedPlant, setSelectedPlant] = useState<FeaturedPlant | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUserPlantId, setSelectedUserPlantId] = useState<string | null>(null);
  const [userPlantModalVisible, setUserPlantModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const { width: windowWidth } = Dimensions.get("window");
    const cardWidth = windowWidth - 30;
    const gap = 24;
    const step = cardWidth + gap;

    timerRef.current = setInterval(() => {
      const nextIndex = activeIndexRef.current + 1;

      carouselRef.current?.scrollTo({
        x: nextIndex * step,
        animated: true,
      });

      if (nextIndex === 5) {
        setTimeout(() => {
          carouselRef.current?.scrollTo({
            x: 0,
            animated: false,
          });
          activeIndexRef.current = 0;
        }, 600);
      } else {
        activeIndexRef.current = nextIndex;
      }
    }, 10000);
  }, []);

  const handleScrollEnd = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const { width: windowWidth } = Dimensions.get("window");
    const cardWidth = windowWidth - 30;
    const gap = 24;
    const step = cardWidth + gap;

    let index = Math.round(contentOffsetX / step);

    if (index >= 5) {
      carouselRef.current?.scrollTo({ x: 0, animated: false });
      index = 0;
    }
    activeIndexRef.current = index;

    // Reiniciar temporizador al scrollear manualmente
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!userId) return;
    if (showLoading) setLoading(true);
    try {
      const [plantasData, profile] = await Promise.all([
        getPlantsByUserId(userId, isConnected),
        getUserById(userId),
      ]);
      setPlantas(plantasData);
      if (profile) setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [userId, isConnected]);

  useFocusEffect(
    useCallback(() => {
      fetchData(!hasLoadedOnce.current);
      hasLoadedOnce.current = true;
    }, [fetchData])
  );

  useEffect(() => {
    fetchData(false);
  }, [isSyncing, queueLength, fetchData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent barStyle={theme.mode === "dark" ? "light-content" : "dark-content"} backgroundColor="transparent" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER BANNER */}
        <View style={styles.headerBanner}>
          <Image
            source={require("../../../assets/images/banner.jpeg")}
            style={styles.bannerImage}
          />

          <View style={styles.bannerContent}>
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.welcomeText}>
                  Hola, {userProfile?.nombre || authUser?.displayName || "Usuario"}!
                </Text>

                <View>
                  {(userProfile?.image || authUser?.photoURL) ? (
                    <Image
                      source={{ uri: userProfile?.image || authUser?.photoURL! }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons name="person-circle-outline" size={42} color="#fff" />
                  )}
                </View>
              </View>

              <View style={styles.weatherContainer}>
                <Ionicons name="partly-sunny-outline" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={styles.weatherText}>Nublado 22°</Text>
              </View>
            </View>

            {/* SEARCH BAR inside the banner */}
            <TouchableOpacity activeOpacity={0.85} onPress={() => setSearchModalVisible(true)}>
              <BlurView
                intensity={20}
                tint="light"
                style={styles.searchBar}
                pointerEvents="none"
              >
                <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.8)" style={{ paddingLeft: 14, marginRight: 8 }} />
                <Text style={styles.searchPlaceholder}>Buscar plantas, secciones...</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI ASSISTANT BANNER CARD */}
        <ImageBackground
          source={theme.mode === "dark"
            ? require("../../../assets/images/bubbles.jpeg")
            : require("../../../assets/images/bubblesligth.jpeg")}
          style={styles.aiCard}
          imageStyle={{ borderRadius: 20 }}
        >
          <View style={styles.aiOverlay} />

          <View style={styles.aiTextContent}>
            <Text style={styles.aiTitle}>
              Pregúntale al Asistente de <Text style={{ color: theme.colors.primary }}>IA</Text> de iPlant!
            </Text>
            <Text style={styles.aiSub}>El Asistente está listo para verificar{"\n"}la salud de tus plantas, programar recordatorios y darte consejos personalizados.</Text>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => router.push("/(app)/(tabs)/asistente")}
            >
              <Text style={styles.aiButtonText}>Chatear</Text>
            </TouchableOpacity>
          </View>
          <Video
            source={require("../../../assets/images/cara.mp4")}
            style={[styles.aiVideo, { mixBlendMode: "screen" } as any]}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            isMuted
          />
        </ImageBackground>

        {/* PLANT OF DAY SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Destacada hoy</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>Ver colección</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={carouselRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15, gap: 24 }}
          snapToInterval={Dimensions.get("window").width - 30 + 24}
          decelerationRate="fast"
          disableIntervalMomentum={true}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
        >
          <PlantOfDayCard
            name="Monstera Deliciosa"
            description={"Perfecta para interiores con\npoca luz. Purifica el aire."}
            image={require("../../../assets/images/monstera.png")}
            onPress={() => {
              setSelectedPlant(featuredPlants.find(p => p.id === "monstera_deliciosa") || null);
              setModalVisible(true);
            }}
          />

          <PlantOfDayCard
            name="Ficus Lyrata"
            description="Elegante y dramática. Ideal para espacios con luz indirecta."
            image={require("../../../assets/images/ficus.png")}
            imageStyle={{ width: 130, height: 160, marginTop: 20, marginLeft: 15 }}
            onPress={() => {
              setSelectedPlant(featuredPlants.find(p => p.id === "ficus_lyrata") || null);
              setModalVisible(true);
            }}
          />

          <PlantOfDayCard
            name="Anthurium Andreanum"
            description="Flores exóticas de larga duración. Símbolo de hospitalidad y abundancia."
            image={require("../../../assets/images/andrea.png")}
            onPress={() => {
              setSelectedPlant(featuredPlants.find(p => p.id === "anthurium_andreanum") || null);
              setModalVisible(true);
            }}
          />

          <PlantOfDayCard
            name="Strelitzia Reginae"
            description="Ave del paraíso. Flores dramáticas en naranja y azul."
            image={require("../../../assets/images/strelitzia.png")}
            imageStyle={{ bottom: 0 }}
            onPress={() => {
              setSelectedPlant(featuredPlants.find(p => p.id === "strelitzia_reginae") || null);
              setModalVisible(true);
            }}
          />

          <PlantOfDayCard
            name="Heliconia Rostrata"
            description="Garra de langosta. Una de las flores tropicales más dramáticas del mundo."
            image={require("../../../assets/images/heliconia.png")}
            imageStyle={{ width: 140, height: 175, top: 13, left: 20 }}
            onPress={() => {
              setSelectedPlant(featuredPlants.find(p => p.id === "heliconia_rostrata") || null);
              setModalVisible(true);
            }}
          />

          {/* CLONE CARD FOR INFINITE SCROLL */}
          <PlantOfDayCard
            name="Monstera Deliciosa"
            description={"Perfecta para interiores con\npoca luz. Purifica el aire."}
            image={require("../../../assets/images/monstera.png")}
            onPress={() => {
              setSelectedPlant(featuredPlants.find(p => p.id === "monstera_deliciosa") || null);
              setModalVisible(true);
            }}
          />
        </ScrollView>

        {/* MY PLANTS SECTION */}
        <View style={styles.myPlantsHeader}>
          <Text style={styles.sectionTitle}>Mis Plantas</Text>
          <TouchableOpacity onPress={() => router.push("/(app)/(tabs)/plants")}>
            <Text style={styles.sectionLink}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {plantas.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, marginTop: 12, gap: 12 }}
          >
            {plantas.map((planta) => (
              <TouchableOpacity
                key={planta.id}
                activeOpacity={0.8}
                style={styles.plantCard}
                onPress={() => {
                  setSelectedUserPlantId(planta.id);
                  setUserPlantModalVisible(true);
                }}
              >
                <Image source={{ uri: planta.imagen }} style={styles.plantImage} />

                <View style={styles.plantInfo}>
                  <Text style={styles.plantName} numberOfLines={1}>{planta.nombre}</Text>

                  <View style={styles.healthRow}>
                    <View style={[
                      styles.healthDot,
                      {
                        backgroundColor:
                          planta.salud === "saludable"
                            ? theme.colors.primary
                            : planta.salud === "atención"
                              ? theme.colors.warning
                              : theme.colors.error
                      }
                    ]} />
                    <Text style={styles.healthText}>
                      {planta.salud === "saludable" ? "Saludable" : planta.salud === "atención" ? "Atención" : "Riesgo"}
                    </Text>
                  </View>

                  <View style={styles.wateringRow}>
                    <Ionicons name="water-outline" size={11} color={theme.colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.wateringText}>
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
          <View style={styles.emptyPlantsContainer}>
            <Ionicons name="leaf-outline" size={56} color={theme.colors.disabledText} />
            <Text style={styles.emptyPlantsText}>Aún no tienes plantas</Text>
            <Text style={styles.emptyPlantsSub}>Agrega tu primera planta con el botón +</Text>
          </View>
        )}

        {/* MARKETPLACE SECTION */}
        <View style={styles.recentActivityHeader}>
          <Text style={styles.sectionTitle}>Marketplace</Text>
          <TouchableOpacity onPress={() => router.push("/marketplace")}>
            <Text style={styles.sectionLink}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <MarketplaceEntryCard />
      </ScrollView>

      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        userPlants={plantas}
        onSelectUserPlant={(id) => {
          setSelectedUserPlantId(id);
          setUserPlantModalVisible(true);
        }}
        onSelectFeaturedPlant={(plant) => {
          setSelectedPlant(plant);
          setModalVisible(true);
        }}
      />

      <PlantDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        plant={selectedPlant}
      />

      <UserPlantDetailModal
        visible={userPlantModalVisible}
        onClose={() => {
          setUserPlantModalVisible(false);
          setSelectedUserPlantId(null);
        }}
        plantId={selectedUserPlantId}
        userId={userId}
        onRefresh={() => fetchData(false)}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  headerBanner: {
    position: "relative",
    width: "100%",
    height: 220,
    overflow: "hidden",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  bannerContent: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#fff",
  },
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 4,
  },
  weatherText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  searchBar: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  searchPlaceholder: {
    flex: 1,
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  aiCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: theme.mode === "dark" ? "rgba(74,222,128,0.2)" : "rgba(74,222,128,0.3)",
    borderRadius: 20,
    padding: 24,
    minHeight: 140,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    ...theme.shadows,
  },
  aiOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.mode === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)",
  },
  aiTextContent: {
    flex: 1,
    marginRight: 60,
    zIndex: 10,
  },
  aiTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    lineHeight: 28,
  },
  aiSub: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 1)",
    marginTop: 6,
    lineHeight: 18,
  },
  aiButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textOnAccent,
  },
  aiVideo: {
    position: "absolute",
    right: -35,
    width: 190,
    height: 200,
  },
  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  sectionLink: {
    fontSize: 13,
    color: theme.colors.primary,
  },
  myPlantsHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  plantCard: {
    width: 155,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    ...theme.shadows,
  },
  plantImage: {
    width: 155,
    height: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    objectFit: "cover",
  },
  plantInfo: {
    padding: 12,
  },
  plantName: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  healthRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  healthText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  wateringRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  wateringText: {
    fontSize: 11,
    color: theme.colors.disabledText,
  },
  emptyPlantsContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  emptyPlantsText: {
    fontSize: 16,
    fontWeight: "300",
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  emptyPlantsSub: {
    fontSize: 13,
    color: theme.colors.disabledText,
    marginTop: 6,
  },
  recentActivityHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
});
