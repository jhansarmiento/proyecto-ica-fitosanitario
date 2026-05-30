// backend/src/routes/usuario.routes.ts
import { Router } from 'express';
import { 
    obtenerUsuarios, 
    obtenerUsuarioPorId, 
    actualizarUsuario 
} from '../controllers/usuario.controller'; // Asegúrate de apuntar a tu controlador de usuarios
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();

// Protegemos el módulo completo de usuarios con el token de seguridad
router.use(validarJWT as any);

// GET http://localhost:3000/api/usuarios 
// 💡 ESTE ES EL ENDPOINT CRÍTICO QUE HACE FALTA PARA LLENAR TU DROPDOWN
router.get('/', obtenerUsuarios as any);

// GET http://localhost:3000/api/usuarios/:id
router.get('/:id', obtenerUsuarioPorId as any);

// PUT http://localhost:3000/api/usuarios/:id
router.put('/:id', actualizarUsuario as any);

export default router;