// predios, lugares de produccion y lotes

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
}

export interface ProducerOption {
  id: string;
  label: string;
}
