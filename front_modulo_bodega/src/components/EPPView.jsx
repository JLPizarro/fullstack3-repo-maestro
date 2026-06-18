import React from 'react';

const EPPView = () => {
  const stockEPP = [
    { id: 1, item: 'Casco de Seguridad', stock: 15, critico: 5 },
    { id: 2, item: 'Guantes de Cabritilla', stock: 42, critico: 20 },
    { id: 3, item: 'Zapatos de Seguridad', stock: 8, critico: 10 },
    { id: 4, item: 'Lentes Transparentes', stock: 25, critico: 10 },
  ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de EPP</h2>
          <p className="text-slate-500 text-sm">Control de Elementos de Protección Personal</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all">
          Entrega Masiva
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventario EPP */}
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 font-bold text-slate-700 text-sm">
            Stock Actual EPP
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-50">
                <th className="px-4 py-3 font-medium">Elemento</th>
                <th className="px-4 py-3 font-medium text-center">Stock</th>
                <th className="px-4 py-3 font-medium text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {stockEPP.map(e => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">{e.item}</td>
                  <td className="px-4 py-3 text-center font-mono">{e.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${e.stock <= e.critico ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {e.stock <= e.critico ? 'STOCK BAJO' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Últimas Entregas */}
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 font-bold text-slate-700 text-sm">
            Últimas Entregas a Personal
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div>
                <p className="text-sm font-bold text-slate-700">Juan Perez</p>
                <p className="text-xs text-slate-400">Kit completo (Guantes, Casco, Lentes)</p>
              </div>
              <p className="text-xs font-mono text-slate-500">Hoy 10:30</p>
            </div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div>
                <p className="text-sm font-bold text-slate-700">Maria Gomez</p>
                <p className="text-xs text-slate-400">Zapatos de Seguridad T40</p>
              </div>
              <p className="text-xs font-mono text-slate-500">Ayer 16:45</p>
            </div>
          </div>
          <button className="w-full py-3 text-sm text-blue-600 font-bold hover:bg-blue-50 transition-colors">Ver Historial Completo</button>
        </div>
      </div>
    </div>
  );
};

export default EPPView;
