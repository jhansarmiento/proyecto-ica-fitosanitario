import { Router } from 'express';
import { crearLugarProduccion } from '../controllers/lugarProduccion.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint: POST /api/lugares-produccion
// Interceptamos con 'validarJWT'. Si el token es malo, no llega al controlador.
router.post('/', validarJWT as any, crearLugarProduccion as any);

export default router;