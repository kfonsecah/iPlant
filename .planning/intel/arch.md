---
updated_at: "2026-04-23T13:30:00Z"
---

## Architecture Overview

This is a React Native mobile application built with **Expo** and **TypeScript**. It uses **Expo Router** for file-based navigation and **NativeWind** (Tailwind CSS for React Native) for styling. The backend is powered by **Firebase** (Auth and Firestore), and it integrates with the **Plant.id API** for AI-based plant identification.

## Key Components

| Component | Path | Responsibility |
|-----------|------|---------------|
| App Entry | `app/index.tsx` | Main entry point for the application. |
| Auth Context | `src/context/AuthContext.tsx` | Manages authentication state and provides it to the app via `useAuth`. |
| Firebase Config | `src/config/firebase.ts` | Initializes Firebase Auth and Firestore instances. |
| Auth Service | `src/services/authService.ts` | Handles user authentication logic (sign in, sign up, Google login). |
| Plant Service | `src/services/plantService.ts` | Handles plant-related operations, including AI identification and CRUD in Firestore. |
| User Service | `src/services/userService.ts` | Manages user profile data in Firestore. |
| Navigation | `app/(app)/_layout.tsx` | Defines the main app navigation structure (tabs and camera). |

## Data Flow

1. **Authentication**: `app/_layout.tsx` (Guard) -> `AuthContext` -> `authService` -> Firebase Auth.
2. **Plant Identification**: `app/(app)/camera.tsx` -> `plantService.identifyPlant` -> Plant.id API -> Result.
3. **Plant Management**: `app/(app)/(tabs)/plants.tsx` -> `plantService.getPlantsByUserId` -> Firestore.
4. **User Profile**: `app/(app)/(tabs)/profile.tsx` -> `userService.getUserProfile` -> Firestore.

## Conventions

- **File-based Routing**: Using Expo Router conventions in the `app/` directory.
- **Service Pattern**: Business logic and API calls are abstracted into services in `src/services/`.
- **Context API**: Global state like authentication is managed via React Context.
- **Type Safety**: TypeScript is used throughout, with DTOs and interfaces defined in `src/types-dtos/`.
- **Styling**: NativeWind for consistent styling using Tailwind CSS classes.
