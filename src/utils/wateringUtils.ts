import { PlantaCompletaInterface } from "../types-dtos/plant.types";

export const calcularProximoRiego = (
  ultimoRiego: string,
  wateringFrequencyDays: number
): number => {
  const ultimo = new Date(ultimoRiego);
  const hoy = new Date();
  
  // Normalize both dates to midnight to compute pure day difference
  ultimo.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);

  const diasDesdeRiego = Math.floor(
    (hoy.getTime() - ultimo.getTime()) / (1000 * 60 * 60 * 24)
  );
  return wateringFrequencyDays - diasDesdeRiego;
};

export const getWateringStatus = (proximoRiego: number) => {
  if (proximoRiego < 0) {
    return {
      label: `${Math.abs(proximoRiego)}d de retraso`,
      color: "#f87171",
      urgent: true,
    };
  }
  if (proximoRiego === 0) {
    return {
      label: "Regar hoy",
      color: "#fbbf24",
      urgent: true,
    };
  }
  if (proximoRiego <= 2) {
    return {
      label: `En ${proximoRiego}d`,
      color: "#fbbf24",
      urgent: false,
    };
  }
  return {
    label: `En ${proximoRiego}d`,
    color: "rgba(255,255,255,0.4)",
    urgent: false,
  };
};

export const getPlantsNeedingWater = (plants: PlantaCompletaInterface[]) =>
  plants.filter((p) => {
    const freq = p.wateringFrequencyDays ?? 7;
    const proximo = p.ultimoRiego
      ? calcularProximoRiego(p.ultimoRiego, freq)
      : (p.proximoRiego ?? 0);
    return proximo <= 0;
  });

export const getWateredTodayPercentage = (plants: PlantaCompletaInterface[]): number => {
  if (!plants.length) return 0;
  const wateredToday = plants.filter((p) => {
    if (!p.ultimoRiego) return false;
    const ultimo = new Date(p.ultimoRiego);
    const hoy = new Date();
    return ultimo.toDateString() === hoy.toDateString();
  });
  return Math.round((wateredToday.length / plants.length) * 100);
};
