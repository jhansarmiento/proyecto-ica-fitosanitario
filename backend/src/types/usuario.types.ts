// Tipo para el modelo Usuario completo (lo que devuelve Sequelize)
export interface Usuario {
  id_usuario: number;
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
  rol_id: number;
  
  // Relación con Rol
  rol?: Rol;
}

// Tipo del Rol (mínimo lo que necesitas)
export interface Rol {
  id_rol: number;
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
  id: number;
  rol: string;
}

// Respuesta que devuelve el endpoint de login
export interface LoginResponse {
  message: string;
  token: string;
  usuario: {
    nombre: string;
    rol: string;
  };
}