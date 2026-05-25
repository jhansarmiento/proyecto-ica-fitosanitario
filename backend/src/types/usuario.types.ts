import { Request } from 'express';

// Tipo para el modelo Usuario completo (lo que devuelve Sequelize)
export interface Usuario {
  id_usuario: string;
  numero_identificacion: string;
  nombres: string;
  apellidos: string;
  direccion: string;
  telefono: string;
  correo_electronico: string;
  ingreso_usuario: string;
  ingreso_contrasena: string;
  registro_ica: string;
  tarjeta_profesional: string;
  rol_id: string;
  
  // Relación con Rol
  rol?: Rol;
}

// Tipo del Rol (mínimo lo que necesitas)
export interface Rol {
  id_rol: string;
  nombre_rol: string;
  descripcion?: string;
}

// Tipo para el cuerpo de la petición de Login
export interface LoginInput {
  ingreso_usuario: string;
  ingreso_contrasena: string;
}

// Payload que irá dentro del JWT
export interface JWTPayload {
  id: string;
  rol: string;
  nombre: string;
  apellidos: string;
}

// Respuesta que devuelve el endpoint de login
export interface LoginResponse {
  message: string;
  token: string;
  usuario: {
    id_usuario: string;
    nombre: string;
    apellidos: string;
    correo_electronico: string;
    rol: string;
  };
}

export interface AuthenticatedRequest extends Request {
    usuario?: JWTPayload;
}