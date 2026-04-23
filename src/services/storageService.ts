import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

const IMAGES_DIR = `${FileSystem.documentDirectory}images/`;

/**
 * Ensures that the images directory exists.
 */
const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
};

/**
 * Saves an item to AsyncStorage.
 */
export async function saveItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error(`Error saving item with key ${key}:`, e);
    throw e;
  }
}

/**
 * Retrieves an item from AsyncStorage.
 */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(`Error retrieving item with key ${key}:`, e);
    return null;
  }
}

/**
 * Removes an item from AsyncStorage.
 */
export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing item with key ${key}:`, e);
    throw e;
  }
}

/**
 * Moves an image from a temporary URI to permanent storage.
 * @param tempUri The temporary URI of the image (e.g. from camera or picker).
 * @returns The new permanent URI.
 */
export async function persistImage(tempUri: string): Promise<string> {
  try {
    await ensureDirExists();
    
    // Extract extension from tempUri or default to .jpg
    const extension = tempUri.split('.').pop() || 'jpg';
    const filename = `${Crypto.randomUUID()}.${extension}`;
    const permanentUri = `${IMAGES_DIR}${filename}`;
    
    await FileSystem.moveAsync({
      from: tempUri,
      to: permanentUri,
    });
    
    return permanentUri;
  } catch (e) {
    console.error('Error persisting image:', e);
    throw e;
  }
}

/**
 * Deletes an image from permanent storage.
 */
export async function deleteImage(uri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch (e) {
    console.error(`Error deleting image at ${uri}:`, e);
  }
}
