import { Router } from 'express';
import Rol from '../models/Rol';

const rolesRoutes = Router();

rolesRoutes.get('/', async (_req, res) => {
  try {
    const roles = await Rol.findAll({ order: [['nombreRol', 'ASC']] });
    return res.status(200).json({ data: roles });
  } catch (error) {
    console.error('Error listando roles:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

rolesRoutes.get('/:id', async (req, res) => {
  try {
    const role = await Rol.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });
    return res.status(200).json({ data: role });
  } catch (error) {
    console.error('Error obteniendo rol:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

rolesRoutes.post('/', async (req, res) => {
  try {
    const { nombreRol, descripcion } = req.body as {
      nombreRol?: string;
      descripcion?: string;
    };

    if (!nombreRol || !descripcion) {
      return res.status(400).json({ message: 'nombreRol y descripcion son obligatorios' });
    }

    const created = await Rol.create({ nombreRol, descripcion });
    return res.status(201).json({ message: 'Rol creado', data: created });
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ya existe un rol con ese nombre' });
    }
    console.error('Error creando rol:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

rolesRoutes.put('/:id', async (req, res) => {
  try {
    const role = await Rol.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

    const { nombreRol, descripcion } = req.body as {
      nombreRol?: string;
      descripcion?: string;
    };

    await role.update({
      nombreRol: nombreRol ?? role.getDataValue('nombreRol'),
      descripcion: descripcion ?? role.getDataValue('descripcion'),
    });

    return res.status(200).json({ message: 'Rol actualizado', data: role });
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ya existe un rol con ese nombre' });
    }
    console.error('Error actualizando rol:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

rolesRoutes.delete('/:id', async (req, res) => {
  try {
    const role = await Rol.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

    await role.destroy();
    return res.status(200).json({ message: 'Rol eliminado' });
  } catch (error) {
    console.error('Error eliminando rol:', error);
    return res.status(500).json({ message: 'No se pudo eliminar el rol (puede estar en uso)' });
  }
});

export default rolesRoutes;
