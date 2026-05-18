import { updatePlant } from "../services/plantService";

export const regarPlanta = async (
  plantId: string,
  userId: string,
  wateringFrequencyDays: number,
  isConnected: boolean = true
): Promise<void> => {
  const ahora = new Date().toISOString();
  const nuevoProximoRiego = wateringFrequencyDays;

  // Utilize the existing, robust offline-first updatePlant service
  // which handles AsyncStorage cache, Firestore, and the SyncQueue automatically!
  await updatePlant(
    plantId,
    {
      ultimoRiego: ahora,
      proximoRiego: nuevoProximoRiego,
      salud: "saludable",
      userId,
    },
    isConnected
  );
};
