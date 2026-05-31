import { Response } from 'express';
import models from '../index';
import { AuthenticatedRequest } from '../types/usuario.types';

export const obtenerMisNotificaciones = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const idUsuario = req.usuario?.id;
    if (!idUsuario) {
      res.status(401).json({ message: 'Usuario no autenticado.' });
      return;
    }

    const notificaciones = await models.Notificacion.findAll({
      where: { id_usuario_destino: idUsuario },
      order: [['fecha_creacion', 'DESC']],
      limit: 30,
    });

    res.status(200).json({ data: notificaciones });
  } catch (error) {
    console.error('❌ Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error interno al obtener notificaciones.' });
  }
};

export const marcarNotificacionLeida = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const idUsuario = req.usuario?.id;
    const { id } = req.params;

    if (!idUsuario) {
      res.status(401).json({ message: 'Usuario no autenticado.' });
      return;
    }

    const notificacion = await models.Notificacion.findByPk(id);
    if (!notificacion) {
      res.status(404).json({ message: 'Notificación no encontrada.' });
      return;
    }

    if (notificacion.getDataValue('id_usuario_destino') !== idUsuario) {
      res.status(403).json({ message: 'No autorizado para modificar esta notificación.' });
      return;
    }

    await notificacion.update({ leida: true });

    res.status(200).json({ message: 'Notificación marcada como leída.' });
  } catch (error) {
    console.error('❌ Error al marcar notificación:', error);
    res.status(500).json({ message: 'Error interno al marcar notificación.' });
  }
};
