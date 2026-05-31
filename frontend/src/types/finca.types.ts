// predios, lugares de produccion y lotes


export interface ProducerOption {
  id: string;
  label: string;
}

// ── PREDIOS ──
export interface PredioDTO {
  id_predio: string;
  nombre_predio: string;
  numero_predial: string;
  area_total: number;
  id_vereda: string;
  id_lugar_produccion: string | null;
  id_propietario: string;
}

// ── LUGARES DE PRODUCCION ──
export interface LugarProduccionInput {
  nombre_lugar_produccion: string;
  numero_registro_ica: string;
  predios_ids: string[];
  especies: {
    id_especie_vegetal: string;
    capacidad_produccion: number;
  }[];
}

// ── ESPECIES VEGETALES ──
export interface EspecieVegetalDTO {
  id_especie_vegetal: string;
  nombre_especie: string;
  nombre_comun: string;
  ciclo_cultivo: string;
}

// Interfaces locales para el estado UI del componente
export interface PredioUI {
  id: string;
  nombre: string;
  codigo: string;
  vereda: string;
  municipio: string;
  departamento: string;
  area_total: number;
}

export interface EspecieUI {
  id_especie_vegetal: string;
  nombre_comun: string;
  nombre_cientifico: string;
  ciclo_cultivo: string;
  imagen_referencia?: string;
}

export interface LoteUI {
  id_lote: string;
  numero_lote: string;
  area_total: number;
  fecha_siembra: string;
  fecha_cosecha?: string;
  estado: string; // 'Activo', 'Inactivo'
  cantidad_plantas: number;
  id_variedad: string;
  id_predio: string;
  // Campos enriquecidos por el backend
  especie_nombre?: string;
  variedad_nombre?: string;
  predio_nombre?: string;
}



