import { Router } from 'express';
import { 
    crearLugarProduccion, 
    obtenerLugaresDelProductor, 
    obtenerSolicitudesPendientesICA,
    aprobarLugarProduccion,
    rechazarLugarProduccion
} from '../controllers/lugarProduccion.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();

// Endpoint: POST /api/lugares-produccion
// Interceptamos con 'validarJWT'. Si el token es malo, no llega al controlador.
router.post('/', validarJWT as any, crearLugarProduccion as any);
router.get('/', validarJWT as any, obtenerLugaresDelProductor as any); 
router.get('/solicitudes-pendientes-lp', validarJWT as any, obtenerSolicitudesPendientesICA as any);
// Nuevos endpoints para aprobar/rechazar solicitudes desde el panel de administración
router.patch('/:id/aprobar', validarJWT as any, aprobarLugarProduccion as any);
router.patch('/:id/rechazar', validarJWT as any, rechazarLugarProduccion as any);

export default router;