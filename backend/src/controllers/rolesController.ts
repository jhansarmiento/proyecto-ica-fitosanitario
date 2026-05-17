import { Request, Response } from 'express';
import Rol from '../models/Rol';
import { createRolSchema, updateRolSchema } from '../schemas/rol.schema';
import { CreateRolInput, UpdateRolInput } from '../types/rol.types';

export const listRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await Rol.findAll({ order: [['nombreRol', 'ASC']] });
    return res.status(200).json({ data: roles });
  } catch (error) {
    console.error('Error listando roles:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getRolById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const role = await Rol.findByPk(id);
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });
    return res.status(200).json({ data: role });
  } catch (error) {
    console.error('Error obteniendo rol:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createRol = async (req: Request, res: Response) => {
  try {
    const parsed = createRolSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.flatten() });
    }

    const body: CreateRolInput = parsed.data;
    const created = await Rol.create({ nombreRol: body.nombreRol, descripcion: body.descripcion });
    return res.status(201).json({ message: 'Rol creado', data: created });
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ya existe un rol con ese nombre' });
    }
    console.error('Error creando rol:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateRol = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const role = await Rol.findByPk(id);
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

    const parsed = updateRolSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.flatten() });
    }

    const body: UpdateRolInput = parsed.data;

    await role.update({
      nombreRol: body.nombreRol ?? role.getDataValue('nombreRol'),
      descripcion: body.descripcion ?? role.getDataValue('descripcion'),
    });

    return res.status(200).json({ message: 'Rol actualizado', data: role });
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ya existe un rol con ese nombre' });
    }
    console.error('Error actualizando rol:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteRol = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const role = await Rol.findByPk(id);
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

    await role.destroy();
    return res.status(200).json({ message: 'Rol eliminado' });
  } catch (error) {
    console.error('Error eliminando rol:', error);
    return res.status(500).json({ message: 'No se pudo eliminar el rol (puede estar en uso)' });
  }
};
