/**
 * Contratos tipados del módulo Catálogo.
 *
 * Convención:
 * - Este archivo define DTOs compartidos entre service/controller.
 * - Mantiene salida en camelCase para frontend.
 */

/**
 * Referencia corta de plaga asociada a una especie vegetal.
 */
export interface PestRefDto {
  id_plaga: string;
  nombre_comun: string;
  nombre_cientifico: string;
}

/**
 * DTO de especie vegetal para la página de catálogo.
 */
export interface CatalogSpeciesDto {
  id: string;
  nombreComun: string;
  nombreCientifico: string;
  ciclo: string;
  variedades: string[];
  plagas: PestRefDto[];
  imagen: string;
}

/**
 * DTO de plaga para la página de catálogo.
 */
export interface CatalogPestDto {
  id_plaga: string;
  nombre_comun: string;
  nombre_cientifico: string;
  tipo_plaga: string;
  especiesAfectadas: string[];
  imagen_plaga: string;
}

/**
 * Forma cruda de fila SQL para especies con agregación.
 */
export interface CatalogSpeciesRawRow {
  id: string;
  nombre_comun: string;
  nombre_cientifico: string;
  ciclo: string;
  imagen: string | null;
  variedades: string[] | null;
  plagas: Array<{
    id_plaga: string;
    nombre_comun: string;
    nombre_cientifico: string;
  }> | null;
}

/**
 * Forma cruda de fila SQL para plagas con agregación.
 */
export interface CatalogPestRawRow {
  id_plaga: string;
  nombre_comun: string;
  nombre_cientifico: string;
  tipo_plaga: string | null;
  imagen_plaga: string | null;
  especies_afectadas: string[] | null;
}
