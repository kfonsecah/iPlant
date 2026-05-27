# Actividad 3 — iPlant

**Curso:** Desarrollo de Aplicaciones Móviles
**Aplicación:** iPlant — Gestión e Identificación de Plantas con IA


---

## Parte 1: Análisis de la aplicación

### Módulos requeridos — Actividad 3

| Módulo | Estado | Descripción |
|---|---|---|
| Identificación de plantas con IA | Completo | La cámara captura una imagen, se envía al backend en Render que consulta Plant.id y devuelve el nombre, confianza y datos de la planta. |
| Manejo de permisos de cámara | Completo | Se solicita permiso al usuario. Si es denegado, se redirige a los ajustes del sistema. Al volver a la app se re-evalúa el permiso automáticamente. |
| Modo offline y almacenamiento local | Completo | Se detecta la conectividad en tiempo real. Las operaciones sin conexión se guardan en una cola local (AsyncStorage) y se sincronizan con Firebase al reconectar. |
| Deploy del backend en Render | Completo | Backend propio desplegado en Render. Actúa de intermediario entre la app y Plant.id, protegiendo la API key. |

### Funcionalidades adicionales completadas

| Funcionalidad | Estado |
|---|---|
| Autenticación (Google + email/password) | Completo |
| Mis Plantas (lista, detalle, edición) | Completo |
| Diario de Salud con score de IA | Completo |
| Asistente IA (chat con contexto de plantas) | Completo |
| Marketplace (tiendas, plantas, florerías) | Completo |
| Perfil de usuario con avatar | Completo |
| Pantalla Premium | Completo |

### Estimación de completitud

La aplicación se encuentra al **95% de funcionalidad**. Todos los módulos requeridos están implementados y la app es funcional de extremo a extremo.

---

## Parte 2: Funcionalidades diferenciadoras

### Funcionalidad 1 — "Arma tu Ramo"

Constructor interactivo de ramos integrado en la sección de Florerías del Marketplace. El usuario elige flores de florerías locales reales, las ve animadas formando un ramo en tiempo real, y envía el pedido directamente por WhatsApp.

**Qué ofrece al cliente:**

- **Visualización previa:** El cliente compone su ramo visualmente antes de comprarlo, viendo colores, combinaciones y cantidades en tiempo real.
- **Efecto de profundidad real:** Las flores aparecen insertadas entre dos capas del papel de envoltura, creando la ilusión tridimensional de un ramo físico.
- **Pedido directo por WhatsApp:** Al confirmar el ramo, la app genera automáticamente un mensaje con el desglose completo de flores y precio total listo para enviar a la floristería.
- **Hasta 25 flores individuales:** Cada unidad de flor ocupa su propio espacio en el ramo, permitiendo composiciones ricas y personalizadas.

Ninguna app de gestión de plantas del curso ofrece una experiencia de compra visual de flores. "Arma tu Ramo" cruza el cuidado de plantas en casa con la florería local, agregando valor comercial real a la aplicación, diseñada específicamente para el mercado de florerías locales de Costa Rica.

---

### Funcionalidad 2 — Asistente IA de Plantas

Chat inteligente integrado en la app que responde preguntas sobre el cuidado, enfermedades e identificación de plantas usando el contexto de las plantas registradas por el usuario.

**Qué ofrece al cliente:**

- **Consultas personalizadas:** El asistente conoce las plantas del usuario y da recomendaciones específicas para su colección, no respuestas genéricas.
- **Disponibilidad inmediata:** Reemplaza la necesidad de buscar en internet o consultar foros — el usuario tiene un experto en plantas disponible en todo momento dentro de la misma app.
- **Complemento a la identificación con IA:** Tras identificar una planta nueva, el usuario puede preguntarle directamente al asistente cómo cuidarla o qué enfermedades puede tener.

El asistente convierte a iPlant en un acompañante activo del cuidado de plantas, no solo un registro pasivo. La combinación de identificación con IA más asistente conversacional es lo que distingue a iPlant de una simple app de catálogo.

---

## Parte 3: Links de entrega

- **Repositorio:** [github.com/kfonsecah/iPlant](https://github.com/kfonsecah/iPlant)
- **Backend Render:** [https://iplant-cz8o.onrender.com](https://iplant-cz8o.onrender.com)

