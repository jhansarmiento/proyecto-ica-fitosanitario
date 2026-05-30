// src/types/auth.types.ts

// Tipos de login y control de sesión
export type LoginRequest = {
  ingreso_usuario: string;
  ingreso_contrasena: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  usuario: {
    id_usuario: string;
    nombre: string;
    apellidos: string;
    correo_electronico: string;
    rol: string;
  };
};

// CONTRATO OFICIAL: Sincronizado con la tabla 'rol' de la base de datos
export type RolDTO = {
  id_rol: string;
  nombre_rol: string;
  descripcion: string;
  createdAt?: string;
  updatedAt?: string;
};

// CONTRATO OFICIAL: Sincronizado con la tabla 'usuario' de la base de datos
export type UsuarioDTO = {
  id_usuario: string;
  numero_identificacion: string;
  nombre: string;
  apellidos: string;
  correo_electronico: string;
  telefono: string;
  direccion: string;
  registro_ica: string | null;
  tarjeta_profesional: string | null;
  ingreso_usuario: string;
  ingreso_contrasena?: string;
  id_rol: string | null;
  rol?: RolDTO | null;
};

// Tipo para la sesión activa en el frontend
export type SessionUser = {
  id_usuario: string;
  nombre: string;
  apellidos: string;
  correo_electronico: string;
  rol: string; // Almacena el nombre del rol ('productor', 'administrador', etc.)
};