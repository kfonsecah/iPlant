# Phase 2: Camera Permission Handling - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 02-Camera Permission Handling
**Areas discussed:** Redirection Strategy, Permission Message, Gallery Fallback, UI Design Style

---

## Redirection Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Show Immediately | Show "Open Settings" button immediately when permanent denial is detected. (Faster path) | ✓ |
| Show on Request | Show only after the user taps "Activate Camera" and it fails. (Less intrusive) | |
| You decide | Let the builder decide the best UX pattern. (the agent's Discretion) | |

**User's choice:** Show Immediately
**Notes:** Decided to use `Linking.openSettings()` directly when `canAskAgain` is false.

---

## Gallery Fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Hide Gallery | Hide gallery button if camera is denied; camera is the primary focus. (Current behavior) | |
| Keep Visible | Keep "Pick from Gallery" visible so users can still identify plants. (More flexible) | ✓ |
| You decide | Let the builder decide based on UI constraints. (the agent's Discretion) | |

**User's choice:** Keep Visible
**Notes:** The user wants to allow identification via gallery even if camera permission is denied.

---

## UI Design Style

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen (Current) | Stay with the current full-screen message for maximum focus. (Existing UI) | ✓ |
| Card Overlay | Change to a centered card/overlay that doesn't block navigation entirely. (More modern) | |
| Bottom Sheet/Modal | Use a bottom sheet or modal that pops up over the camera tab. (Standard iOS/Android feel) | |

**User's choice:** Full-screen (Current)
**Notes:** Decided to keep the existing full-screen guard but with added options.

---

## Permission Message

| Option | Description | Selected |
|--------|-------------|----------|
| Simple & Direct (Current) | Keep it simple: "iPlant necesita camera access to identify plants." (Current) | ✓ |
| Include Fallback Info | Add fallback mention: "If you prefer not to use the camera, you can still pick photos from your gallery." | |
| Include Privacy Note | Add privacy assurance: "We only use your camera for identification; your data is secure." | |

**User's choice:** Simple & Direct (Current)
**Notes:** Decided to stick with the current message for now.

---

## the agent's Discretion

- Button styling and layout within the full-screen view.
- Specific implementation of `canAskAgain` check (some platforms handle it differently).

## Deferred Ideas

- Generic permissions framework for future needs.
