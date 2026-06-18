import React from 'react';

/**
 * Props:
 *   title        — string, título principal del header
 *   gradient     — string, clases Tailwind para la barra de color superior (e.g. "from-blue-600 via-indigo-500 to-cyan-400")
 *   children     — nodo(s) a renderizar a la derecha del título (botones, filtros, etc.)
 */
const Header = ({ title, gradient, children }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm relative">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {children && <div className="flex items-center gap-4">{children}</div>}
    </header>
  );
};

export default Header;
