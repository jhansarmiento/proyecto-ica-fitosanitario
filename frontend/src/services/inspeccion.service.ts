// servicios de inspecciones
import { request } from './apiClient';
import type { ApiEnvelope } from '../types/api.types';

// Interfaces rápidas de contrato para las solicitudes operativas
export interface SolicitudInspeccionInput {
  id_lugar_produccion: string;
  fecha_tentativa_productor: string;
  observaciones?: string;
}

export const inspeccionService = {
  // ── SOLICITUDES DE INSPECCIÓN ──
  
  // Crear una nueva solicitud sobre el Lugar de Producción completo
  crearSolicitud(body: SolicitudInspeccionInput) {
    return request<ApiEnvelope<{ id_solicitud_inspeccion: string }>>('/solicitudes-inspeccion', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // Obtener las solicitudes del productor logueado
  obtenerMisSolicitudes() {
    return request<ApiEnvelope<any[]>>('/solicitudes-inspeccion');
  },

  // ── ACTAS DE INSPECCIÓN (HISTORIAL) ──
  obtenerHistorialInspecciones() {
    return request<ApiEnvelope<any[]>>('/inspecciones-fitosanitarias');
  }
};