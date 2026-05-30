/**
 * Controlador de autenticación.
 *
 * Gestiona el login con JWT y la recuperación de contraseña sin requerir JWT.
 *
 * - `login` genera un token JWT válido para el usuario.
 * - `forgotPassword` crea un token seguro y envía la URL de recuperación.
 * - `resetPassword` valida el token, actualiza la contraseña y marca el token como usado.
 *
 * El flujo de recuperación usa un token de un solo uso cuyo hash se almacena
 * en la base de datos y se expira después de 30 minutos.
 *
 * @module auth.controller
 */
import { Request, Response } from 'express';
import bcrypt from 'bcrypt'; // compara contraseñas de forma segura
import jwt from 'jsonwebtoken'; // genera el token de autenticación
import crypto from 'crypto';
import { Op } from 'sequelize';
import models from '../index'; // modelos DB Operacional
import dotenv from 'dotenv';
import PasswordResetToken from '../models/PasswordResetToken';
import { sendPasswordResetEmail } from '../services/mail.service';

import {
  LoginResponse,
  JWTPayload,
} from '../types/usuario.types';

dotenv.config();

const RESET_TOKEN_EXP_MINUTES = 30;

/**
 * Controlador para iniciar sesión.
 *
 * Recibe `ingreso_usuario` e `ingreso_contrasena`, valida las credenciales,
 * genera un JWT y devuelve los datos del usuario junto con el token.
 *
 * @param {Request} req Petición HTTP entrante.
 * @param {Response} res Respuesta HTTP saliente.
 * @returns {Promise<void>} Promesa que resuelve cuando la petición finaliza.
 */
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

/**
 * Controlador para solicitar recuperación de contraseña.
 *
 * Valida el correo electrónico, invalida tokens previos activos del usuario,
 * genera un nuevo token de recuperación y lo envía por correo o lo registra en
 * la consola para desarrollo.
 *
 * @param {Request} req Petición HTTP entrante.
 * @param {Response} res Respuesta HTTP saliente.
 * @returns {Promise<void>} Promesa que resuelve cuando la petición finaliza.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = (req.body ?? {}) as { correo_electronico?: unknown };
    const rawEmail =
      typeof body.correo_electronico === 'string'
        ? body.correo_electronico
        : typeof (body as any).email === 'string'
          ? (body as any).email
          : '';

    if (!rawEmail || !rawEmail.trim()) {
      res.status(400).json({ message: 'El correo electrónico es obligatorio' });
      return;
    }

    const email = rawEmail.trim().toLowerCase();

    const usuario: any = await models.Usuario.findOne({
      where: { correo_electronico: email },
    });

    // Respuesta genérica para evitar enumeración de usuarios
    const genericMessage =
      'Si el correo existe en el sistema, recibirás instrucciones para restablecer tu contraseña';

    if (!usuario) {
      res.status(200).json({ message: genericMessage });
      return;
    }

    await PasswordResetToken.update(
      { used_at: new Date() },
      {
        where: {
          id_usuario: usuario.id_usuario,
          used_at: null,
          expires_at: { [Op.gt]: new Date() },
        },
      },
    );

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXP_MINUTES * 60 * 1000);

    await PasswordResetToken.create({
      id_usuario: usuario.id_usuario,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendBaseUrl}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
      console.log(`[RECOVERY] Correo de recuperación enviado a ${email}`);
    } catch (mailError) {
      console.error('[RECOVERY] Falló envío de correo, se mantiene URL para soporte:', mailError);
      console.log(`[RECOVERY] URL de restablecimiento para ${email}: ${resetUrl}`);
    }

    res.status(200).json({ message: genericMessage });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
 * Controlador para restablecer contraseña.
 *
 * Valida el token de recuperación, verifica que no esté expirado ni usado,
 * actualiza la contraseña del usuario y marca el token como utilizado.
 *
 * @param {Request} req Petición HTTP entrante.
 * @param {Response} res Respuesta HTTP saliente.
 * @returns {Promise<void>} Promesa que resuelve cuando la petición finaliza.
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = (req.body ?? {}) as {
      token?: unknown;
      nueva_contrasena?: unknown;
      nuevaContrasena?: unknown;
    };

    const token = typeof body.token === 'string' ? body.token : '';
    const nuevaContrasenaRaw =
      typeof body.nueva_contrasena === 'string'
        ? body.nueva_contrasena
        : typeof body.nuevaContrasena === 'string'
          ? body.nuevaContrasena
          : '';

    if (!token || !nuevaContrasenaRaw) {
      res.status(400).json({ message: 'Token y nueva contraseña son obligatorios' });
      return;
    }

    if (nuevaContrasenaRaw.length < 8) {
      res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await PasswordResetToken.findOne({
      where: {
        token_hash: tokenHash,
        used_at: null,
        expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!resetRecord) {
      res.status(400).json({ message: 'Token inválido o expirado' });
      return;
    }

    const usuario: any = await models.Usuario.scope('withPassword').findByPk(resetRecord.id_usuario);
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(nuevaContrasenaRaw, 10);

    await usuario.update({ ingreso_contrasena: hashedPassword });
    await resetRecord.update({ used_at: new Date() });

    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
