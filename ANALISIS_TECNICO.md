# Análisis Técnico y Justificación de Decisiones - iPlant

## 1. Identificación de Módulos Offline
Se han identificado y adaptado los siguientes módulos para funcionar sin conexión a internet, garantizando la continuidad operativa de la aplicación:

| Módulo | Funcionalidad Offline | Justificación |
| :--- | :--- | :--- |
| **Mis Plantas (Listado)** | Visualización completa de la colección. | **Prioridad Alta:** El usuario debe poder consultar su jardín y los cuidados de sus plantas en cualquier momento y lugar. |
| **Registro de Plantas** | Captura de fotos y guardado de metadatos. | **Prioridad Alta:** Permite al usuario documentar hallazgos en zonas sin cobertura (jardines, senderos) sin perder la información. |
| **Gestión de Permisos** | Manejo de estados de cámara y galería. | **Resiliencia:** El sistema de permisos es local al SO; la app debe ser capaz de re-solicitarlos y explicar su necesidad sin depender de un servidor. |

**Módulos que requieren Internet:**
*   **Identificación IA:** La complejidad del modelo de visión computacional de Plant.id requiere procesamiento en la nube. Se maneja mediante un estado de error controlado que permite el "Guardado Manual" como alternativa.

---

## 2. Justificación de Almacenamiento Local (Comparativa)
Se analizó el uso de diversas tecnologías para la persistencia de datos, decidiendo implementar una **Estrategia Híbrida** tras evaluar los siguientes puntos:

### A. Imágenes: FileSystem vs. SQLite/AsyncStorage
*   **Decisión:** `expo-file-system`.
*   **Justificación (El "vs"):** 
    *   Guardar imágenes como strings Base64 en **AsyncStorage** o **SQLite** aumentaría el tamaño de la base de datos exponencialmente, superando el límite de 6MB-10MB y degradando el rendimiento de la app (lentitud al arrancar).
    *   **FileSystem** permite manejar archivos binarios de gran tamaño de forma nativa, consumiendo menos memoria RAM y permitiendo una carga de imagen casi instantánea mediante URIs locales.

### B. Metadatos: AsyncStorage vs. Raw Files
*   **Decisión:** `@react-native-async-storage/async-storage`.
*   **Justificación (El "vs"):**
    *   Aunque los archivos de texto planos serían una opción, **AsyncStorage** ofrece un motor de llave-valor optimizado para React Native que facilita la serialización de objetos JSON (nuestras plantas).
    *   Permite marcar estados de sincronización (`isPending: true/false`) de forma más ágil que sobrescribir archivos completos cada vez que un registro cambia.

### C. Estrategia: Local-First vs. Network-Only
*   **Decisión:** Arquitectura *Local-First* con **Sync Queue**.
*   **Justificación (El "vs"):**
    *   En un modelo **Network-Only**, la app fallaría o mostraría pantallas vacías ante la mínima inestabilidad de red.
    *   Al priorizar el guardado local, el usuario percibe una app "siempre disponible". La sincronización ocurre en segundo plano de forma transparente, cumpliendo con la resiliencia exigida en la Parte 1 de la actividad.

---

## 3. Estrategias de UX y Mensajería
Para cumplir con el requerimiento de informar al usuario sobre el estado de sus datos, se implementaron las siguientes soluciones:

1.  **Banner de Conectividad (Global):**
    *   Un banner persistente con posicionamiento absoluto que indica "Sin conexión" (en color naranja) o "Conexión restaurada" (en color verde/azul).
    *   **Justificación:** No interrumpe la navegación pero mantiene al usuario consciente del estado de sus datos.
2.  **Badge de "Pendiente":**
    *   Las plantas guardadas offline muestran una etiqueta visual de "Pendiente" en la lista principal.
    *   **Justificación:** Transmite transparencia sobre qué contenido está solo en el dispositivo y qué contenido ya está respaldado en la nube.
3.  **Feedback de Sincronización:**
    *   Uso de indicadores de carga (`ActivityIndicator`) y mensajes de "Sincronizando cambios..." en el banner para confirmar que el proceso de subida está activo.

---

## 4. Gestión de Errores y Resiliencia
*   **Timeout Controlado:** Se implementó una utilidad `withTimeout` para las llamadas a Firebase. Si la red es inestable, la app deja de esperar a los 8 segundos y activa automáticamente el modo offline, evitando que la interfaz se congele.
*   **Silenciamiento de Errores de Red:** Las excepciones de red se capturan y se transforman en `console.warn` internos, cargando el caché local de forma silenciosa para que el usuario no vea pantallas de error (RedBoxes) disruptivas.

---

**Repositorio:** [Link al repositorio aquí]
**Video Demostrativo:** [Link al video aquí]
**Backend (Render):** [Link al API aquí]
