import { Router } from 'express';
import { listarCatalogoEspecies, listarCatalogoPlagas } from '../controllers/catalogo.controller';

/**
 * Rutas del módulo Catálogo.
 *
 * Base path sugerido en index:
 * - /api/catalogo
 */
const catalogoRoutes = Router();

/**
 * GET /api/catalogo/especies
 * Lista especies vegetales desde BD catálogo.
 */
catalogoRoutes.get('/especies', listarCatalogoEspecies);

/**
 * GET /api/catalogo/plagas
 * Lista plagas desde BD catálogo.
 */
catalogoRoutes.get('/plagas', listarCatalogoPlagas);

export default catalogoRoutes;
