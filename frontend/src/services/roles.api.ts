import type { RolDTO } from '../types/auth.types';
import { request } from './apiClient';
import type { ApiEnvelope } from '../types/api.types';

export const rolesApi = {
  getRoles() {
    return request<ApiEnvelope<RolDTO[]>>('/roles');
  },

  createRole(body: Pick<RolDTO, 'nombre_rol' | 'descripcion'>) {
    return request<{ message: string }>('/roles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  updateRole(id: string, body: Partial<Pick<RolDTO, 'nombre_rol' | 'descripcion'>>) {
    return request<{ message: string }>(`/roles/${id}`, {
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
};
