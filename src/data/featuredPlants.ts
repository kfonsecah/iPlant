import { ImageSourcePropType } from "react-native";

export interface FeaturedPlant {
  id: string;
  name: string;
  latinName: string;
  description: string;
  image: ImageSourcePropType;
  family: string;
  origin: string;
  climate: string;
  light: "low" | "medium" | "high";
  water: "low" | "medium" | "high";
  humidity: "low" | "medium" | "high";
  difficulty: "fácil" | "moderado" | "experto";
  maxHeight: string;
  bloomSeason: string;
  funFact: string;
  careGuide: string[];
  countryCodes: string[]; // ISO 3166-1 alpha-2 codes where plant is common (lowercase)
  modalImageScale?: number; // Custom scale factor for modal hero image framing
  modalImageTranslateY?: number; // Custom vertical translation offset for modal hero image framing
}

export const featuredPlants: FeaturedPlant[] = [
  {
    id: "monstera_deliciosa",
    name: "Monstera Deliciosa",
    latinName: "Monstera deliciosa",
    description: "Perfecta para interiores con poca luz. Purifica el aire de forma natural y es una de las favoritas por sus hermosas fenestraciones.",
    image: require("../../assets/images/monstera.png"),
    family: "Araceae",
    origin: "Selvas tropicales de México y Centroamérica",
    climate: "Cálido y húmedo",
    light: "medium",
    water: "medium",
    humidity: "high",
    difficulty: "fácil",
    maxHeight: "2 - 3 metros",
    bloomSeason: "Verano (Rara vez en interiores)",
    funFact: "Su nombre 'deliciosa' proviene del exquisito fruto comestible que produce en su hábitat, el cual tiene un sabor dulce similar a una combinación de piña, plátano y mango. Sin embargo, no debe consumirse antes de que madure por completo, ya que es tóxico.",
    careGuide: [
      "Riega únicamente cuando los primeros 3 a 5 cm del sustrato se sientan secos al tacto.",
      "Limpia el polvo de sus hojas grandes regularmente con un paño húmedo para facilitar la fotosíntesis.",
      "Añade un tutor de musgo o madera para que sus raíces aéreas tengan soporte para trepar.",
      "Evita colocarla bajo el sol directo del mediodía ya que sus hojas tiernas pueden quemarse rápidamente."
    ],
    countryCodes: ["mx", "gt"],
    modalImageScale: 0.85, // Scale down to fit beautifully inside the modal header
    modalImageTranslateY: -15 // Center perfectly vertically
  },
  {
    id: "ficus_lyrata",
    name: "Ficus Lyrata",
    latinName: "Ficus lyrata",
    description: "Elegante y dramática. Ideal para espacios con luz indirecta brillante, esta planta destaca por sus hojas rígidas y grandes en forma de lira.",
    image: require("../../assets/images/ficus.png"),
    family: "Moraceae",
    origin: "Oeste de África, desde Camerún hasta Sierra Leona",
    climate: "Cálido y húmedo",
    light: "high",
    water: "medium",
    humidity: "high",
    difficulty: "moderado",
    maxHeight: "3 metros",
    bloomSeason: "No florece en interiores",
    funFact: "Sus espectaculares hojas tienen una forma muy similar a la caja de un violín o una lira, lo que le otorga su característico nombre. En su hábitat natural en las selvas africanas, puede convertirse en un árbol majestuoso de hasta 15 metros de altura.",
    careGuide: [
      "Colócala en una ubicación muy iluminada con abundante luz brillante e indirecta; unas horas de sol suave por la mañana le caen excelente.",
      "Espera a que el sustrato se seque a la mitad de la maceta antes de volver a regar, ya que es sumamente sensible a los excesos de humedad.",
      "Evita cambiarla de sitio frecuentemente o colocarla en zonas con corrientes de aire frío o calefacción directa.",
      "Gira la planta un cuarto de vuelta cada mes para asegurar que reciba luz de manera uniforme y crezca perfectamente vertical."
    ],
    countryCodes: ["cm", "ng", "lr", "ga"],
    modalImageScale: 0.95, // Already slender, scales perfectly
    modalImageTranslateY: 0
  },
  {
    id: "anthurium_andreanum",
    name: "Anthurium Andreanum",
    latinName: "Anthurium andreanum",
    description: "Flores exóticas de larga duración. Símbolo de hospitalidad y abundancia, sus hojas modificadas de vibrante color rojo alegran cualquier espacio.",
    image: require("../../assets/images/andrea.png"),
    family: "Araceae",
    origin: "Selvas tropicales de Colombia y Ecuador",
    climate: "Tropical templado",
    light: "medium",
    water: "medium",
    humidity: "high",
    difficulty: "moderado",
    maxHeight: "60 - 80 cm",
    bloomSeason: "Todo el año",
    funFact: "Lo que comúnmente consideramos sus llamativas flores de plástico brillantes son en realidad espatas, unas hojas modificadas que protegen a las verdaderas y minúsculos flores ubicadas a lo largo de la columna central o espádice.",
    careGuide: [
      "Mantén el sustrato siempre húmedo pero suelto y con excelente drenaje; se recomienda un sustrato aireado especial para orquídeas.",
      "Proporciónale una humedad ambiental muy alta (superior al 60%), pulverizando sus hojas a menudo o usando un humidificador cercano.",
      "Ubícala en una zone muy bien iluminada sin sol directo para incentivar la aparición de nuevas flores durante todo el año.",
      "Fertiliza ligeramente con un abono rico en fósforo cada 15 días durante las temporadas de primavera y verano."
    ],
    countryCodes: ["co", "ec"],
    modalImageScale: 1.0,
    modalImageTranslateY: 0
  },
  {
    id: "strelitzia_reginae",
    name: "Strelitzia Reginae",
    latinName: "Strelitzia reginae",
    description: "Ave del paraíso. Flores dramáticas en naranja y azul que asemejan una exótica ave en pleno vuelo. Excelente para aportar un aire tropical a tus espacios.",
    image: require("../../assets/images/strelitzia.png"),
    family: "Strelitziaceae",
    origin: "Sudáfrica",
    climate: "Cálido, subtropical",
    light: "high",
    water: "medium",
    humidity: "medium",
    difficulty: "fácil",
    maxHeight: "1.5 - 2 metros",
    bloomSeason: "Primavera y Verano",
    funFact: "Esta planta lleva el nombre en honor a la reina Carlota de Mecklemburgo-Strelitzia, reina consorte del rey Jorge III de Gran Bretaña. En la naturaleza, sus complejas flores son polinizadas por pequeños pájaros atraídos por su néctar.",
    careGuide: [
      "Necesita recibir al menos de 4 a 6 horas diarias de luz solar directa para poder desarrollar sus asombrosas y coloridas flores.",
      "Es bastante resistente a la sequía una vez adaptada; riega abundantemente en verano y reduce significativamente el riego en invierno.",
      "Limpia regularmente la superficie de sus anchas hojas para evitar la acumulación de polvo y favorecer su correcta respiración.",
      "Prefiere estar en macetas profundas y ligeramente apretada para favorecer el correcto enraizamiento y la floración constante."
    ],
    countryCodes: ["za"],
    modalImageScale: 0.95,
    modalImageTranslateY: 10
  },
  {
    id: "heliconia_rostrata",
    name: "Heliconia Rostrata",
    latinName: "Heliconia rostrata",
    description: "Garra de langosta. Una de las flores tropicales más espectaculares del mundo, destaca por sus inflorescencias colgantes rojas y amarillas.",
    image: require("../../assets/images/heliconia.png"),
    family: "Heliconiaceae",
    origin: "Regiones tropicales de Perú, Bolivia, Colombia y Ecuador",
    climate: "Húmedo tropical cálido",
    light: "high",
    water: "high",
    humidity: "high",
    difficulty: "experto",
    maxHeight: "2 - 4 metros",
    bloomSeason: "Verano y Otoño",
    funFact: "A diferencia de la mayoría de las heliconias que crecen erectas, las inflorescencias de la Rostrata cuelgan majestuosamente boca abajo. Sus llamativas copas rojas retienen agua, sirviendo de micro-hábitat para pequeños insectos selváticos.",
    careGuide: [
      "Riega frecuentemente manteniendo el sustrato siempre húmedo, rico en materia orgánica y con buen contenido de nutrientes.",
      "Es sumamente sensible al frío; no debe exponerse a temperaturas menores a los 15°C ni a corrientes de viento seco que deshidraten sus hojas.",
      "Dale una ubicación bajo luz solar directa o semisombra muy brillante para que sus brácteas retengan sus hermosos colores cálidos.",
      "Proporciónale una humedad ambiental extremadamente alta (pulverízala a diario o colócala cerca de fuentes de agua constante)."
    ],
    countryCodes: ["pe", "bo", "co", "ec"],
    modalImageScale: 0.8, // Scale down to fit the majestic cascading flowers beautifully
    modalImageTranslateY: 10
  }
];
