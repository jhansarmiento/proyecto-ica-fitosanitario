export interface CreateUsuarioInput {
  numeroIdentificacion: string;
  nombre: string;
  apellidos: string;
  direccion?: string;
  telefono?: string;
  correoElectronico: string;
  ingresoUsuario: string;
  ingresoContrasena: string;
  tarjetaProfesional?: string | null;
  idRol: string;
}

export interface UpdateUsuarioInput {
  numeroIdentificacion?: string;
  nombre?: string;
  apellidos?: string;
  direccion?: string;
  telefono?: string;
  correoElectronico?: string;
  ingresoUsuario?: string;
  ingresoContrasena?: string;
  tarjetaProfesional?: string | null;
  idRol?: string;
}
