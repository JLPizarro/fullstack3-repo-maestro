import { fetchWithAuth } from '../../../shared_components/apiClient';

export const operacionService = {
  async getViajes(inicio, fin) {
    const params = new URLSearchParams();
    if (inicio) params.append('fecha_inicio', inicio);
    if (fin) params.append('fecha_fin', fin);
    const res = await fetchWithAuth(`/operacion/viajes?${params.toString()}`);
    return res.json();
  },
  async createViaje(data) {
    const res = await fetchWithAuth('/operacion/viajes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async updateViaje(id, data) {
    const res = await fetchWithAuth(`/operacion/viajes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async deleteViaje(id) {
    const res = await fetchWithAuth(`/operacion/viajes/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  }
};

