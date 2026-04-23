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

### Active

- [ ] Identificación de planta con IA a partir de foto tomada con la cámara
- [ ] Feedback al usuario sobre la veracidad/confianza de la identificación
- [ ] Manejo de permisos de cámara denegados con opción de re-solicitar
- [ ] Indicadores visuales de contenido pendiente de sincronización
- [ ] Módulos que funcionen sin internet (offline-first)
- [ ] Sincronización de cambios cuando vuelve la conexión
- [ ] Deploy del API backend en Render (cloud)
- [ ] Almacenamiento local justificado (AsyncStorage / MMKV / SQLite)

### Out of Scope

- Notificaciones push — no requerido por el laboratorio
- Chat o comentarios entre usuarios — fuera del alcance actual
- Autenticación biométrica — ya existe Google Auth, no es prioridad

## Context

**Stack existente:**
- React Native + Expo SDK (managed workflow)
- Firebase Auth (Google + email/password)
- NativeWind (Tailwind CSS para RN)
- Backend propio con plantService.ts / userService.ts (endpoints ya definidos)
- Cámara: expo-camera con preview ya implementado (876c258)
- Galería: expo-image-picker ya integrado (876c258)

**Situación actual:**
- La cámara ya funciona y puede tomar fotos
- El form de creación de planta existe pero no llama a ninguna IA
- No hay manejo de permisos denegados con re-solicitud
- El backend no está desplegado en Render aún
- No hay lógica offline ni indicadores de sincronización

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
- **Almacenamiento**: Debe justificarse técnicamente la elección (AsyncStorage vs MMKV vs SQLite)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| IA API para identificación | Por definir: Plant.id (especializada) vs OpenAI Vision (general) vs Google Vision | — Pending |
| Almacenamiento local | Por definir: AsyncStorage (simple) vs MMKV (performance) vs SQLite (relacional) | — Pending |
| Estrategia offline | Queue de operaciones pendientes vs cache de solo lectura | — Pending |

---
*Last updated: 2026-04-23 after initialization — Actividad 3 laboratorio*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
