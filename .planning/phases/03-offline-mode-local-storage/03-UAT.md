# Phase 03 UAT: Offline Mode & Sync Verification

This document outlines the User Acceptance Testing (UAT) steps required to verify the implementation of Phase 03, aligned with the requirements specified in `clase.md`.

## Test Case 1: Permission Resilience (PERM-01 to PERM-04)
*Goal: Ensure the app handles permission denials gracefully and allows recovery.*

| Step | Action | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :---: |
| 1.1 | Open Camera and **Deny** permission. | App does not crash. A message explains why permissions are needed. | [ ] |
| 1.2 | Click "Reintentar" or try to open camera again. | App requests permission again (if not permanently denied). | [ ] |
| 1.3 | Permanently deny and click camera. | App provides a button/link to System Settings. | [ ] |

## Test Case 2: AI Identification & Feedback (AI-01 to AI-05)
*Goal: Verify the "Veracity" and "Feedback" requirements from clase.md.*

| Step | Action | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :---: |
| 2.1 | Take a photo of a plant with internet connection. | HUD Scanning animation is visible. | [ ] |
| 2.2 | Review identification results. | Displays Confidence Score (Veracidad), Scientific Name, and Care Info. | [ ] |
| 2.3 | Save the plant. | Plant is saved to Firestore and confirmed via Toast/UI. | [ ] |

## Test Case 3: Offline Functionality (OFFL-01 to STOR-03)
*Goal: Verify the Repository Pattern and Local Storage behavior.*

| Step | Action | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :---: |
| 3.1 | Disable Wi-Fi/Data (Airplane Mode). | Global Offline Banner appears immediately. | [ ] |
| 3.2 | Navigate to "Mis Plantas" list. | List loads instantly from `AsyncStorage` cache. | [ ] |
| 3.3 | Open a plant profile while offline. | Images and details load from local storage/cache. | [ ] |

## Test Case 4: Sync Queue & Recovery (OFFL-04, OFFL-05)
*Goal: Verify the "Messages for content to be synced" requirement.*

| Step | Action | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :---: |
| 4.1 | Capture a plant while offline (Manual Save). | Plant appears in list with a "Pendiente" badge. | [ ] |
| 4.2 | Re-enable internet connection. | Offline Banner shows "Sincronizar" button. | [ ] |
| 4.3 | Press "Sincronizar". | Loader appears; "Pendiente" badge disappears; data is in Firestore. | [ ] |

---
**Verified by:** [User Name]
**Date:** 2026-04-23
**Note:** This UAT covers the technical requirements for the "Parte 2: Desarrollo" and "Parte 3: Video" sections of the activity.
