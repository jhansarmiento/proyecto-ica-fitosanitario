import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import Rol from '../models/Rol';
import { createUsuarioByProcedure } from '../services/usuarioProcedureService';

const registerProductorSchema = z.object({
  numeroIdentificacion: z.string().min(1, 'numeroIdentificacion es obligatorio'),
  nombre: z.string().min(1, 'nombre es obligatorio'),
  apellidos: z.string().min(1, 'apellidos son obligatorios'),
  direccion: z.string().min(1, 'direccion es obligatoria'),
  telefono: z.string().min(1, 'telefono es obligatorio'),
  correoElectronico: z.string().email('correoElectronico inválido'),
  ingresoUsuario: z.string().min(4, 'ingresoUsuario mínimo 4 caracteres'),
  ingresoContrasena: z.string().min(8, 'ingresoContrasena mínimo 8 caracteres'),
});

export const registerProductor = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerProductorSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: 'Datos inválidos',
        errors: parsed.error.flatten(),
      });
      return;
    }

    const body = parsed.data;

    const rolProductor = await Rol.findOne({ where: { nombre_rol: 'PRODUCTOR' } });
    if (!rolProductor) {
      res.status(500).json({ message: 'No se encontró el rol PRODUCTOR en la base de datos' });
      return;
    }

    const hashed = await bcrypt.hash(body.ingresoContrasena, 10);

    await createUsuarioByProcedure({
      numero_identificacion: body.numeroIdentificacion,
      nombre: body.nombre,
      apellidos: body.apellidos,
      direccion: body.direccion,
      telefono: body.telefono,
      correo_electronico: body.correoElectronico,
      ingreso_usuario: body.ingresoUsuario,
      ingreso_contrasena: hashed,
      tarjeta_profesional: null,
      id_rol: rolProductor.getDataValue('id_rol'),
    });

    res.status(201).json({ message: 'Cuenta de productor creada correctamente' });
  } catch (error: any) {
    if (error?.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({
        message: 'Ya existe un usuario con identificación, correo o nombre de usuario registrado',
      });
      return;
    }

    console.error('Error registrando productor:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
