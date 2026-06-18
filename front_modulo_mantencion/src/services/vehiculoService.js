import { fetchWithAuth } from '../../../shared_components/apiClient';

export const vehiculoService = {
  async crear(data) {
    const res = await fetchWithAuth('/vehiculos/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async obtenerTodos(limit = 100, offset = 0) {
    const res = await fetchWithAuth(`/vehiculos/?limit=${limit}&offset=${offset}`);
    return res.json();
  },
  async obtenerPorId(id) {
    const res = await fetchWithAuth(`/vehiculos/${id}`);
    return res.json();
  },
  async actualizar(id, data) {
    const res = await fetchWithAuth(`/vehiculos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async eliminar(id) {
    const res = await fetchWithAuth(`/vehiculos/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};

