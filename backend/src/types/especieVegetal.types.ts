/**
 * Tipos de dominio para EspecieVegetal.
 *
 * Convenciones:
 * - Persistencia (BD / Sequelize): snake_case
 * - API/TypeScript (dominio app): camelCase
 *
 * Tabla relacional oficial: `especie_vegetal`
 * Campos físicos:
 * - id_especie_vegetal
 * - nombre_especie
 * - nombre_comun
 * - ciclo_cultivo
 * - imagen_especie_vegetal
 */

/**
 * Entidad de dominio alineada al UML para consumo en API y frontend.
 */
export interface EspecieVegetal {
  id: string;
  nombreEspecie: string;
  nombreComun: string;
  cicloCultivo: string;
  imagenEspecieVegetal?: string | null;
  /**
   * Alias UML requerido: getImagenEspecieVegetal() : String
   * Se expone como propiedad derivada para trazabilidad documental.
   */
  getImagenEspecieVegetal?: string | null;
}

/**
 * Payload de creación (capa de aplicación/API).
 */
export interface CreateEspecieVegetalInput {
  nombreEspecie: string;
  nombreComun: string;
  cicloCultivo: string;
  imagenEspecieVegetal?: string;
}

/**
 * Payload de actualización parcial (capa de aplicación/API).
 */
export interface UpdateEspecieVegetalInput {
  nombreEspecie?: string;
  nombreComun?: string;
  cicloCultivo?: string;
  imagenEspecieVegetal?: string | null;
}

/**
 * Registro crudo devuelto por Sequelize desde tabla en snake_case.
 * Se usa para mapear de persistencia a dominio.
 */
export interface EspecieVegetalDbRecord {
  id_especie_vegetal: string;
  nombre_especie: string;
  nombre_comun: string;
  ciclo_cultivo: string;
  imagen_especie_vegetal?: string | null;
}
