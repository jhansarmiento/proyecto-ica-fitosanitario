// servicios de predios, lugares y lotes

import { request } from './apiClient';
import type { ApiEnvelope } from '../types/api.types';
import type  { PredioDTO, LugarProduccionDTO, LoteDTO } from '../types/finca.types';

export const fincaService = {
  // ── PREDIOS ──
  getPredios() {
    return request<ApiEnvelope<PredioDTO[]>>('/predios');
  },
  createPredio(body: Omit<PredioDTO, 'id' | 'lugarProduccion'>) {
    return request<ApiEnvelope<PredioDTO>>('/predios', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // ── LUGARES DE PRODUCCIÓN (Ya unificados sin la tabla solicitud) ──
  getLugaresProduccion() {
    return request<ApiEnvelope<LugarProduccionDTO[]>>('/lugares-produccion');
  },
  createLugarProduccion(body: { 
    nombre_lugar_produccion: string; 
    numero_registro_ica: string; 
    estado: string; 
    id_usuario_productor: string; 
  }) {
    return request<ApiEnvelope<LugarProduccionDTO>>('/lugares-produccion', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // ── LOTES ──
  getLotes() {
    return request<ApiEnvelope<LoteDTO[]>>('/lotes');
  }
};