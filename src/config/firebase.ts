import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Metro resuelve @firebase/auth al build de React Native que sí exporta
// getReactNativePersistence, pero los tipos de TypeScript usan el build web.
// Metro resuelve @firebase/auth al build de React Native que sí exporta
// getReactNativePersistence, pero los tipos de TypeScript usan el build web.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require("@firebase/auth") as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => any;
};

const firebaseConfig = {
  apiKey:            "AIzaSyBDKwMWqKnlwyZBOAG_IXXN6WLXSOojsk4",
  authDomain:        "iplant-database.firebaseapp.com",
  projectId:         "iplant-database",
  storageBucket:     "iplant-database.firebasestorage.app",
  messagingSenderId: "132450203288",
  appId:             "1:132450203288:web:3633b50c1567740c5ac2ed",
};

// Evita re-inicializar en hot-reload de Expo
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

// Auth con persistencia en AsyncStorage (sesión sobrevive reinicios de la app)
export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Si ya fue inicializado (hot-reload), devuelve la instancia existente
    return getAuth(app);
  }
})();
