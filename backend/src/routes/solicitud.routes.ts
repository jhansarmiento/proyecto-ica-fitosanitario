import { Router } from 'express';
import { getSolicitudes, gestionarSolicitud, getDatosInicioInspeccion, finalizarInspeccion, getReportes } from '../controllers/solicitud.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();
router.use(validarJWT as any);

// ⚠️ Las rutas estáticas DEBEN ir antes que las dinámicas (/:id) para que Express no las confunda
router.get('/reportes/generales', getReportes as any);
router.get('/', getSolicitudes as any);
router.put('/:id/gestionar', gestionarSolicitud as any);
router.get('/:id/iniciar-inspeccion', getDatosInicioInspeccion as any);
router.post('/:id/finalizar-inspeccion', finalizarInspeccion as any);

export default router;
