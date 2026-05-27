# Auditoría de Código — marketplace.tsx

---

## CRITICO

### 1. `createStyles` sin `useMemo` — recrea todos los estilos en cada render
**Línea:** 617
**Código problemático:**
```ts
const styles = createStyles(theme);
```
**Problema:** `createStyles` llama internamente a `StyleSheet.create` con ~80 definiciones de estilo. Al estar fuera de `useMemo`, se ejecuta en cada re-render del componente. Con `searchQuery` disparando actualizaciones en cada tecla, esto es constante y costoso.

**Fix:**
```ts
const styles = useMemo(() => createStyles(theme), [theme]);
```

---

### 2. `openBouquetBuilder` usa `expand()` — mismo bug del store modal
**Línea:** 758
**Código problemático:**
```ts
bouquetSheetRef.current?.expand();
```
**Problema:** Si el sheet ya está abierto (floristería 1) y el usuario abre otra (floristería 2), `expand()` es un no-op porque el sheet ya está en esa posición. El estado `selectedFlorist` se actualiza pero el contenido del sheet no se re-renderiza. El usuario siempre ve la primera floristería abierta.

**Fix:**
```ts
bouquetSheetRef.current?.snapToIndex(0);
```

---

### 3. Imagen de publicación guardada como URI local en Firestore
**Línea:** 817
**Código problemático:**
```ts
imagen: addImage || "",
```
**Problema:** `addImage` contiene un URI `file://` del sistema de archivos local del dispositivo. Se persiste directamente en Firestore sin subir a Firebase Storage. Cualquier otro usuario que consulte el listing verá la imagen rota. El mismo usuario también la perderá al limpiar la caché o cambiar de dispositivo.

**Fix:** Subir la imagen a Firebase Storage antes del `addDoc` y guardar la URL de descarga pública.

---

### 4. Memory leak — `maxToastTimeout` no se limpia al desmontar
**Líneas:** 651, 750–752
**Código problemático:**
```ts
const maxToastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

maxToastTimeout.current = setTimeout(() => setShowMaxToast(false), 2000);
```
**Problema:** No existe un `useEffect` de cleanup que cancele el timeout al desmontar el componente. Si el usuario navega fuera de la pantalla mientras el toast está activo, el timeout intenta llamar `setShowMaxToast(false)` sobre un componente ya desmontado, causando un warning y potencial crash.

**Fix:**
```ts
useEffect(() => {
  return () => {
    if (maxToastTimeout.current) clearTimeout(maxToastTimeout.current);
  };
}, []);
```

---

## MALO

### 5. Variable `prevActiveKeys` declarada pero nunca usada (código muerto)
**Línea:** 456
**Código problemático:**
```ts
const prevActiveKeys = new Set(prevActive.map((p) => p.pinKey));
```
**Problema:** Esta variable quedó de una versión anterior de la lógica de sincronización del bouquet. Nunca se lee. Genera confusión y ruido en el código.

**Fix:** Eliminarla.

---

### 6. `PRIMARY` hardcodeado fuera del sistema de temas
**Línea:** 116
**Código problemático:**
```ts
const PRIMARY = "#4ade80";
```
**Problema:** Este color se usa en 6+ lugares del archivo (FAB, botón Maps, ActivityIndicator, etc.) pero está desacoplado del tema. Si `theme.colors.primary` cambia, este valor queda desfasado y genera inconsistencias visuales.

**Fix:** Eliminar la constante y usar `theme.colors.primary` directamente en cada punto de uso.

---

### 7. Dependencias faltantes en `useEffect` de `BouquetFlowerPin`
**Líneas:** 376–381 y 384–391
**Código problemático:**
```ts
useEffect(() => {
  if (!isExiting) {
    svLeft.value = withSpring(targetLeft, ...);
    svTop.value  = withSpring(targetTop, ...);
  }
}, [slotIndex, containerWidth]); // falta: targetLeft, targetTop

useEffect(() => {
  if (isExiting) {
    svScale.value   = withTiming(0, ...);
    svOpacity.value = withTiming(0, ..., (finished) => {
      if (finished) runOnJS(onExitDone)();
    });
  }
}, [isExiting]); // falta: onExitDone
```
**Problema:** `targetLeft` y `targetTop` dependen de `containerWidth` y `slotIndex` por lo que en ese efecto están indirectamente cubiertos, pero `onExitDone` puede capturar una versión obsoleta del callback si la referencia cambia entre renders.

**Fix:** Estabilizar `onExitDone` con `useCallback` en el componente padre (ya está hecho) y agregar al array de deps: `[isExiting, onExitDone]`.

---

### 8. `renderBackdrop` con tipo `unknown` y cast inseguro
**Líneas:** 837–845
**Código problemático:**
```ts
const renderBackdrop = useCallback(
  (props: unknown) => (
    <BottomSheetBackdrop
      {...(props as object)}
      ...
    />
  ),
  []
);
```
**Problema:** Tipar `props` como `unknown` y luego castearlo a `object` para hacer spread es inseguro. Si `props` tuviera un valor no-objeto, el spread fallaría en runtime.

**Fix:**
```ts
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

const renderBackdrop = useCallback(
  (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} ... />
  ),
  []
);
```

---

### 9. `renderListingCard` definido como función inline sin `useCallback`
**Línea:** 855
**Código problemático:**
```ts
const renderListingCard = (listing: MarketplaceListing) => (
  <View key={listing.id} ...>
    ...
  </View>
);
```
**Problema:** Se recrea en cada render del componente padre. Para una lista que puede crecer, fuerza re-renders innecesarios en cada cambio de estado (search, tabs, etc.).

**Fix:** Extraerla como componente separado o envolverla en `useCallback`.

---

## Resumen

| # | Problema | Severidad | Impacto |
|---|----------|-----------|---------|
| 1 | `createStyles` sin `useMemo` | CRITICO | Performance — estilos recreados en cada tecla |
| 2 | `expand()` en bouquet sheet | CRITICO | Bug funcional — siempre muestra la primera floristería |
| 3 | Imagen local en Firestore | CRITICO | Bug de datos — imágenes rotas para otros usuarios |
| 4 | Memory leak toast timeout | CRITICO | Crash potencial al navegar |
| 5 | `prevActiveKeys` no usada | MALO | Código muerto |
| 6 | `PRIMARY` hardcodeado | MALO | Inconsistencia de tema |
| 7 | Deps faltantes en `useEffect` | MALO | Stale closure en animaciones |
| 8 | Tipo inseguro en backdrop | MALO | TypeScript — cast inseguro |
| 9 | `renderListingCard` sin memo | MALO | Performance menor |
