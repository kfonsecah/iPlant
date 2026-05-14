# iPlant — Actividad 3: API + Sincronización

## What This Is

iPlant es una app móvil en React Native/Expo para registro y gestión de plantas. El usuario toma fotos de plantas, las identifica mediante IA, guarda la información en una base de datos backend, y puede consultar su colección. Esta actividad añade identificación con IA, modo offline con sincronización, y despliegue del backend en Render.

## Core Value

El usuario puede tomar una foto de una planta, obtener su identificación y cuidados mediante IA, y guardarla en su colección — todo desde el móvil, con o sin conexión estable.

## Requirements

### Validated

- ✓ Autenticación con Google/email (Firebase) — existente
- ✓ Flujo de cámara y galería para seleccionar fotos — existente
- ✓ Pantalla de creación de planta con formulario — existente
- ✓ Navegación principal y guardas de ruta — existente
- ✓ Sistema de diseño con NativeWind/Tailwind — existente
- ✓ Identificación de planta con IA v3 (Plant.id) — Phase 1
- ✓ Feedback visual de confianza (ConfidenceBadge) — Phase 1
- ✓ Manejo de permisos de cámara y re-solicitud — Phase 2
- ✓ Interfaz inmersiva con animaciones HUD y Parallax — Phase 1+
- ✓ Metadatos botánicos extendidos (Riego, Poda, Suelo, Taxonomía) — Phase 1+
- ✓ Indicadores visuales de contenido pendiente de sincronización — Phase 3
- ✓ Módulos que funcionen sin internet (offline-first) — Phase 3
- ✓ Sincronización de cambios cuando vuelve la conexión — Phase 3
- ✓ Almacenamiento local justificado (AsyncStorage + FileSystem) — Phase 3

### Active

- [ ] Deploy del API backend en Render (cloud)
- [ ] Documentación técnica final (PDF)

### Out of Scope

- Notificaciones push — no requerido por el laboratorio
- Chat o comentarios entre usuarios — fuera del alcance actual
- Autenticación biométrica — ya existe Google Auth, no es prioridad

## Context

**Stack existente:**
- React Native + Expo SDK (managed workflow)
- Firebase Auth (Google + email/password)
- NativeWind (Tailwind CSS para RN)
- Backend: Express Proxy (Node.js)
- Cámara: expo-camera con preview e identificación IA
- Almacenamiento: AsyncStorage (JSON) + FileSystem (Imágenes)

**Situación actual:**
- La identificación por IA está completamente integrada.
- El manejo de permisos es robusto y permite re-solicitar acceso.
- Existe una arquitectura offline-first con cola de sincronización.
- El código del backend está listo; falta confirmar el despliegue final en Render.

**Fecha de entrega:** 24/04/2026 a las 11:59 pm

**Entrega requerida:**
- Video demostrando: rechazar permisos → intentar usar → re-solicitar → foto → IA identifica → guardado en DB
- PDF con análisis técnico (módulos offline, justificación de almacenamiento, estrategias UX sin conexión)
- Link al repo, link al video, link al API en Render
- Compartir Render con: granadosdaniel566@gmail.com / daniel.granados.dev.566@gmail.com

## Constraints

- **Timeline**: Entrega 24/04/2026 — quedan aproximadamente 1 día
- **Tech stack**: React Native/Expo managed — no se puede usar código nativo puro
- **Backend**: Debe desplegarse en Render (gratis o paid) con logs verificables
- **IA**: Puede ser cualquier API de IA que identifique plantas (Plant.id, OpenAI Vision, Google Vision)
- **Almacenamiento**: AsyncStorage + FileSystem (híbrido)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| IA API para identificación | Plant.id v3: Especializada, ofrece metadatos botánicos extensos y confianza nativa. | Plant.id |
| UI Strategy | Inmersiva: Animaciones HUD para escaneo y vista Parallax para perfil para mayor engagement. | Immersive UI |
| Almacenamiento local | Híbrido: AsyncStorage para rapidez en metadatos y FileSystem para persistencia de imágenes pesadas. | AsyncStorage + FileSystem |
| Estrategia offline | Queue de operaciones (Optimistic UI): Los cambios se aplican localmente y se sincronizan al detectar red. | Offline-First Sync |

---
*Last updated: 2026-04-24 after completing Phase 3*

## Evolution

This document evolves at phase transitions and milestone boundaries.
