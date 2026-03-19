import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDKwMWqKnlwyZBOAG_IXXN6WLXSOojsk4",
  authDomain: "iplant-database.firebaseapp.com",
  projectId: "iplant-database",
  storageBucket: "iplant-database.firebasestorage.app",
  messagingSenderId: "132450203288",
  appId: "1:132450203288:web:3633b50c1567740c5ac2ed",
};

// Evita inicializar la app más de una vez (hot reload de Expo)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
