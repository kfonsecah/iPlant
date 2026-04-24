import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { UserInterface } from "../types-dtos/user.types";
import { withTimeout } from "../utils/withTimeout";

export async function getUserById(userId: string): Promise<UserInterface | null> {
  try {
    const snap = await withTimeout(getDoc(doc(db, "users", userId)));
    if (!snap.exists()) return null;
    return snap.data() as UserInterface;
  } catch (e) {
    console.warn("User fetch failed (offline/timeout), using local state.");
    return null;
  }
}

export async function updateUser(
  userId: string,
  data: Partial<Pick<UserInterface, "nombre" | "apodo" | "descripcion" | "privacidad">>
): Promise<void> {
  await withTimeout(updateDoc(doc(db, "users", userId), data));
}
