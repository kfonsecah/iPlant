# iPlant Micro-Backend (Render Deployment)

Este es el micro-backend para la aplicación iPlant, desarrollado en Node.js/Express para cumplir con los requerimientos de la Actividad 3.

## Funcionalidades
- **Proxy de Identificación:** Protege la API Key de Plant.id procesando las solicitudes desde el servidor.
- **Endpoint de Creación:** Implementa `POST /api/plants` para verificar el flujo end-to-end desde la app móvil.
- **Health Check:** Endpoint `/health` para monitoreo en Render.

## Despliegue en Render
1. **Root Directory:** `backend/`
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`
4. **Environment Variables:**
   - `PORT`: 3000
   - `PLANT_ID_API_KEY`: [Tu API Key de Plant.id]

## Verificación de Logs
Se pueden observar los logs en el dashboard de Render para confirmar las peticiones entrantes:
- `POST /api/identify` -> Redirecciona a Plant.id v3.
- `POST /api/plants` -> Simula la creación en base de datos y retorna un ID.
