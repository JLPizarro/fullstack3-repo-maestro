import React, { useState, useEffect } from 'react';
import { decodeJWT } from './auth';

const ALL_MODULES = [
  { id: 'rrhh', name: 'RRHH', path: '/rrhh/' },
  { id: 'mantenciones', name: 'Mantención', path: '/mantencion/' },
  { id: 'prevencion', name: 'Prevención', path: '/prevencion/' },
  { id: 'acreditacion', name: 'Acreditación', path: '/acreditacion/' },
  { id: 'operacion', name: 'Operación', path: '/operacion/' },
  { id: 'bodega', name: 'Bodega', path: '/bodega/' },
  { id: 'facturacion', name: 'Facturación', path: '/facturacion/' },
  { id: 'administracion', name: 'Administración', path: '/' },
  { id: 'watchdog', name: 'Watchdog', path: '/watchdog/' },
];

/**
 * Props:
 *   moduleName      — string, nombre mostrado en el header del sidebar (e.g. "RRHH")
 *   accentColor     — string, clase Tailwind de color para el acento (e.g. "blue")
 *   activePath      — string, path del módulo activo (e.g. "/rrhh/")
 *   permiso         — "view" | "edit"
 *   badge           — string opcional, texto del badge bajo el nombre
 *   menuItems       — array de { id, label, icon, requiresEdit? }
 *   activeTab       — id del tab activo
 *   onTabChange     — (id) => void
 *   onLogout        — () => void
 *   currentUser     — object con { nombre } opcional
 *   children        — nodo extra para el footer del sidebar (opcional)
 */
const Sidebar = ({
  moduleName,
  accentColor = 'blue',
  activePath,
  permiso,
  badge,
  menuItems = [],
  activeTab,
  onTabChange,
  onLogout,
  currentUser,
}) => {
  const [allowedModules, setAllowedModules] = useState([]);
  const [userName, setUserName] = useState(currentUser?.nombre || '');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJWT(token);
      if (payload) {
        if (!currentUser && payload.nombre) setUserName(payload.nombre);
        const permisos = payload.permisos || {};
        
        const filtered = ALL_MODULES.filter(m => {
          const nivel = permisos[m.id] || 'none';
          return nivel === 'view' || nivel === 'edit';
        });
        setAllowedModules(filtered);
      }
    }
  }, [currentUser]);

  const filteredMenuItems = menuItems.filter(
    (item) => !item.requiresEdit || permiso === 'edit'
  );

  const accent = {
    blue:    { text: 'text-blue-400',   border: 'border-blue-500',   bg: 'bg-blue-500/20',   badgeBorder: 'border-blue-500/30',   badgeText: 'text-blue-300',   specialBorder: 'border-blue-500/30' },
    emerald: { text: 'text-emerald-400',border: 'border-emerald-500',bg: 'bg-emerald-500/20',badgeBorder: 'border-emerald-500/30',badgeText: 'text-emerald-300',specialBorder: 'border-emerald-500/30' },
    amber:   { text: 'text-amber-400',  border: 'border-amber-500',  bg: 'bg-amber-500/20',  badgeBorder: 'border-amber-500/30',  badgeText: 'text-amber-300',  specialBorder: 'border-amber-500/30' },
    red:     { text: 'text-red-400',    border: 'border-red-500',    bg: 'bg-red-500/20',    badgeBorder: 'border-red-500/30',    badgeText: 'text-red-300',    specialBorder: 'border-red-500/30' },
    indigo:  { text: 'text-indigo-400', border: 'border-indigo-500', bg: 'bg-indigo-500/20', badgeBorder: 'border-indigo-500/30', badgeText: 'text-indigo-300', specialBorder: 'border-indigo-500/30' },
    slate:   { text: 'text-slate-400',  border: 'border-slate-500',  bg: 'bg-slate-800',     badgeBorder: 'border-slate-500/30',  badgeText: 'text-slate-300',  specialBorder: 'border-slate-500/30' },
  }[accentColor] || { text: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-500/20', badgeBorder: 'border-blue-500/30', badgeText: 'text-blue-300', specialBorder: 'border-blue-500/30' };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
      <div className="p-6 border-b border-slate-800">
        <div className={`text-xs font-bold ${accent.text} uppercase tracking-widest mb-1`}>Hub Empresarial</div>
        <div className="text-xl font-bold text-white uppercase tracking-tighter">{moduleName}</div>
        {badge && (
          <div className={`mt-2 inline-block px-2 py-0.5 rounded ${accent.bg} text-[10px] ${accent.badgeText} border ${accent.badgeBorder} font-bold uppercase tracking-widest`}>
            {badge}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {filteredMenuItems.length > 0 && (
          <>
            <div className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Navegación</div>
            {filteredMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-6 py-3 text-sm transition-colors ${
                  activeTab === item.id
                    ? `bg-slate-800 text-white border-l-4 ${accent.border}`
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="mr-3 opacity-70">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </>
        )}

        {allowedModules.length > 0 && (
          <>
            <div className="mt-8 px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-800 pt-6">
              Módulos del Sistema
            </div>
            {allowedModules.map((m) => {
              const isActive = m.path === activePath;
              const isWatchdog = m.path === '/watchdog/';
              return (
                <a
                  key={m.path}
                  href={m.path}
                  className={`flex items-center px-6 py-2 text-xs transition-colors ${
                    isActive ? `${accent.text} font-bold` : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  } ${isWatchdog ? `mt-2 border ${accent.specialBorder} rounded mx-4 py-1 justify-center` : ''}`}
                >
                  {m.name}
                </a>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 bg-slate-800/50 border-t border-slate-800">
        {userName && (
          <>
            <div className="text-xs font-bold text-white mb-1">{userName}</div>
            <div className="flex items-center text-[10px] text-green-400 mb-4">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-2"></span>
              Sesión Activa
            </div>
          </>
        )}
        <button
          onClick={onLogout}
          className="w-full text-left text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

