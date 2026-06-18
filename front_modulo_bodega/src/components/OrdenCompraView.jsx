import React from 'react';

const OrdenCompraView = () => {
  const ocs = [
    { id: 'OC-5001', proveedor: 'Neumáticos Chile', fecha: '2026-04-25', total: 1250000, estado: 'PENDIENTE' },
    { id: 'OC-4998', proveedor: 'Lubricantes Shell', fecha: '2026-04-20', total: 850000, estado: 'RECIBIDA' },
    { id: 'OC-4995', proveedor: 'Ferretería Industrial', fecha: '2026-04-18', total: 120000, estado: 'PARCIAL' },
  ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Órdenes de Compra</h2>
          <p className="text-slate-500 text-sm">Gestión y seguimiento de pedidos a proveedores</p>
        </div>
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all">
          Nueva Orden
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <input type="text" className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm w-64" placeholder="Buscar por N° o Proveedor..." />
        <select className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm">
          <option>Todos los Estados</option>
          <option>Pendientes</option>
          <option>Recibidas</option>
        </select>
      </div>

      <div className="border border-slate-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Proveedor</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {ocs.map(oc => (
              <tr key={oc.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-700">{oc.id}</td>
                <td className="px-6 py-4">{oc.proveedor}</td>
                <td className="px-6 py-4 text-slate-500">{oc.fecha}</td>
                <td className="px-6 py-4 font-mono font-bold">${oc.total.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    oc.estado === 'RECIBIDA' ? 'bg-green-100 text-green-600' : 
                    oc.estado === 'PARCIAL' ? 'bg-orange-100 text-orange-600' : 
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {oc.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:underline mr-4">Ver</button>
                  <button className="text-slate-400 hover:text-slate-600">Recepción</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdenCompraView;
