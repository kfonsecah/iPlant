import { addDoc, collection, doc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import { db } from "../config/firebase";
import { PlantAIFields, PlantIdentificationResult, PlantaCompletaInterface, PlantaInterface } from "../types-dtos/plant.types";
import { withTimeout } from "../utils/withTimeout";
import { getItem, persistImage, saveItem } from "./storageService";
import { addToQueue, getQueue, processQueue } from "./syncService";
import { calcularProximoRiego } from "../utils/wateringUtils";

const getBackendUrl = (): string => {
  return process.env.EXPO_PUBLIC_BACKEND_URL || "https://iplant-cz8o.onrender.com";
};

async function imageToDataUri(uri: string): Promise<string> {
  try {
    const file = new File(uri);
    const base64 = (await file.base64()).trim();
    
    // Use the file's native type or fallback to extension check
    let mimeType = file.type;
    if (!mimeType || mimeType === "") {
      const isPng = (uri || "").toLowerCase().includes('.png') || (uri || "").includes('png');
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

export async function enrichPlant(plantName: string, latinName?: string): Promise<any> {
  const isConnected = (await NetInfo.fetch()).isConnected;
  if (!isConnected) {
    throw new Error("Sin conexión a internet. El enriquecimiento por IA no está disponible sin conexión.");
  }

  const backendUrl = getBackendUrl();
  console.log(`[enrichPlant] Fetching from: ${backendUrl}/api/enrich-plant`);

  const response = await fetch(`${backendUrl}/api/enrich-plant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plantName,
      latinName,
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo enriquecer la información de la planta");
  }

  return await response.json();
}

function formatUltimoRiego(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === "string" && value !== "—" && value !== "Hoy") {
    return value;
  }
  return new Date().toISOString();
}

const getCacheKey = (userId: string) => `PLANTS_CACHE_${userId}`;

export async function getPlantsByUserId(userId: string, isConnected: boolean): Promise<PlantaCompletaInterface[]> {
  const cacheKey = getCacheKey(userId);
  let loadedPlants: PlantaCompletaInterface[] = [];

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
          salud: data.healthScore != null
            ? (data.healthScore >= 70 ? "saludable" : data.healthScore >= 40 ? "atención" : "riesgo")
            : (data.salud ?? "saludable"),
          proximoRiego: data.proximoRiego,
          wateringFrequencyDays: data.wateringFrequencyDays,
          confianza: data.confianza,
          descripcion: data.descripcion,
          cuidados: data.cuidados,
          identificadoConIA: data.identificadoConIA,
          latinName: data.latinName,
          taxonomy: data.taxonomy,
          wateringDetails: data.wateringDetails,
          sunlight: data.sunlight,
          pruning: data.pruning,
          soil: data.soil,
          propagationMethods: data.propagationMethods,
          wikiExtract: data.wikiExtract,
          countryCodes: data.countryCodes,
          commonNames: data.commonNames,
          origin: data.origin,
          climate: data.climate,
          maxHeight: data.maxHeight,
          bloomSeason: data.bloomSeason,
          toxicity: data.toxicity,
          healthScore: data.healthScore ?? null,
          healthLastUpdated: data.healthLastUpdated,
        } as PlantaCompletaInterface;
      });

      // Merge with pending items from queue to ensure they remain visible/updated in the UI
      const queue = await getQueue(userId);
      const createdPlants = queue
        .filter(action => action.type === 'CREATE')
        .map(action => action.data as PlantaCompletaInterface);
      const deletedIds = queue
        .filter(action => action.type === 'DELETE')
        .map(action => action.id);
      const updatedPlantsMap = new Map<string, any>();
      queue
        .filter(action => action.type === 'UPDATE')
        .forEach(action => {
          if (action.id) {
            updatedPlantsMap.set(action.id, action.data);
          }
        });

      // Filter out deleted plants from remote list and apply any pending updates
      const activeRemotePlants = remotePlants
        .filter(rp => !deletedIds.includes(rp.id))
        .map(rp => {
          if (updatedPlantsMap.has(rp.id)) {
            return { ...rp, ...updatedPlantsMap.get(rp.id) };
          }
          return rp;
        });

      loadedPlants = [...createdPlants, ...activeRemotePlants];
      await saveItem(cacheKey, loadedPlants);
    } catch (e) {
      console.warn("Fallback: Cargando plantas desde el caché local por inestabilidad de red.");
      loadedPlants = (await getItem<PlantaCompletaInterface[]>(cacheKey)) || [];
    }
  } else {
    loadedPlants = (await getItem<PlantaCompletaInterface[]>(cacheKey)) || [];
  }

  // Recalculate proximoRiego for each plant using calcularProximoRiego
  const updatedPlants = loadedPlants.map(plant => {
    if (!plant.ultimoRiego || !plant.wateringFrequencyDays) return plant;
    
    const calculated = calcularProximoRiego(plant.ultimoRiego, plant.wateringFrequencyDays);
    const currentStored = plant.proximoRiego ?? 0;
    
    // If calculated value differs from stored value by more than 1 day, sync in background
    if (Math.abs(calculated - currentStored) > 1) {
      console.log(`[Recalculate] Syncing proximoRiego for ${plant.nombre}: stored=${currentStored}, calculated=${calculated}`);
      updatePlant(plant.id, { proximoRiego: calculated, userId: plant.userId }, isConnected).catch(err => {
        console.warn(`[Recalculate] Background sync failed for ${plant.nombre}:`, err);
      });
      return { ...plant, proximoRiego: calculated };
    }
    
    return plant;
  });

  return updatedPlants;
}

export async function getPlantById(userId: string, plantId: string, isConnected: boolean): Promise<PlantaCompletaInterface | null> {
  const plants = await getPlantsByUserId(userId, isConnected);
  return plants.find(p => p.id === plantId) || null;
}

export async function addPlant(
  data: Pick<PlantaInterface, "userId" | "nombre" | "categoria" | "proximoRiego"> & Partial<Pick<PlantaInterface, "imagen" | "wateringFrequencyDays">> & Partial<PlantAIFields>
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
    wateringFrequencyDays: data.wateringFrequencyDays || 7,
    salud: "saludable",
    imagen: finalImagen,
    ultimoRiego: new Date().toISOString(),
    isPending: true,
    confianza: data.confianza,
    descripcion: data.descripcion,
    cuidados: data.cuidados,
    identificadoConIA: data.identificadoConIA,
    latinName: data.latinName,
    taxonomy: data.taxonomy,
    wateringDetails: data.wateringDetails,
    sunlight: data.sunlight,
    pruning: data.pruning,
    soil: data.soil,
    propagationMethods: data.propagationMethods,
    wikiExtract: data.wikiExtract,
    countryCodes: data.countryCodes,
    commonNames: data.commonNames,
    origin: data.origin,
    climate: data.climate,
    maxHeight: data.maxHeight,
    bloomSeason: data.bloomSeason,
    toxicity: data.toxicity,
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
    wateringFrequencyDays: plant.wateringFrequencyDays || 7,
    salud: plant.salud,
    imagen: plant.imagen,
    ultimoRiego: plant.ultimoRiego || new Date().toISOString(),
    ...(plant.confianza && { confianza: plant.confianza }),
    ...(plant.descripcion && { descripcion: plant.descripcion }),
    ...(plant.cuidados && { cuidados: plant.cuidados }),
    ...(plant.identificadoConIA !== undefined && { identificadoConIA: plant.identificadoConIA }),
    ...(plant.latinName && { latinName: plant.latinName }),
    ...(plant.taxonomy && { taxonomy: plant.taxonomy }),
    ...(plant.wateringDetails && { wateringDetails: plant.wateringDetails }),
    ...(plant.sunlight && { sunlight: plant.sunlight }),
    ...(plant.pruning && { pruning: plant.pruning }),
    ...(plant.soil && { soil: plant.soil }),
    ...(plant.propagationMethods && { propagationMethods: plant.propagationMethods }),
    ...(plant.wikiExtract && { wikiExtract: plant.wikiExtract }),
    ...(plant.countryCodes && { countryCodes: plant.countryCodes }),
    ...(plant.commonNames && { commonNames: plant.commonNames }),
    ...(plant.origin && { origin: plant.origin }),
    ...(plant.climate && { climate: plant.climate }),
    ...(plant.maxHeight && { maxHeight: plant.maxHeight }),
    ...(plant.bloomSeason && { bloomSeason: plant.bloomSeason }),
    ...(plant.toxicity && { toxicity: plant.toxicity }),
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
    } else if (action.type === 'DELETE') {
      // Direct delete from Firestore if it's a remote ID
      if (action.id && !action.id.includes('-')) { // Simple check if it's a UUID or Firestore ID
        try {
          const { deleteDoc } = await import("firebase/firestore");
          await withTimeout(deleteDoc(doc(db, "plants", action.id)));
        } catch (e) {
          console.warn("Could not delete from remote, might have been already deleted:", e);
        }
      }
    } else if (action.type === 'UPDATE') {
      if (action.id && !action.id.includes('-')) {
        try {
          await withTimeout(updateDoc(doc(db, "plants", action.id), action.data));
        } catch (e) {
          console.warn("Could not update remote plant:", e);
        }
      }
    }
  });
}

export async function updatePlant(
  plantId: string,
  data: Partial<PlantaCompletaInterface>,
  isConnected: boolean = true
): Promise<void> {
  const { auth } = await import("../config/firebase");
  const userId = data.userId || auth.currentUser?.uid || "";
  
  // 1. Sync changes to local offline cache immediately
  if (userId) {
    try {
      const cacheKey = `PLANTS_CACHE_${userId}`;
      const currentCache = (await getItem<PlantaCompletaInterface[]>(cacheKey)) || [];
      const updatedCache = currentCache.map(p => p.id === plantId ? { ...p, ...data } : p);
      await saveItem(cacheKey, updatedCache);
    } catch (err) {
      console.warn("Failed to update local cache on plant update:", err);
    }
  }

  // 2. If online and not a temporary local ID, write to Firestore
  const isLocalId = plantId.includes('-');
  if (isConnected && !isLocalId) {
    try {
      await withTimeout(updateDoc(doc(db, "plants", plantId), data as any));
      return;
    } catch (err) {
      console.warn("Remote update failed, queuing for offline sync:", err);
    }
  }

  // 3. Queue update action if offline or remote fails
  if (userId) {
    await addToQueue({
      id: plantId,
      type: 'UPDATE',
      data: data,
      userId,
      timestamp: Date.now(),
    });
  }
}

export async function deletePlant(userId: string, plantId: string, isConnected: boolean): Promise<void> {
  // 1. Remove from local cache
  const cacheKey = `PLANTS_CACHE_${userId}`;
  const currentCache = (await getItem<PlantaCompletaInterface[]>(cacheKey)) || [];
  const updatedCache = currentCache.filter(p => p.id !== plantId);
  await saveItem(cacheKey, updatedCache);

  // 2. Add to sync queue (DELETE action)
  await addToQueue({
    id: plantId,
    type: 'DELETE',
    data: { id: plantId },
    userId: userId,
    timestamp: Date.now(),
  });

  // 3. Trigger sync
  if (isConnected) {
    syncPlants(userId).catch(err => console.error("Auto-sync failed:", err));
  }
}
