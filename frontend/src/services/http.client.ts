const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export type ApiEnvelope<T> = {
  message?: string;
  data: T;
};

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      ...init,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.message || 'Error en la solicitud');
    }

    return payload as T;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté encendido.');
    }
    throw error;
  }
}
