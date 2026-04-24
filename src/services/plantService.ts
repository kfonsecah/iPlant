import { addDoc, collection, doc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import { db } from "../config/firebase";
import { PlantAIFields, PlantIdentificationResult, PlantaCompletaInterface, PlantaInterface } from "../types-dtos/plant.types";
import { withTimeout } from "../utils/withTimeout";
import { getItem, persistImage, saveItem } from "./storageService";
import { addToQueue, getQueue, processQueue } from "./syncService";

const getBackendUrl = (): string => {
  return process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";
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
  const isConnected = (await NetInfo.fetch()).isConnected;
  if (!isConnected) {
    throw new Error("Sin conexión a internet. La identificación por IA no está disponible sin conexión.");
  }

  const backendUrl = getBackendUrl();
  const dataUri = await imageToDataUri(imageUri);

  const response = await fetch(`${backendUrl}/api/identify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      images: [dataUri],
      similar_images: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      throw new Error("Límite de solicitudes excedido. Intenta más tarde.");
    }
    throw new Error(`Error de Servidor: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // The v3 API nests suggestions under result.classification
  const suggestion = data.result?.classification?.suggestions?.[0];
  
  if (!suggestion) {
    throw new Error("No se identificó ninguna planta. Intenta con una foto más clara.");
  }

  const details = suggestion.details;
  const commonName = details?.common_names?.[0];
  const synonym = details?.synonyms?.[0];
  
  const plantName = commonName 
    ? commonName.charAt(0).toUpperCase() + commonName.slice(1) 
    : (synonym || suggestion.name);

  // Robustly extract care sub-fields (v3 can return objects or strings)
  const extractText = (field: any) => {
    if (!field) return undefined;
    if (typeof field === "string") return field;
    return field.description || field.text || field.value || undefined;
  };

  const care = details?.care_instructions;

  return {
    plantName: plantName || "Planta desconocida",
    latinName: suggestion.name,
    probability: Math.round((suggestion.probability || 0) * 100),
    description: details?.description?.value || details?.wiki_description?.value || details?.wiki_description?.extract,
    careInstructions: extractText(care?.watering) || extractText(care?.sunlight) || details?.wiki_description?.extract,
    sunlight: extractText(care?.sunlight),
    pruning: extractText(care?.pruning),
    soil: extractText(care?.soil),
    taxonomy: details?.taxonomy ? {
      class: details.taxonomy.class,
      family: details.taxonomy.family,
      genus: details.taxonomy.genus,
    } : undefined,
    watering: details?.watering ? {
      max: details.watering.max,
      min: details.watering.min,
    } : undefined,
    propagationMethods: details?.propagation_methods || [],
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

const getCacheKey = (userId: string) => `PLANTS_CACHE_${userId}`;

export async function getPlantsByUserId(userId: string, isConnected: boolean): Promise<PlantaCompletaInterface[]> {
  const cacheKey = getCacheKey(userId);

  if (isConnected) {
    try {
      const q = query(collection(db, "plants"), where("userId", "==", userId));
      const snap = await withTimeout(getDocs(q));

      const remotePlants = snap.docs.map((d) => {
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
          confianza: data.confianza,
          descripcion: data.descripcion,
          cuidados: data.cuidados,
          identificadoConIA: data.identificadoConIA,
        } as PlantaCompletaInterface;
      });

      // Merge with pending items from queue to ensure they remain visible in the UI
      const queue = await getQueue(userId);
      const pendingPlants = queue.map(action => action.data as PlantaCompletaInterface);
      
      const allPlants = [...pendingPlants, ...remotePlants.filter(rp => !pendingPlants.some(pp => pp.id === rp.id))];

      await saveItem(cacheKey, allPlants);
      return allPlants;
    } catch (e) {
      console.warn("Fallback: Cargando plantas desde el caché local por inestabilidad de red.");
    }
  }

  return (await getItem<PlantaCompletaInterface[]>(cacheKey)) || [];
}

export async function addPlant(
  data: Pick<PlantaInterface, "userId" | "nombre" | "categoria" | "proximoRiego"> & Partial<Pick<PlantaInterface, "imagen">> & Partial<PlantAIFields>
): Promise<PlantaCompletaInterface> {
  const localId = Crypto.randomUUID();
  let finalImagen = data.imagen || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400";

  // If we have a local URI and it's not a remote URL, persist it
  if (data.imagen && !data.imagen.startsWith('http')) {
    try {
      finalImagen = await persistImage(data.imagen);
    } catch (e) {
      console.error("Failed to persist image locally:", e);
    }
  }

  const newPlant: PlantaCompletaInterface = {
    id: localId,
    userId: data.userId,
    nombre: data.nombre,
    categoria: data.categoria,
    proximoRiego: data.proximoRiego,
    salud: "saludable",
    imagen: finalImagen,
    ultimoRiego: "Hoy",
    isPending: true,
    confianza: data.confianza,
    descripcion: data.descripcion,
    cuidados: data.cuidados,
    identificadoConIA: data.identificadoConIA,
  };

  // 1. Save to local cache
  const cacheKey = getCacheKey(data.userId);
  const currentCache = (await getItem<PlantaCompletaInterface[]>(cacheKey)) || [];
  await saveItem(cacheKey, [newPlant, ...currentCache]);

  // 2. Add to sync queue
  await addToQueue({
    id: localId,
    type: 'CREATE',
    data: newPlant,
    userId: data.userId,
    timestamp: Date.now(),
  });

  // 3. Trigger background sync if online
  NetInfo.fetch().then(state => {
    if (state.isConnected) {
      syncPlants(data.userId).catch(err => console.error("Auto-sync failed:", err));
    }
  });

  return newPlant;
}

/**
 * Pushes a plant to the backend API and saves it to Firestore.
 */
async function pushPlantToFirestore(plant: PlantaCompletaInterface): Promise<string> {
  const backendUrl = getBackendUrl();
  const firestoreData = {
    userId: plant.userId,
    nombre: plant.nombre,
    categoria: plant.categoria,
    proximoRiego: plant.proximoRiego,
    salud: plant.salud,
    imagen: plant.imagen,
    ultimoRiego: Timestamp.now(),
    ...(plant.confianza && { confianza: plant.confianza }),
    ...(plant.descripcion && { descripcion: plant.descripcion }),
    ...(plant.cuidados && { cuidados: plant.cuidados }),
    ...(plant.identificadoConIA !== undefined && { identificadoConIA: plant.identificadoConIA }),
  };

  // 1. Notify Backend (Phase 4 Requirement: "Plant creation endpoint works end-to-end")
  try {
    await fetch(`${backendUrl}/api/plants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(firestoreData),
    });
  } catch (e) {
    console.warn("Backend notification failed, proceeding with Firestore direct save:", e);
  }

  // 2. Direct save to Firestore to ensure persistence
  const docRef = await addDoc(collection(db, "plants"), firestoreData);
  return docRef.id;
}

/**
 * Synchronizes pending plants with the remote database.
 */
export async function syncPlants(userId: string): Promise<void> {
  await processQueue(userId, async (action) => {
    if (action.type === 'CREATE') {
      const plant = action.data as PlantaCompletaInterface;
      const remoteId = await pushPlantToFirestore(plant);
      
      // Update local cache: replace localId with remoteId and remove isPending
      const cacheKey = getCacheKey(userId);
      const currentCache = (await getItem<PlantaCompletaInterface[]>(cacheKey)) || [];
      const updatedCache = currentCache.map(p => 
        p.id === action.id ? { ...p, id: remoteId, isPending: false } : p
      );
      await saveItem(cacheKey, updatedCache);
    }
  });
}

export async function updatePlant(
  plantId: string,
  data: Partial<Pick<PlantaInterface, "nombre" | "categoria" | "salud" | "proximoRiego">>
): Promise<void> {
  await withTimeout(updateDoc(doc(db, "plants", plantId), data));
}
