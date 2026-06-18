const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const fetchWithAuth = async (url, options = {}) => {
  const headers = getHeaders();
  
  // Si la URL es relativa (empieza con /), le ponemos la base
  const finalUrl = url.startsWith('/') ? `${API_BASE}${url}` : url;
  
  const response = await fetch(finalUrl, { 
    ...options, 
    headers: { ...headers, ...options.headers } 
  });
  
  if (response.status === 401 || response.status === 403) {
    localStorage.clear();
    window.location.href = '/login/';
    throw new Error('Unauthorized or Session Expired');
  }
  
  return response;
};

