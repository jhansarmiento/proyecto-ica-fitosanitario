// backend/src/routes/rol.routes.ts
import { Router } from 'express';
import { 
    listRoles, 
    getRolById, 
    createRol, 
    updateRol, 
    deleteRol
} from '../controllers/rol.controller'; // Tu controlador actual
import { validarJWT } from '../middlewares/auth.middleware';

const router = Router();

// 💡 Todas las rutas de roles requieren que el usuario esté autenticado
router.use(validarJWT as any);

// GET http://localhost:3000/api/roles
router.get('/', listRoles as any);

// GET http://localhost:3000/api/roles/:id
router.get('/:id', getRolById as any);

// POST http://localhost:3000/api/roles
router.post('/', createRol as any);

// PUT http://localhost:3000/api/roles/:id
router.put('/:id', updateRol as any);

// DELETE http://localhost:3000/api/roles/:id
router.delete('/:id', deleteRol as any);

export default router;