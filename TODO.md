# TODO - Notificaciones Productor (Aprobación/Rechazo Lugar Producción)

- [ ] Crear modelo backend `backend/src/models/Notificacion.ts`.
- [ ] Registrar modelo y asociaciones en `backend/src/index.ts` y `backend/src/models/Usuario.ts`.
- [ ] Crear controlador `backend/src/controllers/notificacion.controller.ts`.
- [ ] Crear rutas `backend/src/routes/notificacion.routes.ts`.
- [ ] Montar rutas en `backend/src/index.ts`.
- [ ] Integrar creación de notificaciones en:
  - [ ] `aprobarLugarProduccion` (lugar aprobado)
  - [ ] `rechazarLugarProduccion` (lugar rechazado)
- [ ] Crear servicio frontend `frontend/src/services/notificacion.service.ts`.
- [ ] Conectar UI de notificaciones en layout/header para usar backend real.
- [ ] Validar flujo mínimo: admin aprueba/rechaza y productor visualiza notificación.
