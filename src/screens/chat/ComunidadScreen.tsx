import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';

import { useAuth } from '../../context/AuthContext';
import { AppTheme, useTheme } from '../../theme/desingSystem';
import {
  ChatMessage,
  ChatUser,
  MediaAttachment,
  clearSession,
  createChatWebSocket,
  getStoredToken,
  getStoredUserId,
  joinChat,
  storeSession,
  uploadChatMedia,
} from '../../services/chatService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getInitials(nickname: string): string {
  return nickname.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ['#4ade80', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa', '#34d399', '#facc15'];

function colorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// ─── AnimatedMessageBubble ────────────────────────────────────────────────────

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

// ─── TypingIndicator ──────────────────────────────────────────────────────────

function TypingIndicator({ nickname, theme }: { nickname: string; theme: AppTheme }) {
  const styles = createStyles(theme);
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 300 }),
        withDelay(400, withTiming(0.3, { duration: 10 }))
      ), -1, false
    );
    dot2.value = withRepeat(
      withSequence(
        withDelay(200, withTiming(1, { duration: 300 })),
        withTiming(0.3, { duration: 300 }),
        withDelay(200, withTiming(0.3, { duration: 10 }))
      ), -1, false
    );
    dot3.value = withRepeat(
      withSequence(
        withDelay(400, withTiming(1, { duration: 300 })),
        withTiming(0.3, { duration: 300 })
      ), -1, false
    );
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.otherRow}>
      <View style={styles.avatarPlaceholder} />
      <View style={styles.otherBubble}>
        <Text style={styles.senderName}>{nickname}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 2 }}>
          <Animated.View style={[styles.typingDot, s1]} />
          <Animated.View style={[styles.typingDot, s2]} />
          <Animated.View style={[styles.typingDot, s3]} />
        </View>
      </View>
    </View>
  );
}

// ─── OnlineUsersPanel ─────────────────────────────────────────────────────────

function OnlineUsersPanel({
  users,
  myUserId,
  theme,
}: {
  users: ChatUser[];
  myUserId: string;
  theme: AppTheme;
}) {
  const s = createStyles(theme);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.onlinePanelContent}
    >
      {users.map(u => {
        const color = colorFromId(u.id);
        const isMe = u.id === myUserId;
        return (
          <View key={u.id} style={s.onlineUserChip}>
            <View style={{ position: 'relative' }}>
              <View style={[s.onlineAvatar, { backgroundColor: color + '22', borderColor: color + '55' }]}>
                <Text style={[s.onlineAvatarText, { color }]}>
                  {u.nickname.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={s.onlineGreenDot} />
            </View>
            <Text style={s.onlineUserName} numberOfLines={1}>
              {isMe ? 'Tú' : u.nickname}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── UserAvatar ───────────────────────────────────────────────────────────────

function UserAvatar({ userId, nickname }: { userId: string; nickname: string }) {
  const color = colorFromId(userId);
  return (
    <View style={[styles.avatar, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[styles.avatarText, { color }]}>{getInitials(nickname)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

// ─── MessageBubble ────────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  isOwn,
  seen,
  theme,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  seen: boolean;
  theme: AppTheme;
}) {
  const s = createStyles(theme);
  const color = colorFromId(msg.sender_id);

  return (
    <AnimatedMessageBubble>
      {isOwn ? (
        <View style={s.ownRow}>
          <View style={{ alignItems: 'flex-end', flex: 1 }}>
            <View style={s.ownBubble}>
              {msg.media?.url ? (
                <ExpoImage
                  source={{ uri: msg.media.url }}
                  style={s.msgImage}
                  contentFit="cover"
                />
              ) : null}
              {msg.content ? <Text style={s.ownBubbleText}>{msg.content}</Text> : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 }}>
              <Text style={s.timeText}>{formatTime(msg.timestamp)}</Text>
              <Ionicons
                name={seen ? 'checkmark-done' : 'checkmark'}
                size={13}
                color={seen ? theme.colors.primary : theme.colors.disabledText}
              />
            </View>
          </View>
          <View style={{ marginLeft: 8, marginTop: 2 }}>
            <UserAvatar userId={msg.sender_id} nickname={msg.sender_nickname} />
          </View>
        </View>
      ) : (
        <View style={s.otherRow}>
          <View style={{ marginRight: 8, marginTop: 2 }}>
            <UserAvatar userId={msg.sender_id} nickname={msg.sender_nickname} />
          </View>
          <View style={{ maxWidth: '78%' }}>
            <Text style={[s.senderName, { color }]}>{msg.sender_nickname}</Text>
            <View style={s.otherBubble}>
              {msg.media?.url ? (
                <ExpoImage source={{ uri: msg.media.url }} style={s.msgImage} contentFit="cover" />
              ) : null}
              {msg.content ? <Text style={s.otherBubbleText}>{msg.content}</Text> : null}
            </View>
            <Text style={s.timeText}>{formatTime(msg.timestamp)}</Text>
          </View>
        </View>
      )}
    </AnimatedMessageBubble>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface TypingUser { user_id: string; nickname: string }

export default function ComunidadScreen() {
  const theme = useTheme();
  const s = createStyles(theme);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [seenMap, setSeenMap]           = useState<Record<string, boolean>>({});
  const [input, setInput]               = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaAttachment | null>(null);
  const [uploading, setUploading]       = useState(false);
  const [connected, setConnected]       = useState(false);
  const [myUserId, setMyUserId]       = useState('');
  const [joining, setJoining]         = useState(true);
  const [showUsers, setShowUsers]     = useState(false);

  const wsRef           = useRef<WebSocket | null>(null);
  const tokenRef        = useRef('');
  const myUserIdRef     = useRef('');
  const listRef         = useRef<FlatList>(null);
  const typingTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendScale       = useSharedValue(1);
  const panelHeight     = useSharedValue(0);
  const panelStyle      = useAnimatedStyle(() => ({
    height: panelHeight.value,
    overflow: 'hidden',
  }));

  // ── Keyboard animation (mismo patrón que Flora) ────────────────────────────

  const inputPaddingBottom = useSharedValue(80 + Math.max(insets.bottom, 12));
  const inputSectionStyle  = useAnimatedStyle(() => ({ paddingBottom: inputPaddingBottom.value }));

  useEffect(() => {
    const targetOpen   = Math.max(insets.bottom, 8);
    const targetClosed = 80 + Math.max(insets.bottom, 12);
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => { inputPaddingBottom.value = withTiming(targetOpen, { duration: 220 }); }
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => { inputPaddingBottom.value = withTiming(targetClosed, { duration: 220 }); }
    );
    return () => { show.remove(); hide.remove(); };
  }, [insets.bottom]);

  const sendAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  // ── Init ──────────────────────────────────────────────────────────────────

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    initChat();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (typingTimer.current)    clearTimeout(typingTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);

  const initChat = async () => {
    try {
      setJoining(true);
      let token  = await getStoredToken();
      let userId = await getStoredUserId();

      if (!token || !userId) {
        const raw      = user?.displayName ?? user?.email ?? 'Usuario';
        const nickname = raw.split(/[\s@]/)[0].slice(0, 20) || 'Usuario';
        const res      = await joinChat(nickname);
        await storeSession(res.token, res.user.id);
        token  = res.token;
        userId = res.user.id;
      }

      tokenRef.current  = token;
      myUserIdRef.current = userId;
      setMyUserId(userId);
      connectWS(token);
    } catch {
      setJoining(false);
    }
  };

  // ── WebSocket ─────────────────────────────────────────────────────────────

  const connectWS = (token: string) => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    const ws = createChatWebSocket(token);

    ws.onopen  = () => { if (mountedRef.current) { setConnected(true); setJoining(false); } };
    ws.onclose = (event) => {
      if (!mountedRef.current) return;
      setConnected(false);
      // Code 4001 = server doesn't recognize the user (restart o token expirado)
      if ((event as CloseEvent).code === 4001) {
        clearSession().then(() => {
          if (mountedRef.current) reconnectTimer.current = setTimeout(initChat, 2000);
        });
      } else {
        reconnectTimer.current = setTimeout(() => connectWS(token), 4000);
      }
    };
    ws.onerror = () => { if (mountedRef.current) setConnected(false); };
    ws.onmessage = (event: MessageEvent) => {
      try { handleWs(JSON.parse(event.data as string)); } catch { /* ignore */ }
    };

    wsRef.current = ws;
  };

  const sendMarkRead = (messageId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'mark_read', message_id: messageId }));
    }
  };

  const handleWs = (data: Record<string, unknown>) => {
    const me = myUserIdRef.current;

    switch (data.type) {
      case 'group_history': {
        const msgs = (data.messages as ChatMessage[]) ?? [];
        setMessages(msgs);
        // Marcar como leídos todos los mensajes de otros
        msgs.forEach(m => { if (m.sender_id !== me) sendMarkRead(m.id); });
        break;
      }
      case 'group_message': {
        const msg = data.message as ChatMessage;
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
        // Marcar como leído si es de otro
        if (msg.sender_id !== me) sendMarkRead(msg.id);
        break;
      }
      case 'message_seen':
        setSeenMap(prev => ({ ...prev, [data.message_id as string]: true }));
        break;
      case 'message_expired':
        setMessages(prev => prev.filter(m => m.id !== (data.message_id as string)));
        break;
      case 'users_list':
        setOnlineUsers((data.users as ChatUser[]) ?? []);
        break;
      case 'user_joined':
        setOnlineUsers(prev => {
          const u = data.user as ChatUser;
          return prev.some(x => x.id === u.id) ? prev : [...prev, u];
        });
        break;
      case 'user_left':
        setOnlineUsers(prev => prev.filter(u => u.id !== (data.user_id as string)));
        setTypingUsers(prev => prev.filter(u => u.user_id !== (data.user_id as string)));
        break;
      case 'typing':
        setTypingUsers(prev => {
          if (prev.some(u => u.user_id === (data.user_id as string))) return prev;
          return [...prev, { user_id: data.user_id as string, nickname: data.nickname as string }];
        });
        break;
      case 'stop_typing':
        setTypingUsers(prev => prev.filter(u => u.user_id !== (data.user_id as string)));
        break;
    }
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const scrollToBottom = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const mime = asset.mimeType ?? 'image/jpeg';
      const name = asset.fileName ?? `photo_${Date.now()}.jpg`;
      const uploaded = await uploadChatMedia(tokenRef.current, asset.uri, mime, name);
      setSelectedMedia(uploaded);
    } catch {
      /* silent — user can retry */
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'typing' }));
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        ws.send(JSON.stringify({ type: 'stop_typing' }));
      }, 2500);
    }
  };

  const sendMessage = () => {
    const text = input.trim();
    if ((!text && !selectedMedia) || wsRef.current?.readyState !== WebSocket.OPEN) return;

    sendScale.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withSpring(1, { damping: 12, stiffness: 150 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const payload: Record<string, unknown> = { type: 'group_message', content: text };
    if (selectedMedia) payload.media = selectedMedia;

    wsRef.current.send(JSON.stringify(payload));
    if (typingTimer.current) clearTimeout(typingTimer.current);
    wsRef.current.send(JSON.stringify({ type: 'stop_typing' }));
    setInput('');
    setSelectedMedia(null);
  };

  const toggleUsers = () => {
    const next = !showUsers;
    setShowUsers(next);
    panelHeight.value = withTiming(next ? 72 : 0, { duration: 220 });
  };

  const handleReconnect = async () => {
    await clearSession();
    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
    initChat();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageBubble
        msg={item}
        isOwn={item.sender_id === myUserIdRef.current}
        seen={seenMap[item.id] ?? false}
        theme={theme}
      />
    ),
    [seenMap, theme]
  );

  const onlineCount = onlineUsers.length;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        translucent
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      {/* ── Header (mismo estilo que Flora) ── */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <View style={s.headerLeft}>
          <View style={s.headerIconWrap}>
            <Ionicons name="people" size={18} color={theme.colors.primary} />
          </View>
          <View style={{ marginLeft: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={s.headerTitle}>Comunidad</Text>
              <View style={[s.onlineDot, { backgroundColor: connected ? theme.colors.primary : theme.colors.error }]} />
            </View>
            <Pressable
              onPress={connected && onlineCount > 0 ? toggleUsers : undefined}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
            >
              <Text style={s.headerSubtitle}>
                {joining ? 'Conectando...' : connected ? `${onlineCount} en línea` : 'Desconectado'}
              </Text>
              {connected && onlineCount > 0 && (
                <Ionicons
                  name={showUsers ? 'chevron-up' : 'chevron-down'}
                  size={10}
                  color={theme.colors.textSecondary}
                />
              )}
            </Pressable>
          </View>
        </View>

        {!connected && !joining && (
          <Pressable style={s.menuBtn} onPress={handleReconnect}>
            <Ionicons name="refresh-outline" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* ── Online Users Panel ── */}
      <Animated.View style={[s.onlinePanel, panelStyle]}>
        <OnlineUsersPanel users={onlineUsers} myUserId={myUserId} theme={theme} />
      </Animated.View>

      {/* ── Messages ── */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          s.listContent,
          messages.length === 0 && { flex: 1, justifyContent: 'center' },
        ]}
        onContentSizeChange={scrollToBottom}
        ListEmptyComponent={
          <View style={s.welcomeContainer}>
            <View style={s.welcomeIconWrap}>
              <Ionicons name="people" size={36} color={theme.colors.primary} />
            </View>
            <Text style={s.welcomeTitle}>Chat de la Comunidad</Text>
            <Text style={s.welcomeSubtitle}>
              {joining ? 'Conectando al servidor...' : 'Sé el primero en escribir algo'}
            </Text>
          </View>
        }
        ListFooterComponent={
          typingUsers.length > 0 ? (
            <TypingIndicator
              nickname={
                typingUsers.length === 1
                  ? typingUsers[0].nickname
                  : `${typingUsers.length} personas`
              }
              theme={theme}
            />
          ) : null
        }
      />

      {/* ── Input (mismo card pill que Flora) ── */}
      <Animated.View style={[s.inputSection, inputSectionStyle]}>
        {selectedMedia ? (
          <View style={s.previewWrap}>
            <ExpoImage source={{ uri: selectedMedia.url }} style={s.previewImg} contentFit="cover" />
            <TouchableOpacity style={s.previewRemove} onPress={() => setSelectedMedia(null)}>
              <Ionicons name="close" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={s.inputCard}>
          <TouchableOpacity onPress={handlePickImage} disabled={uploading} style={s.iconButton}>
            {uploading
              ? <Ionicons name="hourglass-outline" size={18} color={theme.colors.textSecondary} />
              : <Ionicons name="image-outline"     size={18} color={theme.colors.textSecondary} />}
          </TouchableOpacity>
          <TextInput
            style={s.textInput}
            value={input}
            onChangeText={handleInputChange}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={theme.colors.disabledText}
            multiline
            maxLength={1000}
          />
          <Animated.View style={sendAnimStyle}>
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!input.trim() || !connected}
              style={[
                s.sendButton,
                (input.trim() || selectedMedia) && connected ? s.sendButtonActive : s.sendButtonDisabled,
              ]}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={
                  input.trim() && connected
                    ? theme.colors.textOnAccent
                    : theme.colors.disabledText
                }
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '300',
      color: theme.colors.textPrimary,
    },
    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 6,
    },
    headerSubtitle: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    menuBtn: {
      padding: 6,
    },

    // Online users panel
    onlinePanel: {
      backgroundColor: theme.colors.backgroundCard,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    onlinePanelContent: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 14,
      alignItems: 'center',
    },
    onlineUserChip: {
      alignItems: 'center',
      gap: 4,
      width: 46,
    },
    onlineAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    onlineAvatarText: {
      fontSize: 11,
      fontWeight: '700',
    },
    onlineGreenDot: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: '#4ade80',
      borderWidth: 1.5,
      borderColor: theme.colors.backgroundCard,
    },
    onlineUserName: {
      fontSize: 9,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      maxWidth: 46,
    },

    // List
    listContent: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },

    // Empty / Welcome
    welcomeContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    welcomeIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    welcomeTitle: {
      fontSize: 20,
      fontWeight: '300',
      color: theme.colors.textPrimary,
    },
    welcomeSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },

    // Other bubble row (left)
    otherRow: {
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'flex-start',
    },
    avatarPlaceholder: {
      width: 36,
      marginRight: 8,
    },
    senderName: {
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 3,
      marginLeft: 2,
    },
    otherBubble: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      borderTopLeftRadius: 4,
      paddingHorizontal: 14,
      paddingVertical: 10,
      maxWidth: '100%',
      ...theme.shadows,
    },
    otherBubbleText: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      lineHeight: 21,
    },

    // Own bubble row (right)
    ownRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    ownBubble: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(74, 222, 128, 0.12)' : 'rgba(74, 222, 128, 0.18)',
      borderWidth: 1,
      borderColor: 'rgba(74, 222, 128, 0.25)',
      borderRadius: 18,
      borderTopRightRadius: 4,
      paddingHorizontal: 14,
      paddingVertical: 10,
      maxWidth: '80%',
    },
    ownBubbleText: {
      fontSize: 14,
      color: theme.mode === 'dark' ? '#fff' : '#1A3A2A',
      lineHeight: 21,
    },

    // Time
    timeText: {
      fontSize: 10,
      color: theme.colors.disabledText,
      marginTop: 3,
      marginHorizontal: 2,
    },

    // Typing dots
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },

    // Input
    inputSection: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    inputCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 22,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      ...theme.shadows,
    },
    textInput: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 14,
      paddingHorizontal: 8,
      paddingTop: 4,
      paddingBottom: 4,
      maxHeight: 150,
      textAlignVertical: 'top',
    },
    sendButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    sendButtonDisabled: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    msgImage: {
      width: 200,
      height: 140,
      borderRadius: 12,
      marginBottom: 6,
    },
    previewWrap: {
      position: 'relative',
      alignSelf: 'flex-start',
      marginHorizontal: 16,
      marginBottom: 6,
    },
    previewImg: {
      width: 64,
      height: 64,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    previewRemove: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: 'rgba(0,0,0,0.7)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
