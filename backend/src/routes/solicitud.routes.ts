import { Router } from 'express';
import { getSolicitudes, gestionarSolicitud } from '../controllers/solicitud.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();
router.use(validarJWT as any);

router.get('/', getSolicitudes as any);
router.put('/:id/gestionar', gestionarSolicitud as any);

export default router;