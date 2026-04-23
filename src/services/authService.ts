import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  getAdditionalUserInfo,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

// ─── Mapeo de errores Firebase → español ──────────────────────────────────────
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/user-not-found":        "No existe una cuenta con este correo",
  "auth/wrong-password":        "Contraseña incorrecta",
  "auth/invalid-credential":    "Credenciales inválidas (correo, contraseña o sesión de Google)",
  "auth/email-already-in-use":  "Ya existe una cuenta con este correo",
  "auth/weak-password":         "La contraseña debe tener al menos 6 caracteres",
  "auth/invalid-email":         "Correo electrónico no válido",
  "auth/network-request-failed":"Sin conexión a internet",
  "auth/too-many-requests":     "Demasiados intentos fallidos. Intenta más tarde",
  "auth/user-disabled":         "Esta cuenta ha sido deshabilitada",
  "auth/operation-not-allowed": "Operación no permitida",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? "Ocurrió un error inesperado";
  }
  return "Ocurrió un error inesperado";
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export async function signUp(nombre: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  // Crear documento de usuario en Firestore con el mismo uid
  await setDoc(doc(db, "users", uid), {
    nombre,
    apodo:            nombre.split(" ")[0].toLowerCase(),
    image:            "https://i.pravatar.cc/150?u=" + uid,
    bannerImage:      "",
    descripcion:      "",
    privacidad:       "Público",
    cumpleanos:       "",
    racha:            0,
    cantidadPlantas:  0,
    cantidadAmigos:   0,
    detecciones:      0,
    categoriasPlantas:[],
    plantaFavorita:   { nombre: "", imagen: "" },
    createdAt:        serverTimestamp(),
  });

  return credential;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function logOut() {
  return signOut(auth);
}

// ─── Password Reset ───────────────────────────────────────────────────────────
export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

// ─── Google Sign In ───────────────────────────────────────────────────────────
export async function signInWithGoogle(idToken: string | null, accessToken?: string | null) {
  // Para Google Sign-In, es más robusto pasar tanto el id_token como el access_token si están disponibles
  const credential = GoogleAuthProvider.credential(idToken, accessToken ?? null);
  const result     = await signInWithCredential(auth, credential);
  const isNew      = getAdditionalUserInfo(result)?.isNewUser ?? false;

  // Si es usuario nuevo → crear su documento en Firestore
  if (isNew) {
    const { uid, displayName, photoURL } = result.user;
    const nombre = displayName ?? "Usuario iPlant";
    const docRef = doc(db, "users", uid);
    const snap   = await getDoc(docRef);

    if (!snap.exists()) {
      await setDoc(docRef, {
        nombre,
        apodo:            nombre.split(" ")[0].toLowerCase(),
        image:            photoURL ?? "https://i.pravatar.cc/150?u=" + uid,
        bannerImage:      "",
        descripcion:      "",
        privacidad:       "Público",
        cumpleanos:       "",
        racha:            0,
        cantidadPlantas:  0,
        cantidadAmigos:   0,
        detecciones:      0,
        categoriasPlantas:[],
        plantaFavorita:   { nombre: "", imagen: "" },
        createdAt:        serverTimestamp(),
      });
    }
  }

  return result;
}
