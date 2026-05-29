// frontend/src/services/finca.service.ts
import { request } from './apiClient';
import type { ApiEnvelope } from '../types/api.types';
import type { PredioDTO, LugarProduccionInput, EspecieVegetalDTO } from '../types/finca.types';

export const fincaService = {

  // ── PREDIOS ──
  getPredios() {
    return request<ApiEnvelope<PredioDTO[]>>('/predios');
  },
  
  createPredio(body: Omit<PredioDTO, 'id_predio' | 'id_lugar_produccion'>) {
    return request<ApiEnvelope<PredioDTO>>('/predios', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // ── LUGARES DE PRODUCCIÓN ──
  getLugaresProduccion() {
    return request<ApiEnvelope<any[]>>('/lugares-produccion'); 
  },

  createLugarProduccion(body: LugarProduccionInput) {
    return request<{ message: string; id_lugar_produccion: string }>('/lugares-produccion', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // ── CATÁLOGOS (ESPECIES VEGETALES) ──
  getEspeciesVegetales() {
    return request<ApiEnvelope<EspecieVegetalDTO[]>>('/especies-vegetales');
  },

  // ── Solicitudes Pendientes ICA (para el administrador aceptar) ──
  getSolicitudesPendientesICA() {
  return request<ApiEnvelope<any[]>>('/lugares-produccion/solicitudes-pendientes-lp');
  },

  // Método listo para cuando el administrador presione "Aprobar"
  aprobarLugarProduccion(idLugarProduccion: string, payload: { numero_registro_ica_oficial: string; id_asistente_asignado: string }) {
    return request<{ message: string }>(`/lugares-produccion/${idLugarProduccion}/aprobar`, {
      method: 'PATCH', // Usamos PATCH para actualizaciones parciales
      body: JSON.stringify(payload)
    });
  },
};