// backend/src/routes/usuario.routes.ts
import { Router } from 'express';
import { 
    obtenerUsuarios, 
    obtenerUsuarioPorId, 
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
} from '../controllers/usuario.controller';
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();

// Protegemos el módulo completo de usuarios con el token de seguridad
router.use(validarJWT as any);

// GET    /api/usuarios
router.get('/', obtenerUsuarios as any);

// POST   /api/usuarios
router.post('/', crearUsuario as any);

// GET    /api/usuarios/:id
router.get('/:id', obtenerUsuarioPorId as any);

// PUT    /api/usuarios/:id
router.put('/:id', actualizarUsuario as any);

// DELETE /api/usuarios/:id
router.delete('/:id', eliminarUsuario as any);

export default router;