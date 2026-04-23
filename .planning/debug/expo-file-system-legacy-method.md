---
status: resolved
trigger: "Call Stack errorOnLegacyMethodUse (node_modules\\expo-file-system\\src\\legacyWarnings.ts) readAsStringAsync"
created: 2026-04-23
updated: 2026-04-23
---

# Debug Session: expo-file-system-legacy-method

## Symptoms
- **Expected**: `readAsStringAsync` converts the image URI to a base64 string without errors.
- **Actual**: Crash with `errorOnLegacyMethodUse` in `expo-file-system`.
- **Error Messages**: 
```
Call Stack
  errorOnLegacyMethodUse (node_modules\expo-file-system\src\legacyWarnings.ts)
  readAsStringAsync (node_modules\expo-file-system\src\legacyWarnings.ts)
```
- **Timeline**: Ocurre al probar la funcionalidad después de la implementación inicial.
- **Reproduction**: Se dispara siempre que se pulsa el botón "Identificar", el cual invoca `imageToDataUri` y subsecuentemente `FileSystem.readAsStringAsync`.

## Current Focus
- **Hypothesis**: La versión actual de `expo-file-system` (probablemente v19+) ha marcado `readAsStringAsync` como un método "legacy" no soportado y requiere el uso de una nueva API (posiblemente la nueva API síncrona `File` o `FileSystem.File` que ya vimos importada en `CameraScreen.tsx`).
- **Next Action**: Migrar a la nueva API de File.

## Evidence
- `src/screens/camera/CameraScreen.tsx` hace importaciones que sugieren una API nueva: `import { File, Directory, Paths } from "expo-file-system";`
- `src/services/plantService.ts` estaba usando la API antigua: `await FileSystem.readAsStringAsync(...)`.

## Resolution
- **root_cause**: Uso de `FileSystem.readAsStringAsync` en `expo-file-system` v19+, donde este método está marcado como legacy y lanza un error en lugar de funcionar (o requiere configuraciones que ya no son las por defecto).
- **fix**: Se actualizó `src/services/plantService.ts` para usar la nueva clase `File` de `expo-file-system`. Ahora utiliza `await new File(uri).base64()` para obtener la representación base64 de la imagen de forma compatible con la nueva API.
