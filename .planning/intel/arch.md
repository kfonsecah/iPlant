---
updated_at: "2025-02-28T00:00:00.000Z"
---

## Architecture Overview

iPlant is a cross-platform mobile application built with Expo (React Native). It follows a modular architecture with a clear separation between UI (screens/components), business logic (services), and state management (contexts).

The application implements an **Offline-First** strategy using a hybrid storage approach (AsyncStorage for metadata, FileSystem for images) and a synchronization queue that automatically pushes pending changes to a remote backend when connectivity is restored.

The backend is a lightweight Express.js proxy that secures API keys for third-party services (Plant.id) and provides endpoints for end-to-end data flow verification.

## Key Components

| Component | Path | Responsibility |
|-----------|------|---------------|
| App Layout | `app/_layout.tsx` | Root entry point, provides Auth, Connectivity, and Sync contexts. |
| Plant Service | `src/services/plantService.ts` | Orchestrates plant identification, local saving, and remote syncing. |
| Storage Service | `src/services/storageService.ts` | Abstract layer for AsyncStorage and FileSystem operations. |
| Sync Service | `src/services/syncService.ts` | Manages the persistent queue of operations to be synchronized. |
| Backend Proxy | `backend/src/index.ts` | Express server handling IA identification requests and mock persistence. |
| Connectivity Context | `src/context/ConnectivityContext.tsx` | Real-time monitoring of network status across the app. |

## Data Flow

**Plant Identification Flow:**
1. `CameraScreen` captures image -> `plantService.identifyPlant`
2. `plantService` sends image to `Backend Proxy` (`/api/identify`)
3. `Backend Proxy` calls `Plant.id v3` API and returns botanical metadata
4. `plantService` returns structured data to UI for user confirmation

**Offline Save & Sync Flow:**
1. User saves plant -> `plantService.addPlant`
2. `plantService` saves metadata to `AsyncStorage` and image to `FileSystem`
3. `plantService` adds a `CREATE` action to `Sync Service` queue
4. `Sync Service` monitors `Connectivity Context`
5. When online, `Sync Service` processes queue -> `plantService.syncPlants`
6. `plantService` calls `Backend Proxy` (`/api/plants`) and `Firebase Firestore`
7. Local cache is updated with remote IDs and `isPending` flag is cleared

## Conventions

- **Hybrid Storage:** Large binary files (images) go to `FileSystem`; structured JSON metadata goes to `AsyncStorage`.
- **Zod Validation:** Used for DTOs and API responses (where applicable).
- **NativeWind:** Tailwind-based styling for consistent UI across components.
- **Service Pattern:** API and storage logic is encapsulated in singleton-like service modules.
