# Análisis Técnico y Justificación de Decisiones - iPlant

Este documento detalla la arquitectura de persistencia, sincronización y manejo de IA para el proyecto iPlant, cumpliendo con los requerimientos de la Actividad 3 del Laboratorio a cargo de **Kendall Fonseca Hidalgo**.

---


## 1. Identificación y Priorización de Módulos Offline
Se han adaptado los módulos críticos para garantizar que la App sea funcional en entornos sin cobertura (jardines, senderos, invernaderos), permitiendo que el usuario no pierda información valiosa.

| Módulo | Estado Offline | Justificación de Prioridad (UX/Negocio) |
| :--- | :--- | :--- |
| **Mis Plantas (Listado)** | **Disponible** | **Crítico:** El usuario debe poder consultar los cuidados de su planta (riego, luz) en el sitio exacto donde se encuentra la planta, sin depender de internet. |
| **Registro de Plantas** | **Disponible** | **Alta:** Permite documentar hallazgos en zonas rurales o jardines profundos. Los datos se encolan localmente y se sincronizan automáticamente al recuperar señal. |
| **Perfil de Usuario** | **Disponible** | **Media:** Mantiene la identidad del usuario y sus estadísticas (racha de cuidado) visibles, reforzando la conexión emocional con su jardín. |
| **Identificación por IA** | **No Disponible** | **Limitación Técnica:** El procesamiento de visión computacional requiere la infraestructura en la nube de Plant.id v3. Se ofrece "Guardado Manual" como alternativa para no bloquear el flujo. |

--- 

## 2. Justificación de Almacenamiento Local (Decisiones Técnicas)
Se implementó una **Estrategia Híbrida** para optimizar el rendimiento del dispositivo y la integridad de los datos.

### A. Metadatos: AsyncStorage vs SQLite
*   **Decisión:** `@react-native-async-storage/async-storage`.
*   **Justificación:** Dado que nuestra estructura de datos de plantas es un esquema JSON simple y no requiere consultas relacionales complejas (JOINs), AsyncStorage ofrece el mejor balance entre velocidad de desarrollo y rendimiento en lectura/escritura para objetos serializados.

### B. Imágenes: FileSystem vs Base64
*   **Decisión:** `expo-file-system`.
*   **Justificación:** Guardar imágenes como strings Base64 en la base de datos saturaría la memoria RAM y aumentaría el tiempo de carga de la App. Al usar el FileSystem, manejamos archivos binarios de forma nativa, permitiendo que la App cargue las fotos casi instantáneamente usando URIs locales.

### C. Sincronización: Sync Queue (Cola de Sincronización)
*   Se implementó una arquitectura **Local-First**. Cada cambio se guarda primero en el dispositivo y luego se añade a una cola persistente. Esto asegura que, incluso si la App se cierra antes de sincronizar, los datos se subirán al servidor en la próxima oportunidad.

---

## 3. Lista de Pantallas y Uso de Almacenamiento
A continuación se listan las pantallas que utilizan activamente el almacenamiento local:

1.  **Pantalla "Mis Plantas" (Home):** Recupera y cachea el listado completo desde `AsyncStorage`.
2.  **Pantalla "Cámara / Captura":** Utiliza el `FileSystem` para mover las fotos temporales a una carpeta permanente de la App.
3.  **Pantalla "Detalle de Planta":** Almacena los resultados detallados de la IA y guías de cuidado localmente.
4.  **Pantalla "Perfil":** Persiste la racha (streak) y datos de personalización del usuario.

---

## 4. Estrategias de UX sin Conexión
Para cumplir con los estándares de usabilidad, la App informa proactivamente al usuario sobre su estado:

*   **Offline Banner:** Un indicador visual en la parte superior que cambia dinámicamente según el estado de la red (detectado vía `@react-native-community/netinfo`).
*   **Indicator de Pendiente (Cloud icon):** Las plantas guardadas sin internet muestran una etiqueta de "Pendiente" y un icono de nube, indicando que el dato aún no está en la nube.
*   **Toasts de Sincronización:** Mensajes flotantes que confirman al usuario cuando sus plantas locales han sido subidas exitosamente al servidor.

---

## 5. Veracidad de la Información (IA)
Para asegurar que el usuario confíe en los resultados de la identificación:
*   **Confidence Badge:** Se muestra un "Índice de Confianza" (probabilidad %) obtenido de la IA.
*   **Filtro de Sugerencias:** Solo se presentan los resultados con mayor probabilidad, advirtiendo al usuario si la calidad de la foto no permite una identificación certera.
*   **Feedback Botánico:** Se entregan nombres científicos y descripciones detalladas para que el usuario pueda validar visualmente la información.

---

**Link del Repositorio:** https://github.com/kfonsecah/iPlant.git  
**Link del Video Demostrativo:** https://drive.google.com/file/d/1BgprKlJ2LqJIlJ1ZKhTSys9SL8UEsPmY/view?usp=sharing  
**Backend en Render:** https://iplant.onrender.com
