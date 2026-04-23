# Phase 3 Validation: Offline Mode & Local Storage

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest |
| Config file | `jest.config.js` |
| Quick run command | `npm test` |

## Requirement Validation Map

| Req ID | Description | Acceptance Criteria | Test File |
|--------|-------------|---------------------|-----------|
| OFFL-01 | La app detecta cuando no hay conexión a internet y muestra un banner/indicador visual | `OfflineBanner` is visible when `isConnected` is false. | `src/components/ui/offlineBanner/__tests__/OfflineBanner.test.tsx` |
| OFFL-02 | Los módulos de solo lectura funcionan sin internet usando datos cacheados | `plantService.getPlants` returns data from `storageService` when offline. | `src/services/__tests__/plantService.offline.test.ts` |
| OFFL-03 | Las operaciones de escritura se encolan localmente cuando no hay conexión | `plantService.addPlant` adds item to `syncQueue` when offline. | `src/services/__tests__/plantService.offline.test.ts` |
| OFFL-04 | Al recuperar la conexión, las operaciones encoladas se sincronizan automáticamente (manual) | `syncService.processQueue` pushes items to Firestore. | `src/services/__tests__/syncService.test.ts` |
| OFFL-05 | Las plantas pendientes se muestran con un indicador visual diferenciado | Plant cards show "Pending" badge if `isPending` is true. | `src/components/ui/plantCard/__tests__/PlantCard.test.tsx` |
| STOR-01 | Se implementa almacenamiento local con tecnología justificada | `storageService` uses `AsyncStorage` and `FileSystem`. | `src/services/__tests__/storageService.test.ts` |
| STOR-02 | Las plantas del usuario se cachean localmente para acceso offline | Cache keys include `userId`. | `src/services/__tests__/storageService.test.ts` |
| STOR-03 | La cola de sincronización pendiente persiste entre sesiones | Queue items are saved to `AsyncStorage`. | `src/services/__tests__/syncService.test.ts` |

## Manual Verification Steps

1. **Connectivity Toggle:**
   - Open app.
   - Disable Wi-Fi/Data (Airplane Mode).
   - Verify `OfflineBanner` appears.
   - Verify existing plants are still visible.
2. **Offline Creation:**
   - While offline, take a photo and "save" a plant.
   - Verify plant appears in list with "Pending" indicator.
   - Restart app.
   - Verify plant is still there and still "Pending".
3. **Synchronization:**
   - Enable Wi-Fi/Data.
   - Click "Sincronizar ahora" in banner or profile.
   - Verify "Pending" indicator disappears.
   - Verify plant appears in Firestore console.
4. **Error Handling:**
   - Mock a sync failure (e.g., temporary API error).
   - Verify plant remains "Pending" and shows error status after retries.
