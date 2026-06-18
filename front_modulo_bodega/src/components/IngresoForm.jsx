import React, { useState } from 'react';
import { fetchWithAuth } from '../../../shared_components/apiClient';

const IngresoForm = () => {
  const [formData, setFormData] = useState({
    usuario_entrega: 'Victor Henriquez Llancao',
    usuario_recepcion: 'Luciano Quintanilla',
    tipo_doc_origen: 'Orden de Compra',
    tipo_doc_recepcion: 'Seleccione',
    n_documento: '',
    fecha_requerimiento: '2026-04-29',
    descripcion: '',
    n_oc: '',
    n_salida: '',
    opcion_radio: 'oc' // 'oc' o 'salida'
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadio = (val) => {
    setFormData(prev => ({
      ...prev,
      opcion_radio: val,
      n_oc: val === 'oc' ? prev.n_oc : '',
      n_salida: val === 'salida' ? prev.n_salida : ''
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetchWithAuth('/bodega/ingresos', {
        method: 'POST',
        body: JSON.stringify({
          usuario_entrega: formData.usuario_entrega,
          usuario_recepcion: formData.usuario_recepcion,
          tipo_doc_origen: formData.tipo_doc_origen,
          tipo_doc_recepcion: formData.tipo_doc_recepcion !== 'Seleccione' ? formData.tipo_doc_recepcion : null,
          n_documento: formData.n_documento,
          fecha_requerimiento: formData.fecha_requerimiento || null,
          descripcion: formData.descripcion,
          n_oc: formData.opcion_radio === 'oc' ? formData.n_oc : null,
          n_salida: formData.opcion_radio === 'salida' ? formData.n_salida : null
        })
      });

      if (!response.ok) {
        throw new Error('Error al registrar el ingreso');
      }

      
      setMessage('Ingreso registrado con éxito');
      // Reset form but keep default names
      setFormData({
        ...formData,
        n_documento: '',
        descripcion: '',
        n_oc: '',
        n_salida: ''
      });
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow-sm border border-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-normal text-gray-700">Ingreso de Producto a Bodega</h2>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-cyan-400 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded text-sm flex items-center shadow-sm transition-colors"
        >
          <span className="text-lg mr-1 font-bold">+</span> Ingreso a Bodega
        </button>
      </div>

      {message && (
        <div className={`p-3 mb-4 rounded text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form className="space-y-6 text-sm" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Columna Izquierda */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Usuario</label>
              <select 
                name="usuario_entrega" 
                value={formData.usuario_entrega}
                onChange={handleChange}
                className="w-full border border-gray-300 p-1.5 rounded-sm focus:outline-none focus:border-cyan-400"
              >
                <option>Victor Henriquez Llancao</option>
                <option>Juan Perez</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Usuario</label>
              <select 
                name="usuario_recepcion" 
                value={formData.usuario_recepcion}
                onChange={handleChange}
                className="w-full border border-gray-300 p-1.5 rounded-sm focus:outline-none focus:border-cyan-400"
              >
                <option>Luciano Quintanilla</option>
                <option>Pedro Gomez</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tipo Documento Origen</label>
              <select 
                name="tipo_doc_origen" 
                value={formData.tipo_doc_origen}
                onChange={handleChange}
                className="w-full border border-gray-300 p-1.5 rounded-sm focus:outline-none focus:border-cyan-400"
              >
                <option>Orden de Compra</option>
                <option>Guia de Despacho</option>
                <option>Factura</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tipo Documento Recepcion</label>
              <select 
                name="tipo_doc_recepcion" 
                value={formData.tipo_doc_recepcion}
                onChange={handleChange}
                className="w-full border border-gray-300 p-1.5 rounded-sm focus:outline-none focus:border-cyan-400"
              >
                <option>Seleccione</option>
                <option>Guia de Despacho Interna</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">N° Documento</label>
              <input 
                type="text" 
                name="n_documento" 
                value={formData.n_documento}
                onChange={handleChange}
                className="w-full border border-gray-300 p-1.5 rounded-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Requerimiento</label>
              <input 
                type="date" 
                name="fecha_requerimiento" 
                value={formData.fecha_requerimiento}
                onChange={handleChange}
                className="w-full border border-gray-300 p-1.5 rounded-sm bg-gray-50 focus:outline-none focus:border-cyan-400 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Descripción</label>
              <textarea 
                name="descripcion" 
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 p-1.5 rounded-sm focus:outline-none focus:border-cyan-400 resize-none"
              ></textarea>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex flex-col">
                <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                  <input 
                    type="radio" 
                    name="opcion" 
                    checked={formData.opcion_radio === 'oc'} 
                    onChange={() => handleRadio('oc')}
                    className="mr-2 h-3 w-3 text-cyan-500 focus:ring-cyan-500"
                  />
                  N° OC:
                </label>
                <input 
                  type="text" 
                  name="n_oc" 
                  value={formData.n_oc}
                  onChange={handleChange}
                  disabled={formData.opcion_radio !== 'oc'}
                  className="w-full border border-gray-300 p-1.5 rounded-sm focus:outline-none focus:border-cyan-400 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>

              <div className="flex flex-col">
                <label className="flex items-center text-xs font-bold text-gray-700 mb-1">
                  <input 
                    type="radio" 
                    name="opcion" 
                    checked={formData.opcion_radio === 'salida'} 
                    onChange={() => handleRadio('salida')}
                    className="mr-2 h-3 w-3 text-cyan-500 focus:ring-cyan-500"
                  />
                  N° Salida:
                </label>
                <input 
                  type="text" 
                  name="n_salida" 
                  value={formData.n_salida}
                  onChange={handleChange}
                  disabled={formData.opcion_radio !== 'salida'}
                  className="w-full border border-gray-300 p-1.5 rounded-sm focus:outline-none focus:border-cyan-400 disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
      <div className="mt-8 border-t border-gray-100 pt-4 text-xs text-gray-400">
        © 2026 - Transportes Artisa
      </div>
    </div>
  );
};

export default IngresoForm;
