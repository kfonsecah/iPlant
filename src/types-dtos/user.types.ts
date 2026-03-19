export interface PlantaFavorita {
  nombre: string;
  imagen?: string;
}

export type PrivacidadPerfil = "Público" | "Privado";

export interface UserInterface {
  nombre: string;
  apodo: string;
  image: string;
  bannerImage?: string;
  descripcion: string;
  privacidad: PrivacidadPerfil;
  cumpleanos: string;
  racha: number;
  cantidadPlantas: number;
  cantidadAmigos: number;
  detecciones: number;
  categoriasPlantas: string[];
  plantaFavorita: PlantaFavorita;
}
