import { Router } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario';
import Rol from '../models/Rol';

const usuariosRoutes = Router();

usuariosRoutes.get('/', async (_req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [{ model: Rol, as: 'rol', attributes: ['id', 'nombreRol'] }],
      order: [['nombre', 'ASC']],
    });
    return res.status(200).json({ data: usuarios });
  } catch (error) {
    console.error('Error listando usuarios:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

usuariosRoutes.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [{ model: Rol, as: 'rol', attributes: ['id', 'nombreRol'] }],
    });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.status(200).json({ data: usuario });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

usuariosRoutes.post('/', async (req, res) => {
  try {
    const body = req.body as {
      numeroIdentificacion?: string;
      nombre?: string;
      apellidos?: string;
      direccion?: string;
      telefono?: string;
      correoElectronico?: string;
      ingresoUsuario?: string;
      ingresoContrasena?: string;
      tarjetaProfesional?: string | null;
      idRol?: string;
    };

    const required = [
      body.numeroIdentificacion,
      body.nombre,
      body.apellidos,
      body.correoElectronico,
      body.ingresoUsuario,
      body.ingresoContrasena,
      body.idRol,
    ];

    if (required.some((v) => !v)) {
      return res.status(400).json({
        message:
          'numeroIdentificacion, nombre, apellidos, correoElectronico, ingresoUsuario, ingresoContrasena e idRol son obligatorios',
      });
    }

    const hashed = await bcrypt.hash(body.ingresoContrasena as string, 10);

    const created = await Usuario.create({
      numeroIdentificacion: body.numeroIdentificacion,
      nombre: body.nombre,
      apellidos: body.apellidos,
      direccion: body.direccion ?? '',
      telefono: body.telefono ?? '',
      correoElectronico: body.correoElectronico,
      ingresoUsuario: body.ingresoUsuario,
      ingresoContrasena: hashed,
      tarjetaProfesional: body.tarjetaProfesional ?? null,
      idRol: body.idRol,
    });

    const usuario = await Usuario.findByPk(created.getDataValue('id'), {
      include: [{ model: Rol, as: 'rol', attributes: ['id', 'nombreRol'] }],
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
});

usuariosRoutes.put('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.scope('withPassword').findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const body = req.body as {
      numeroIdentificacion?: string;
      nombre?: string;
      apellidos?: string;
      direccion?: string;
      telefono?: string;
      correoElectronico?: string;
      ingresoUsuario?: string;
      ingresoContrasena?: string;
      tarjetaProfesional?: string | null;
      idRol?: string;
    };

    let hashed = usuario.getDataValue('ingresoContrasena');
    if (body.ingresoContrasena) {
      hashed = await bcrypt.hash(body.ingresoContrasena, 10);
    }

    await usuario.update({
      numeroIdentificacion: body.numeroIdentificacion ?? usuario.getDataValue('numeroIdentificacion'),
      nombre: body.nombre ?? usuario.getDataValue('nombre'),
      apellidos: body.apellidos ?? usuario.getDataValue('apellidos'),
      direccion: body.direccion ?? usuario.getDataValue('direccion'),
      telefono: body.telefono ?? usuario.getDataValue('telefono'),
      correoElectronico: body.correoElectronico ?? usuario.getDataValue('correoElectronico'),
      ingresoUsuario: body.ingresoUsuario ?? usuario.getDataValue('ingresoUsuario'),
      ingresoContrasena: hashed,
      tarjetaProfesional:
        body.tarjetaProfesional !== undefined
          ? body.tarjetaProfesional
          : usuario.getDataValue('tarjetaProfesional'),
      idRol: body.idRol ?? usuario.getDataValue('idRol'),
    });

    const updated = await Usuario.findByPk(usuario.getDataValue('id'), {
      include: [{ model: Rol, as: 'rol', attributes: ['id', 'nombreRol'] }],
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
});

usuariosRoutes.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    await usuario.destroy();
    return res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return res.status(500).json({ message: 'No se pudo eliminar el usuario (puede estar en uso)' });
  }
});

export default usuariosRoutes;
