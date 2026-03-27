import { collection, doc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { PlantaInterface, SaludPlanta } from "../types-dtos/plant.types";
import { withTimeout } from "../utils/withTimeout";

function formatUltimoRiego(value: unknown): string {
  if (value instanceof Timestamp) {
    const date = value.toDate();
    const today = new Date();
    const diffDays = Math.floor(
      (today.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Hoy";
    return `${diffDays}d`;
  }
  return String(value ?? "—");
}

export async function getPlantsByUserId(userId: string): Promise<PlantaInterface[]> {
  const q = query(collection(db, "plants"), where("userId", "==", userId));
  const snap = await withTimeout(getDocs(q));

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      nombre: data.nombre,
      categoria: data.categoria,
      imagen: data.imagen,
      ultimoRiego: formatUltimoRiego(data.ultimoRiego),
      salud: data.salud,
      proximoRiego: data.proximoRiego,
    } as PlantaInterface;
  });
}

export async function updatePlant(
  plantId: string,
  data: Partial<Pick<PlantaInterface, "nombre" | "categoria" | "salud" | "proximoRiego">>
): Promise<void> {
  await withTimeout(updateDoc(doc(db, "plants", plantId), data));
}
