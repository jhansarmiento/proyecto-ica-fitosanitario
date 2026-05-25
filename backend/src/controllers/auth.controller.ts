import { Request, Response } from 'express';
import bcrypt from 'bcrypt'; // compara contraseñas de forma segura
import jwt from 'jsonwebtoken'; // genera el token de autenticación
import models from '../index'; // modelos DB Operacional
import dotenv from 'dotenv';

import {
  LoginResponse,
  JWTPayload,
} from '../types/usuario.types';

dotenv.config();

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ingreso_usuario, ingreso_contrasena } = req.body; // Recibimos los datos del cuerpo de la solicitud

    // 1. Buscar al usuario donde ingreso_usuario coincida
    const usuario: any = await models.Usuario.scope('withPassword').findOne({
      where: { ingreso_usuario },
      include: [{ association: 'rol' }],
    });

    if (!usuario) { // Si no encontramos al usuario
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // 2. Comparar la contraseña encriptada
    // Comparamos la contraseña encriptada con la ingresada por el usuario
    const validPassword = await bcrypt.compare(ingreso_contrasena, usuario.ingreso_contrasena);
    if (!validPassword) { // Si la contraseña no coincide
      res.status(401).json({ message: 'Contraseña incorrecta' });
      return;
    }

    // 3. Estructuramos el Payload del JWT usando la interfaz
    const payload: JWTPayload = {
      id: usuario.id_usuario,
      rol: usuario.rol.nombre_rol,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
    };

    // 4. Generar el Token (Firma digital)
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'semilla_secreta_desarrollo', // Llave de firma en env
      { expiresIn: '8h' }, // El token expira en 8 horas
    );

    // 5. Enviar respuesta exitosa
    const respuesta: LoginResponse = {
      message: 'Login exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correo_electronico: usuario.correo_electronico,
        rol: usuario.rol.nombre_rol,
      },
    };

    res.json(respuesta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
