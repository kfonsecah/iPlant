import * as Speech from 'expo-speech';
import { PlantaCompletaInterface } from '../types-dtos/plant.types';

/**
 * Utility to narrate plant care instructions using AI voice synthesis.
 */
export const narratePlantCare = async (plant: PlantaCompletaInterface) => {
  const isSpeaking = await Speech.isSpeakingAsync();
  
  if (isSpeaking) {
    await Speech.stop();
    return;
  }

  const name = plant.nombre;
  const description = plant.descripcion || "";
  const watering = plant.cuidados || "No hay instrucciones de riego específicas.";
  const sunlight = plant.sunlight ? `Esta planta prefiere ${plant.sunlight}.` : "";
  const family = plant.taxonomy?.family ? `Pertenece a la familia ${plant.taxonomy.family}.` : "";

  const textToSpeak = `Hola. Te daré información sobre tu ${name}. ${family} ${description} Para sus cuidados: ${watering} ${sunlight}`;

  Speech.speak(textToSpeak, {
    language: 'es-ES',
    pitch: 1.0,
    rate: 0.9,
  });
};

export const stopNarration = async () => {
  await Speech.stop();
};
