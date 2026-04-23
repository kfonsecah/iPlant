# iPlant Roadmap — Actividad 3

**Project:** iPlant — AI plant identification + offline sync + Render deploy
**Granularity:** Standard
**Coverage:** 21/21 v1 requirements mapped
**Deadline:** 2026-04-24 23:59 UTC

---

## Phases

- [ ] **Phase 1: AI Plant Identification** - Integrate Plant.id API, display confidence scores, save results
- [ ] **Phase 2: Camera Permission Handling** - Deny gracefully, enable re-request, redirect to settings
- [ ] **Phase 3: Offline Mode & Local Storage** - Async detection, cache reads, queue writes, sync queue
- [ ] **Phase 4: Backend Deploy & Documentation** - Render deploy, verify endpoints, share with instructors

---

## Phase Details

### Phase 1: AI Plant Identification

**Goal:** User can identify plants using AI and receive confidence-backed results

**Depends on:** None (foundation feature)

**Requirements:** AI-01, AI-02, AI-03, AI-04, AI-05

**Success Criteria** (what must be TRUE):
1. User submits plant photo to AI identification API and receives species/name result
2. App displays plant name, description, and care instructions from AI response
3. Confidence score visible (percentage or confidence level) indicating identification accuracy
4. User can accept AI result or manually edit plant info before saving
5. Edited/accepted plant data persists in backend database

**Plans:** 5 plans

- [ ] 01-01-PLAN.md — API integration & types (identifyPlant method, AI fields)
- [ ] 01-02-PLAN.md — Confidence badge component
- [ ] 01-03-PLAN.md — AI result card with inline editing
- [ ] 01-04-PLAN.md — CameraScreen integration
- [ ] 01-05-PLAN.md — Environment configuration

**UI hint:** yes

---

### Phase 2: Camera Permission Handling

**Goal:** App gracefully handles camera permission denials without crashing

**Depends on:** Phase 1 (camera + photo submission already working)

**Requirements:** PERM-01, PERM-02, PERM-03, PERM-04

**Success Criteria** (what must be TRUE):
1. App does not crash when user denies camera permission at runtime
2. Clear message explains why camera permission is required
3. User can request camera permission again from within the app (not forced system retry)
4. If permission was permanently denied, user is directed to system settings to enable manually
5. Camera functionality becomes available after permission is granted or re-requested successfully

**Plans:** TBD

**UI hint:** yes

---

### Phase 3: Offline Mode & Local Storage

**Goal:** Users can access and add plants with or without internet, with visible sync status

**Depends on:** Phase 1 (plant data exists to cache)

**Requirements:** OFFL-01, OFFL-02, OFFL-03, OFFL-04, OFFL-05, STOR-01, STOR-02, STOR-03

**Success Criteria** (what must be TRUE):
1. App displays banner/indicator when offline, hides when online (netinfo detection working)
2. Plant list and profile pages load from local cache without network (read-only views fully offline)
3. New plant creation queues locally when offline without crashing
4. Queued operations sync to backend when connection returns (automatic sync)
5. Plants pending sync display distinct visual indicator (icon, badge, color, or status label)

**Plans:** TBD

**UI hint:** yes

---

### Phase 4: Backend Deploy & Documentation

**Goal:** Production API is live, verified, and accessible with proof of deployment

**Depends on:** Phase 1 (endpoints exist), Phase 3 (sync logic complete)

**Requirements:** BACK-01, BACK-02, BACK-03, BACK-04

**Success Criteria** (what must be TRUE):
1. Render deployment is live and accessible via public URL
2. Plant creation endpoint works end-to-end from production app to Render database
3. Render logs show successful requests and error traces
4. Render project is shared with instructor emails for verification (granadosdaniel566@gmail.com / daniel.granados.dev.566@gmail.com)

**Plans:** TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. AI Plant Identification | 0/5 | Not started | - |
| 2. Camera Permission Handling | 0/4 | Not started | - |
| 3. Offline Mode & Local Storage | 0/5 | Not started | - |
| 4. Backend Deploy & Documentation | 0/3 | Not started | - |

---

## Requirements Mapped

### By Phase

**Phase 1 (5 req):**
- AI-01: Photo submission to IA API
- AI-02: Display IA results (name, description, care)
- AI-03: Confidence score indicator
- AI-04: Accept or edit before saving
- AI-05: Save to backend database

**Phase 2 (4 req):**
- PERM-01: No crash on permission deny
- PERM-02: Clear permission explanation message
- PERM-03: Re-request permission from app
- PERM-04: Redirect to settings for permanent denial

**Phase 3 (8 req):**
- OFFL-01: Offline detection banner
- OFFL-02: Cache-based offline read
- OFFL-03: Local queue for writes
- OFFL-04: Automatic sync on reconnect
- OFFL-05: Pending sync visual indicator
- STOR-01: Local storage with justification (AsyncStorage)
- STOR-02: Plant cache for offline access
- STOR-03: Persistent sync queue across sessions

**Phase 4 (4 req):**
- BACK-01: Render deployment live
- BACK-02: Plant creation endpoint works production
- BACK-03: Render logs verifiable
- BACK-04: Render shared with instructors

---

## Key Technical Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| AI API Choice | Plant.id (specialized plant API, free tier, confidence scores built-in) | Phase 1 |
| Local Storage | AsyncStorage (simple key-value, sufficient for cache + sync queue) | Phase 3 |
| Offline Detection | @react-native-community/netinfo (standard RN practice) | Phase 3 |
| Sync Strategy | Queue-based (persist pending ops, retry on reconnect) | Phase 3 |
| Backend Host | Render (free tier, required by lab) | Phase 4 |

---

**Roadmap created:** 2026-04-23
**Last updated:** 2026-04-23
