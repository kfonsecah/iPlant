# Phase 1: AI Plant Identification - Research

**Researched:** 2026-04-23
**Status:** Research complete, ready for planning

---

## API Integration

### Plant.id API

**Endpoint:** `https://api.plant.id/v3/identification`

**Request:**
```json
{
  "images": ["base64_encoded_image"],
  "latitude": 49.207,
  "longitude": 16.608,
  "similar_images": true
}
```

**Headers:**
- `Api-Key`: {PLANT_ID_API_KEY}
- Content-Type: application/json

**Response Structure:**
```json
{
  "suggestions": [
    {
      "id": 123,
      "plant_name": "Monstera deliciosa",
      "probability": 0.85,
      "description": "Plant description...",
      "wiki_description": {
        "title": "Monstera deliciosa",
        "extract": "Care instructions..."
      }
    }
  ]
}
```

### Free Tier Limits
- 100 free credits per month
- 1 identification = ~1 credit
- API key from https://web.plant.id/ (register for free)

---

## React Native Image Handling

### Image to Base64 (for Plant.id)

```typescript
import * as FileSystem from 'expo-file-system';

async function imageToBase64(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}
```

**Note:** Plant.id expects image data URI format: `data:image/jpeg;base64,{base64_string}`

### Alternative: expo-image-picker returns local URI
- `const result = await ImagePicker.launchCameraAsync(...)`
- Result.uri gives local file path
- Must convert to base64 before API call

---

## Confidence Display

### Thresholds (from CONTEXT.md D-02)
| Level | Range | Color |
|-------|-------|-------|
| Alta (High) | ≥70% | Green |
| Media (Medium) | 40-69% | Yellow |
| Baja (Low) | <40% | Red |

### UI Implementation
- Display as percentage: "85% de confianza"
- Color-coded badge next to plant name
- Show full confidence bar on detail view

---

## Error Handling

### API Errors
| Error | Handling |
|-------|----------|
| Invalid API key | Show "Configuration error" - developer must fix |
| Network timeout | Retry once, then show "Connection failed - check internet" |
| Rate limit (429) | Show "Too many requests - try again later" |
| No plant identified | Show "No se pudo identificar la planta - intenta con otra foto" |

### Loading State
- Show activity indicator during API call
- Disable form submission while identifying
- Typical API response time: 3-10 seconds

---

## Integration with Existing Code

### Existing Files to Modify
1. **CameraScreen.tsx** - Already captures photo, will add AI button
2. **PlantService.ts** - Add `identifyPlant(imageBase64)` method
3. **CreatePlantScreen.tsx** - Add AI identification step to form
4. **plant.types.ts** - Extend with AI fields (confidence, description, care)

### Flow (from CONTEXT.md D-04)
1. User taps camera button → takes photo
2. Tap "Identificar" → call Plant.id API
3. Display results with confidence score
4. Form pre-filled with AI data (editable)
5. User taps "Guardar" → save to Firestore via plantService

---

## Security Considerations

- **API Key:** Store in `app.json` or environment, never commit to repo
- **Image data:** Only send to Plant.id API, not other services
- **User photos:** Optionally cache locally for offline identification later

---

## References

- Plant.id API Docs: https://web.plant.id/plant-identification-api/
- expo-file-system: https://docs.expo.dev/versions/latest/sdk/filesystem/
- expo-image-picker: https://docs.expo.dev/versions/latest/sdk/imagepicker/

---

*Research completed for Phase 1 planning*