import { fetchWithAuth } from '../../../shared_components/apiClient';

export const mantencionService = {
  async crear(data) {
    const res = await fetchWithAuth('/mantenciones/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async obtenerTodos() {
    const res = await fetchWithAuth('/mantenciones/');
    return res.json();
  },
  async obtenerPorId(id) {
    const res = await fetchWithAuth(`/mantenciones/${id}`);
    return res.json();
  },
  async actualizar(id, data) {
    const res = await fetchWithAuth(`/mantenciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async eliminar(id) {
    const res = await fetchWithAuth(`/mantenciones/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  async obtenerStatusPreventivo() {
    const res = await fetchWithAuth('/preventive/status-preventivo');
    return res.json();
  },
};

