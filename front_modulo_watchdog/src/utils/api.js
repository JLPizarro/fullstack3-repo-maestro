import { fetchWithAuth } from '../../shared_components/apiClient';
const createApi = (baseUrl) => {
  const get = async (endpoint) => {
    const response = await fetchWithAuth(`${baseUrl}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  };

  const post = async (endpoint, data) => {
    const response = await fetchWithAuth(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  };

  const put = async (endpoint, data) => {
    const response = await fetchWithAuth(`${baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  };

  const del = async (endpoint) => {
    const response = await fetchWithAuth(`${baseUrl}${endpoint}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return true;
  };

  return { get, post, put, del };
};

export const api = createApi(import.meta.env.VITE_API_URL || 'http://localhost:8000');
