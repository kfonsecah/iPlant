# Requirements: iPlant — Actividad 3

**Defined:** 2026-04-23
**Core Value:** El usuario puede tomar una foto de una planta, identificarla con IA, y guardarla — con o sin conexión.

## v1 Requirements

### IA Identification

- [ ] **AI-01**: El usuario puede tomar una foto de la planta desde la pantalla de creación y enviársela a la API de IA
- [ ] **AI-02**: La app muestra el nombre de la planta, descripción y cuidados identificados por la IA
- [ ] **AI-03**: La app muestra un indicador de confianza/veracidad de la identificación (porcentaje o nivel)
- [ ] **AI-04**: El usuario puede aceptar o editar la información identificada antes de guardarla
- [ ] **AI-05**: La información identificada se guarda en la base de datos del backend al confirmar

### Camera Permissions

- [ ] **PERM-01**: Si el usuario deniega permisos de cámara, la app sigue funcionando (sin crash)
- [ ] **PERM-02**: La app muestra un mensaje claro explicando por qué se necesita el permiso
- [ ] **PERM-03**: El usuario puede volver a solicitar el permiso de cámara desde dentro de la app
- [ ] **PERM-04**: Si el permiso fue denegado permanentemente, la app redirige a Configuración del sistema

### Offline & Sync

- [ ] **OFFL-01**: La app detecta cuando no hay conexión a internet y muestra un banner/indicador visual
- [ ] **OFFL-02**: Los módulos de solo lectura (lista de mis plantas, perfil) funcionan sin internet usando datos cacheados
- [ ] **OFFL-03**: Las operaciones de escritura (agregar planta) se encolan localmente cuando no hay conexión
- [ ] **OFFL-04**: Al recuperar la conexión, las operaciones encoladas se sincronizan automáticamente
- [ ] **OFFL-05**: Las plantas pendientes de sincronización se muestran con un indicador visual diferenciado

### Backend Deploy

- [ ] **BACK-01**: El API del backend está desplegado en Render y accesible desde internet
- [ ] **BACK-02**: El endpoint de creación de planta funciona correctamente desde la app en producción
- [ ] **BACK-03**: El deploy en Render tiene logs verificables
- [ ] **BACK-04**: El Render está compartido con los correos del profesor

### Local Storage

- [ ] **STOR-01**: Se implementa almacenamiento local con la tecnología justificada (AsyncStorage/MMKV/SQLite)
- [ ] **STOR-02**: Las plantas del usuario se cachean localmente para acceso offline
- [ ] **STOR-03**: La cola de sincronización pendiente persiste entre sesiones (no se pierde al cerrar la app)

## v2 Requirements

### Notifications

- **NOTF-01**: Notificación push cuando la sincronización completa exitosamente
- **NOTF-02**: Notificación si la sincronización falla después de varios intentos

### Analytics

- **ANLX-01**: Tracking de qué plantas se identifican con mayor frecuencia
- **ANLX-02**: Tasa de aceptación vs edición de identificaciones de IA

## Out of Scope

| Feature | Reason |
|---------|--------|
| Notificaciones push | No requerido por el lab, alta complejidad |
| Chat entre usuarios | Fuera del alcance del proyecto actual |
| Autenticación biométrica | Ya existe Google Auth |
| Video de plantas | No requerido, alto costo de almacenamiento |
| Mapa de plantas | No requerido por el lab |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AI-01 | Phase 1 | Pending |
| AI-02 | Phase 1 | Pending |
| AI-03 | Phase 1 | Pending |
| AI-04 | Phase 1 | Pending |
| AI-05 | Phase 1 | Pending |
| PERM-01 | Phase 2 | Pending |
| PERM-02 | Phase 2 | Pending |
| PERM-03 | Phase 2 | Pending |
| PERM-04 | Phase 2 | Pending |
| OFFL-01 | Phase 3 | Pending |
| OFFL-02 | Phase 3 | Pending |
| OFFL-03 | Phase 3 | Pending |
| OFFL-04 | Phase 3 | Pending |
| OFFL-05 | Phase 3 | Pending |
| BACK-01 | Phase 4 | Pending |
| BACK-02 | Phase 4 | Pending |
| BACK-03 | Phase 4 | Pending |
| BACK-04 | Phase 4 | Pending |
| STOR-01 | Phase 3 | Pending |
| STOR-02 | Phase 3 | Pending |
| STOR-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-23*
*Last updated: 2026-04-23 after initial definition*
