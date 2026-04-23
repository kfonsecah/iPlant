---
phase: 03-offline-mode-local-storage
plan: 03-02
subsystem: Services
tags: [offline, synchronization, repository-pattern]
requires: [OFFL-02, OFFL-03, STOR-02, STOR-03]
affects: [src/services/plantService.ts, src/services/syncService.ts]
tech-stack: [AsyncStorage, NetInfo, expo-crypto]
key-files: [src/services/syncService.ts, src/services/plantService.ts, src/types-dtos/plant.types.ts]
decisions:
  - id: D-03-02-01
    name: Repository Pattern with Local-First
    description: All writes go to local cache and sync queue immediately. Reads prefer online data but fallback to cache.
    rationale: Ensures maximum availability and immediate feedback for users.
  - id: D-03-02-02
    name: Sequential Sync Queue
    description: Offline changes are processed one by one to avoid memory issues and ensure consistency.
    rationale: More reliable than parallel sync for mobile devices.
metrics:
  duration: 45m
  completed_date: "2026-04-23"
---

# Phase 03 Plan 02: Offline Logic & Sync Queue Summary

## Substantive Progress

Implemented a robust offline-first architecture by refactoring the `plantService` into a Repository pattern and establishing a persistent `syncService` for enqueued operations.

- **Sync Queue:** Created `syncService.ts` to manage a FIFO queue in `AsyncStorage`. It handles sequential processing of actions and prevents concurrent sync cycles using a lock mechanism.
- **Repository Pattern:** Refactored `plantService.ts` to implement "Local-First" writes. New plants are immediately saved to the local cache and added to the sync queue, providing an optimistic UI experience even when offline.
- **Connectivity Awareness:** Integrated `@react-native-community/netinfo` to detect network status. `identifyPlant` now correctly blocks API calls when offline, while `getPlantsByUserId` seamlessly falls back to cached data.
- **Data Model Enrichment:** Updated `PlantaCompletaInterface` with `isPending` and `syncError` flags to support UI feedback for offline items.
- **Testing:** Comprehensive unit tests for both `syncService` and `plantService` ensure the reliability of the queue management and the repository logic.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Circular Dependency Prevention**
- **Found during:** Task 1 Implementation.
- **Issue:** `SyncService` needed to call `plantService` for API pushes, while `plantService` needed to call `SyncService` for enqueuing.
- **Fix:** Implemented a callback-based `processQueue` in `SyncService`, allowing `plantService` to provide the specific API handlers without requiring a direct import from `SyncService`.

**2. [Rule 3 - Blocking Issue] Mocking Timestamp in Tests**
- **Found during:** Task 3 (Testing).
- **Issue:** `instanceof Timestamp` check in `plantService.ts` failed during tests because `Timestamp` was not correctly mocked as a constructor.
- **Fix:** Refined the `jest.mock` for `firebase/firestore` to provide a properly functional `Timestamp` constructor.

## Known Stubs

None - The core offline and sync logic is fully implemented and tested.

## Threat Flags

None - The implementation follows the established STRIDE mitigation plan by using sequential processing.

## Self-Check: PASSED
- [x] `src/services/syncService.ts` exists and manages persistent queue.
- [x] `src/services/plantService.ts` refactored to Repository pattern.
- [x] Unit tests pass for both services.
- [x] Deviations documented.
