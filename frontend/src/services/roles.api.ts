import type { RolDTO } from '../types/auth.types';
import { request } from './apiClient';
import type { ApiEnvelope } from '../types/api.types';

export const rolesApi = {
  getRoles() {
    return request<ApiEnvelope<RolDTO[]>>('/roles');
  },

  createRole(body: Pick<RolDTO, 'nombreRol' | 'descripcion'>) {
    return request<ApiEnvelope<RolDTO>>('/roles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  updateRole(id: string, body: Partial<Pick<RolDTO, 'nombreRol' | 'descripcion'>>) {
    return request<ApiEnvelope<RolDTO>>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...(body.nombreRol !== undefined ? { nombreRol: body.nombreRol } : {}),
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
