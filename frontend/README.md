# Frontend - FitoGestor (React + TypeScript + Vite + Tailwind)

Este frontend está diseñado para consumir la API del backend de forma **centralizada, tipada y modular**.

## Objetivo de este README

Documentar con alto detalle:

1. **A dónde debe apuntar el frontend** (base URL, entornos, CORS).
2. **Qué endpoints debe exponer backend** para soportar **listar, crear, editar y eliminar**.
3. **Qué contratos de datos exactos** espera hoy la UI (usuarios, roles, lugares de producción, lotes).
4. **Cómo mapear campos** si backend usa snake_case y frontend usa camelCase.
5. **Checklist de integración** para evitar roturas en vistas de edición.

---

## 1) Stack y arquitectura del frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Patrón modular por capas

```bash
frontend/src/
  components/   # UI reutilizable (modales, tarjetas, botones, etc.)
  pages/        # Vistas principales
  services/     # Capa de comunicación API (obligatoria para requests)
  hooks/        # Lógica de estado/reutilizable
  schemas/      # Validaciones (Zod)
  models/       # Tipos/modelos del dominio
```

### Regla crítica de arquitectura
- Las páginas **NO** deben llamar backend directamente.
- Toda llamada HTTP debe centralizarse en `src/services/`.

---

## 2) URL base del backend (a dónde apuntar)

Se debe configurar por entorno con variables de Vite.

### `.env` local
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Uso esperado en frontend
En `src/services/api.ts`:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

> Si `VITE_API_BASE_URL` no está definida, debe fallar de forma controlada (error claro en consola).

---

## 3) CORS y puertos esperados

- Frontend Vite local: `http://localhost:5173`
- Backend recomendado local: `http://localhost:3000`

Backend debe permitir CORS para origen frontend local (y los entornos de despliegue definidos por DevOps).

---

## 4) Vistas afectadas y responsabilidades API

### Módulos con UI activa de listar/editar
1. Gestión de Usuarios
2. Gestión de Roles
3. Gestión Agrícola (Lugares de Producción)
4. Gestión de Lotes por lugar de producción

### Vistas con botón editar vinculado
- `UsersPage` → `EditUserModal`
- `RolesPage` → `EditRoleModal`
- `ProductionLotsPage` → `EditLotModal`
- `AgriculturalManagementPage` → `EditProductionPlaceModal`

---

## 5) Contratos API detallados por módulo

---

## 5.1 Gestión de Usuarios

### 5.1.1 Tipo que usa UI (frontend)
```ts
type User = {
  id: number;
  identificacion: string;
  telefono: string;
  nombres: string;
  apellidos: string;
  direccion: string;
  usuario: string;
  correo: string;
  rol: string;
  registroIca: string;
  tarjetaProfesional: string;
};
```

### 5.1.2 Endpoints requeridos

#### Listar usuarios
- `GET /api/users`

Respuesta esperada:
```json
[
  {
    "id": 1,
    "identificacion": "1032456789",
    "telefono": "3001234567",
    "nombres": "Laura",
    "apellidos": "Pineda",
    "direccion": "Calle 123 #45-67",
    "usuario": "lpineda",
    "correo": "laura.pineda@fitogestor.com",
    "rol": "Administrador",
    "registroIca": "ICA-2026-00123",
    "tarjetaProfesional": "TP-54879"
  }
]
```

#### Obtener detalle de usuario
- `GET /api/users/:id`

#### Crear usuario
- `POST /api/users`

Body sugerido:
```json
{
  "identificacion": "1032456789",
  "telefono": "3001234567",
  "nombres": "Laura",
  "apellidos": "Pineda",
  "direccion": "Calle 123 #45-67",
  "usuario": "lpineda",
  "correo": "laura.pineda@fitogestor.com",
  "rol": "Administrador",
  "registroIca": "ICA-2026-00123",
  "tarjetaProfesional": "TP-54879"
}
```

#### Editar usuario (completo o parcial)
- `PUT /api/users/:id` (reemplazo)
- `PATCH /api/users/:id` (parcial)

Body para edición:
```json
{
  "identificacion": "1032456789",
  "telefono": "3010000000",
  "nombres": "Laura",
  "apellidos": "Pineda",
  "direccion": "Calle 123 #45-89",
  "usuario": "lpineda",
  "correo": "laura.pineda@fitogestor.com",
  "rol": "Administrador",
  "registroIca": "ICA-2026-00123",
  "tarjetaProfesional": "TP-54879"
}
```

#### Eliminar usuario
- `DELETE /api/users/:id`

---

## 5.2 Gestión de Roles

### 5.2.1 Tipo que usa UI
```ts
type Role = {
  id: number;
  rol: string;
  descripcion: string;
};
```

### 5.2.2 Endpoints requeridos

#### Listar roles
- `GET /api/roles`

Respuesta:
```json
[
  {
    "id": 1,
    "rol": "Administrador",
    "descripcion": "Acceso total a los permisos"
  }
]
```

#### Obtener rol por id
- `GET /api/roles/:id`

#### Crear rol
- `POST /api/roles`

Body:
```json
{
  "rol": "Coordinador Regional",
  "descripcion": "Gestiona operación regional y reportes"
}
```

#### Editar rol
- `PUT /api/roles/:id`
- `PATCH /api/roles/:id`

Body:
```json
{
  "rol": "Coordinador Regional",
  "descripcion": "Gestiona operación regional, equipos y reportes"
}
```

#### Eliminar rol
- `DELETE /api/roles/:id`

---

## 5.3 Gestión Agrícola - Lugares de Producción

### 5.3.1 Tipo que usa UI
```ts
type ProductionSite = {
  id: number;
  name: string;
  municipality: string;
  department: string;
  associatedPredios: number;
  authorizedSpecies: number;
  activeLots: number;
  area: string;
  ica: string;
  status: "Activo" | "Pendiente";
};
```

### 5.3.2 Endpoints requeridos

#### Listar lugares de producción
- `GET /api/agricultural-sites`

Respuesta:
```json
[
  {
    "id": 1,
    "name": "Finca Los Arrayanes",
    "municipality": "Chipaque",
    "department": "Cundinamarca",
    "associatedPredios": 2,
    "authorizedSpecies": 3,
    "activeLots": 3,
    "area": "37.8 ha",
    "ica": "ICA-2026-0015",
    "status": "Activo"
  }
]
```

#### Obtener detalle de lugar
- `GET /api/agricultural-sites/:id`

#### Crear lugar
- `POST /api/agricultural-sites`

Body:
```json
{
  "name": "Finca Los Arrayanes",
  "municipality": "Chipaque",
  "department": "Cundinamarca",
  "associatedPredios": 2,
  "authorizedSpecies": 3,
  "activeLots": 0,
  "area": "37.8 ha",
  "ica": "ICA-2026-0015",
  "status": "Activo"
}
```

#### Editar lugar
- `PUT /api/agricultural-sites/:id`
- `PATCH /api/agricultural-sites/:id`

Body:
```json
{
  "name": "Finca Los Arrayanes",
  "municipality": "Chipaque",
  "department": "Cundinamarca",
  "associatedPredios": 3,
  "authorizedSpecies": 4,
  "activeLots": 2,
  "area": "40.1 ha",
  "ica": "ICA-2026-0015",
  "status": "Activo"
}
```

#### Eliminar lugar
- `DELETE /api/agricultural-sites/:id`

---

## 5.4 Gestión de Lotes (por lugar de producción)

### 5.4.1 Tipo que usa UI
```ts
type Lot = {
  id: number;
  code: string;
  especie: string;
  variedad: string;
  areaHa: number;
  fechaSiembra: string;   // YYYY-MM-DD
  fechaCosecha?: string;  // YYYY-MM-DD opcional
};
```

### 5.4.2 Endpoints requeridos

#### Listar lotes por lugar de producción
- `GET /api/agricultural-sites/:siteId/lots`

Respuesta:
```json
[
  {
    "id": 1,
    "code": "LOT-001",
    "especie": "Café Arábica",
    "variedad": "Castillo",
    "areaHa": 15.5,
    "fechaSiembra": "2024-02-01",
    "fechaCosecha": "2024-10-20"
  }
]
```

#### Obtener lote por id
- `GET /api/lots/:id`

#### Crear lote
- `POST /api/agricultural-sites/:siteId/lots`

Body:
```json
{
  "code": "LOT-001",
  "especie": "Café Arábica",
  "variedad": "Castillo",
  "areaHa": 15.5,
  "fechaSiembra": "2024-02-01",
  "fechaCosecha": "2024-10-20"
}
```

> Nota de compatibilidad UI: el modal de crear actualmente usa `numero` internamente; el servicio debe mapear `numero -> code` antes de enviar.

#### Editar lote
- `PUT /api/lots/:id`
- `PATCH /api/lots/:id`

Body:
```json
{
  "code": "LOT-001",
  "especie": "Café Arábica",
  "variedad": "Caturra",
  "areaHa": 16.2,
  "fechaSiembra": "2024-02-10",
  "fechaCosecha": "2024-11-01"
}
```

#### Eliminar lote
- `DELETE /api/lots/:id`

---

## 6) Tabla rápida: Vista frontend ↔ endpoints backend

| Vista Frontend | Listado | Detalle | Crear | Editar | Eliminar |
|---|---|---|---|---|---|
| UsersPage | `GET /users` | `GET /users/:id` | `POST /users` | `PUT/PATCH /users/:id` | `DELETE /users/:id` |
| RolesPage | `GET /roles` | `GET /roles/:id` | `POST /roles` | `PUT/PATCH /roles/:id` | `DELETE /roles/:id` |
| AgriculturalManagementPage | `GET /agricultural-sites` | `GET /agricultural-sites/:id` | `POST /agricultural-sites` | `PUT/PATCH /agricultural-sites/:id` | `DELETE /agricultural-sites/:id` |
| ProductionLotsPage | `GET /agricultural-sites/:siteId/lots` | `GET /lots/:id` | `POST /agricultural-sites/:siteId/lots` | `PUT/PATCH /lots/:id` | `DELETE /lots/:id` |

> URL real completa = `VITE_API_BASE_URL + ruta`.

---

## 7) Contratos HTTP recomendados (formato de respuesta)

### Éxito listado
- `200 OK`
```json
{
  "data": [],
  "meta": {
    "total": 0
  }
}
```

### Éxito crear
- `201 Created`
```json
{
  "data": {
    "id": 123
  },
  "message": "Creado correctamente"
}
```

### Éxito editar
- `200 OK`
```json
{
  "data": {
    "id": 123
  },
  "message": "Actualizado correctamente"
}
```

### Error validación
- `400 Bad Request` o `422 Unprocessable Entity`
```json
{
  "message": "Error de validación",
  "errors": {
    "correo": ["Formato inválido"]
  }
}
```

### No encontrado
- `404 Not Found`
```json
{
  "message": "Recurso no encontrado"
}
```

---

## 8) Normalización de nombres (snake_case ↔ camelCase)

Frontend espera camelCase.  
Si backend entrega snake_case, mapear en `services/`:

Ejemplo:
- `fecha_siembra` → `fechaSiembra`
- `tarjeta_profesional` → `tarjetaProfesional`
- `associated_predios` → `associatedPredios`

Recomendación: definir mappers por recurso (`mapUserDto`, `mapRoleDto`, etc.) en `src/services`.

---

## 9) Campos críticos por formulario de edición

### Editar Usuario
- Requeridos recomendados: `identificacion`, `nombres`, `apellidos`, `usuario`, `correo`, `rol`
- Opcionales: `telefono`, `direccion`, `registroIca`, `tarjetaProfesional`

### Editar Rol
- Requerido: `rol`
- Opcional: `descripcion`

### Editar Lote
- Requeridos: `code`, `areaHa`, `fechaSiembra`, `especie`, `variedad`
- Opcional: `fechaCosecha`

### Editar Lugar de Producción
- Requeridos: `name`, `municipality`, `department`, `associatedPredios`, `authorizedSpecies`
- Opcionales según negocio: `activeLots`, `area`, `ica`, `status`

---

## 10) Paginación, búsqueda y filtros (recomendado)

Aunque la UI hoy usa filtros locales, se recomienda que backend soporte query params:

- `GET /users?search=...&page=1&limit=20`
- `GET /roles?search=...`
- `GET /agricultural-sites?search=...`
- `GET /agricultural-sites/:siteId/lots?search=...`

Respuesta recomendada:
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 145
  }
}
```

---

## 11) Seguridad y operación

- Validar autenticación/autorización (JWT o sesión) para rutas de mutación.
- Registrar auditoría en backend para operaciones `POST/PUT/PATCH/DELETE`.
- Sanitizar y validar payloads.
- Controlar concurrencia en ediciones simultáneas (optimistic locking o `updatedAt`).

---

## 12) Checklist de integración backend ↔ frontend

Antes de conectar en producción:

- [ ] `VITE_API_BASE_URL` configurada por entorno.
- [ ] CORS habilitado para origen frontend.
- [ ] Endpoints de listado responden con campos esperados por UI.
- [ ] Endpoints de edición aceptan payload completo/parcial.
- [ ] Contratos de error homogéneos.
- [ ] Mappers DTO en `services/` definidos (si hay snake_case).
- [ ] Pruebas de flujo completo: listar → editar → guardar → refrescar vista.

---

## 13) Ejecución local frontend

```bash
cd frontend
npm install
npm run dev
```

App local:
- `http://localhost:5173`

Build producción:
```bash
npm run build
npm run preview
```

---

## 14) Nota final de integración

Actualmente algunas vistas aún usan datos mock para UX.  
Al conectar backend real, mantener la UI intacta y mover la lógica a `src/services/` siguiendo este contrato.

Si backend no puede entregar exactamente estos nombres de campo, la adaptación debe resolverse en la capa de servicios, no en componentes/páginas.
