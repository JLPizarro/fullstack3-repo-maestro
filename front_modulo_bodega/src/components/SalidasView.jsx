import React, { useState } from 'react';

const SalidasView = () => {
  const [formData, setFormData] = useState({
    personal_id: '',
    tipo_salida: 'Consumo Interno',
    motivo: '',
    fecha: new Date().toISOString().split('T')[0],
    items: [{ id: Date.now(), producto: '', cantidad: 1 }]
  });

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), producto: '', cantidad: 1 }]
    }));
  };

  const removeItem = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Control de Salidas de Bodega</h2>
          <p className="text-slate-500 text-sm">Registro de retiro de materiales y repuestos</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all">
          Registrar Salida
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Solicitante (Personal)</label>
          <input type="text" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Nombre o RUT" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Tipo de Salida</label>
          <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none">
            <option>Consumo Interno</option>
            <option>Entrega a Terceros</option>
            <option>Merma / Pérdida</option>
            <option>Devolución Proveedor</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Fecha</label>
          <input type="date" value={formData.fecha} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none" />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Motivo / Observación</label>
        <textarea className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg outline-none h-20" placeholder="Ej: Mantención preventiva Scania Patente XX-YY-ZZ"></textarea>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-700">Productos a Retirar</h3>
          <button onClick={addItem} className="text-orange-500 text-sm font-bold hover:underline">+ Agregar Item</button>
        </div>
        <div className="space-y-3">
          {formData.items.map(item => (
            <div key={item.id} className="flex gap-4 items-center">
              <div className="flex-1">
                <input type="text" className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm" placeholder="Buscar producto..." />
              </div>
              <div className="w-24">
                <input type="number" className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm" placeholder="Cant." />
              </div>
              <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalidasView;
