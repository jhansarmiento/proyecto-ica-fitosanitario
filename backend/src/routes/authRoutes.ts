import { Router } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario';
import Rol from '../models/Rol';

const authRoutes = Router();

authRoutes.post('/login', async (req, res) => {
  try {
    const { ingresoUsuario, ingresoContrasena } = req.body as {
      ingresoUsuario?: string;
      ingresoContrasena?: string;
    };

    if (!ingresoUsuario || !ingresoContrasena) {
      return res.status(400).json({
        message: 'ingresoUsuario e ingresoContrasena son obligatorios',
      });
    }

    const user = await Usuario.scope('withPassword').findOne({
      where: { ingresoUsuario },
      include: [{ model: Rol, as: 'rol', attributes: ['id', 'nombreRol'] }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const passwordOk = await bcrypt.compare(ingresoContrasena, user.getDataValue('ingresoContrasena'));

    if (!passwordOk) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      data: {
        id: user.getDataValue('id'),
        ingresoUsuario: user.getDataValue('ingresoUsuario'),
        nombre: user.getDataValue('nombre'),
        apellidos: user.getDataValue('apellidos'),
        correoElectronico: user.getDataValue('correoElectronico'),
        rol: (user as any).rol?.nombreRol ?? null,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default authRoutes;
