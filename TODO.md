# TODO - CRUD completo alineado a UML (Usuarios, Roles, Lugares, Predios, Lotes)

- [ ] Backend
  - [x] Crear rutas CRUD de `roles`.
  - [x] Crear rutas CRUD de `usuarios`.
  - [x] Crear rutas CRUD de `lugares-produccion`.
  - [x] Crear rutas CRUD de `predios`.
  - [x] Crear rutas CRUD de `lotes`.
  - [x] Registrar rutas en `backend/src/index.ts`.
  - [ ] Verificar coherencia final de campos respecto a UML y asociaciones Sequelize.

- [ ] Frontend - Servicios API
  - [ ] Extender `frontend/src/services/api.ts` con tipos y métodos CRUD para:
    - [ ] `roles`
    - [ ] `usuarios`
    - [ ] `lugaresProduccion`
    - [ ] `predios`
    - [ ] `lotes`

- [ ] Frontend - Páginas
  - [ ] Conectar `RolesPage.tsx` a backend (listar/crear/editar/eliminar).
  - [ ] Conectar `UsersPage.tsx` a backend (listar/crear/editar/eliminar).
  - [ ] Conectar `AgriculturalManagementPage.tsx` a backend (lugares).
  - [ ] Conectar `ProductionPlaceDetailPage.tsx` a backend (predios del lugar).
  - [ ] Conectar `ProductionLotsPage.tsx` a backend (lotes por lugar/predios).

- [ ] Frontend - UX/Estados
  - [ ] Manejo de loading/error/success en cada CRUD.
  - [ ] Mantener diseño actual sin romper interfaz.

- [ ] Testing exhaustivo
  - [ ] Probar endpoints con escenarios happy path.
  - [ ] Probar errores de validación y not-found.
  - [ ] Probar conflictos/duplicados donde aplique.
  - [ ] Ejecutar build frontend y validar que compile.
  - [ ] Validar flujo UI completo (login + CRUD principales).
