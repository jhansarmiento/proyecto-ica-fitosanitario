import { request } from './apiClient';

export type NotificacionDTO = {
  id_notificacion: string;
  id_usuario_destino: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  leida: boolean;
  metadata?: Record<string, unknown> | null;
  fecha_creacion: string;
};

type Envelope<T> = {
  data: T;
};

export const notificacionService = {
  async getMisNotificaciones() {
    return request<Envelope<NotificacionDTO[]>>('/notificaciones/mis-notificaciones');
  },

  async marcarLeida(idNotificacion: string) {
    return request<{ message: string }>(`/notificaciones/${idNotificacion}/leida`, {
      method: 'PATCH',
    });
  },
};
