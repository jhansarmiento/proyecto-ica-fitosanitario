export interface CreateRolInput {
  nombre_rol: string;
  descripcion: string;
}

export interface UpdateRolInput {
  nombre_rol?: string;
  descripcion?: string;
}
