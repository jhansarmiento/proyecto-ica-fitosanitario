import { Router } from 'express';
import { crearLugarProduccion, obtenerLugaresDelProductor, obtenerSolicitudesPendientesICA } from '../controllers/lugarProduccion.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint: POST /api/lugares-produccion
// Interceptamos con 'validarJWT'. Si el token es malo, no llega al controlador.
router.post('/', validarJWT as any, crearLugarProduccion as any);
router.get('/', validarJWT as any, obtenerLugaresDelProductor as any); 
router.get('/solicitudes-pendientes-lp', validarJWT as any, obtenerSolicitudesPendientesICA as any);

export default router;