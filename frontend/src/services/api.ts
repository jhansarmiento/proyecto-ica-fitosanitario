import type {  
  UsuarioDTO, 
  RolDTO 
} from '../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

type ApiEnvelope<T> = {
  message?: string;
  data: T;
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
  solicitudRegistroLugar?: {
    asistenteAsignado?: {
      id: string;
      nombre: string;
      apellidos: string;
      correoElectronico: string;
      telefono: string;
    } | null;
  } | null;
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


export type EspecieVegetalDTO = {
  id: string;
  nombreEspecie: string;
  nombreComun: string;
  cicloCultivo: string;
};

export type AutorizacionEspecieDTO = {
  id: string;
  idLugarProduccion: string;
  idEspecieVegetal: string;
  capacidadProduccion: number;
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
  // login(body: LoginRequest) {
  //   return request<LoginResponse>('auth/login', {
  //     method: 'POST',
  //     body: JSON.stringify(body),
  //   });
  // },

  // getRoles() {
  //   return request<ApiEnvelope<RolDTO[]>>('/roles');
  // },
  // createRole(body: Pick<RolDTO, 'nombreRol' | 'descripcion'>) {
  //   return request<ApiEnvelope<RolDTO>>('/roles', {
  //     method: 'POST',
  //     body: JSON.stringify(body),
  //   });
  // },

  //getUsuarios() {
  //   return request<ApiEnvelope<UsuarioDTO[]>>('/usuarios');
  // },

  // createUsuario(body: Partial<UsuarioDTO> & { ingresoContrasena: string }) {
  //   return request<ApiEnvelope<UsuarioDTO>>('/usuarios', {
  //     method: 'POST',
  //     body: JSON.stringify(body),
  //   });
  // },

  updateRole(id: string, body: Partial<Pick<RolDTO, 'nombreRol' | 'descripcion'>>) {
    return request<ApiEnvelope<RolDTO>>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...(body.nombreRol !== undefined ? { nombreRol: body.nombreRol } : {}),
        ...(body.descripcion !== undefined ? { descripcion: body.descripcion } : {}),
      }),
    });
  },

  deleteRole(id: string) {
    return request<{ message: string }>(`/roles/${id}`, {
      method: 'DELETE',
    });
  },

  // 
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

  getEspeciesVegetales() {
    return request<ApiEnvelope<EspecieVegetalDTO[]>>('/especies-vegetales');
  },

  getAutorizacionesEspecie() {
    return request<ApiEnvelope<AutorizacionEspecieDTO[]>>('/autorizaciones-especie');
  },

  // ── Solicitudes de Inspección ──────────────────────────────────────────────
  getSolicitudesInspeccion(params: { userId: string; rol: string }) {
    const qs = new URLSearchParams({ userId: params.userId, rol: params.rol }).toString();
    return request<ApiEnvelope<SolicitudInspeccionDTO[]>>(`/solicitudes-inspeccion?${qs}`);
  },
  getSolicitudById(id: string) {
    return request<ApiEnvelope<SolicitudInspeccionDTO>>(`/solicitudes-inspeccion/${id}`);
  },
  createSolicitud(body: CreateSolicitudDTO) {
    return request<ApiEnvelope<SolicitudInspeccionDTO>>('/solicitudes-inspeccion', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  updateEstadoSolicitud(id: string, body: UpdateEstadoSolicitudDTO) {
    return request<ApiEnvelope<SolicitudInspeccionDTO>>(`/solicitudes-inspeccion/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
};

// ── DTOs de Inspecciones ────────────────────────────────────────────────────

export type EstadoSolicitud = 'SOLICITADA' | 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA' | 'NO_PROGRAMADA';

export type SolicitudInspeccionDTO = {
  id: string;
  fechaCreacion: string;
  fechaTentativaProductor: string;
  fechaProgramadaTecnico: string | null;
  estado: EstadoSolicitud;
  observaciones: string | null;
  lote: {
    id: string;
    numeroLote: string;
    areaTotal: number;
    idVariedad: string;
    predio: {
      id: string;
      nombrePredio: string;
      numeroPredial: string;
      numeroRegistroICA: string;
      direccion: string;
      lugarProduccion: {
        id: string;
        nombreLugarProduccion: string;
        numeroRegistroICA: string;
        productor: {
          id: string;
          nombre: string;
          apellidos: string;
          correoElectronico: string;
          telefono: string;
        } | null;
      } | null;
    } | null;
  } | null;
  asistenteTecnico: {
    id: string;
    nombre: string;
    apellidos: string;
    correoElectronico: string;
    telefono: string;
    tarjetaProfesional: string | null;
  } | null;
};

export type CreateSolicitudDTO = {
  idLote: string;
  idAsistenteTecnico: string;
  fechaTentativaProductor: string;
};

export type UpdateEstadoSolicitudDTO = {
  accion: 'ACEPTAR' | 'RECHAZAR';
  fechaProgramada?: string;
  observaciones?: string;
};
