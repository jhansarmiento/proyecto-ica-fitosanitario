import { Router } from 'express';
import { obtenerCatalogoEspecies } from '../controllers/especie.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint maestro: GET /
router.get('/', validarJWT as any, obtenerCatalogoEspecies);

export default router;