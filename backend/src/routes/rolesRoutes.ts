import { Router } from 'express';
import { createRol, deleteRol, getRolById, listRoles, updateRol } from '../controllers/rolesController';

const rolesRoutes = Router();

rolesRoutes.get('/', listRoles);
rolesRoutes.get('/:id', getRolById);
rolesRoutes.post('/', createRol);
rolesRoutes.put('/:id', updateRol);
rolesRoutes.delete('/:id', deleteRol);

export default rolesRoutes;
