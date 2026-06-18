import React from 'react';

const CombustibleView = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Control de Combustible</h2>
          <p className="text-slate-500 text-sm">Registro de carga y stock de tanques</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all">
            Nueva Carga
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white">
          <p className="text-slate-400 text-xs font-bold uppercase mb-2">Tanque Lampa (Diesel)</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">12,450</span>
            <span className="text-slate-400 mb-1">Litros</span>
          </div>
          <div className="mt-4 w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: '62%' }}></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 uppercase">Capacidad: 20,000 L (62%)</p>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl">
          <p className="text-slate-400 text-xs font-bold uppercase mb-2">Consumo 24h</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-800">840</span>
            <span className="text-slate-400 mb-1">Litros</span>
          </div>
          <p className="text-xs text-green-500 mt-2">↓ 12% vs ayer</p>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl">
          <p className="text-slate-400 text-xs font-bold uppercase mb-2">Próximo Camión</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-800">Mañana</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">OC-5012 Confirmada</p>
        </div>
      </div>

      <div className="border border-slate-100 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Últimos Despachos</h3>
            <button className="text-blue-600 text-xs font-bold uppercase">Descargar Excel</button>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Patente</th>
              <th className="px-6 py-3">Chofer</th>
              <th className="px-6 py-3">KM</th>
              <th className="px-6 py-3 text-right">Litros</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <tr>
              <td className="px-6 py-4">29-04 08:30</td>
              <td className="px-6 py-4 font-bold">ABCD-12</td>
              <td className="px-6 py-4">Juan Perez</td>
              <td className="px-6 py-4">450,230</td>
              <td className="px-6 py-4 text-right font-bold">120 L</td>
            </tr>
            <tr>
              <td className="px-6 py-4">29-04 09:15</td>
              <td className="px-6 py-4 font-bold">EFGH-34</td>
              <td className="px-6 py-4">Carlos Lopez</td>
              <td className="px-6 py-4">320,110</td>
              <td className="px-6 py-4 text-right font-bold">185 L</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CombustibleView;
