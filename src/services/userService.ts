import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { UserInterface } from "../types-dtos/user.types";

export async function getUserById(userId: string): Promise<UserInterface | null> {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  return snap.data() as UserInterface;
}
