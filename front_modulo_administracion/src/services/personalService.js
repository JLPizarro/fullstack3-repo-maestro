import { fetchWithAuth } from '../../shared_components/apiClient';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function call(endpoint, options = {}) {
  try {
    const res = await fetchWithAuth(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || `Error: ${res.status}`);
    return data;
  } catch (error) {
    console.error(`API Call failed: ${endpoint}`, error);
    throw error;
  }
}

export const personalService = {
  crear(data) {
    return call('/personal/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  obtenerTodos() {
    return call('/personal/');
  },
  obtenerPorId(id) {
    return call(`/personal/${id}`);
  },
  actualizar(id, data) {
    return call(`/personal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  eliminar(id) {
    return call(`/personal/${id}`, {
      method: 'DELETE',
    });
  },
};
