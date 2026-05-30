import { Router } from 'express';
import { createLote, getLotesPorLugar, updateLote, deleteLote } from '../controllers/lote.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();

// Aplica el middleware de seguridad a todas las rutas de este archivo
router.use(validarJWT as any);

// Estas rutas se anidan bajo la URL del lugar de producción padre
router.post('/:id/lotes', createLote as any);
router.get('/:id/lotes', getLotesPorLugar as any);
router.put('/lotes/:id_lote', updateLote as any);
router.delete('/lotes/:id_lote', deleteLote as any);

export default router;