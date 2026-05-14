# iPlant — Login Screen con Parallax Giroscopio

## Stack
- Expo SDK 54, TypeScript, Expo Router v4
- react-native-reanimated v3 (ya instalado)
- expo-sensors (instalar si no está: `npx expo install expo-sensors`)

## Assets
Ya están en `assets/images/`:
- `layer1.jpeg` — cielo nocturno, fondo opaco (base)
- `layer3.png` — hojas primer plano, PNG con alpha transparente

---

## Archivo 1: `components/ParallaxBackground.tsx`

- 2 imágenes apiladas en `position: absolute`, sin `mixBlendMode`
- Giroscopio con `DeviceMotion` de `expo-sensors`
- Cada capa se mueve a distinta velocidad con `useSharedValue` + `useAnimatedStyle` + `withSpring`
- `ParallaxLayer` como componente separado (Rules of Hooks)
- `MAX_OFFSET = 35` — margen extra en todos los lados para evitar bordes vacíos
- Spring: `damping: 18, stiffness: 80`
- Gyro: `rotation.gamma` → X, `rotation.beta` → Y, clamp entre -1 y 1
- `setUpdateInterval(16)` para ~60fps
- `requestPermissionsAsync()` para iOS 13+
- Si DeviceMotion no disponible (simulador) → capas estáticas, sin error
- `children` se renderizan encima con `zIndex: 10`

```ts
const LAYERS = [
  { source: require('../assets/images/layer1.jpeg'), factor: 0.06 },
  { source: require('../assets/images/layer3.png'),  factor: 0.55 },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', overflow: 'hidden' },
  layer: {
    position: 'absolute',
    top: -MAX_OFFSET, left: -MAX_OFFSET,
    width: W + MAX_OFFSET * 2,
    height: H + MAX_OFFSET * 2,
  },
  image: { width: '100%', height: '100%' },
  content: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
});
```

---

## Archivo 2: `app/(auth)/login.tsx`

Envolver todo en `<ParallaxBackground>` + `KeyboardAvoidingView` + `ScrollView`.

**Layout centrado verticalmente:**
```
[flex: 1]
  Ionicons "leaf" — size 52, color #4ade80, glow verde
  "iPlant" — fontSize 38, fontWeight 300, color white, letterSpacing -1
  "Tu jardín inteligente" — fontSize 13, color rgba(255,255,255,0.5), letterSpacing 3, uppercase
  [gap 48]
  Input email   (icono mail-outline izquierda)
  Input password (icono lock-closed-outline izq, toggle eye der)
  "¿Olvidaste tu contraseña?" — right aligned, color rgba(255,255,255,0.45)
  [gap 24]
  Botón "Iniciar sesión" — bg #4ade80, text negro, borderRadius 14, height 52, sombra verde
  Divider "o continúa con"
  Botón "G Continuar con Google" — bg rgba(255,255,255,0.08), border sutil
  [gap 20]
  "¿No tienes cuenta? Regístrate" — Regístrate en #4ade80
[flex: 1]
```

**Inputs:**
```ts
{
  backgroundColor: 'rgba(255,255,255,0.07)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  borderRadius: 14,
  height: 52,
  color: '#fff',
  placeholderTextColor: 'rgba(255,255,255,0.35)',
}
```

**Estado:**
```ts
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState('');
```

**Notas:**
- `StatusBar` translucent, barStyle light
- NO usar `SafeAreaView`
- Error en `#f87171` debajo de los inputs
- Google sign in: solo `console.log('TODO')` por ahora
- Íconos: `@expo/vector-icons` Ionicons