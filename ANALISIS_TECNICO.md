# Análisis Técnico — iPlant (Actividad 4)

## 1. Investigación y Análisis

### 1.1 Módulos Identificados y Estado de la Aplicación
Al inicio de esta fase, se identificaron los siguientes vacíos funcionales necesarios para llevar la aplicación de un estado "Base" a un estado "Completo (90%+)":

1.  **Detalle de Planta Extendido**: La aplicación solo listaba nombres y categorías. Se requería una vista detallada que aprovechara los metadatos botánicos de la IA.
2.  **Gestión de Colección (CRUD Completo)**: Faltaba la capacidad de eliminar registros y realizar búsquedas eficientes dentro de la colección personal.
3.  **Visualización de Datos Botánicos**: Integración de información sobre taxonomía, riego, luz solar y propagación.
4.  **Feedback de Sincronización**: Indicadores claros de qué datos están guardados localmente vs en la nube.

**Estado Actual**: La aplicación cumple con más del 90% de la funcionalidad esperada, integrando identificación por IA, sincronización offline-first, búsqueda, eliminación y visualización detallada.

### 1.2 Función Propia: Narrador de Cuidados con IA
**Descripción**: Se ha diseñado e implementado el "Narrador de Cuidados con IA" utilizando el SDK de `expo-speech`.
**Valor Agregado**:
*   **Accesibilidad**: Permite a usuarios con discapacidad visual o dificultades de lectura acceder a las instrucciones de cuidado de sus plantas.
*   **Usabilidad (Hands-free)**: El usuario puede escuchar las instrucciones de riego y luz mientras tiene las manos ocupadas trabajando con la tierra o regando sus plantas, eliminando la necesidad de interactuar constantemente con la pantalla.
*   **Engagement**: Proporciona una experiencia premium y diferencial frente a otras aplicaciones de identificación que son puramente textuales.

---

## 2. Desarrollo Técnico

### 2.1 Módulos Implementados
*   **Vista Detallada (`PlantDetailScreen`)**: Implementación de una interfaz inmersiva que utiliza gradientes y animaciones para mostrar información científica de la planta.
*   **Buscador Inteligente**: Barra de búsqueda reactiva en la pantalla principal que filtra por nombre común, científico o categoría.
*   **Sistema de Eliminación**: Flujo completo de borrado de datos con confirmación y sincronización en la nube.
*   **Persistencia de Metadatos**: Se expandió el esquema de datos en Firestore y almacenamiento local para incluir 8 nuevos campos botánicos.

### 2.2 Funcionalidad Propia: Implementación
La funcionalidad se integró como un "Action Button" en la vista de detalle. Utiliza el motor de síntesis de voz del sistema para leer una composición dinámica de los metadatos (Nombre, Descripción, Riego, Luz y Familia).

---

## 3. Infraestructura y Despliegue

### 3.1 Backend en Render
*   **URL**: `https://iplant.onrender.com`
*   **Tecnología**: Node.js / Express / TypeScript.
*   **Seguridad**: El backend actúa como proxy para la API de Plant.id, protegiendo la API Key mediante variables de entorno en el servidor.
*   **Endpoints**:
    *   `POST /api/identify`: Proxy de identificación.
    *   `POST /api/plants`: Verificación de creación de plantas en producción.

### 3.2 Sincronización Offline
Se utiliza una estrategia de **Queue-based Synchronization**. Los cambios realizados sin conexión se encolan localmente y se procesan automáticamente cuando el dispositivo detecta red, notificando al usuario mediante badges de estado.

---

## 4. Conclusión
iPlant ha evolucionado de un prototipo de identificación a una herramienta de gestión botánica completa. La integración de la IA no se limita a la identificación, sino que se extiende a la asistencia por voz, cumpliendo con los estándares de diseño y desarrollo solicitados en el curso.
