import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario';
import Rol from '../models/Rol';
import { createUsuarioSchema, updateUsuarioSchema } from '../schemas/usuario.schema';
import { CreateUsuarioInput, UpdateUsuarioInput } from '../types/usuario.types';
import {
  createUsuarioByProcedure,
  deleteUsuarioByProcedure,
  updateUsuarioByProcedure,
} from '../services/usuarioProcedureService';

export const listUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [{ model: Rol, as: 'rol', attributes: ['id_rol', 'nombreRol'] }],
      order: [['nombre', 'ASC']],
    });

    return res.status(200).json({ data: usuarios });
  } catch (error) {
    console.error('Error listando usuarios:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getUsuarioById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: 'rol', attributes: ['id_rol', 'nombreRol'] }],
    });

    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.status(200).json({ data: usuario });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createUsuario = async (req: Request, res: Response) => {
  try {
    const parsed = createUsuarioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: parsed.error.flatten(),
      });
    }

    const body: CreateUsuarioInput = parsed.data;
    const hashed = await bcrypt.hash(body.ingresoContrasena, 10);

    await createUsuarioByProcedure({
      numero_identificacion: body.numeroIdentificacion,
      nombre: body.nombre,
      apellidos: body.apellidos,
      direccion: body.direccion ?? undefined,
      telefono: body.telefono ?? undefined,
      correo_electronico: body.correoElectronico,
      ingreso_usuario: body.ingresoUsuario,
      ingreso_contrasena: hashed,
      tarjeta_profesional: body.tarjetaProfesional ?? null,
      id_rol: body.idRol,
    });

    const usuario = await Usuario.findOne({
      where: { ingreso_usuario: body.ingresoUsuario },
      include: [{ model: Rol, as: 'rol', attributes: ['id_rol', 'nombreRol'] }],
    });

    return res.status(201).json({ message: 'Usuario creado', data: usuario });
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: 'Ya existe un usuario con identificación, correo o nombre de usuario registrado',
      });
    }

    console.error('Error creando usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateUsuario = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const usuario = await Usuario.scope('withPassword').findByPk(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const parsed = updateUsuarioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: parsed.error.flatten(),
      });
    }

    const body: UpdateUsuarioInput = parsed.data;

    let hashed: string | undefined = undefined;
    if (body.ingresoContrasena) {
      hashed = await bcrypt.hash(body.ingresoContrasena, 10);
    }

    await updateUsuarioByProcedure({
      id_usuario: id,
      numero_identificacion: body.numeroIdentificacion,
      nombre: body.nombre,
      apellidos: body.apellidos,
      direccion: body.direccion,
      telefono: body.telefono,
      correo_electronico: body.correoElectronico,
      ingreso_usuario: body.ingresoUsuario,
      ingreso_contrasena: hashed,
      tarjeta_profesional: body.tarjetaProfesional,
      id_rol: body.idRol,
    });

    const updated = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: 'rol', attributes: ['id_rol', 'nombreRol'] }],
    });

    return res.status(200).json({ message: 'Usuario actualizado', data: updated });
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: 'Ya existe un usuario con identificación, correo o nombre de usuario registrado',
      });
    }

    console.error('Error actualizando usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    await deleteUsuarioByProcedure(id);
    return res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return res.status(500).json({ message: 'No se pudo eliminar el usuario (puede estar en uso)' });
  }
};
