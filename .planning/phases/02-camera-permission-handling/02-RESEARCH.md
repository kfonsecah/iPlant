# Phase 2: Camera Permission Handling - Research

**Date:** 2026-04-23
**Status:** Completed
**Domain:** UX / Permissions / Camera

## Technical Implementation

### Expo Permissions (v51/v54)
The current version of `expo-camera` (v17.x as of Expo 54) provides the `useCameraPermissions` hook, which returns a tuple `[permission, requestPermission, getPermission]`. 

- **`permission.granted`**: `boolean` indicating if the user has already granted access.
- **`permission.canAskAgain`**: `boolean` indicating if the user can be prompted again at the system level.
- **`permission.status`**: `PermissionStatus` (granted, denied, undetermined).

### Permanent Denial Detection
A "Permanent Denial" (where the system won't show the native prompt anymore) is detected when:
```typescript
const isPermanentlyDenied = !permission.granted && !permission.canAskAgain;
```
*Note: On iOS, `canAskAgain` is usually `false` once the user denies it once. On Android, it's `false` only if the user checks "Don't ask again".*

### Redirection to Settings
To fulfill **PERM-04**, use the `Linking` API from `react-native`:
```typescript
import { Linking } from 'react-native';

const handleOpenSettings = async () => {
  try {
    await Linking.openSettings();
  } catch (error) {
    console.error("Failed to open settings:", error);
  }
};
```

### UI Reorganization (Gallery Fallback)
To allow **D-02 (Gallery Fallback)**, the `CameraScreen.tsx` logic must be reordered. Currently, the permission guard blocks everything. The new order should be:

1. **Check for `previewUri`**: If the user just took a photo or picked from gallery, show the preview REGARDLESS of current camera permissions.
2. **Check for `permission.granted`**: If not granted, show the "Permission Required" screen.
3. **Inside the Permission Screen**:
   - If `permission.canAskAgain === true`: Show "Activar Cámara".
   - If `permission.canAskAgain === false`: Show "Abrir Ajustes".
   - **Always show "Seleccionar de Galería"** as a secondary option.

## Code Patterns

### Improved Permission Guard
```typescript
if (!permission.granted) {
  const isPermanentlyDenied = !permission.canAskAgain;

  return (
    <View style={styles.permissionContainer}>
      {/* ... Message ... */}
      
      {isPermanentlyDenied ? (
        <TouchableOpacity onPress={handleOpenSettings}>
          <Text>Abrir Ajustes</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={requestPermission}>
          <Text>Activar Cámara</Text>
        </TouchableOpacity>
      )}

      {/* Gallery Fallback (D-02) */}
      <TouchableOpacity onPress={pickImage}>
        <Text>Seleccionar de Galería</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Edge Cases

1. **Returning from Settings**: The `useCameraPermissions` hook might not automatically refresh when the app returns from the background. 
   - **Fix**: Add an `AppState` listener to call `getPermission()` manually when the app becomes `active`.
2. **User grants permission but returns to "Permission Required" screen**: The hook should update automatically if `getPermission()` is called.
3. **Gallery access denied**: If the user denies both camera AND gallery, they should see a message explaining they can't identify plants at all. (Gallery permissions are handled via `expo-image-picker`).

## Validation Architecture

### Manual Verification Steps
1. **Fresh Install**: Open camera, verify "Activar Cámara" shows. Deny permission.
2. **Temporary Denial**: Verify "Activar Cámara" still shows.
3. **Permanent Denial (Android/iOS)**: Deny again (or check "Don't ask again" on Android). Verify "Abrir Ajustes" appears.
4. **Settings Loop**: Tap "Abrir Ajustes", enable camera in system settings, return to app. Verify camera is now active without manual refresh (if AppState listener is implemented).
5. **Gallery Only**: Deny camera, tap "Seleccionar de Galería", verify identification still works.

### Mock Strategy (for Unit/Integration Tests)
Mock `expo-camera`'s `useCameraPermissions`:
- `jest.mock('expo-camera', () => ({ ... }))`
- Return different states: `{ granted: false, canAskAgain: true }`, `{ granted: false, canAskAgain: false }`.
- Verify the correct button (Request vs Settings) is rendered.

---

*Phase: 02-camera-permission-handling*
*Research completed: 2026-04-23*
