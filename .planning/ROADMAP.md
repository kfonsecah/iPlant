# iPlant Roadmap — Actividad 4: Entrega Final

**Project:** iPlant — 100% Completion for Lab Submission
**Granularity:** Professional
**Coverage:** 100% functionality + Unique Feature
**Deadline:** 2026-05-27 23:59 UTC

---
## Phases

- [x] **Phase 1: AI Plant Identification** ✓
- [x] **Phase 2: Camera Permission Handling** ✓
- [x] **Phase 3: Offline Mode & Local Storage** ✓
- [x] **Phase 4: Enhanced Collection & Search (CRUD)** ✓
- [x] **Phase 5: Unique Feature: AI Care Narrator** ✓
- [x] **Phase 6: Final Deploy & Audit** ✓

---

## Phase Details

### Phase 1: AI Plant Identification & Immersive UI

**Goal:** User can identify plants using AI and receive immersive, detailed botanical feedback.
**Status:** Completed ✓

---

### Phase 2: Camera Permission Handling

**Goal:** App gracefully handles camera permission denials without crashing.
**Status:** Completed ✓

---

### Phase 3: Offline Mode & Local Storage

**Goal:** Users can access and add plants with or without internet, with visible sync status.
**Status:** Completed ✓

---

### Phase 4: Backend Deploy & Documentation

**Goal:** Production API is live, verified, and accessible with proof of deployment.

**Depends on:** Phase 1 (endpoints exist), Phase 3 (sync logic complete)

**Requirements:** BACK-01, BACK-02, BACK-03, BACK-04

**Success Criteria**:
1. [x] Micro-backend (Node.js/Express) created to proxy AI requests and secure keys.
2. [ ] Render deployment is live and accessible via public URL.
3. [ ] Plant creation endpoint works end-to-end from production app.
4. [ ] Render logs show successful requests and error traces.
5. [ ] Render project and GitHub repository shared with instructor.
6. [ ] Final PDF analysis submitted based on ANALISIS_TECNICO.md.

---

## Progress

| Phase | Status | Completed |
|-------|--------|-----------|
| 1. AI Plant Identification | Completed ✓ | 2026-04-23 |
| 2. Camera Permission Handling | Completed ✓ | 2026-04-23 |
| 3. Offline Mode & Local Storage | Completed ✓ | 2026-04-23 |
| 4. Enhanced Collection (CRUD) | Completed ✓ | 2026-05-13 |
| 5. Unique Feature: AI Care Narrator | Completed ✓ | 2026-05-13 |
| 6. Final Deploy & Audit | Completed ✓ | 2026-05-13 |


---

## Key Technical Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| AI API Choice | Plant.id v3 (specialized, metadata rich, confidence scores) | Completed ✓ |
| UI Strategy | Immersive HUD + Parallax (Premium mobile experience) | Completed ✓ |
| Security | .env for API Keys (Industry standard for Expo) | Completed ✓ |
| Local Storage | Hybrid (AsyncStorage for JSON + FileSystem for images) | Completed ✓ |
| Offline Detection | @react-native-community/netinfo (Active Listener) | Completed ✓ |
| Backend Host | Render (required by lab) | In Progress |

---
**Last updated:** 2026-04-24 after completing Phase 3 & scaffolded Phase 4
