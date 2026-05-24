// tipos de login y usuarios
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

export type RolDTO = {
  id: string;
  nombreRol: string;
  descripcion: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UsuarioDTO = {
  id: string;
  numeroIdentificacion: string;
  nombre: string;
  apellidos: string;
  correoElectronico: string;
  telefono: string;
  direccion: string;
  registroICA: string | null;
  tarjetaProfesional: string | null;
  ingresoUsuario: string;
  ingresoContrasena?: string;
  idRol: string | null;
  rol?: RolDTO | null;
};