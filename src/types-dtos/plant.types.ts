export type SaludPlanta = "saludable" | "atención" | "riesgo";

export interface PlantaInterface {
  id: string;
  userId: string;
  nombre: string;
  categoria: string;
  imagen: string;
  ultimoRiego: string;
  salud: SaludPlanta;
  proximoRiego: number;
  wateringFrequencyDays?: number;
}

export interface PlantIdentificationResult {
  plantName: string;
  latinName?: string;
  probability: number;
  description?: string;
  careInstructions?: string;
  sunlight?: string;
  pruning?: string;
  soil?: string;
  taxonomy?: {
    class?: string;
    family?: string;
    genus?: string;
  };
  watering?: {
    max?: string;
    min?: string;
  };
  propagationMethods?: string[];
  wikiDescription?: {
    title: string;
    extract: string;
  };
  countryCodes?: string[];
  commonNames?: string;
  origin?: string;
  climate?: string;
  maxHeight?: string;
  bloomSeason?: string;
  toxicity?: string;
  category?: string;
  wateringFrequencyDays?: number;
}

export interface PlantAIFields {
  confianza?: number;
  descripcion?: string;
  cuidados?: string;
  identificadoConIA?: boolean;
  // New rich botanical fields
  latinName?: string;
  taxonomy?: {
    class?: string;
    family?: string;
    genus?: string;
  };
  wateringDetails?: {
    max?: string;
    min?: string;
  };
  sunlight?: string;
  pruning?: string;
  soil?: string;
  propagationMethods?: string[];
  wikiExtract?: string;
  countryCodes?: string[];
  commonNames?: string;
  origin?: string;
  climate?: string;
  maxHeight?: string;
  bloomSeason?: string;
  toxicity?: string;
  // Health Journal
  healthScore?: number | null;
  healthLastUpdated?: string;
  // Sync metadata
  isPending?: boolean;
  syncError?: string;
}

export type PlantaCompletaInterface = PlantaInterface & PlantAIFields;
