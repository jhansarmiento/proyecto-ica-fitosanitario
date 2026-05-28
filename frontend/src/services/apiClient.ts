// el motor de fetch, funcion de request con el JWT automatizado
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    // Recuperamos el token que guardamos en el Login con la mutación snake_case
    const token = localStorage.getItem('token');

    // Enviamos la solicitud
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        // Enviamos el token en la cabecera
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}), // Inyección automática de seguridad
        ...(init?.headers || {}),
      },
      ...init,
    });

    const payload = await response.json().catch(() => ({})); // Manejo de errores

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
