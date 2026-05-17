export interface CreateRolInput {
  nombreRol: string;
  descripcion: string;
}

export interface UpdateRolInput {
  nombreRol?: string;
  descripcion?: string;
}
