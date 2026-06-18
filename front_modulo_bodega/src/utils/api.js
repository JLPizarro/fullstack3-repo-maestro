import { fetchWithAuth } from '../../shared_components/apiClient';

export const api = {
  async get(endpoint) {
    const res = await fetchWithAuth(`/bodega${endpoint}`);
    return res.json();
  },
  async post(endpoint, data) {
    const res = await fetchWithAuth(`/bodega${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async put(endpoint, data) {
    const res = await fetchWithAuth(`/bodega${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async del(endpoint) {
    const res = await fetchWithAuth(`/bodega${endpoint}`, {
      method: 'DELETE',
    });
    return res.ok;
  }
};

