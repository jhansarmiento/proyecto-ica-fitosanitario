/**
 * Servicio de autenticación y gestión de usuarios.
 *
 * Proporciona funciones para iniciar sesión, recuperar contraseña,
 * restablecer contraseña y consultar usuarios/roles desde el backend.
 *
 * @module authService
 */
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

  /**
   * Solicita el envío del correo de recuperación de contraseña.
   *
   * @param {{ correo_electronico: string }} body Objeto con el correo electrónico.
   * @returns {Promise<{ message: string }>} Mensaje de éxito del backend.
   */
  forgotPassword(body: { correo_electronico: string }) {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /**
   * Restablece la contraseña usando el token de recuperación.
   *
   * @param {{ token: string; nueva_contrasena: string }} body Datos de restablecimiento.
   * @returns {Promise<{ message: string }>} Mensaje de confirmación del backend.
   */
  resetPassword(body: { token: string; nueva_contrasena: string }) {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /**
   * Obtiene la lista de usuarios del sistema.
   *
   * @returns {Promise<ApiEnvelope<UsuarioDTO[]>>} Paquete de respuesta con los usuarios.
   */
  getUsuarios() {
    return request<ApiEnvelope<UsuarioDTO[]>>('/usuarios');
  },

  /**
   * Crea un nuevo usuario.
   *
   * @param {Partial<UsuarioDTO> & { ingresoContrasena: string }} body Datos del usuario a crear.
   * @returns {Promise<ApiEnvelope<UsuarioDTO>>} Respuesta con el usuario creado.
   */
  createUsuario(body: Partial<UsuarioDTO> & { ingresoContrasena: string }) {
    return request<ApiEnvelope<UsuarioDTO>>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /**
   * Obtiene los roles definidos en el sistema.
   *
   * @returns {Promise<ApiEnvelope<RolDTO[]>>} Paquete de respuesta con los roles.
   */
  getRoles() {
    return request<ApiEnvelope<RolDTO[]>>('/roles');
  }
  // ... aquí meten los métodos de update y delete de usuarios/roles
};
