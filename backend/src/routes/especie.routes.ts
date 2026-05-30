import { Router } from 'express';
import { obtenerCatalogoEspecies, getVariedadesPorEspecie } from '../controllers/especie.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint maestro: GET /
router.get('/', validarJWT as any, obtenerCatalogoEspecies);
router.get('/:id/variedades', getVariedadesPorEspecie as any);

export default router;