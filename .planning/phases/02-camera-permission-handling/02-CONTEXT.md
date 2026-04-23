# Phase 2: Camera Permission Handling - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

App gracefully handles camera permission denials without crashing. Includes explanatory message, re-request capability from within the UI, and redirection to system settings for permanent denials.

</domain>

<decisions>
## Implementation Decisions

### Redirection Strategy
- **D-01:** Immediate "Open Settings" Button — when permanent denial is detected (via `canAskAgain: false` or similar state), show a clear "Abrir Ajustes" button immediately on the permission screen.
- Action: Use `Linking.openSettings()` from `react-native`.

### Gallery Fallback
- **D-02:** Keep "Pick from Gallery" Visible — even if camera permission is denied, the user should still be able to use the "Pick from Gallery" option to identify plants.
- Flow: The permission request screen will include a secondary button to open the image picker.

### UI Design Style
- **D-03:** Full-screen (Current) — stay with the current full-screen "Permission Required" view to maintain maximum focus on the resolution.
- Updates: The view will be updated to include the new "Open Settings" and "Seleccionar de Galería" buttons.

### Message Tone
- **D-04:** Simple & Direct (Current) — keep the existing explanatory message as is, focusing on the core utility: "iPlant necesita usar la cámara para identificar tus plantas. Toca el botón de abajo para activar el permiso."

### the agent's Discretion
- Exact layout/styling of the new buttons (Open Settings vs Gallery).
- Error handling if `Linking.openSettings()` fails or isn't supported.
- State management for `permission.canAskAgain` check.

</decisions>

<specifics>
## Specific Ideas

- "Si el permiso fue denegado permanentemente, la app redirige a Configuración del sistema" (PERM-04)
- Reuse existing `pickImage` logic from `CameraScreen.tsx`.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Permissions
- `src/screens/camera/CameraScreen.tsx` — current camera and permission logic
- `https://docs.expo.dev/versions/latest/sdk/camera/#usecamerapermissions-options` — expo-camera hook docs
- `https://reactnative.dev/docs/linking#opensettings` — React Native Linking API for settings

### Requirements
- `.planning/REQUIREMENTS.md` (PERM-01 to PERM-04)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- CameraScreen.tsx: `permission` object from `useCameraPermissions()`.
- CameraScreen.tsx: `pickImage` function for gallery access.
- `src/theme/desingSystem.ts`: Theme colors (primary, surface, error) for buttons.

### Established Patterns
- Full-screen permission guard in `CameraScreen.tsx`.
- `TouchableOpacity` for system buttons with consistent shadow and radius.

### Integration Points
- `CameraScreen.tsx`: Needs to handle `permission.canAskAgain` to toggle between "Activar Cámara" and "Abrir Ajustes".
- `CameraScreen.tsx`: Needs to expose the gallery picker even when camera permission is `granted: false`.

</code_context>

<deferred>
## Deferred Ideas

- Generic "Permissions Context" for other future permissions (e.g., location, notifications).

</deferred>

---

*Phase: 02-camera-permission-handling*
*Context gathered: 2026-04-23*
