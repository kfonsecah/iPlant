# Phase 2: Camera Permission Handling - Validation

**Date:** 2026-04-23
**Status:** Pending
**Phase:** 02

## Verification Strategy

### Automated Tests (Unit)
- **Goal**: Verify permission state logic in `CameraScreen.tsx`.
- **Target**: `src/screens/camera/__tests__/CameraScreen.test.tsx` (to be created)
- **Scenarios**:
  - [ ] Render "Activar Cámara" button when `granted: false` and `canAskAgain: true`.
  - [ ] Render "Abrir Ajustes" button when `granted: false` and `canAskAgain: false`.
  - [ ] Render "Seleccionar de Galería" button always on the permission screen.

### Manual Verification (UAT)
- **Goal**: Confirm end-to-end flow on physical device or emulator.
- **Scenarios**:
  - [ ] **UAT-01 (Grant)**: First launch -> Tap "Activar Cámara" -> System prompt appears -> Grant -> Camera starts.
  - [ ] **UAT-02 (Deny & Fallback)**: First launch -> Deny -> Permission Screen shows -> Tap "Seleccionar de Galería" -> Gallery opens -> Select plant -> Identification works.
  - [ ] **UAT-03 (Permanent Denial)**: Deny with "Don't ask again" (Android) or second denial (iOS) -> "Abrir Ajustes" appears -> Tap it -> System settings open -> Enable camera -> Return to app -> Camera is active.
  - [ ] **UAT-04 (No Crash)**: Deny permissions multiple times, switch tabs, return to camera -> App remains stable (PERM-01).

## Success Criteria (Nyquist Dimension 8)

| ID | Criterion | Verification Method |
|----|-----------|----------------------|
| SC-01 | App doesn't crash on denial | Manual (UAT-04) |
| SC-02 | Clear explanation shown | Manual (UI Check) |
| SC-03 | Request again via UI | Manual (UAT-01) |
| SC-04 | Redirect to settings works | Manual (UAT-03) |
| SC-05 | Gallery fallback works | Manual (UAT-02) |

---

*Phase: 02-camera-permission-handling*
*Validation plan created: 2026-04-23*
