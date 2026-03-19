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
