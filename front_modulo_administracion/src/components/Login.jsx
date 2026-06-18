import { fetchWithAuth } from '../../../shared_components/apiClient';
import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api/v1/administracion';
      const response = await fetchWithAuth(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        // data format: { message: "...", user: { user: {...}, token: "..." } }
        localStorage.setItem('token', data.user.token);
        localStorage.setItem('userData', JSON.stringify(data.user.user));
        onLogin(data.user.user);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 text-center bg-slate-50">
          <div className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">Acceso Seguro</div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">HUB EMPRESARIAL</h1>
          <p className="text-slate-500 text-sm mt-2">Módulo de Administración</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Correo Electrónico</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="ejemplo@empresa.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Contraseña</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transform transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Iniciando Sesión...' : 'Entrar al Sistema'}
          </button>
        </form>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
            v1.0 • Control de Acceso Unificado
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
