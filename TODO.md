# TODO - Bloqueo por estado del lugar de producción

- [ ] Backend: localizar endpoint de crear lote y agregar validación de estado (solo APROBADO/ACTIVO permite crear).
- [ ] Backend: localizar endpoint de crear solicitud de inspección y agregar validación de estado.
- [ ] Backend: estandarizar mensaje de error para estado inválido.
- [ ] Frontend: deshabilitar acción "Nuevo Lote" si estado del lugar es Pendiente/Rechazado.
- [ ] Frontend: deshabilitar acción "Solicitar Inspección" si estado del lugar es Pendiente/Rechazado.
- [ ] Frontend: mostrar mensaje informativo consistente.
- [ ] Ejecutar build/typecheck y reportar estado final.
