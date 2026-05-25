import { Router } from 'express';
import { listarEspeciesVegetales } from '../controllers/especiesVegetales.controller';

const especiesRoutes = Router();

/**
 * GET /api/especies-vegetales
 * Retorna especies vegetales mapeadas a contrato camelCase para frontend.
 */
especiesRoutes.get('/', listarEspeciesVegetales);

export default especiesRoutes;
