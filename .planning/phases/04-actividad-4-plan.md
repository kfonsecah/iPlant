# Implementation Plan - iPlant Actividad 4

## Objective
Finalize the iPlant application by reaching 90% functionality, implementing a unique value-added feature, and completing the deployment and documentation requirements as specified in `README-Lab.md`.

## Part 1: Investigation & Analysis

### 1.1 Missing Modules Identification
Based on the current state of the app (v1.0 from Actividad 3):
- **Plant Detail View**: The app currently lists plants but needs a dedicated screen to display full botanical metadata (watering, pruning, etc.) saved from the AI identification.
- **Full CRUD Operations**: Users should be able to edit plant nicknames/notes and delete plants from their collection.
- **Search & Filtering**: A way to quickly find plants in the collection as it grows.
- **Sync Visuals**: While the sync engine exists, more explicit UI feedback for "Syncing..." and "Sync Complete" would improve UX.

### 1.2 Unique Feature Design
**Feature Name:** AI Care Narrator (Narrador de Cuidados con IA)
**Description:** A voice-guided assistant that reads out the specific care requirements of the identified plant.
**Value Proposition:** 
- **Accessibility**: Users can listen to care instructions while they are actually tending to their plants, without needing to read small text on a screen.
- **Immersive Experience**: Enhances the "premium" feel of the app by giving it a voice.
- **Immediate Value**: Provides quick, actionable info (e.g., "This plant needs water every 2 days") in an engaging way.

---

## Part 2: Development Phases

### Phase 5: Enhanced Collection Management (90% Completion)
- [ ] **Task 5.1: Plant Detail Screen**
    - Create a new route `plants/[id]` or similar.
    - Display all botanical metadata (Taxonomy, Watering, Soil, etc.).
    - Implement a "Delete" action with confirmation.
- [ ] **Task 5.2: Search & Filter**
    - Add a search bar to the `plants` screen.
    - Implement filtering by "Family" or "Sync Status".
- [ ] **Task 5.3: Edit Functionality**
    - Allow users to update the nickname or notes of a saved plant.

### Phase 6: Unique Feature - AI Care Narrator
- [ ] **Task 6.1: Integration with expo-speech**
    - Install and configure `expo-speech`.
- [ ] **Task 6.2: Logic for Text-to-Speech**
    - Extract watering and maintenance tips from the plant metadata.
    - Create a "Listen Care Tips" button in the Detail View and Identification results.
- [ ] **Task 6.3: UI Polish**
    - Add a "Wave" animation or speaker icon when the narrator is active.

### Phase 7: Final Deployment & Audit
- [ ] **Task 7.1: Verify Render Deployment**
    - Confirm the API is responding at `https://iplant.onrender.com`.
    - Ensure `PLANT_ID_API_KEY` is set in Render environment.
- [ ] **Task 7.2: Logs & Error Tracing**
    - Check Render logs for any failures in production.

---

## Part 3: Documentation & Delivery

- [ ] **Generate ANALISIS_TECNICO_V2.md**: Documenting missing modules and the new feature.
- [ ] **Final PDF Generation**: Consolidate analysis and links.
- [ ] **Repository Cleanup**: Ensure README is updated and code is clean.

## Success Criteria
1. At least 90% of the functional requirements are met.
2. The AI Care Narrator works flawlessly on physical devices.
3. The backend is live on Render and shared with the instructor.
4. All documentation is complete and ready for submission.
