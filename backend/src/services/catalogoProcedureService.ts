import { QueryTypes } from 'sequelize';
import { sequelizeCatalog } from '../catalogIndex';
import type { CatalogPestRawRow, CatalogSpeciesRawRow } from '../types/catalogo.types';

/**
 * Servicio de procedimientos/funciones SQL del módulo Catálogo.
 *
 * Patrón replicado de `usuarioProcedureService`:
 * - Las operaciones se encapsulan en funciones de servicio.
 * - Se invocan rutinas SQL existentes en BD.
 * - El controller consume datos crudos y aplica mapeo de contrato.
 */

/**
 * Obtiene especies de catálogo ejecutando la función `fn_catalogo_especies`.
 *
 * @returns Filas crudas de especies con arreglos agregados.
 */
export async function listCatalogSpeciesRaw(): Promise<CatalogSpeciesRawRow[]> {
  const rows = await sequelizeCatalog.query<CatalogSpeciesRawRow>(
    `
    SELECT * FROM fn_catalogo_especies();
    `,
    {
      type: QueryTypes.SELECT,
    },
  );

  return rows;
}

/**
 * Obtiene plagas de catálogo ejecutando la función `fn_catalogo_plagas`.
 *
 * @returns Filas crudas de plagas con especies afectadas agregadas.
 */
export async function listCatalogPestsRaw(): Promise<CatalogPestRawRow[]> {
  const rows = await sequelizeCatalog.query<CatalogPestRawRow>(
    `
    SELECT * FROM fn_catalogo_plagas();
    `,
    {
      type: QueryTypes.SELECT,
    },
  );

  return rows;
}
