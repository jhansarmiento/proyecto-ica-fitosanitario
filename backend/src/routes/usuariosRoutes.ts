import { Router } from 'express';
import {
  createUsuario,
  deleteUsuario,
  getUsuarioById,
  listUsuarios,
  updateUsuario,
} from '../controllers/usuariosController';

const usuariosRoutes = Router();

usuariosRoutes.get('/', listUsuarios);
usuariosRoutes.get('/:id', getUsuarioById);
usuariosRoutes.post('/', createUsuario);
usuariosRoutes.put('/:id', updateUsuario);
usuariosRoutes.delete('/:id', deleteUsuario);

export default usuariosRoutes;
