import { request, type ApiEnvelope } from './api';

/**
 * API del módulo Catálogo.
 *
 * Responsabilidad:
 * - Centralizar llamadas HTTP requeridas por CatalogManagementPage.
 * - Mantener contrato tipado de respuesta.
 */

export interface CatalogSpeciesApiItem {
  id: string;
  nombreComun: string;
  nombreCientifico: string;
  ciclo: string;
  variedades: string[];
  plagas: Array<{
    id_plaga: string;
    nombre_comun: string;
    nombre_cientifico: string;
  }>;
  imagen: string;
}

export interface CatalogPestApiItem {
  id_plaga: string;
  nombre_comun: string;
  nombre_cientifico: string;
  tipo_plaga: string;
  especiesAfectadas: string[];
  imagen_plaga: string;
}

type CatalogSpeciesResponse = ApiEnvelope<CatalogSpeciesApiItem[]>;
type CatalogPestsResponse = ApiEnvelope<CatalogPestApiItem[]>;

/**
 * Obtiene especies de catálogo desde backend.
 */
export async function getCatalogSpecies(): Promise<CatalogSpeciesApiItem[]> {
  const response = await request<CatalogSpeciesResponse>('/catalogo/especies');
  return response.data ?? [];
}

/**
 * Obtiene plagas de catálogo desde backend.
 */
export async function getCatalogPests(): Promise<CatalogPestApiItem[]> {
  const response = await request<CatalogPestsResponse>('/catalogo/plagas');
  return response.data ?? [];
}
