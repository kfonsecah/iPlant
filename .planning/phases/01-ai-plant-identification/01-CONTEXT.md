# Phase 1: AI Plant Identification - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

User can identify plants using AI via camera photo, receive confidence-backed results, edit if needed, and save to backend database. Integration into existing plant creation form. Offline sync is a separate phase.

</domain>

<decisions>
## Implementation Decisions

### AI API Choice
- **D-01:** Plant.id API — specialized for plants, 100 free credits, built-in confidence scores

### Confidence Display
- **D-02:** Percentage + Color Badge — e.g., "85% confident" with Green (high), Yellow (medium), Red (low)
- Thresholds: ≥70% Green (Alta), 40-69% Yellow (Media), <40% Red (Baja)

### Edit UI Flow
- **D-03:** Inline Form Editing — form fields pre-filled with AI data, user edits directly before save
- Editable fields: Nombre, Categoría, Descripción, Cuidados, Frecuencia de riego

### Integration Point
- **D-04:** Step in Create Plant Form — after user takes photo, call AI, pre-fill form, allow edit/save
- Flow: Camera button → Take photo → Submit to Plant.id API → Display results with confidence → User edits → Save

### the agent's Discretion
- Exact API endpoint structure (Plant.id v3)
- Error handling for API failures (retry logic, user message)
- Loading state UI during API call

</decisions>

<specifics>
## Specific Ideas

- "Necesito ver el porcentaje de confianza para saber qué tan seguro está la IA"
- API key handled via environment variable (never committed)
- Plant.id returns description/wiki_description in response — use for plant care info

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Plant identification
- `src/services/plantService.ts` — existing plant service patterns
- `src/types-dtos/plant.types.ts` — existing plant interface
- `https://web.plant.id/plant-identification-api/` — Plant.id API docs (free tier, confidence scores)

### Existing code
- `src/screens/camera/CameraScreen.tsx` — existing camera usage
- No external specs — requirements fully captured in decisions above

</canonical_refs>

 <code_context>
## Existing Code Insights

### Reusable Assets
- plantService.ts: addPlant(), updatePlant() — reuse for saving AI results
- plant.types.ts: PlantaInterface — extend with AI fields (descripcion, cuidados, confianza)

### Established Patterns
- Firebase Firestore for persistence
- NativeWind for styling
- withTimeout() wrapper for API calls

### Integration Points
- CameraScreen.tsx already has camera capture
- Create plant form already exists (src/screens/ misPlants or similar)
- AuthContext provides userId for plant ownership

</code_context>

<deferred>
## Deferred Ideas

- Offline identification results cache — Phase 3
- Multiple photo submission for better accuracy — future enhancement

</deferred>

---

*Phase: 01-ai-plant-identification*
*Context gathered: 2026-04-23*