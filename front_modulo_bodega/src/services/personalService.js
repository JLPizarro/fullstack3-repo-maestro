import { fetchWithAuth } from '../../../shared_components/apiClient';

export const personalService = {
  async crear(data) {
    const res = await fetchWithAuth('/personal/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async obtenerTodos() {
    const res = await fetchWithAuth('/personal/');
    return res.json();
  },
  async obtenerPorId(id) {
    const res = await fetchWithAuth(`/personal/${id}`);
    return res.json();
  },
  async actualizar(id, data) {
    const res = await fetchWithAuth(`/personal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async eliminar(id) {
    const res = await fetchWithAuth(`/personal/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};

