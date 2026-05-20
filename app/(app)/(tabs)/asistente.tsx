import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
} from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';
import BottomSheet, { BottomSheetFlatList, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

import { useTheme } from '../../../src/theme/desingSystem';
import { useAuth } from '../../../src/context/AuthContext';
import { getPlantsByUserId } from '../../../src/services/plantService';
import Toast from '../../../src/components/ui/toast/Toast';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: string | null;
  timestamp?: number;
}

// ─── Animations ───────────────────────────────────────────────────────────────

function AnimatedMessageBubble({ children }: { children: React.ReactNode }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withSpring(1, { damping: 18, stiffness: 90 });
    translateY.value = withSpring(0, { damping: 18, stiffness: 90 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

function TypingIndicator() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 300 }),
        withDelay(400, withTiming(0.3, { duration: 10 }))
      ),
      -1,
      false
    );
    dot2.value = withRepeat(
      withSequence(
        withDelay(200, withTiming(1, { duration: 300 })),
        withTiming(0.3, { duration: 300 }),
        withDelay(200, withTiming(0.3, { duration: 10 }))
      ),
      -1,
      false
    );
    dot3.value = withRepeat(
      withSequence(
        withDelay(400, withTiming(1, { duration: 300 })),
        withTiming(0.3, { duration: 300 })
      ),
      -1,
      false
    );
  }, []);

  const style1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const style2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const style3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 4 }}>
      <Animated.View style={[styles.typingDot, style1]} />
      <Animated.View style={[styles.typingDot, style2]} />
      <Animated.View style={[styles.typingDot, style3]} />
    </View>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AsistenteScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<any | null>(null);
  const [plants, setPlants] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const [toast, setToast] = useState<{ visible: boolean; type: "success" | "error" | "warning"; message: string }>({
    visible: false,
    type: "success",
    message: "",
  });

  const flatListRef = useRef<FlatList>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const sendScale = useSharedValue(1);

  const snapPoints = useMemo(() => ['55%'], []);

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ visible: true, type, message });
  };

  // Load chat history and user plants
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem('IPLANT_CHAT_HISTORY');
        if (saved) {
          setMessages(JSON.parse(saved));
        }
        const premiumStatus = await AsyncStorage.getItem('IPLANT_PREMIUM_STATUS');
        if (premiumStatus === 'true') {
          setIsPremium(true);
        }
      } catch (e) {
        console.error('Failed to load chat history/premium status:', e);
      }
    };
    loadChatHistory();
  }, []);

  const loadUserPlants = useCallback(async () => {
    if (user?.uid) {
      try {
        const netState = await NetInfo.fetch();
        const userPlants = await getPlantsByUserId(user.uid, !!netState.isConnected);
        setPlants(userPlants);
      } catch (e) {
        console.error("Failed to load user plants:", e);
      }
    }
  }, [user]);

  useEffect(() => {
    loadUserPlants();
  }, [loadUserPlants]);

  const saveChatHistory = async (newMessages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem('IPLANT_CHAT_HISTORY', JSON.stringify(newMessages));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [messages, loading]);

  const handlePickImage = async (useCamera = false) => {
    try {
      const permissionResult = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showToast("Permiso denegado para acceder a la cámara/galería.", "error");
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
          });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        const file = new File(uri);
        const base64 = (await file.base64()).trim();
        const dataUri = `data:image/jpeg;base64,${base64}`;
        setSelectedImage(dataUri);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {
      console.error("Error picking image:", e);
      showToast("Error al cargar la imagen.", "error");
    }
  };

  const handleMenuPress = () => {
    const options: any[] = [
      {
        text: "Limpiar conversación",
        style: "destructive",
        onPress: async () => {
          setMessages([]);
          await AsyncStorage.removeItem('IPLANT_CHAT_HISTORY');
          showToast("Conversación limpiada.", "success");
        }
      }
    ];

    if (isPremium) {
      options.unshift({
        text: "Cancelar Suscripción Premium (Simulación)",
        style: "destructive",
        onPress: async () => {
          setIsPremium(false);
          await AsyncStorage.setItem('IPLANT_PREMIUM_STATUS', 'false');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          showToast("Suscripción cancelada.", "warning");
        }
      });
    }

    options.push({
      text: "Cancelar",
      style: "cancel"
    });

    Alert.alert("Opciones de Chat", "Elige una opción para continuar", options);
  };

  const handleCopyMessage = async (text: string) => {
    await Clipboard.setStringAsync(text);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast("Texto copiado al portapapeles", "success");
  };

  const handleUpgradePurchase = async () => {
    setPurchasing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate secure 1.5 second purchase transaction
    setTimeout(async () => {
      try {
        setIsPremium(true);
        await AsyncStorage.setItem('IPLANT_PREMIUM_STATUS', 'true');
        setUpgradeModalVisible(false);
        setPurchasing(false);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast("¡Suscripción Premium Activada! 🌿✨", "success");
      } catch (e) {
        console.error("Failed to upgrade:", e);
        setPurchasing(false);
        showToast("Error al procesar la compra.", "error");
      }
    }, 1500);
  };

  const handleDeactivatePremium = async () => {
    try {
      setIsPremium(false);
      await AsyncStorage.setItem('IPLANT_PREMIUM_STATUS', 'false');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showToast("Premium desactivado (Simulación) 🌿", "warning");
    } catch (e) {
      console.error("Failed to deactivate premium:", e);
    }
  };

  const openPlantPicker = () => {
    loadUserPlants();
    bottomSheetRef.current?.expand();
  };

  const closePlantPicker = () => {
    bottomSheetRef.current?.close();
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedImage) return;

    const contentText = input.trim();
    const textToSend = selectedPlant 
      ? `[Planta seleccionada: ${selectedPlant.nombre}] ${contentText}`
      : contentText;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: textToSend,
      image: selectedImage,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await saveChatHistory(updatedMessages);

    setInput('');
    setSelectedImage(null);
    setSelectedPlant(null);
    setLoading(true);

    // Trigger send haptic
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        throw new Error("Sin conexión a internet.");
      }

      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          imageBase64: userMessage.image || undefined
        })
      });

      if (!response.ok) {
        throw new Error("Error en respuesta de servidor");
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = { 
        role: 'model', 
        content: data.response,
        timestamp: Date.now()
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);

      // Trigger success haptic on message received
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      const errorMessage: ChatMessage = { 
        role: 'model', 
        content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor verifica tu conexión e intenta de nuevo.',
        timestamp: Date.now()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPress = () => {
    sendScale.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withSpring(1, { damping: 12, stiffness: 150 })
    );
    sendMessage();
  };

  const sendAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }]
  }));

  const getHealthColor = (salud: string) => {
    switch (salud?.toLowerCase()) {
      case 'saludable':
        return { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80' };
      case 'enferma':
      case 'enfermo':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
      default:
        return { bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171' };
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  const formatMessageTime = (timestamp?: number) => {
    const date = timestamp ? new Date(timestamp) : new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `Hoy ${hours}:${minutes}`;
  };

  // Markdown Display Custom Styles
  const markdownStyles = StyleSheet.create({
    body: {
      color: "rgba(255,255,255,0.85)",
      fontSize: 14,
      lineHeight: 21,
    },
    strong: {
      color: "white",
      fontWeight: "600",
    },
    bullet_list: {
      color: "rgba(255,255,255,0.7)",
      marginVertical: 4,
    },
    list_item: {
      marginVertical: 2,
    },
    heading2: {
      color: "#4ade80",
      fontWeight: "500",
      marginTop: 8,
      marginBottom: 4,
      fontSize: 16,
    },
    code_inline: {
      backgroundColor: "rgba(255,255,255,0.08)",
      color: "#4ade80",
      borderRadius: 4,
      paddingHorizontal: 4,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#000' }}
    >
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <ExpoImage
            source={require('../../../assets/images/mascot.png')}
            style={styles.mascotIcon}
          />
          <View style={{ marginLeft: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.headerTitle}>Flora</Text>
              <View style={styles.onlineDot} />
            </View>
            <Text style={styles.headerSubtitle}>En línea</Text>
          </View>
        </View>
        
        {/* Header Right Action Area */}
        <View style={styles.headerRight}>
          {!isPremium ? (
            <TouchableOpacity 
              style={styles.upgradeBtn} 
              onPress={() => setUpgradeModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={11} color="#fbbf24" style={{ marginRight: 3 }} />
              <Text style={styles.upgradeBtnText}>Upgrade</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.premiumBadge} 
              onPress={handleDeactivatePremium}
              activeOpacity={0.8}
            >
              <Ionicons name="ribbon" size={11} color="#4ade80" style={{ marginRight: 3 }} />
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.headerMenuBtn} onPress={handleMenuPress}>
            <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* MESSAGES LIST */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={[
          styles.listContent,
          messages.length === 0 && { flex: 1, justifyContent: 'center' }
        ]}
        ListEmptyComponent={
          <View style={styles.welcomeContainer}>
            <ExpoImage
              source={require('../../../assets/images/mascot.png')}
              style={styles.welcomeMascot}
            />
            <Text style={styles.welcomeTitle}>Hola, soy Flora 🌿</Text>
            <Text style={styles.welcomeSubtitle}>Tu asistente botánica de iPlant</Text>
            
            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity 
                style={styles.quickActionPill} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handlePickImage(false);
                }}
              >
                <Ionicons name="scan-outline" size={14} color="#4ade80" />
                <Text style={styles.quickActionText}>Identificar planta</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickActionPill} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handlePickImage(false);
                }}
              >
                <Ionicons name="medical-outline" size={14} color="#f87171" />
                <Text style={styles.quickActionText}>Diagnosticar enfermedad</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          const isFirstMessage = index === 0;
          return (
            <View>
              {isFirstMessage && (
                <Text style={styles.dateSeparator}>{formatMessageTime(item.timestamp)}</Text>
              )}
              <AnimatedMessageBubble>
                {item.role === 'model' ? (
                  <View style={styles.assistantRow}>
                    <ExpoImage
                      source={require('../../../assets/images/mascot.png')}
                      style={styles.assistantAvatar}
                    />
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      onLongPress={() => handleCopyMessage(item.content)}
                      style={styles.assistantBubble}
                    >
                      <Markdown style={markdownStyles}>{item.content}</Markdown>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.userBubbleContainer}>
                    <View style={styles.userBubble}>
                      {item.image && (
                        <ExpoImage source={{ uri: item.image }} style={styles.messageImage} />
                      )}
                      <Text style={styles.userMessageText}>{item.content}</Text>
                    </View>
                  </View>
                )}
              </AnimatedMessageBubble>
            </View>
          );
        }}
        ListFooterComponent={
          loading ? (
            <View style={styles.assistantRow}>
              <ExpoImage
                source={require('../../../assets/images/mascot.png')}
                style={styles.assistantAvatar}
              />
              <View style={styles.assistantBubble}>
                <TypingIndicator />
              </View>
            </View>
          ) : null
        }
      />

      {/* INPUT CARD CONTAINER (Claude/Gemini style) */}
      <View style={[styles.inputSection, { paddingBottom: 80 + Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputCard}>
          {/* Integrated Attachments Row */}
          {(selectedImage || selectedPlant) && (
            <View style={styles.attachmentsRow}>
              {selectedImage && (
                <View style={styles.selectedImageContainer}>
                  <ExpoImage source={{ uri: selectedImage }} style={styles.selectedImagePreview} />
                  <TouchableOpacity style={styles.clearImageBtn} onPress={() => setSelectedImage(null)}>
                    <Ionicons name="close" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              {selectedPlant && (
                <View style={styles.selectedPlantBadge}>
                  <ExpoImage source={{ uri: selectedPlant.imagen }} style={styles.selectedPlantThumb} />
                  <Text style={styles.selectedPlantText}>{selectedPlant.nombre}</Text>
                  <TouchableOpacity onPress={() => setSelectedPlant(null)} style={{ padding: 2 }}>
                    <Ionicons name="close" size={12} color="#4ade80" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Pregúntale a Flora..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            maxLength={1000}
          />

          {/* Actions Bottom Bar */}
          <View style={styles.inputActionsRow}>
            {/* Left Icons */}
            <View style={styles.leftActions}>
              <TouchableOpacity onPress={() => handlePickImage(true)} style={styles.iconButton}>
                <Ionicons name="camera-outline" size={18} color="rgba(255,255,255,0.45)" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handlePickImage(false)} style={styles.iconButton}>
                <Ionicons name="image-outline" size={18} color="rgba(255,255,255,0.45)" />
              </TouchableOpacity>
              <TouchableOpacity onPress={openPlantPicker} style={styles.iconButton}>
                <Ionicons name="leaf-outline" size={18} color="rgba(255,255,255,0.45)" />
              </TouchableOpacity>
            </View>


            {/* Send Button */}
            <Animated.View style={sendAnimatedStyle}>
              <TouchableOpacity
                onPress={handleSendPress}
                disabled={(!input.trim() && !selectedImage) || loading}
                style={[
                  styles.sendButton,
                  (input.trim() || selectedImage) && !loading
                    ? styles.sendButtonActive
                    : styles.sendButtonDisabled,
                ]}
              >
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={(input.trim() || selectedImage) && !loading ? '#000' : 'rgba(255,255,255,0.25)'}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>

      {/* PLANT PICKER BOTTOM SHEET */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
      >
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={styles.bottomSheetTitle}>Selecciona una Planta</Text>
          {plants.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                Aún no tienes plantas agregadas
              </Text>
            </View>
          ) : (
            <BottomSheetFlatList
              data={plants}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.plantRow}
                  onPress={() => {
                    setSelectedPlant(item);
                    closePlantPicker();
                  }}
                >
                  <ExpoImage
                    source={{ uri: item.imagen }}
                    style={styles.plantRowThumb}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.plantRowName}>{item.nombre}</Text>
                    <Text style={styles.plantRowCat}>{item.categoria}</Text>
                  </View>
                  <View
                    style={[
                      styles.healthBadge,
                      { backgroundColor: getHealthColor(item.salud).bg },
                    ]}
                  >
                    <Text style={[styles.healthText, { color: getHealthColor(item.salud).text }]}>
                      {item.salud.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </BottomSheet>

      {/* PREMIUM PAYWALL MODAL */}
      <Modal
        visible={upgradeModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setUpgradeModalVisible(false)}
      >
        <View style={styles.premiumOverlay}>
          {/* Backdrop overlay */}
          <TouchableOpacity
            style={styles.premiumBackdrop}
            activeOpacity={1}
            onPress={() => setUpgradeModalVisible(false)}
            disabled={purchasing}
          />

          {/* Bottom sheet container */}
          <View style={styles.premiumBottomSheet}>
            
            {/* 3D POP-OUT HERO CONTAINER (Rendered absolutely behind the ScrollView) */}
            <View style={styles.premiumHeroContainer}>
              <ExpoImage
                source={require('../../../assets/images/plantapremium.png')}
                style={styles.premiumHeroImage}
                contentFit="contain"
              />
              <LinearGradient
                colors={["transparent", "#121212"]}
                style={styles.premiumHeroGradient}
              />
            </View>

            {/* SCROLLVIEW RENDERED ABOVE THE HERO */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.premiumScrollView}
              contentContainerStyle={styles.premiumScrollContent}
            >
              {/* HERO PLACEHOLDER & TEXTS */}
              <View style={styles.premiumHeroPlaceholder}>
                <View style={styles.premiumHeroTextContainer}>
                  <Text style={styles.premiumLatinName}>FLORA IA PRO</Text>
                  <Text style={styles.premiumPlantName}>iPlant Premium</Text>
                </View>

                <TouchableOpacity 
                  style={styles.premiumCloseButton} 
                  onPress={() => setUpgradeModalVisible(false)}
                  disabled={purchasing}
                >
                  <Ionicons name="close" size={18} color="white" />
                </TouchableOpacity>
              </View>

              {/* MAIN SOLID CONTENT WRAPPER */}
              <View style={styles.premiumMainContentContainer}>
                
                {/* Benefits List */}
                <View style={styles.premiumBenefitsContainer}>
                  <View style={styles.premiumBenefitRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#4ade80" style={{ marginTop: 2 }} />
                    <View style={styles.premiumBenefitTextContainer}>
                      <Text style={styles.premiumBenefitTitle}>Identificaciones con IA Ilimitadas</Text>
                      <Text style={styles.premiumBenefitDesc}>Escanea todas las plantas que quieras sin límites diarios ni anuncios molestos.</Text>
                    </View>
                  </View>

                  <View style={styles.premiumBenefitRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#4ade80" style={{ marginTop: 2 }} />
                    <View style={styles.premiumBenefitTextContainer}>
                      <Text style={styles.premiumBenefitTitle}>Diagnóstico Médico Botánico</Text>
                      <Text style={styles.premiumBenefitDesc}>Detecta plagas y enfermedades al instante con tratamientos detallados y recetas botánicas.</Text>
                    </View>
                  </View>

                  <View style={styles.premiumBenefitRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#4ade80" style={{ marginTop: 2 }} />
                    <View style={styles.premiumBenefitTextContainer}>
                      <Text style={styles.premiumBenefitTitle}>Flora Pro Supercargada</Text>
                      <Text style={styles.premiumBenefitDesc}>Respuestas instantáneas y análisis botánicos ultra detallados basados en Gemini 2.5 Pro.</Text>
                    </View>
                  </View>

                  <View style={styles.premiumBenefitRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#4ade80" style={{ marginTop: 2 }} />
                    <View style={styles.premiumBenefitTextContainer}>
                      <Text style={styles.premiumBenefitTitle}>Alertas Inteligentes de Clima</Text>
                      <Text style={styles.premiumBenefitDesc}>Optimiza el riego de acuerdo al clima en tiempo real de tu ciudad para evitar ahogamientos.</Text>
                    </View>
                  </View>
                </View>

                {/* Price details */}
                <View style={styles.premiumPricingCard}>
                  <Text style={styles.premiumPricingAmount}>$4.99 / mes</Text>
                  <Text style={styles.premiumPricingSub}>Cancela en cualquier momento. Incluye 7 días de prueba gratis.</Text>
                </View>
              </View>
            </ScrollView>

            {/* BOTTOM FIXED CTA BUTTON */}
            <View style={styles.premiumBottomCtaContainer}>
              <TouchableOpacity
                style={[styles.premiumCtaButton, purchasing && styles.premiumCtaButtonDisabled]}
                onPress={handleUpgradePurchase}
                disabled={purchasing}
                activeOpacity={0.8}
              >
                {purchasing ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.premiumCtaButtonText}>Iniciar Suscripción por $4.99</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TOAST OVERLAY */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#000',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotIcon: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#fff',
  },
  onlineDot: {
    width: 8,
    height: 8,
    backgroundColor: '#4ade80',
    borderRadius: 4,
    marginLeft: 6,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 1,
  },
  headerMenuBtn: {
    padding: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  dateSeparator: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    marginVertical: 12,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeMascot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#fff',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    justifyContent: 'center',
  },
  quickActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  quickActionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  assistantRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginTop: 2,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  userBubbleContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  userMessageText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 21,
  },
  messageImage: {
    width: 200,
    height: 140,
    borderRadius: 12,
    marginBottom: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
    marginHorizontal: 1,
  },
  inputSection: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
    padding: 10,
    flexDirection: 'column',
    gap: 8,
  },
  attachmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  selectedImageContainer: {
    position: 'relative',
    width: 52,
    height: 52,
  },
  selectedImagePreview: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  clearImageBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  selectedPlantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    alignSelf: 'flex-start',
  },
  selectedPlantThumb: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  selectedPlantText: {
    fontSize: 11,
    color: '#4ade80',
    fontWeight: '500',
  },
  textInput: {
    width: '100%',
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 4,
    maxHeight: 150,
    textAlignVertical: 'top',
  },
  inputActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#4ade80',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  bottomSheetBackground: {
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  plantRowThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  plantRowName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  plantRowCat: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthText: {
    fontSize: 10,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  upgradeBtnText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  premiumBadgeText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  premiumBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  premiumBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '84%',
    backgroundColor: '#121212',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'visible',
  },
  premiumHeroContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -65,
    height: 280,
    overflow: 'visible',
    zIndex: 1,
  },
  premiumHeroImage: {
    width: '100%',
    height: 280,
  },
  premiumHeroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  premiumScrollView: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  premiumScrollContent: {
    paddingBottom: 110,
  },
  premiumHeroPlaceholder: {
    height: 200,
    position: 'relative',
  },
  premiumHeroTextContainer: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
  },
  premiumLatinName: {
    fontSize: 11,
    color: '#fbbf24',
    letterSpacing: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  premiumPlantName: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
  },
  premiumCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 50,
  },
  premiumMainContentContainer: {
    backgroundColor: '#121212',
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  premiumBenefitsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  premiumBenefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  premiumBenefitTextContainer: {
    flex: 1,
  },
  premiumBenefitTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  premiumBenefitDesc: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  premiumPricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumPricingAmount: {
    color: '#fbbf24',
    fontSize: 22,
    fontWeight: '700',
  },
  premiumPricingSub: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  premiumBottomCtaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
    zIndex: 10,
  },
  premiumCtaButton: {
    backgroundColor: '#4ade80',
    borderRadius: 16,
    height: 52,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCtaButtonDisabled: {
    backgroundColor: 'rgba(74, 222, 128, 0.4)',
  },
  premiumCtaButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});
