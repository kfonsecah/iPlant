// Mock firebase/firestore
jest.mock('firebase/firestore', () => {
  const MockTimestamp = jest.fn().mockImplementation(() => ({
    toDate: jest.fn(() => new Date()),
  }));
  (MockTimestamp as any).now = jest.fn(() => new MockTimestamp());

  return {
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    Timestamp: MockTimestamp,
  };
});

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid'),
}));

// Mock storageService
jest.mock('../storageService', () => ({
  getItem: jest.fn(),
  saveItem: jest.fn(),
  persistImage: jest.fn((uri) => Promise.resolve(`permanent-${uri}`)),
}));

// Mock syncService
jest.mock('../syncService', () => ({
  addToQueue: jest.fn(),
  getQueue: jest.fn(() => Promise.resolve([])),
  processQueue: jest.fn(),
}));

// Mock expo-modules-core
jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {},
  requireNativeModule: jest.fn(),
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => {
  return {
    File: jest.fn().mockImplementation(() => ({
      base64: jest.fn().mockResolvedValue('base64data'),
    })),
  };
});

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        plantIdApiKey: 'test-api-key',
      },
    },
  },
  expoConfig: {
    extra: {
      plantIdApiKey: 'test-api-key',
    },
  },
}));

// Mock firebase/app
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock firebase config
jest.mock('../../config/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock utils/withTimeout
jest.mock('../../utils/withTimeout', () => ({
  withTimeout: (p: any) => p,
}));

import NetInfo from '@react-native-community/netinfo';
import { identifyPlant, getPlantsByUserId, addPlant } from "../plantService";
import { getItem, saveItem } from '../storageService';
import { addToQueue } from '../syncService';
import { getDocs, Timestamp } from 'firebase/firestore';

// Mock react-native
jest.mock('react-native', () => ({}));

describe('plantService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    process.env = { ...originalEnv, EXPO_PUBLIC_PLANT_ID_API_KEY: 'test-api-key' };
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('identifyPlant', () => {
    it('should identify a plant successfully when online', async () => {
      const mockResponse = {
        result: {
          classification: {
            suggestions: [
              {
                name: 'Rosa',
                probability: 0.95,
                details: {
                  common_names: ['Rosa'],
                  wiki_description: {
                    value: 'Roses are woody perennial flowering plants...',
                  },
                },
              },
            ],
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await identifyPlant('mock-uri');

      expect(result.plantName).toBe('Rosa');
      expect(result.probability).toBe(95);
    });

    it('should throw error if offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      await expect(identifyPlant('mock-uri')).rejects.toThrow(
        'Sin conexión a internet. La identificación por IA no está disponible sin conexión.'
      );
    });
  });

  describe('getPlantsByUserId', () => {
    const userId = 'user-1';

    it('should fetch from Firestore and update cache when online', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ userId, nombre: 'Plant 1', categoria: 'Cat', imagen: 'img', salud: 'saludable', proximoRiego: 1, ultimoRiego: Timestamp.now() }) },
      ];
      (getDocs as jest.Mock).mockResolvedValueOnce({ docs: mockDocs });

      const plants = await getPlantsByUserId(userId, true);

      expect(plants.length).toBe(1);
      expect(saveItem).toHaveBeenCalled();
    });

    it('should return from cache when offline', async () => {
      const cachedPlants = [{ id: 'cached-1', nombre: 'Cached Plant' }];
      (getItem as jest.Mock).mockResolvedValueOnce(cachedPlants);

      const plants = await getPlantsByUserId(userId, false);

      expect(plants).toEqual(cachedPlants);
      expect(getDocs).not.toHaveBeenCalled();
    });
  });

  describe('addPlant', () => {
    it('should save to cache and enqueue sync (Local-First)', async () => {
      const plantData: any = {
        userId: 'user-1',
        nombre: 'New Plant',
        categoria: 'Interior',
        proximoRiego: 7,
        imagen: 'local-uri',
      };

      (getItem as jest.Mock).mockResolvedValueOnce([]);

      const result = await addPlant(plantData);

      expect(result.id).toBe('test-uuid');
      expect(result.isPending).toBe(true);
      expect(saveItem).toHaveBeenCalled();
      expect(addToQueue).toHaveBeenCalled();
    });
  });
});
