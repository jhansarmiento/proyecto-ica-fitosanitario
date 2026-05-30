// src/routes/autorizacionEspecie.routes.ts
import { Router } from 'express';
import { obtenerAutorizacionesEspecie } from '../controllers/autorizacionEspecie.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint: GET /api/autorizaciones-especie
router.get('/', validarJWT as any, obtenerAutorizacionesEspecie);

export default router;