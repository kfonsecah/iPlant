import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { File } from "expo-file-system";
import { db } from "../config/firebase";
import { HealthJournalEntry } from "../types-dtos/healthJournal.types";

const getBackendUrl = (): string =>
  process.env.EXPO_PUBLIC_BACKEND_URL || "https://iplant-cz8o.onrender.com";

async function uriToDataUri(uri: string): Promise<string> {
  const file = new File(uri);
  const base64 = (await file.base64()).trim();
  let mimeType = file.type;
  if (!mimeType || mimeType === "") {
    mimeType = uri.toLowerCase().includes(".png") ? "image/png" : "image/jpeg";
  }
  if (base64.startsWith("data:")) return base64;
  return `data:${mimeType};base64,${base64}`;
}

export async function getHealthJournalEntries(
  plantId: string
): Promise<HealthJournalEntry[]> {
  const q = query(
    collection(db, "plants", plantId, "healthJournal"),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      date:
        data.date instanceof Timestamp
          ? data.date.toDate().toISOString()
          : data.date,
      photoUrl: data.photoUrl,
      score: data.score,
      assessment: data.assessment,
      steps: Array.isArray(data.steps) ? data.steps : [],
      notes: data.notes || "",
    };
  });
}

export async function addHealthJournalEntry(
  plantId: string,
  entry: Omit<HealthJournalEntry, "id">
): Promise<HealthJournalEntry> {
  const docRef = await addDoc(
    collection(db, "plants", plantId, "healthJournal"),
    entry
  );
  return { ...entry, id: docRef.id };
}

export async function analyzeHealthWithGemini(
  imageUri: string,
  plantName?: string,
  latinName?: string
): Promise<{ score: number; assessment: string; steps: string[] }> {
  const dataUri = await uriToDataUri(imageUri);

  const plantContext = plantName
    ? `La planta es "${plantName}"${latinName ? ` (${latinName})` : ""}. `
    : "";

  const prompt =
    `Eres un experto fitosanitario. ${plantContext}Analiza la imagen de esta planta y responde ÚNICAMENTE con un JSON válido sin texto adicional, sin formato markdown, sin asteriscos, sin negritas. Usa esta estructura exacta: {"score": <número entero del 0 al 100 que representa la salud visible>, "assessment": "<evaluación de 1-2 oraciones en español plano, sin formato>", "steps": ["<paso concreto 1 en texto plano>", "<paso concreto 2 en texto plano>", "<paso concreto 3 en texto plano>"]}. Los steps son 3 a 4 acciones específicas en español adaptadas al tipo de planta y al diagnóstico observado. Rangos: 0-39 riesgo, 40-69 atención, 70-100 saludable.`;

  const response = await fetch(`${getBackendUrl()}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      imageBase64: dataUri,
    }),
  });

  if (!response.ok) {
    throw new Error("Error al contactar el servidor de análisis.");
  }

  const data = await response.json();
  const text: string = data.response || "";

  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) throw new Error("Respuesta de IA inválida.");

  const parsed = JSON.parse(match[0]);
  if (
    typeof parsed.score !== "number" ||
    typeof parsed.assessment !== "string"
  ) {
    throw new Error("Formato de respuesta IA inválido.");
  }

  const stripMd = (s: string) => s.replace(/\*\*/g, "").replace(/\*/g, "").replace(/_/g, "").trim();

  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    assessment: stripMd(parsed.assessment),
    steps: Array.isArray(parsed.steps) ? parsed.steps.map((s: string) => stripMd(s)) : [],
  };
}
