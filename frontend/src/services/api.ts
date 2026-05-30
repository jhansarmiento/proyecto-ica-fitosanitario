/**
 * API facade de compatibilidad.
 *
 * Objetivo:
 * - Mantener funcionando el código existente que importa `{ api }` desde este archivo.
 * - Permitir migración gradual hacia servicios modulares (`rolesApi`, `usuariosApi`, etc.).
 *
 * Nota:
 * - Este archivo conserva los DTOs y métodos históricos para no romper pantallas.
 * - Nuevo código debería usar módulos por dominio.
 */

import type { UsuarioDTO, RolDTO } from '../types/auth.types';
import { request } from './apiClient';
import type { ApiEnvelope } from '../types/api.types';
import { rolesApi } from './roles.api';
import { authService } from './auth.service';


export { request, type ApiEnvelope, rolesApi, authService };

/** DTO de Predio */
export type PredioDTO = {
  id: string;
  numeroPredial: string;
  numeroRegistroICA: string;
  nombrePredio: string;
  direccion: string;
  areaTotal: number;
  idVereda: string;
  numeroIdentificacionProductor?: string | null;
  idLugarProduccion: string | null;
  idPropietario: string;
  lugarProduccion?: { id: string; nombreLugarProduccion: string } | null;
};

/** DTO de Lugar de Producción */
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

/** DTO de Lote */
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

/** DTO API (snake_case) de especies vegetales */
export type EspecieVegetalApiDTO = {
  id: string;
  nombre_especie: string;
  nombre_comun: string;
  ciclo_cultivo: string;
  imagen_especie_vegetal?: string | null;
};

/** DTO de dominio frontend (camelCase) de especies vegetales */
export type EspecieVegetalDTO = {
  id: string;
  nombreEspecie: string;
  nombreComun: string;
  cicloCultivo: string;
  imagenEspecieVegetal?: string | null;
};

/** DTO de autorización de especie */
export type AutorizacionEspecieDTO = {
  id: string;
  idLugarProduccion: string;
  idEspecieVegetal: string;
  capacidadProduccion: number;
};

/** Estado de solicitud de inspección */
export type EstadoSolicitud = 'SOLICITADA' | 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA' | 'NO_PROGRAMADA';

/** DTO de solicitud de inspección */
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

/**
 * Objeto API de compatibilidad para código legado.
 * Mantiene firma y rutas usadas por pantallas existentes.
 */
export const api = {
  // Roles
  getRoles() {
    return rolesApi.getRoles();
  },
  /**
   * Crea un rol usando el contrato oficial en snake_case.
   *
   * @param {Pick<RolDTO, 'nombre_rol' | 'descripcion'>} body Datos del rol.
   * @returns {Promise<{ message: string }>} Resultado del backend.
   */
  createRole(body: Pick<RolDTO, 'nombre_rol' | 'descripcion'>) {
    return rolesApi.createRole(body);
  },

  updateRole(id: string, body: Partial<Pick<RolDTO, 'nombre_rol' | 'descripcion'>>) {
    return rolesApi.updateRole(id, body);
  },
  deleteRole(id: string) {
    return rolesApi.deleteRole(id);
  },

  // Usuarios
  getUsuarios() {
    return authService.getUsuarios();
  },
  createUsuario(body: Partial<UsuarioDTO> & { ingresoContrasena: string }) {
    return authService.createUsuario(body);
  },
  updateUsuario(id: string, body: Partial<UsuarioDTO> & { ingresoContrasena?: string }) {
    return authService.updateUsuario(id, body);
  },
  deleteUsuario(id: string) {
    return authService.deleteUsuario(id);
  },

  // Lugares de producción
  getLugaresProduccion() {
    return request<ApiEnvelope<LugarProduccionDTO[]>>('/lugares-produccion');
  },
  createLugarProduccion(
    body: Pick<LugarProduccionDTO, 'nombreLugarProduccion' | 'numeroRegistroICA' | 'estado' | 'idUsuarioProductor'>,
  ) {
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

  // Predios
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

  // Lotes
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

  // Especies vegetales
  async getEspeciesVegetales() {
    const response = await request<ApiEnvelope<EspecieVegetalApiDTO[]>>('/especies-vegetales');
    return {
      ...response,
      data: response.data.map((item) => ({
        id: item.id,
        nombreEspecie: item.nombre_especie,
        nombreComun: item.nombre_comun,
        cicloCultivo: item.ciclo_cultivo,
        imagenEspecieVegetal: item.imagen_especie_vegetal ?? null,
      })),
    } as ApiEnvelope<EspecieVegetalDTO[]>;
  },

  // Autorizaciones de especie
  getAutorizacionesEspecie() {
    return request<ApiEnvelope<AutorizacionEspecieDTO[]>>('/autorizaciones-especie');
  },

  // Solicitudes de inspección
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
