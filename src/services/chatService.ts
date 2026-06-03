import AsyncStorage from '@react-native-async-storage/async-storage';

export const CHAT_API = 'https://chat-backend-4nzg.onrender.com';
export const CHAT_WS = 'wss://chat-backend-4nzg.onrender.com';

const TOKEN_KEY = 'IPLANT_CHAT_TOKEN';
const USER_ID_KEY = 'IPLANT_CHAT_USER_ID';

export interface ChatUser {
  id: string;
  nickname: string;
  is_online: boolean;
  public_key?: string;
}

export interface MediaAttachment {
  url: string;
  public_id: string;
  resource_type: string;
  format: string;
  size_bytes: number;
  original_filename: string;
  width?: number;
  height?: number;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_nickname: string;
  content: string;
  timestamp: string;
  type: 'group' | 'dm';
  recipient_id?: string;
  ttl?: number;
  expires_at?: string;
  allow_read_receipt: boolean;
  media?: MediaAttachment;
}

export async function joinChat(nickname: string): Promise<{ user: ChatUser; token: string }> {
  const res = await fetch(`${CHAT_API}/api/chat/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname }),
  });
  if (!res.ok) throw new Error('No se pudo unir al chat');
  return res.json();
}

export async function logoutChat(token: string): Promise<void> {
  await fetch(`${CHAT_API}/api/chat/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY]);
}

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUserId(): Promise<string | null> {
  return AsyncStorage.getItem(USER_ID_KEY);
}

export async function storeSession(token: string, userId: string): Promise<void> {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_ID_KEY, userId],
  ]);
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY]);
}

export function createChatWebSocket(token: string): WebSocket {
  return new WebSocket(`${CHAT_WS}/ws/${token}`);
}

export async function uploadChatMedia(
  token: string,
  uri: string,
  mimeType: string,
  filename: string,
): Promise<MediaAttachment> {
  const form = new FormData();
  form.append('file', { uri, type: mimeType, name: filename } as unknown as Blob);
  const res = await fetch(`${CHAT_API}/api/chat/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error('Error al subir imagen');
  return res.json();
}
