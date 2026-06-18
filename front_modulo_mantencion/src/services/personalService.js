import { fetchWithAuth } from '../../../shared_components/apiClient';

export const personalService = {
  async obtenerTodos() {
    const res = await fetchWithAuth('/personal/');
    return res.json();
  },

  async obtenerPorId(id) {
    const res = await fetchWithAuth(`/personal/${id}`);
    return res.json();
  }
};

