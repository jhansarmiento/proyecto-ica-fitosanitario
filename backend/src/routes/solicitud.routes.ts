import { Router } from 'express';
<<<<<<< HEAD
import { getSolicitudes, gestionarSolicitud, getDatosInicioInspeccion } from '../controllers/solicitud.controller';
=======
import { getSolicitudes, gestionarSolicitud, getDatosInicioInspeccion, finalizarInspeccion, getReportes } from '../controllers/solicitud.controller';
>>>>>>> origin/jhan_branch
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();
router.use(validarJWT as any);

router.get('/', getSolicitudes as any);
router.put('/:id/gestionar', gestionarSolicitud as any);
router.get('/:id/iniciar-inspeccion', getDatosInicioInspeccion as any);
<<<<<<< HEAD
=======
router.post('/:id/finalizar-inspeccion', finalizarInspeccion as any);
router.get('/reportes/generales', getReportes as any);
>>>>>>> origin/jhan_branch

export default router;