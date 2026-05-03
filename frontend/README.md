# Frontend - FitoGestor (React + TypeScript + Vite + Tailwind)

Este frontend está construido para consumir la API del backend de forma centralizada y modular.

## Objetivo

Este documento le indica al equipo backend **dónde debe apuntar** y **qué contratos de datos** debe exponer para que las vistas del frontend puedan listar información correctamente.

---

## Estructura del frontend

```bash
frontend/src/
  components/   # UI reutilizable (botones, modales, tarjetas, etc.)
  pages/        # Vistas principales (Home, Users, Roles, Gestión Agrícola)
  services/     # Capa de comunicación con backend (fetch/axios)
  hooks/        # Lógica reutilizable (estado, side effects, etc.)
  schemas/      # Validaciones (zod)
```

Regla principal:  
- **Las páginas NO deben hacer llamadas directas al backend.**
- Toda llamada debe pasar por `src/services/`.

---

## URL base del backend (a dónde apuntar)

Definir la URL base por entorno usando variables de entorno de Vite.

### Archivo `.env` (local)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Uso esperado en frontend
`src/services/api.ts` debe construir peticiones usando `VITE_API_BASE_URL`.

Ejemplo recomendado:
```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## Módulos de UI ya implementados y contratos esperados

Actualmente el frontend tiene páginas funcionales de:
- Gestión de Usuarios
- Gestión de Roles
- Gestión Agrícola

A continuación, los endpoints sugeridos para listar datos:

---

## 1) Gestión de Usuarios

### Endpoint listado
- `GET /api/users`

### Respuesta esperada (ejemplo)
```json
[
  {
    "id": 1,
    "identificacion": "1032456789",
    "nombres": "Laura",
    "apellidos": "Pineda",
    "rol": "Administrador"
  }
]
```

### Campos usados por UI
- `id`
- `identificacion`
- `nombres`
- `apellidos`
- `rol`

---

## 2) Gestión de Roles

### Endpoint listado
- `GET /api/roles`

### Respuesta esperada (ejemplo)
```json
[
  {
    "id": 1,
    "rol": "Administrador",
    "descripcion": "Acceso total a los permisos"
  }
]
```

### Campos usados por UI
- `id`
- `rol`
- `descripcion`

---

## 3) Gestión Agrícola

### Endpoint listado
- `GET /api/agricultural-sites`

### Respuesta esperada (ejemplo)
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

### Campos usados por UI
- `id`
- `name`
- `municipality`
- `department`
- `associatedPredios`
- `authorizedSpecies`
- `activeLots`
- `area`
- `ica`
- `status` (`Activo` | `Pendiente`)

---

## Endpoints adicionales sugeridos (futuro)

### Usuarios
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Roles
- `POST /api/roles`
- `PUT /api/roles/:id`
- `DELETE /api/roles/:id`

### Gestión Agrícola
- `POST /api/agricultural-sites`
- `PUT /api/agricultural-sites/:id`
- `DELETE /api/agricultural-sites/:id`

---

## Convenciones recomendadas para backend

- Responder JSON siempre.
- Usar códigos HTTP correctos (`200`, `201`, `400`, `404`, `500`, etc.).
- Mantener nombres de campos consistentes con los contratos anteriores.
- Manejar CORS para permitir requests desde el frontend local (`http://localhost:5173` por defecto en Vite).

---

## Ejecución local frontend

```bash
cd frontend
npm install
npm run dev
```

App por defecto en:
- `http://localhost:5173`

---

## Nota de integración

Mientras se conecta backend real, el frontend puede usar data mock.  
Cuando backend esté listo, reemplazar mocks por servicios en `src/services/` sin cambiar la UI.
