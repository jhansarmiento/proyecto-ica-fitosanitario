// backend/src/controllers/rol.controller.ts
import { Request, Response } from 'express';
import { createRolSchema, updateRolSchema } from '../schemas/rol.schema';
import type { CreateRolInput, UpdateRolInput } from '../types/rol.types';
import {
  listRolesByFunction,
  createRolByProcedure,
  updateRolByProcedure,
  deleteRolByProcedure,
} from '../services/rolProcedureService';

// Controladores para la gestión de roles en el sistema fitosanitario
export const listRoles = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const roles = await listRolesByFunction();
    return res.status(200).json({ data: roles });
  } catch (error) {
    console.error('❌ Error listando roles:', error);
    return res.status(500).json({ message: 'Error interno del servidor al cargar roles.' });
  }
};

export const getRolById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const roles = await listRolesByFunction();
    const rol = roles.find((r) => r.id_rol === id);
    if (!rol) return res.status(404).json({ message: 'Rol no encontrado.' });
    return res.status(200).json({ data: rol });
  } catch (error) {
    console.error('❌ Error obteniendo rol:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const createRol = async (req: Request, res: Response): Promise<Response> => {
  try {
    const parsed = createRolSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Datos del rol inválidos.',
        errors: parsed.error.flatten(),
      });
    }

    const body: CreateRolInput = parsed.data;
    await createRolByProcedure({
      nombreRol: body.nombre_rol,
      descripcion: body.descripcion ?? '',
    });

    return res.status(201).json({ message: 'Rol creado con éxito.' });
  } catch (error: unknown) {
    const dbError = error as { name?: string };
    if (dbError?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ya existe un rol registrado con ese nombre descriptivo.' });
    }
    console.error('❌ Error creando rol:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const updateRol = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const parsed = updateRolSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Estructura de cambios de rol inválida.',
        errors: parsed.error.flatten(),
      });
    }

    const body: UpdateRolInput = parsed.data;

    await updateRolByProcedure({
      id_rol: id,
      nombreRol: body.nombre_rol,
      descripcion: body.descripcion,
    });

    return res.status(200).json({ message: 'Rol actualizado formalmente.' });
  } catch (error: unknown) {
    const dbError = error as { name?: string };
    if (dbError?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Conflicto: El nombre de rol ingresado ya está en uso.' });
    }
    console.error('❌ Error actualizando rol:', error);
    return res.status(500).json({ message: 'Error interno al modificar el registro.' });
  }
};

export const deleteRol = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await deleteRolByProcedure(id);
    return res.status(200).json({ message: 'Rol eliminado satisfactoriamente.' });
  } catch (error) {
    console.error('❌ Error eliminando rol:', error);
    return res.status(500).json({ message: 'No se puede eliminar el rol porque está asignado a usuarios activos.' });
  }
};