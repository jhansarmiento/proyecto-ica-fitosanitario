import { Request, Response } from 'express';
import { listCatalogPestsRaw, listCatalogSpeciesRaw } from '../services/catalogoProcedureService';
import type { CatalogPestDto, CatalogSpeciesDto } from '../types/catalogo.types';

/**
 * Controller del módulo Catálogo.
 *
 * Responsabilidad:
 * - Invocar servicio SQL.
 * - Mapear filas crudas al contrato final para frontend.
 * - Estandarizar respuesta HTTP.
 */

/**
 * GET /api/catalogo/especies
 * Retorna especies con variedades y plagas relacionadas.
 */
export async function listarCatalogoEspecies(_req: Request, res: Response) {
    try {
        const rows = await listCatalogSpeciesRaw();

        const data: CatalogSpeciesDto[] = rows.map((row) => ({
            id: row.id,
            nombreComun: row.nombre_comun,
            nombreCientifico: row.nombre_cientifico,
            ciclo: row.ciclo,
            variedades: Array.isArray(row.variedades) ? row.variedades : [],
            plagas: Array.isArray(row.plagas) ? row.plagas : [],
            imagen: row.imagen ?? '',
        }));

        return res.status(200).json({ data });
    } catch (error) {
        console.error('Error listando catálogo de especies:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

/**
 * GET /api/catalogo/plagas
 * Retorna plagas con especies afectadas.
 */
export async function listarCatalogoPlagas(_req: Request, res: Response) {
    try {
        const rows = await listCatalogPestsRaw();

        const data: CatalogPestDto[] = rows.map((row) => ({
            id_plaga: row.id_plaga,
            nombre_comun: row.nombre_comun,
            nombre_cientifico: row.nombre_cientifico,
            tipo_plaga: row.tipo_plaga ?? 'N/A',
            especiesAfectadas: Array.isArray(row.especies_afectadas) ? row.especies_afectadas : [],
            imagen_plaga: row.imagen_plaga ?? '',
        }));

        return res.status(200).json({ data });
    } catch (error) {
        console.error('Error listando catálogo de plagas:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}
