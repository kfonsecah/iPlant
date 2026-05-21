import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { AppTheme, useTheme } from "../../theme/desingSystem";
import { useAuth } from "../../context/AuthContext";
import { useConnectivity } from "../../context/ConnectivityContext";
import { getPlantById, updatePlant } from "../../services/plantService";
import {
  addHealthJournalEntry,
  analyzeHealthWithGemini,
  getHealthJournalEntries,
} from "../../services/healthJournalService";
import { persistImage } from "../../services/storageService";
import { PlantaCompletaInterface } from "../../types-dtos/plant.types";
import { HealthJournalEntry } from "../../types-dtos/healthJournal.types";
import {
  getHealthScoreColor,
  getHealthScoreLabel,
} from "../../components/ui/healthCard/HealthCard";

type SheetState = "form" | "error";
type PendingEntry = { photoUrl: string; date: string };

function formatEntryDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("es-CR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HealthJournalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isConnected } = useConnectivity();

  const [plant, setPlant] = useState<PlantaCompletaInterface | null>(null);
  const [entries, setEntries] = useState<HealthJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentScore, setCurrentScore] = useState<number | null>(null);

  // Bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["72%"], []);
  const [sheetState, setSheetState] = useState<SheetState>("form");
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [pendingEntry, setPendingEntry] = useState<PendingEntry | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Animated hero progress bar
  const [barContainerWidth, setBarContainerWidth] = useState(0);
  const animatedBarWidth = useSharedValue(0);
  const animatedBarStyle = useAnimatedStyle(() => ({
    width: animatedBarWidth.value,
  }));

  // Pulsing heart for pending card
  const pulseScale = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));
  useEffect(() => {
    if (pendingEntry) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [pendingEntry]);

  useEffect(() => {
    if (currentScore !== null && barContainerWidth > 0) {
      animatedBarWidth.value = withSpring(
        (currentScore / 100) * barContainerWidth,
        { damping: 20, stiffness: 80 }
      );
    }
  }, [currentScore, barContainerWidth]);

  const loadData = useCallback(async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const plantData = await getPlantById(user.uid, id, isConnected);
      setPlant(plantData);
      setCurrentScore(plantData?.healthScore ?? null);

      if (isConnected) {
        const journalEntries = await getHealthJournalEntries(id);
        setEntries(journalEntries);
      }
    } catch (e) {
      console.error("Error loading health journal:", e);
    } finally {
      setLoading(false);
    }
  }, [user, id, isConnected]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openSheet = () => {
    setSheetState("form");
    setPickedImage(null);
    setNotes("");
    setErrorMsg("");
    bottomSheetRef.current?.expand();
  };

  const closeSheet = () => {
    bottomSheetRef.current?.close();
  };

  const handlePickImage = async () => {
    Alert.alert("Agregar foto", "Elige una opción", [
      {
        text: "Cámara",
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert("Permiso denegado", "Necesitas permitir el acceso a la cámara.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.6,
          });
          if (!result.canceled && result.assets?.[0]?.uri) {
            setPickedImage(result.assets[0].uri);
          }
        },
      },
      {
        text: "Galería",
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert("Permiso denegado", "Necesitas permitir el acceso a la galería.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.6,
          });
          if (!result.canceled && result.assets?.[0]?.uri) {
            setPickedImage(result.assets[0].uri);
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleAnalyze = async () => {
    if (!pickedImage) {
      Alert.alert("Foto requerida", "Agrega una foto de tu planta primero.");
      return;
    }
    if (!isConnected) {
      Alert.alert("Sin conexión", "El análisis con IA requiere conexión a internet.");
      return;
    }

    const imageUri = pickedImage;
    const entryNotes = notes.trim();
    const pendingDate = new Date().toISOString();

    // Close sheet immediately — show pending card in the list
    setPendingEntry({ photoUrl: imageUri, date: pendingDate });
    closeSheet();

    try {
      const result = await analyzeHealthWithGemini(imageUri, plant?.nombre, plant?.latinName);
      const permanentUri = await persistImage(imageUri);

      const entry: Omit<HealthJournalEntry, "id"> = {
        date: pendingDate,
        photoUrl: permanentUri,
        score: result.score,
        assessment: result.assessment,
        steps: result.steps,
        notes: entryNotes,
      };
      const saved = await addHealthJournalEntry(id, entry);

      if (user && plant) {
        await updatePlant(plant.id, {
          healthScore: result.score,
          healthLastUpdated: entry.date,
          userId: user.uid,
        });
      }

      setEntries((prev) => [saved, ...prev]);
      setCurrentScore(result.score);
    } catch (e: any) {
      console.error("Health analysis error:", e);
      Alert.alert("Error al analizar", e?.message || "Ocurrió un error inesperado.");
    } finally {
      setPendingEntry(null);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    []
  );

  const scoreColor =
    currentScore !== null
      ? getHealthScoreColor(currentScore)
      : theme.colors.disabledText;

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {plant?.nombre || "Salud de la planta"}
          </Text>
          <Text style={styles.headerSub}>Diario de salud</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SCORE SECTION */}
        <View style={styles.heroSection}>
          {currentScore !== null ? (
            <>
              <Text style={[styles.heroScore, { color: scoreColor }]}>
                {currentScore}
                <Text style={styles.heroScoreMax}>/100</Text>
              </Text>
              <Text style={[styles.heroStatusLabel, { color: scoreColor }]}>
                {getHealthScoreLabel(currentScore)}
              </Text>
              <View
                style={styles.heroBigBarTrack}
                onLayout={(e) =>
                  setBarContainerWidth(e.nativeEvent.layout.width)
                }
              >
                <Animated.View
                  style={[
                    styles.heroBigBarFill,
                    { backgroundColor: scoreColor },
                    animatedBarStyle,
                  ]}
                />
              </View>
            </>
          ) : (
            <View style={styles.heroEmpty}>
              <Ionicons
                name="leaf-outline"
                size={40}
                color={theme.colors.disabledText}
              />
              <Text style={styles.heroEmptyText}>Sin análisis aún</Text>
              <Text style={styles.heroEmptySub}>
                Agrega tu primera revisión para ver el estado de salud
              </Text>
            </View>
          )}
        </View>

        {/* JOURNAL SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Historial</Text>
        </View>

        {entries.length === 0 && !pendingEntry ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="camera-outline"
              size={52}
              color={theme.colors.disabledText}
            />
            <Text style={styles.emptyTitle}>Aún no hay registros</Text>
            <Text style={styles.emptySub}>
              Toma una foto de tu planta para que Flora analice su salud y
              guarde el historial
            </Text>
          </View>
        ) : (
          (() => {
            type TLItem =
              | { kind: "pending"; photoUrl: string; date: string }
              | { kind: "entry"; entry: HealthJournalEntry };
            const items: TLItem[] = [
              ...(pendingEntry
                ? [{ kind: "pending" as const, ...pendingEntry }]
                : []),
              ...entries.map((e) => ({ kind: "entry" as const, entry: e })),
            ];
            return items.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === items.length - 1;
              return (
                <View
                  key={item.kind === "pending" ? "__pending__" : item.entry.id}
                  style={styles.timelineRow}
                >
                  {/* Timeline gutter */}
                  <View style={styles.timelineGutter}>
                    <View
                      style={[
                        styles.timelineDot,
                        isFirst && styles.timelineDotCurrent,
                      ]}
                    />
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  {/* Card */}
                  <View
                    style={[
                      styles.entryCard,
                      { marginHorizontal: 0 },
                      isFirst && styles.entryCardCurrent,
                    ]}
                  >
                    {item.kind === "pending" ? (
                      <>
                        <View style={styles.entryHeader}>
                          <Text style={styles.entryDate}>
                            {formatEntryDate(item.date)}
                          </Text>
                          <View
                            style={[
                              styles.entryBadge,
                              { backgroundColor: theme.colors.primary + "22" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.entryBadgeText,
                                { color: theme.colors.primary },
                              ]}
                            >
                              Analizando...
                            </Text>
                          </View>
                        </View>
                        <Image
                          source={{ uri: item.photoUrl }}
                          style={styles.entryPhoto}
                          contentFit="cover"
                        />
                        <View style={styles.pendingIndicator}>
                          <Animated.View style={pulseStyle}>
                            <Ionicons
                              name="heart"
                              size={30}
                              color={theme.colors.primary}
                            />
                          </Animated.View>
                          <Text style={styles.pendingText}>
                            Flora está revisando tu planta
                          </Text>
                          <Text style={styles.pendingSub}>
                            Los resultados aparecerán en un momento
                          </Text>
                        </View>
                      </>
                    ) : (
                      (() => {
                        const { entry } = item;
                        const entryColor = getHealthScoreColor(entry.score);
                        return (
                          <>
                            <View style={styles.entryHeader}>
                              <Text style={styles.entryDate}>
                                {formatEntryDate(entry.date)}
                              </Text>
                              <View
                                style={[
                                  styles.entryBadge,
                                  { backgroundColor: entryColor + "22" },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.entryBadgeText,
                                    { color: entryColor },
                                  ]}
                                >
                                  {entry.score}/100 ·{" "}
                                  {getHealthScoreLabel(entry.score)}
                                </Text>
                              </View>
                            </View>
                            <Image
                              source={{ uri: entry.photoUrl }}
                              style={styles.entryPhoto}
                              contentFit="cover"
                            />
                            <Text style={styles.entryAssessment}>
                              {entry.assessment}
                            </Text>
                            {entry.steps && entry.steps.length > 0 && (
                              <View style={styles.stepsBox}>
                                <View style={styles.stepsHeader}>
                                  <Ionicons
                                    name="leaf"
                                    size={13}
                                    color={theme.colors.primary}
                                  />
                                  <Text style={styles.stepsTitle}>
                                    Pasos a seguir
                                  </Text>
                                </View>
                                {entry.steps.map((step, i) => (
                                  <View key={i} style={styles.stepRow}>
                                    <View style={styles.stepBullet} />
                                    <Text style={styles.stepText}>{step}</Text>
                                  </View>
                                ))}
                              </View>
                            )}
                            {!!entry.notes && (
                              <View style={styles.entryNotesRow}>
                                <Ionicons
                                  name="create-outline"
                                  size={13}
                                  color={theme.colors.disabledText}
                                />
                                <Text style={styles.entryNotesText}>
                                  {entry.notes}
                                </Text>
                              </View>
                            )}
                          </>
                        );
                      })()
                    )}
                  </View>
                </View>
              );
            });
          })()
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={openSheet}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={22} color={theme.colors.textOnAccent} />
        <Text style={styles.fabText}>Nueva revisión</Text>
      </TouchableOpacity>

      {/* BOTTOM SHEET */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: theme.colors.background,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          {sheetState === "form" && (
            <>
              <Text style={styles.sheetTitle}>Nueva revisión</Text>

              {/* IMAGE PICKER AREA */}
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                {pickedImage ? (
                  <Image
                    source={{ uri: pickedImage }}
                    style={styles.imagePickerPreview}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Ionicons
                      name="camera-outline"
                      size={36}
                      color={theme.colors.disabledText}
                    />
                    <Text style={styles.imagePickerHint}>
                      Toca para agregar foto de tu planta
                    </Text>
                    <Text style={styles.imagePickerSub}>
                      Cámara o galería
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* NOTES INPUT */}
              <Text style={styles.notesLabel}>Notas personales (opcional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Observaciones, cambios notados, etc."
                placeholderTextColor={theme.colors.disabledText}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />

              {/* ANALYZE BUTTON */}
              <TouchableOpacity
                style={[
                  styles.analyzeBtn,
                  { backgroundColor: theme.colors.primary },
                  !pickedImage && styles.analyzeBtnDisabled,
                ]}
                onPress={handleAnalyze}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={16}
                  color={theme.colors.textOnAccent}
                />
                <Text
                  style={[
                    styles.analyzeBtnText,
                    { color: theme.colors.textOnAccent },
                  ]}
                >
                  Analizar salud
                </Text>
              </TouchableOpacity>
            </>
          )}

          {sheetState === "error" && (
            <View style={styles.sheetCentered}>
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color={theme.colors.error}
              />
              <Text style={styles.errorTitle}>No se pudo analizar</Text>
              <Text style={styles.errorMsg}>{errorMsg}</Text>
              <View style={styles.errorActions}>
                <TouchableOpacity
                  style={[
                    styles.retryBtn,
                    { borderColor: theme.colors.primary },
                  ]}
                  onPress={() => setSheetState("form")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.retryBtnText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Reintentar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.closeBtn,
                    { backgroundColor: theme.colors.primary, marginTop: 0 },
                  ]}
                  onPress={closeSheet}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.closeBtnText,
                      { color: theme.colors.textOnAccent },
                    ]}
                  >
                    Cerrar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // HEADER
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.textPrimary,
    },
    headerSub: {
      fontSize: 11,
      color: theme.colors.disabledText,
      marginTop: 1,
    },
    // SCROLL
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: 24,
    },
    // HERO
    heroSection: {
      marginHorizontal: 20,
      marginBottom: 28,
      alignItems: "flex-start",
    },
    heroScore: {
      fontSize: 72,
      fontWeight: "200",
      lineHeight: 80,
      letterSpacing: -2,
    },
    heroScoreMax: {
      fontSize: 24,
      fontWeight: "300",
      letterSpacing: 0,
      color: theme.colors.disabledText,
    },
    heroStatusLabel: {
      fontSize: 14,
      fontWeight: "500",
      marginTop: 4,
      marginBottom: 12,
    },
    heroBigBarTrack: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      width: "100%",
      overflow: "hidden",
    },
    heroBigBarFill: {
      height: 6,
      borderRadius: 3,
    },
    heroEmpty: {
      alignItems: "center",
      paddingVertical: 16,
      width: "100%",
    },
    heroEmptyText: {
      fontSize: 18,
      fontWeight: "300",
      color: theme.colors.textSecondary,
      marginTop: 12,
    },
    heroEmptySub: {
      fontSize: 13,
      color: theme.colors.disabledText,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 18,
    },
    // SECTION
    sectionHeader: {
      marginHorizontal: 20,
      marginBottom: 12,
    },
    sectionLabel: {
      fontSize: 10,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: theme.colors.disabledText,
    },
    // EMPTY STATE
    emptyState: {
      alignItems: "center",
      marginHorizontal: 20,
      marginTop: 24,
      padding: 32,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "400",
      color: theme.colors.textSecondary,
      marginTop: 14,
    },
    emptySub: {
      fontSize: 13,
      color: theme.colors.disabledText,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 18,
    },
    // TIMELINE
    timelineRow: {
      flexDirection: "row",
      paddingLeft: 20,
      paddingRight: 20,
      alignItems: "stretch",
    },
    timelineGutter: {
      width: 20,
      alignItems: "center",
      paddingTop: 18,
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.border,
      flexShrink: 0,
    },
    timelineDotCurrent: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: theme.colors.border,
      marginTop: 4,
      marginBottom: -16,
    },
    // JOURNAL ENTRY CARD
    entryCard: {
      marginHorizontal: 20,
      marginBottom: 20,
      marginLeft: 12,
      flex: 1,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
      ...theme.shadows,
    },
    entryCardCurrent: {
      borderColor: theme.colors.primary + "55",
      borderWidth: 1.5,
    },
    // PENDING CARD
    pendingIndicator: {
      alignItems: "center",
      paddingVertical: 24,
      gap: 8,
    },
    pendingText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.textPrimary,
      marginTop: 4,
    },
    pendingSub: {
      fontSize: 12,
      color: theme.colors.disabledText,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 10,
    },
    entryDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textTransform: "capitalize",
    },
    entryBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    entryBadgeText: {
      fontSize: 11,
      fontWeight: "600",
    },
    entryPhoto: {
      width: "100%",
      height: 180,
    },
    entryAssessment: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      padding: 16,
      paddingBottom: 8,
    },
    stepsBox: {
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: theme.colors.successDim,
      borderWidth: 1,
      borderColor: theme.colors.primary + "40",
      borderRadius: 14,
      padding: 14,
      gap: 8,
    },
    stepsHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 2,
    },
    stepsTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.primary,
      letterSpacing: 0.3,
    },
    stepRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    stepBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
      marginTop: 5,
      flexShrink: 0,
    },
    stepText: {
      fontSize: 13,
      color: theme.colors.textPrimary,
      lineHeight: 19,
      flex: 1,
    },
    entryNotesRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      paddingHorizontal: 16,
      paddingBottom: 14,
    },
    entryNotesText: {
      fontSize: 12,
      color: theme.colors.disabledText,
      flex: 1,
      lineHeight: 18,
    },
    // FAB
    fab: {
      position: "absolute",
      right: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 18,
      paddingVertical: 13,
      borderRadius: 20,
      elevation: 6,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    fabText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textOnAccent,
    },
    // BOTTOM SHEET CONTENT
    sheetContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      paddingTop: 8,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.textPrimary,
      marginBottom: 20,
    },
    imagePicker: {
      width: "100%",
      height: 190,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundChip,
      overflow: "hidden",
      marginBottom: 16,
    },
    imagePickerPreview: {
      width: "100%",
      height: "100%",
    },
    imagePickerPlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    imagePickerHint: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    imagePickerSub: {
      fontSize: 12,
      color: theme.colors.disabledText,
    },
    notesLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    notesInput: {
      backgroundColor: theme.colors.inputBackground,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: theme.colors.textPrimary,
      minHeight: 80,
      textAlignVertical: "top",
      marginBottom: 20,
    },
    analyzeBtn: {
      height: 50,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    analyzeBtnDisabled: {
      opacity: 0.5,
    },
    analyzeBtnText: {
      fontSize: 15,
      fontWeight: "600",
    },
    // CENTERED SHEET STATES
    sheetCentered: {
      alignItems: "center",
      paddingVertical: 32,
      gap: 10,
    },
    analyzingTitle: {
      fontSize: 17,
      fontWeight: "500",
      color: theme.colors.textPrimary,
      marginTop: 8,
      textAlign: "center",
    },
    analyzingSubtitle: {
      fontSize: 13,
      color: theme.colors.disabledText,
      textAlign: "center",
    },
    // SUCCESS STATE
    resultScoreCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 2,
    },
    resultScoreNumber: {
      fontSize: 36,
      fontWeight: "200",
    },
    resultScoreMax: {
      fontSize: 13,
      color: theme.colors.disabledText,
      alignSelf: "flex-end",
      marginBottom: 6,
    },
    resultLabel: {
      fontSize: 15,
      fontWeight: "600",
    },
    resultAssessment: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginTop: 4,
    },
    closeBtn: {
      height: 48,
      paddingHorizontal: 32,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
    },
    closeBtnText: {
      fontSize: 15,
      fontWeight: "600",
    },
    // ERROR STATE
    errorTitle: {
      fontSize: 17,
      fontWeight: "500",
      color: theme.colors.textPrimary,
      marginTop: 4,
    },
    errorMsg: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 18,
    },
    errorActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 8,
    },
    retryBtn: {
      height: 48,
      paddingHorizontal: 24,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    retryBtnText: {
      fontSize: 14,
      fontWeight: "600",
    },
  });
