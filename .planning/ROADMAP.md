# iPlant Roadmap — Actividad 3

**Project:** iPlant — AI plant identification + offline sync + Render deploy
**Granularity:** Standard
**Coverage:** 25/25 v1 requirements mapped
**Deadline:** 2026-04-24 23:59 UTC

---

## Phases

- [x] **Phase 1: AI Plant Identification** - Integrate Plant.id API, display confidence scores, save results ✓
- [x] **Phase 2: Camera Permission Handling** - Deny gracefully, enable re-request, redirect to settings ✓
- [ ] **Phase 3: Offline Mode & Local Storage** - Async detection, cache reads, queue writes, sync queue
- [ ] **Phase 4: Backend Deploy & Documentation** - Render deploy, verify endpoints, share with instructors

---

## Phase Details

### Phase 1: AI Plant Identification & Immersive UI

**Goal:** User can identify plants using AI and receive immersive, detailed botanical feedback.

**Requirements:** AI-01, AI-02, AI-03, AI-04, AI-05, UI-01, UI-02, UI-03, UI-04

**Success Criteria**:
1. [x] User submits plant photo to Plant.id v3 API and receives detailed botanical metadata.
2. [x] App displays name, description, and care instructions (Watering, Pruning, Soil, Sunlight).
3. [x] High-tech HUD scanning animation visible during processing.
4. [x] Full-page PlantDetailView with parallax and zoom effects.
5. [x] API keys secured via .env variables.

---

### Phase 2: Camera Permission Handling

**Goal:** App gracefully handles camera permission denials without crashing.

**Requirements:** PERM-01, PERM-02, PERM-03, PERM-04

**Plans:** 1 plans
- [x] 02-01-PLAN.md — Enhanced permission guard with settings redirection and gallery fallback. ✓

**Success Criteria**:
1. [x] App does not crash when user denies camera permission.
2. [x] Clear message explains why camera permission is required.
3. [x] User can request camera permission again from within the app UI.
4. [x] Permanent denial redirects user to system settings.

---

### Phase 3: Offline Mode & Local Storage

**Goal:** Users can access and add plants with or without internet, with visible sync status.

**Depends on:** Phase 1 (plant data exists to cache)

**Requirements:** OFFL-01, OFFL-02, OFFL-03, OFFL-04, OFFL-05, STOR-01, STOR-02, STOR-03

**Plans:** 3 plans
- [ ] 03-01-PLAN.md — Connectivity & Storage Foundation
- [ ] 03-02-PLAN.md — Sync Engine & Repository Refactor
- [ ] 03-03-PLAN.md — UI Integration & Offline Flow

**Success Criteria**:
1. App displays banner/indicator when offline, hides when online.
2. Plant list and profile pages load from local cache without network.
3. New plant creation queues locally when offline without crashing.
4. Queued operations sync to backend when connection returns.
5. Plants pending sync display distinct visual indicator.

---

### Phase 4: Backend Deploy & Documentation

**Goal:** Production API is live, verified, and accessible with proof of deployment.

**Depends on:** Phase 1 (endpoints exist), Phase 3 (sync logic complete)

**Requirements:** BACK-01, BACK-02, BACK-03, BACK-04

**Success Criteria**:
1. Render deployment is live and accessible via public URL.
2. Plant creation endpoint works end-to-end from production app.
3. Render logs show successful requests and error traces.
4. Render project is shared with instructor emails.

---

## Progress

| Phase | Status | Completed |
|-------|--------|-----------|
| 1. AI Plant Identification | Completed ✓ | 2026-04-23 |
| 2. Camera Permission Handling | Completed ✓ | 2026-04-23 |
| 3. Offline Mode & Local Storage | Planning | - |
| 4. Backend Deploy & Documentation | Not started | - |

---

## Key Technical Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| AI API Choice | Plant.id v3 (specialized, metadata rich, confidence scores) | Completed ✓ |
| UI Strategy | Immersive HUD + Parallax (Premium mobile experience) | Completed ✓ |
| Security | .env for API Keys (Industry standard for Expo) | Completed ✓ |
| Local Storage | AsyncStorage (simple key-value, sufficient for cache + sync queue) | Phase 3 |
| Offline Detection | @react-native-community/netinfo | Phase 3 |
| Backend Host | Render (required by lab) | Phase 4 |

---
**Last updated:** 2026-04-23 after planning Phase 3
