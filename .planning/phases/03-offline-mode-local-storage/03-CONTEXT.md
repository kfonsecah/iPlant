# Phase 3 Context: Offline Mode & Local Storage

## Phase Goal
Implement a robust offline experience where users can view their plant collection without internet and queue new additions that sync once connection is restored.

## Decisions (Locked)

### 1. Offline Identification Strategy
- **Restricted Approach:** The `identifyPlant` service will not attempt to call the API if offline.
- **UX:** Show a "No connection" message in the identification screen.
- **Queueing:** Only "Add Plant" operations (after successful identification or manual entry) can be queued. If a user identifies a plant while online but loses connection before clicking "Save", the app must allow saving that result to the local queue.

### 2. Synchronization Mechanism
- **Trigger:** On-demand (User-triggered).
- **UI Element:** A "Sincronizar ahora" (Sync Now) button will appear within the global offline banner or the profile page.
- **Manual Control:** The user decides when to push queued items, providing transparency and preventing unexpected data usage.

### 3. Caching Depth
- **Full Cache:** The entire `PlantaInterface[]` list for the logged-in user will be stored in `AsyncStorage`.
- **Initialization:** On app start or after login, the cache is populated/refreshed from Firestore if online.

### 4. Conflict Resolution
- **Policy:** "Last write wins".
- **Implementation:** The local version of a plant or the local queue items will overwrite or be appended to the remote database without complex merging or version checks.

### 5. UI Presence
- **Global Banner:** A floating banner (using `nativewind` for styling) will appear at the top or bottom of the screen when `NetInfo` detects no connection.
- **Status Indicators:** Plants in the list that are currently only in the local queue (pending sync) will display a "Pending" icon/badge (e.g., a clock or cloud icon).

## Technical Requirements
- **Library:** Add `@react-native-community/netinfo`.
- **Storage:** Use `@react-native-async-storage/async-storage` (already in `package.json`).
- **Service Updates:** Refactor `plantService.ts` to wrap Firestore calls with local cache logic.

## Deferred / Out of Scope
- Automatic background sync (replaced by on-demand button).
- Offline AI (not possible with current cloud-based API).
