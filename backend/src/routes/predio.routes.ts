import { Router } from 'express';
import { obtenerPrediosDisponibles } from '../controllers/predio.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', validarJWT as any, obtenerPrediosDisponibles);

export default router;