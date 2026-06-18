import { fetchWithAuth } from '../../../shared_components/apiClient';

export const clienteService = {
  async getAll() {
    const res = await fetchWithAuth('/acreditacion/clientes');
    return res.json();
  },
  async create(data) {
    const res = await fetchWithAuth('/acreditacion/clientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  }
};

export const requerimientoService = {
  async create(data) {
    const res = await fetchWithAuth('/acreditacion/requerimientos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async getByCliente(clienteId) {
    const res = await fetchWithAuth(`/acreditacion/clientes/${clienteId}/requerimientos`);
    return res.json();
  }
};

export const acreditacionService = {
  async create(data) {
    const res = await fetchWithAuth('/acreditacion/acreditaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.sujeto_id) params.append('sujeto_id', filters.sujeto_id);
    if (filters.tipo_sujeto) params.append('tipo_sujeto', filters.tipo_sujeto);
    const res = await fetchWithAuth(`/acreditacion/acreditaciones?${params.toString()}`);
    return res.json();
  }
};

