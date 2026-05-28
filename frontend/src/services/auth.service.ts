// servicios de login
import { request } from './apiClient';
import type { ApiEnvelope } from '../types/api.types';
import type { 
  LoginRequest, 
  LoginResponse, 
  UsuarioDTO, 
  RolDTO 
} from '../types/auth.types';

export const authService = {
  login(body: LoginRequest) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getUsuarios() {
    return request<ApiEnvelope<UsuarioDTO[]>>('/usuarios');
  },

  getRoles() {
    return request<ApiEnvelope<RolDTO[]>>('/roles');
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
  }
};
