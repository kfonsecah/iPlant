# iPlant — Design System & Especificación de Diseño Móvil

Documentación del sistema de diseño implementado en el proyecto **iPlant**, construido con **React Native + Expo Router**.

---

## Índice

1. [Estructura del proyecto](#1-estructura-del-proyecto)
2. [Tokens de diseño](#2-tokens-de-diseño)
   - 2.1 [Colores](#21-colores)
   - 2.2 [Tipografía](#22-tipografía)
   - 2.3 [Espaciado](#23-espaciado)
   - 2.4 [Bordes y radio](#24-bordes-y-radio)
3. [Tokens adicionales](#3-tokens-adicionales)
4. [Implementación en la app](#4-implementación-en-la-app)
   - 4.1 [Uso del tema](#41-uso-del-tema)
   - 4.2 [Navegación](#42-navegación)
   - 4.3 [Pantallas implementadas](#43-pantallas-implementadas)

---

## 1. Estructura del proyecto

```
app/
├── _layout.tsx             ← Root layout (fuentes, splash)
└── (app)/
    └── (tabs)/
        ├── _layout.tsx     ← Tab navigator con BottomTabBar personalizado
        ├── plants.tsx      ← Pantalla Mis Plantas
        └── profile.tsx     ← Pantalla Perfil de usuario
src/
├── components/
│   ├── bottomTabBar/       ← Barra de navegación inferior custom
│   └── screenWrapper/      ← Wrapper de pantalla con fondo del tema
├── screens/
│   ├── misPlants/          ← Lógica y estilos de Mis Plantas
│   └── userProfile/        ← Lógica y estilos del Perfil
└── theme/
    └── desingSystem.ts     ← Fuente única de verdad del Design System
```

---

## 2. Tokens de diseño

Todos los tokens viven en `src/theme/desingSystem.ts` y se acceden mediante el hook `useTheme()`, que resuelve automáticamente el modo claro u oscuro del dispositivo.

```ts
import { useTheme } from "@/src/theme/desingSystem";

const theme = useTheme();
```

---

### 2.1 Colores

El sistema soporta **modo claro y oscuro** con un mapa de colores semántico. Los colores de marca principal son verdes esmeralda.

#### Paleta modo oscuro

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#34D399` | Botones, íconos activos, accents |
| `primaryPressed` | `#059669` | Estado pressed del primary |
| `primaryDisabled` | `#1A3D2F` | Estado disabled del primary |
| `secondary` | `#86EFAC` | Elementos secundarios |
| `secondaryPressed` | `#4ADE80` | Estado pressed del secondary |
| `secondaryDisabled` | `#1E3A28` | Estado disabled del secondary |
| `background` | `#0D1117` | Fondo de pantalla |
| `surface` | `#161B22` | Cards, headers, tab bar |
| `surfaceElevated` | `#1C2128` | Chips, superficies elevadas |
| `border` | `#21262D` | Bordes de cards y divisores |
| `textPrimary` | `#E6EDF3` | Texto principal |
| `textSecondary` | `#8B949E` | Texto secundario, labels |
| `textOnAccent` | `#FFFFFF` | Texto sobre fondos de color |
| `error` | `#F87171` | Errores |
| `errorPressed` | `#DC2626` | Estado pressed del error |
| `errorDisabled` | `#3D1515` | Estado disabled del error |
| `success` | `#34D399` | Confirmaciones |
| `disabled` | `#21262D` | Fondo de elementos deshabilitados |
| `disabledText` | `#4B5563` | Texto deshabilitado |
| `overlay` | `#00000099` | Overlays y modales |
| `tabBarActive` | `#34D399` | Ícono de tab activo |
| `tabBarInactive` | `#4B5563` | Ícono de tab inactivo |

#### Paleta modo claro

| Token | Valor |
|---|---|
| `primary` | `#059669` |
| `background` | `#FFFFFF` |
| `surface` | `#F9FAFB` |
| `textPrimary` | `#111827` |
| `textSecondary` | `#4B5563` |
| `border` | `#D1D5DB` |
| `tabBarActive` | `#34D399` |
| `tabBarInactive` | `#9CA3AF` |

> La conmutación entre paletas es automática vía `useColorScheme()` de React Native — no se requiere ningún proveedor de contexto adicional.

---

### 2.2 Tipografía

**Familia de fuentes:** [Inter](https://fonts.google.com/specimen/Inter), cargada con `@expo-google-fonts/inter`.

| Token | Fuente | Uso |
|---|---|---|
| `fontFamily.regular` | `Inter_400Regular` | Cuerpo de texto, descripciones |
| `fontFamily.medium` | `Inter_500Medium` | Labels, tabs |
| `fontFamily.semibold` | `Inter_600SemiBold` | Nombres, subtítulos |
| `fontFamily.bold` | `Inter_700Bold` | Títulos de pantalla, valores destacados |

#### Estilos de texto semánticos

| Estilo | Tamaño | Peso | Line Height | Uso |
|---|---|---|---|---|
| `title` | 24 px | 700 | 32 | Títulos de pantalla, hero text |
| `subtitle` | 18 px | 600 | 26 | Cabeceras de sección |
| `body` | 16 px | 400 | 24 | Contenido principal legible |
| `caption` | 12 px | 400 | 16 | Metadatos, texto de ayuda |
| `button` | 14 px | 600 | 20 | Etiquetas de botones CTA |
| `overline` | 11 px | 500 | 16 | Categorías, tags |

#### Escala numérica de tamaños (`theme.typography.fontSizes`)

| Token | px | | Token | px |
|---|---|---|---|---|
| `xs` | 10 | | `2xl` | 16 |
| `sm` | 11 | | `3xl` | 17 |
| `base` | 12 | | `4xl` | 18 |
| `md` | 13 | | `5xl` | 20 |
| `lg` | 14 | | `6xl` | 22 |
| `xl` | 15 | | `7xl` | 24 |

---

### 2.3 Espaciado

Escala de **4 pt grid**, alineada con Material Design y Apple HIG.

#### Escala semántica (`theme.scale`)

| Token | px | Uso típico |
|---|---|---|
| `xs` | 4 | Micro gaps, nudges de íconos |
| `sm` | 8 | Separación compacta entre elementos relacionados |
| `md` | 12 | Padding interior de chips y badges |
| `base` | 16 | Padding de contenido por defecto |
| `lg` | 24 | Separación entre secciones |
| `xl` | 32 | Breathing room en secciones grandes |
| `2xl` | 40 | Espaciado a nivel de pantalla / hero |

#### Escala nombrada (`theme.spacing`)

| Token | px | | Token | px |
|---|---|---|---|---|
| `s0` | 0 | | `s14` | 14 |
| `s2` | 2 | | `s16` | 16 |
| `s4` | 4 | | `s18` | 18 |
| `s6` | 6 | | `s20` | 20 |
| `s8` | 8 | | `s22` | 22 |
| `s12` | 12 | | `s44` | 44 |

---

### 2.4 Bordes y radio

#### Radio de bordes (`theme.radius`)

| Token | px | Uso |
|---|---|---|
| `sm` | 12 | Botones secundarios, inputs |
| `md` | 14 | Cards compactas, chips |
| `lg` | 16 | Cards de plantas |
| `xl` | 20 | Cards principales |
| `pill` | 20 | Chips de categoría, pills de estado |
| `full` | 40 | Headers redondeados, arco del tab bar |
| `avatar` | 46 | Wrapper exterior del avatar |
| `centerButton` | 32 | Botón central flotante del tab bar |

#### Grosor de bordes (`theme.borders`)

| Token | dp | Uso |
|---|---|---|
| `none` | 0 | Sin borde |
| `thin` | 1 | Borde estándar de cards y separadores |
| `avatarRing` | 2.5 | Anillo del avatar con color `primary` |

---

## 3. Tokens adicionales

### Sombras (`theme.shadows`)

| Token | Uso |
|---|---|
| `card` | Elevación estándar de cards y contenedores |
| `centerButton` | Glow verde del botón de cámara (sombra coloreada con `primary`) |

### Opacidad (`theme.opacity`)

| Token | Valor | Uso |
|---|---|---|
| `backgroundTexture` | 0.07 | Imagen de fondo decorativa de pantalla |
| `decorativeImage` | 0.35 | Imágenes decorativas en tarjetas de métricas |
| `categoryCardIcon` | 0.15 | Ícono decorativo en tarjetas de categoría |
| `pressableTab` | 0.70 | Feedback al presionar un tab |
| `pressableButton` | 0.80 | Feedback al presionar un botón |
| `pressableCenterButton` | 0.85 | Feedback al presionar el botón central |

### ZIndex (`theme.zIndex`)

| Token | Valor | Uso |
|---|---|---|
| `arc` | 2 | Arco curvo decorativo del tab bar |
| `centerButton` | 10 | Botón flotante de cámara sobre el tab bar |

---

## 4. Implementación en la app

### 4.1 Uso del tema

El hook `useTheme()` retorna el objeto `AppTheme` completo resuelto para el modo actual del dispositivo:

```ts
// src/theme/desingSystem.ts
export function useTheme(): AppTheme {
  const mode = useColorScheme(); // "light" | "dark" | null
  return getTheme(mode);
}
```

**Patrón de uso en componentes:**

```ts
import { useTheme } from "@/src/theme/desingSystem";
import { createStyles } from "./MiComponente.styles";

export default function MiComponente() {
  const theme = useTheme();
  const styles = createStyles(theme);
  return <View style={styles.card} />;
}
```

**Patrón de estilos (función fábrica):**

```ts
// MiComponente.styles.ts
import { AppTheme } from "@/src/theme/desingSystem";

export const createStyles = (theme: AppTheme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.s16,
    borderWidth: theme.borders.thin,
    borderColor: theme.colors.border,
  },
  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSizes["5xl"],
  },
});
```

---

### 4.2 Navegación

Implementada con **Expo Router** (file-based routing) y un **Tab Navigator** con barra inferior completamente personalizada.

```
/  →  redirige a /profile
│
└── /(app)/(tabs)/
    ├── /profile   ←── Mi Perfil    (UserProfile)
    └── /plants    ←── Mis Plantas  (MisPlants)
```

**Flujo entre pantallas:**

```
┌──────────────────────────────────────────────────────┐
│                 BottomTabBar custom                  │
│  [Para Ti]  [Diagnosticar]  [🌿 cámara]  [Plantas]  [Perfil] │
└──────┬───────────────────────────────────────┬───────┘
       │                                       │
  /profile                                 /plants
(Mi Perfil)                            (Mis Plantas)
```

**Componente `BottomTabBar`** (`src/components/bottomTabBar/BottomTabBar.tsx`):
- Tabs izquierdos: *Para Ti*, *Diagnosticar*
- Botón central flotante (cámara) con sombra coloreada en `primary` y arco curvo decorativo
- Tabs derechos: *Mis Plantas*, *Mi Perfil*
- Respeta el safe area inferior vía `useSafeAreaInsets()`
- Todos los tamaños, colores y espaciados provienen exclusivamente del `theme`

---

### 4.3 Pantallas implementadas

#### Pantalla: Mis Plantas — `/plants`

**Archivo:** `src/screens/misPlants/MisPlants.tsx`

Muestra la colección personal de plantas del usuario con su racha de cuidado.

| Sección | Descripción |
|---|---|
| **Header** | Título + botón de filtros con `borderRadius: full` y sombra de card |
| **Summary card** | Contador de plantas totales, número de categorías y días de racha |
| **Grilla de colección** | Cards de 2 columnas (`47.5%`) con imagen, chip de categoría, nombre y última fecha de riego |

**Tokens aplicados:**

```ts
// Chip de categoría
{
  backgroundColor: theme.colors.accentDim,
  borderColor:     theme.colors.accentWithAlpha,
  borderRadius:    theme.radius.pill,           // 20 dp — forma de píldora
  paddingHorizontal: theme.spacing.s8,
}

// Card de planta
{
  backgroundColor: theme.colors.surface,
  borderRadius:    theme.radius.lg,             // 16 dp
  borderWidth:     theme.borders.thin,          // 1 dp
  borderColor:     theme.colors.border,
  elevation:       theme.shadows.card.elevation,
}

// Nombre de la planta
{
  color:       theme.colors.textPrimary,
  fontFamily:  theme.typography.fontFamily.semibold,
  fontSize:    theme.typography.fontSizes.md,   // 13 px
}
```

---

#### Pantalla: Mi Perfil — `/profile`

**Archivo:** `src/screens/userProfile/UserProfile.tsx`

Muestra el perfil detallado del usuario autenticado.

| Sección | Descripción |
|---|---|
| **Profile card** | Banner fotográfico, avatar flotante con anillo `primary`, nombre, handle, pill de privacidad, descripción y acciones (editar / compartir) |
| **Metrics card** | 4 métricas en cards horizontales: Plantas, Amigos, Racha, Cumpleaños — con imagen decorativa semitransparente |
| **Planta favorita** | Imagen a ancho completo con nombre en cursiva |
| **Categorías** | Grilla de cards con ícono de gran tamaño en baja opacidad |

**Tokens aplicados:**

```ts
// Anillo del avatar
{
  borderRadius: theme.radius.avatar,            // 46 dp
  borderWidth:  theme.borders.avatarRing,       // 2.5 dp
  borderColor:  theme.colors.primary,           // #34D399
}

// Botón editar perfil
{
  borderRadius:    theme.radius.md,             // 14 dp
  backgroundColor: theme.colors.backgroundChip,
  borderWidth:     theme.borders.thin,
}

// Botón compartir
{
  backgroundColor: theme.colors.primary,
  borderRadius:    theme.radius.sm,             // 12 dp
  width:  theme.dimensions.shareButton.width,  // 42 dp
  height: theme.dimensions.shareButton.height, // 42 dp
}

// Ícono decorativo de categoría
{
  opacity: theme.opacity.categoryCardIcon,      // 0.15
  fontSize: theme.dimensions.categoryIconSize,  // 68 dp
}
```

   ```

