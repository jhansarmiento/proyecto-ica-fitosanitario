const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

type ApiEnvelope<T> = {
  message?: string;
  data: T;
};

export type LoginRequest = {
  ingresoUsuario: string;
  ingresoContrasena: string;
};

export type LoginResponse = {
  message: string;
  data: {
    id: string;
    ingresoUsuario: string;
    nombre: string;
    apellidos: string;
    correoElectronico: string;
    rol: string | null;
  };
};

export type RolDTO = {
  id: string;
  nombreRol: string;
  descripcion: string;
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
  idRol: string | null;
  Rol?: RolDTO | null;
};

export type LugarProduccionDTO = {
  id: string;
  nombreLugarProduccion: string;
  numeroRegistroICA: string;
  estado: string;
  idUsuarioProductor: string;
  productor?: {
    id: string;
    nombre: string;
    apellidos: string;
    ingresoUsuario: string;
  } | null;
};

export type PredioDTO = {
  id: string;
  numeroPredial: string;
  numeroRegistroICA: string;
  nombrePredio: string;
  direccion: string;
  areaTotal: number;
  idVereda: string;
  idLugarProduccion: string | null;
  idPropietario: string;
  lugarProduccion?: { id: string; nombreLugarProduccion: string } | null;
};

export type LoteDTO = {
  id: string;
  numeroLote: string;
  areaTotal: number;
  fechaSiembra: string;
  fechaCosecha: string;
  idVariedad: string;
  idPredio: string;
  predio?: { id: string; nombrePredio: string; numeroPredial: string } | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      ...init,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.message || 'Error en la solicitud');
    }

    return payload as T;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté encendido.');
    }
    throw error;
  }
}

export const api = {
  login(body: LoginRequest) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getRoles() {
    return request<ApiEnvelope<RolDTO[]>>('/roles');
  },
  createRole(body: Pick<RolDTO, 'nombreRol' | 'descripcion'>) {
    return request<ApiEnvelope<RolDTO>>('/roles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  updateRole(id: string, body: Partial<Pick<RolDTO, 'nombreRol' | 'descripcion'>>) {
    return request<ApiEnvelope<RolDTO>>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  deleteRole(id: string) {
    return request<{ message: string }>(`/roles/${id}`, {
      method: 'DELETE',
    });
  },

  getUsuarios() {
    return request<ApiEnvelope<UsuarioDTO[]>>('/usuarios');
  },
  createUsuario(body: Partial<UsuarioDTO> & { ingresoContrasena: string }) {
    return request<ApiEnvelope<UsuarioDTO>>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  updateUsuario(id: string, body: Partial<UsuarioDTO> & { ingresoContrasena?: string }) {
    return request<ApiEnvelope<UsuarioDTO>>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  deleteUsuario(id: string) {
    return request<{ message: string }>(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  },

  getLugaresProduccion() {
    return request<ApiEnvelope<LugarProduccionDTO[]>>('/lugares-produccion');
  },
  createLugarProduccion(body: Pick<LugarProduccionDTO, 'nombreLugarProduccion' | 'numeroRegistroICA' | 'estado' | 'idUsuarioProductor'>) {
    return request<ApiEnvelope<LugarProduccionDTO>>('/lugares-produccion', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  updateLugarProduccion(
    id: string,
    body: Partial<Pick<LugarProduccionDTO, 'nombreLugarProduccion' | 'numeroRegistroICA' | 'estado' | 'idUsuarioProductor'>>,
  ) {
    return request<ApiEnvelope<LugarProduccionDTO>>(`/lugares-produccion/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  deleteLugarProduccion(id: string) {
    return request<{ message: string }>(`/lugares-produccion/${id}`, {
      method: 'DELETE',
    });
  },

  getPredios() {
    return request<ApiEnvelope<PredioDTO[]>>('/predios');
  },
  createPredio(body: Omit<PredioDTO, 'id' | 'lugarProduccion'>) {
    return request<ApiEnvelope<PredioDTO>>('/predios', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  updatePredio(id: string, body: Partial<Omit<PredioDTO, 'id' | 'lugarProduccion'>>) {
    return request<ApiEnvelope<PredioDTO>>(`/predios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  deletePredio(id: string) {
    return request<{ message: string }>(`/predios/${id}`, {
      method: 'DELETE',
    });
  },

  getLotes() {
    return request<ApiEnvelope<LoteDTO[]>>('/lotes');
  },
  createLote(body: Omit<LoteDTO, 'id' | 'predio'>) {
    return request<ApiEnvelope<LoteDTO>>('/lotes', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  updateLote(id: string, body: Partial<Omit<LoteDTO, 'id' | 'predio'>>) {
    return request<ApiEnvelope<LoteDTO>>(`/lotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  deleteLote(id: string) {
    return request<{ message: string }>(`/lotes/${id}`, {
      method: 'DELETE',
    });
  },
};
