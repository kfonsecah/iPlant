# Debug: Expo File System Legacy Method

**Issue:** `Error: Method getInfoAsync imported from expo-file-system is deprecated`
**Root Cause:** Recent update in `expo-file-system` deprecated `getInfoAsync` in favor of a new API using `File` and `Directory` classes, but the current implementation still uses the method-based API.
**Fix:** Switched import from `expo-file-system` to `expo-file-system/legacy` as recommended by the error message. This maintains compatibility with the existing code while resolving the deprecation warning.

## Affected Files
- `src/services/storageService.ts`

## Verification
- Code changed to use legacy import.
- Unit tests for plant service (which uses storage service) should pass.
