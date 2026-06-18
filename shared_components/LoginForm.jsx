import React, { useState } from 'react';
import { decodeJWT, getFirstAuthorizedModule } from './auth';
import { fetchWithAuth } from './apiClient';

/**
 * Props:
 *   onSuccess — (userData) => void, llamado tras login exitoso con el objeto user
 *
 * Comportamiento por defecto (sin onSuccess):
 *   Decodifica el JWT, busca el primer módulo autorizado y redirige.
 */
const LoginForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetchWithAuth('/administracion/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.user.token;
        const userData = data.user.user;

        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));

        if (onSuccess) {
          onSuccess(userData);
        } else {
          const payload = decodeJWT(token);
          const permisos = payload?.permisos || {};
          const nextPath = getFirstAuthorizedModule(permisos);

          if (nextPath) {
            window.location.href = nextPath;
          } else {
            setError('Usuario autenticado pero sin permisos para ningún módulo.');
            localStorage.clear();
          }
        }
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[140px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[140px]"></div>

      <div className="max-w-md w-full z-10">
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              SISTEMA CENTRALIZADO
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-3">BIENVENIDO</h1>
            <p className="text-slate-400 text-sm font-medium">
              Inicia sesión para acceder a tus módulos autorizados
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-800/30 border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="nombre@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-slate-800/30 border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'AUTENTICANDO...' : 'INGRESAR AL PORTAL'}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
              Hub Empresarial &copy; 2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
