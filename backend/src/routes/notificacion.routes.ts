import { Router } from 'express';
import {
  obtenerMisNotificaciones,
  marcarNotificacionLeida,
} from '../controllers/notificacion.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/mis-notificaciones', validarJWT as any, obtenerMisNotificaciones as any);
router.patch('/:id/leida', validarJWT as any, marcarNotificacionLeida as any);

export default router;
