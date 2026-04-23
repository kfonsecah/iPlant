# iPlant — Guía del Proyecto (GSD)

## Proyecto

iPlant es una app móvil React Native/Expo para gestión de plantas. La Actividad 3 añade identificación de plantas con IA (Plant.id), modo offline con sincronización, manejo de permisos de cámara, y deploy del backend en Render.

**Fecha de entrega:** 24/04/2026 23:59

## Stack

- React Native + Expo SDK (managed workflow)
- Firebase Auth (Google + email/password)
- NativeWind (Tailwind CSS para RN)
- Plant.id API para identificación con IA
- AsyncStorage para cache local y cola de sync
- @react-native-community/netinfo para detección offline
- Backend propio desplegado en Render

## Flujo GSD

Este proyecto usa GSD para planificación y ejecución por fases:

1. `/gsd-discuss-phase 1` → Discutir antes de planificar
2. `/gsd-plan-phase 1` → Crear plan de ejecución
3. `/gsd-execute-phase 1` → Ejecutar el plan
4. Verificar → avanzar a siguiente fase

## Fases

| # | Fase | Estado |
|---|------|--------|
| 1 | AI Plant Identification | Pendiente |
| 2 | Camera Permission Handling | Pendiente |
| 3 | Offline Mode & Local Storage | Pendiente |
| 4 | Backend Deploy & Documentation | Pendiente |

## Convenciones

- Commits en inglés con prefijos: `feat:`, `fix:`, `chore:`, `docs:`
- NativeWind para estilos (no StyleSheet directo salvo necesidad)
- TypeScript estricto — no usar `any`
- Screens en `src/screens/`, servicios en `src/services/`

## Notas del Laboratorio

- API de IA: Plant.id (free tier) — incluye `probability` como score de confianza
- Storage: AsyncStorage justificado sobre MMKV/SQLite por simplicidad y scope del proyecto
- Offline: Queue de operaciones pendientes en AsyncStorage, procesada al reconectar
- Entrega: PDF análisis + link repo + link video + link Render compartido con profesor
