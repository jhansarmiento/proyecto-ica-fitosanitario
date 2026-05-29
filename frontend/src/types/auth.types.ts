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

// 💡 CONTRATO OFICIAL: Sincronizado con la tabla 'rol' de tu base de datos
export type RolDTO = {
  id_rol: string;
  nombre_rol: string;
  descripcion: string;
  createdAt?: string;
  updatedAt?: string;
};

// 💡 CONTRATO OFICIAL: Sincronizado con la tabla 'usuario' de tu base de datos
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