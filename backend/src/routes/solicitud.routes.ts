import { Router } from 'express';
import { getSolicitudes, programarSolicitud } from '../controllers/solicitud.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();
router.use(validarJWT as any);

router.get('/', getSolicitudes as any);
router.put('/:id/programar', programarSolicitud as any);

export default router;