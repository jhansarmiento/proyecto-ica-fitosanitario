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
  /**
   * Inicia sesión en el sistema.
   *
   * @param {LoginRequest} body Credenciales de acceso del usuario.
   * @returns {Promise<LoginResponse>} Respuesta con el token y datos del usuario.
   */
  login(body: LoginRequest) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // Roles
  getRoles() {
    return request<ApiEnvelope<RolDTO[]>>('/roles');
  },

  createRole(body: Pick<RolDTO, 'nombre_rol' | 'descripcion'>) {
    return request<ApiEnvelope<RolDTO>>('/roles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  updateRole(id: string, body: Partial<Pick<RolDTO, 'nombre_rol' | 'descripcion'>>) {
    return request<ApiEnvelope<RolDTO>>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...(body.nombre_rol !== undefined ? { nombre_rol: body.nombre_rol } : {}),
        ...(body.descripcion !== undefined ? { descripcion: body.descripcion } : {}),
      }),
    });
  },

  deleteRole(id: string) {
    return request<{ message: string }>(`/roles/${id}`, {
      method: 'DELETE',
    });
  },

  // Usuarios
  createUsuario(body: Partial<UsuarioDTO> & { ingresoContrasena: string }) {
    return request<ApiEnvelope<UsuarioDTO>>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getUsuarios() {
    return request<ApiEnvelope<UsuarioDTO[]>>('/usuarios');
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

  forgotPassword(correo_electronico: string) {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ correo_electronico }),
    });
  },

  resetPassword(token: string, nuevaContrasena: string) {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, nuevaContrasena }),
    });
  },
};
