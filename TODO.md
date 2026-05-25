# TODO - Procedimientos usuarios + filtro de roles en NewUserModal

- [x] Revisar modelo y rutas de usuarios para mapear columnas reales (snake_case/camelCase) antes de SP.
- [x] Crear SQL PostgreSQL con procedimientos:
  - [x] sp_crear_usuario
  - [x] sp_actualizar_usuario
  - [x] sp_eliminar_usuario
- [x] Integrar ejecución de procedimientos en backend (controller/service usuarios).
- [x] Mantener endpoints actuales (`POST/PUT/DELETE /api/usuarios`) usando SP internamente.
- [x] Ajustar `UsersPage` para filtrar roles permitidos en creación/edición:
  - [x] solo "ASISTENTE" (asistente técnico)
  - [x] solo "ADMIN" (administrador ICA)
  - [x] excluir "PRODUCTOR"
- [ ] Crear endpoint `POST /api/auth/register-productor` usando procedimiento almacenado.
- [ ] Conectar `RegisterProductorPage` al endpoint modular (`http.client.ts`) en vez de fetch manual.
- [ ] Validar con curl endpoint register-productor (happy path + duplicado).
- [ ] Verificar flujo UI de RegisterProductorPage.
