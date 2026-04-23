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
}

export interface PlantIdentificationResult {
  plantName: string;
  latinName?: string;
  probability: number;
  description?: string;
  careInstructions?: string;
  wikiDescription?: {
    title: string;
    extract: string;
  };
}

export interface PlantAIFields {
  confianza?: number;
  descripcion?: string;
  cuidados?: string;
  identificadoConIA?: boolean;
}

export type PlantaCompletaInterface = PlantaInterface & PlantAIFields;
