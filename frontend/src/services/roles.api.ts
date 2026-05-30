import type { RolDTO } from '../types/auth.types';
import { request } from './apiClient';
import type { ApiEnvelope } from '../types/api.types';

/**
 * API del módulo de roles.
 *
 * Contrato principal:
 * - Lectura de listado: `GET /roles`
 * - Escritura (create/update): payload en snake_case (`nombre_rol`, `descripcion`)
 */
export const rolesApi = {
  /**
   * Obtiene el listado de roles.
   *
   * @returns {Promise<ApiEnvelope<RolDTO[]>>} Envoltorio con colección de roles.
   */
  getRoles() {
    return request<ApiEnvelope<RolDTO[]>>('/roles');
  },

  /**
   * Crea un rol.
   *
   * @param {Pick<RolDTO, 'nombre_rol' | 'descripcion'>} body Datos del rol.
   * @returns {Promise<{ message: string }>} Mensaje de resultado.
   */
  createRole(body: Pick<RolDTO, 'nombre_rol' | 'descripcion'>) {
    return request<{ message: string }>('/roles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /**
   * Actualiza un rol existente.
   *
   * @param {string} id Identificador del rol.
   * @param {Partial<Pick<RolDTO, 'nombre_rol' | 'descripcion'>>} body Campos editables.
   * @returns {Promise<{ message: string }>} Mensaje de resultado.
   */
  updateRole(id: string, body: Partial<Pick<RolDTO, 'nombre_rol' | 'descripcion'>>) {
    return request<{ message: string }>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...(body.nombre_rol !== undefined ? { nombre_rol: body.nombre_rol } : {}),
        ...(body.descripcion !== undefined ? { descripcion: body.descripcion } : {}),
      }),
    });
  },

  /**
   * Elimina un rol por identificador.
   *
   * @param {string} id Identificador del rol.
   * @returns {Promise<{ message: string }>} Mensaje de resultado.
   */
  deleteRole(id: string) {
    return request<{ message: string }>(`/roles/${id}`, {
      method: 'DELETE',
    });
  },
};
