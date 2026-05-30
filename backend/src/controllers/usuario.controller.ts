// backend/src/controllers/usuario.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario';
import Rol from '../models/Rol';
import { createUsuarioSchema, updateUsuarioSchema } from '../schemas/usuario.schema';
import type { CreateUsuarioInput, UpdateUsuarioInput } from '../types/usuario.types';
import {
  createUsuarioByProcedure,
  deleteUsuarioByProcedure,
  updateUsuarioByProcedure,
} from '../services/usuarioProcedureService';

// Controladores para la gestión de usuarios en el sistema fitosanitario
export const obtenerUsuarios = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const usuarios = await Usuario.findAll({
      // 💡 Ajustamos 'nombreRol' a 'nombre_rol' según tu diagrama relacional físico
      include: [{ model: Rol, as: 'rol', attributes: ['id_rol', 'nombre_rol'] }],
      order: [['nombre', 'ASC']],
    });

    return res.status(200).json({ data: usuarios });
  } catch (error) {
    console.error('❌ Error listando usuarios:', error);
    return res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
  }
};

// Controlador para obtener un usuario por su ID
export const obtenerUsuarioPorId = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Rol, as: 'rol', attributes: ['id_rol', 'nombre_rol'] }],
    });

    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado.' });
    return res.status(200).json({ data: usuario });
  } catch (error) {
    console.error('❌ Error obteniendo usuario por ID:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const crearUsuario = async (req: Request, res: Response): Promise<Response> => {
  try {
    const parsed = createUsuarioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Datos inválidos en el formulario de registro.',
        errors: parsed.error.flatten(),
      });
    }

    const body: CreateUsuarioInput = parsed.data;
    const hashed = await bcrypt.hash(body.ingresoContrasena, 10);

    // Ejecución del procedimiento almacenado de persistencia
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
      include: [{ model: Rol, as: 'rol', attributes: ['id_rol', 'nombre_rol'] }],
    });

    return res.status(201).json({ message: 'Usuario registrado con éxito.', data: usuario });
  } catch (error: unknown) {
    const dbError = error as { name?: string };
    if (dbError?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: 'Conflictos de duplicación: La identificación, correo o nombre de usuario ya existen.',
      });
    }

    console.error('❌ Error creando usuario:', error);
    return res.status(500).json({ message: 'Error interno al procesar el procedimiento de creación.' });
  }
};

// Controlador para actualizar un usuario
export const actualizarUsuario = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const usuario = await Usuario.scope('withPassword').findByPk(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado.' });

    const parsed = updateUsuarioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Datos de actualización inválidos.',
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
      include: [{ model: Rol, as: 'rol', attributes: ['id_rol', 'nombre_rol'] }],
    });

    return res.status(200).json({ message: 'Usuario actualizado con éxito.', data: updated });
  } catch (error: unknown) {
    const dbError = error as { name?: string };
    if (dbError?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        message: 'No se pueden guardar los cambios: El correo o identificación ya pertenecen a otro usuario.',
      });
    }

    console.error('❌ Error actualizando usuario:', error);
    return res.status(500).json({ message: 'Error interno al ejecutar la actualización.' });
  }
};

export const eliminarUsuario = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado.' });

    await deleteUsuarioByProcedure(id);
    return res.status(200).json({ message: 'Usuario eliminado del sistema fitosanitario.' });
  } catch (error) {
    console.error('❌ Error eliminando usuario:', error);
    return res.status(500).json({ message: 'Restricción de Integridad: El usuario tiene registros operacionales activos.' });
  }
};