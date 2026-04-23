import { addDoc, collection, doc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import Constants from "expo-constants";
import { File } from 'expo-file-system';
import { db } from "../config/firebase";
import { PlantAIFields, PlantIdentificationResult, PlantaInterface, SaludPlanta } from "../types-dtos/plant.types";
import { withTimeout } from "../utils/withTimeout";

const PLANT_ID_API_URL = "https://api.plant.id/v3/identification";
const getPlantIdApiKey = (): string => {
  const envKey = process.env.EXPO_PUBLIC_PLANT_ID_API_KEY;
  const appJsonKey = Constants.expoConfig?.extra?.plantIdApiKey;
  return envKey || appJsonKey || "";
};

async function imageToDataUri(uri: string): Promise<string> {
  try {
    const file = new File(uri);
    const base64 = (await file.base64()).trim();
    
    // Use the file's native type or fallback to extension check
    let mimeType = file.type;
    if (!mimeType || mimeType === "") {
      const isPng = uri.toLowerCase().includes('.png') || uri.includes('png');
      mimeType = isPng ? 'image/png' : 'image/jpeg';
    }
    
    // Check if base64 already has a data prefix (unlikely but safe)
    if (base64.startsWith('data:')) {
      return base64;
    }
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Error converting image to Data URI:", error);
    throw new Error("No se pudo procesar la imagen capturada.");
  }
}

export async function identifyPlant(imageUri: string): Promise<PlantIdentificationResult> {
  const apiKey = getPlantIdApiKey();
  if (!apiKey) {
    throw new Error("PLANT_ID_API_KEY no configurada. Añade tu clave en app.json extra.plantIdApiKey");
  }

  const dataUri = await imageToDataUri(imageUri);

  // API v3 requires details and language as query parameters
  // Using the comprehensive list of details to maximize info retrieval
  const detailsList = "common_names,url,description,taxonomy,rank,gbif_id,inaturalist_id,image,synonyms,edible_parts,watering,propagation_methods,wiki_description,care_instructions";
  const urlWithParams = `${PLANT_ID_API_URL}?details=${detailsList}&language=es`;

  const response = await fetch(urlWithParams, {
    method: "POST",
    headers: {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      images: [dataUri],
      similar_images: true,
      health: "all",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      throw new Error("Límite de solicitudes excedido. Intenta más tarde.");
    }
    throw new Error(`Error de Plant.id: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // The v3 API nests suggestions under result.classification
  const suggestion = data.result?.classification?.suggestions?.[0];
  
  if (!suggestion) {
    throw new Error("No se identificó ninguna planta. Intenta con una foto más clara.");
  }

  // Use common name if available, fallback to first synonym, then scientific name
  const details = suggestion.details;
  const commonName = details?.common_names?.[0];
  const synonym = details?.synonyms?.[0];
  
  const plantName = commonName 
    ? commonName.charAt(0).toUpperCase() + commonName.slice(1) 
    : (synonym || suggestion.name);

  return {
    plantName: plantName || "Planta desconocida",
    latinName: suggestion.name,
    probability: Math.round((suggestion.probability || 0) * 100),
    description: details?.description?.value || details?.wiki_description?.value,
    careInstructions: details?.care_instructions?.text || details?.wiki_description?.extract,
    wikiDescription: details?.wiki_description
      ? {
          title: plantName,
          extract: details.wiki_description.value || details.wiki_description.extract,
        }
      : undefined,
  };
}

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

export async function addPlant(
  data: Pick<PlantaInterface, "userId" | "nombre" | "categoria" | "proximoRiego"> & Partial<Pick<PlantaInterface, "imagen">> & Partial<PlantAIFields>
): Promise<PlantaInterface> {
  const newPlant = {
    userId:       data.userId,
    nombre:      data.nombre,
    categoria:   data.categoria,
    proximoRiego: data.proximoRiego,
    salud:       "saludable" as const,
    imagen:     data.imagen || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    ultimoRiego:  Timestamp.now(),
    ...(data.confianza && { confianza: data.confianza }),
    ...(data.descripcion && { descripcion: data.descripcion }),
    ...(data.cuidados && { cuidados: data.cuidados }),
    ...(data.identificadoConIA !== undefined && { identificadoConIA: data.identificadoConIA }),
  };
  const ref = await withTimeout(addDoc(collection(db, "plants"), newPlant));
  return {
    id:          ref.id,
    userId:      newPlant.userId,
    nombre:      newPlant.nombre,
    categoria:   newPlant.categoria,
    proximoRiego:newPlant.proximoRiego,
    salud:       newPlant.salud,
    imagen:      newPlant.imagen,
    ultimoRiego: "Hoy",
  };
}

export async function updatePlant(
  plantId: string,
  data: Partial<Pick<PlantaInterface, "nombre" | "categoria" | "salud" | "proximoRiego">>
): Promise<void> {
  await withTimeout(updateDoc(doc(db, "plants", plantId), data));
}
