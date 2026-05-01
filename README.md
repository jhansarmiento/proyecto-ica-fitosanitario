# 🚀 Proyecto ICA Fitosanitario - Fullstack PERN

Este es el repositorio central del Proyecto Integrador 2026-I. El sistema utiliza el stack **PERN** (PostgreSQL, Express, React, Node.js) con **TypeScript** y **Sequelize**.

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:
* **Node.js** (Versión v20 o superior).
* **PostgreSQL** (Funcionando localmente).
* **DBeaver** (Para gestión visual de la base de datos).
* **Git**.

---

## 🛠️ Configuración Inicial (Paso a Paso)

### 1. Clonar el proyecto
Abre una terminal en tu carpeta de proyectos y ejecuta:
```bash
git clone https://github.com/TU_USUARIO/proyecto-ica-fitosanitario.git
cd proyecto-ica-fitosanitario
```

### 2. Configurar el Backend
Entra a la carpeta de backend e instala las librerías:
```bash
cd backend
npm install
```

#### Configurar Variables de Entorno (`.env`)
Crea un archivo llamado `.env` en la raíz de la carpeta `backend/` (puedes guiarte del archivo `.env.template` si existe) y agrega tus credenciales locales:
```env
DB_NAME=ica_db
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
DB_HOST=localhost
DB_PORT=5432
PORT=3000
```

### 3. Configurar la Base de Datos
1. Abre **DBeaver**.
2. Crea una nueva base de datos llamada **`ica_db`**.
3. **¡No necesitas crear tablas manualmente!** El sistema usa Sequelize Auto-Sync para crearlas al iniciar el servidor.

### 4. Configurar el Frontend
Abre una **nueva terminal** en la raíz del proyecto y ejecuta:
```bash
cd frontend
npm install
```

---

## 🏃 Cómo ejecutar el proyecto

Para trabajar, debes tener ambos servidores corriendo:

* **Backend:** En `/backend` ejecuta `npm run dev`.
* **Frontend:** En `/frontend` ejecuta `npm run dev`.

El servidor de base de datos se conectará automáticamente y verás el mensaje: `✅ Conexión a PostgreSQL establecida`.

---

## 📊 Ver las tablas en DBeaver
Si después de iniciar el backend no ves las tablas:
1. En DBeaver, haz clic derecho sobre la base de datos **`ica_db`**.
2. Selecciona **Refresh (F5)**.
3. Despliega `Schemas` -> `public` -> `Tables`. Allí debería aparecer la tabla `usuarios`.

---

## 🔄 Flujo de Trabajo con Git (La Regla de Oro)

Para evitar que el código se rompa o que haya conflictos imposibles de arreglar, sigue siempre este orden antes de subir tus cambios:

### 1. Traer los cambios del equipo (PULL)
Antes de empezar a escribir código o antes de subir lo tuyo, descarga lo que tus compañeros hicieron:
```bash
git pull origin main
```
*Si hay conflictos, VS Code te avisará para que elijas qué código conservar.*

### 2. Preparar tus cambios (ADD y COMMIT)
Cuando termines tu tarea:
```bash
git add .
git commit -m "feat: descripción corta de lo que hiciste"
```

### 3. Subir al repositorio (PUSH)
```bash
git push origin main
```

---

## 🛠️ Tecnologías Principales
* **Frontend:** React + TypeScript + Vite + Tailwind CSS.
* **Backend:** Node.js + Express + TypeScript.
* **ORM:** Sequelize (PostgreSQL).
* **Validación:** Zod.

---

### 💡 Notas Adicionales
* **Nunca subas el archivo `.env` al GitHub.** Ya está configurado en el `.gitignore`.
* Si instalas una nueva librería, avisa al equipo para que todos ejecuten `npm install`.

---

### ¿Cómo usar este README?
1. Crea el archivo en tu proyecto.
2. Haz `git add README.md`, luego `git commit` y finalmente `git push`.
3. ¡Listo! Cuando tu compañero entre al link del repositorio en GitHub, verá toda esta guía formateada y elegante.

---

## 📂 Estructura del Proyecto y Guía de Contribución

Para mantener el proyecto organizado y escalable, seguimos una **Arquitectura de Capas**. Aquí te explicamos dónde incluir cada parte de tu código:

### 🖥️ Backend (`/backend/src`)

El backend está dividido por responsabilidades técnicas para que la lógica no se mezcle:

* **`config/`**: Configuraciones globales. Aquí solo va la conexión a la DB (`database.ts`) y configuraciones de seguridad.
* **`models/`**: **Capa de Persistencia.** Aquí creas los archivos de Sequelize (ej: `Lote.ts`). 
    * *Regla:* Todo modelo nuevo debe importarse en `models/index.ts`.
* **`controllers/`**: **Capa de Lógica.** Aquí escribes las funciones que procesan los datos (ej: `crearUsuario`, `obtenerInspeccion`). Reciben la petición del cliente y devuelven la respuesta.
* **`routes/`**: **Capa de Entrada.** Aquí defines los endpoints (ej: `router.post('/login', ...)`). Solo sirven para conectar una URL con un controlador.
* **`schemas/`**: **Validación con Zod.** Antes de que los datos lleguen al controlador, pasan por aquí para verificar que tengan el formato correcto (ej: que el email sea un email real).
* **`types/`**: Definiciones de interfaces de TypeScript que necesites compartir entre varios archivos del backend.


### 🎨 Frontend (`/frontend/src`)

El frontend sigue una estructura modular para facilitar la reutilización de interfaces:

* **`components/`**: Elementos de UI pequeños y reutilizables (Botones, Tarjetas de Lotes, Inputs estilizados con Tailwind).
* **`pages/`**: Las vistas principales de la aplicación (Home, Login, Formulario de Inspección). Cada página puede usar varios componentes.
* **`services/`**: **Capa de Comunicación.** Aquí vive **Axios**. Todas las peticiones al backend deben centralizarse aquí. *No hagas peticiones directamente dentro de una página.*
* **`hooks/`**: Funciones personalizadas de React para manejar lógica compleja o estados compartidos.
* **`schemas/`**: Validaciones de formularios con Zod para mostrar errores al usuario en tiempo real antes de enviar los datos al servidor.

---

### 💡 Guía Rápida: ¿Dónde pongo mi código?

| Si vas a... | ...entonces crea el archivo en: |
| :--- | :--- |
| **Agregar una tabla al UML** | `backend/src/models/` |
| **Crear un nuevo endpoint API** | `backend/src/routes/` |
| **Escribir la lógica de un proceso** | `backend/src/controllers/` |
| **Diseñar un botón o modal** | `frontend/src/components/` |
| **Crear una vista nueva (URL)** | `frontend/src/pages/` |
| **Configurar una llamada a la API** | `frontend/src/services/` |

---

### 🚀 ¿Cómo empezar a programar una funcionalidad? (Ejemplo: *Lotes*)
1.  **Backend:** Crea el modelo en `models/`, define su validación en `schemas/`, escribe su lógica en `controllers/` y expón la URL en `routes/`.
2.  **Frontend:** Crea el servicio en `services/` para llamar a esa URL y luego diseña la página en `pages/` que consuma ese servicio.

---