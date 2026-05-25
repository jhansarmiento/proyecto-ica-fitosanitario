import type { UsuarioDTO } from '../types/auth.types';
import { request, type ApiEnvelope } from './http.client';

export const usuariosApi = {
  getUsuarios() {
    return request<ApiEnvelope<UsuarioDTO[]>>('/usuarios');
  },

  createUsuario(body: Partial<UsuarioDTO> & { ingresoContrasena: string }) {
    return request<ApiEnvelope<UsuarioDTO>>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  updateUsuario(id: string, body: Partial<UsuarioDTO> & { ingresoContrasena?: string }) {
    return request<ApiEnvelope<UsuarioDTO>>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  deleteUsuario(id: string) {
    return request<{ message: string }>(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  },
};
