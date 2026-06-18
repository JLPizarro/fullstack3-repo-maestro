import { useState, useEffect } from 'react';
import { vehiculoService } from '../services/vehiculoService';

function VehiculoList() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarVehiculos();
  }, []);

  async function cargarVehiculos() {
    try {
      const data = await vehiculoService.obtenerTodos();
      setVehiculos(Array.isArray(data) ? data : []);
    } catch (err) {
      alert('Error cargando vehículos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Seguro que deseas eliminar este vehículo?')) return;
    try {
      await vehiculoService.eliminar(id);
      setVehiculos(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  function startEdit(vehiculo) {
    setEditingId(vehiculo.id);
    setEditForm({ ...vehiculo });
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSaveEdit(id) {
    try {
      const data = { ...editForm };
      const result = await vehiculoService.actualizar(id, data);
      setVehiculos(prev => prev.map(v => v.id === id ? result : v));
      setEditingId(null);
    } catch (err) {
      alert('Error actualizando: ' + err.message);
    }
  }

  const filteredVehiculos = Array.isArray(vehiculos) ? vehiculos.filter(v => {
    const term = searchTerm.toLowerCase();
    return (v.patente && v.patente.toLowerCase().includes(term)) ||
           (v.modelo && v.modelo.toLowerCase().includes(term)) ||
           (v.numero_interno && v.numero_interno.toLowerCase().includes(term)) ||
           (v.color && v.color.toLowerCase().includes(term));
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <div className="w-5 h-5 border-2 border-t-transparent border-orange-500 rounded-full animate-spin-slow" />
        <span className="text-slate-500 text-sm">Cargando directorio...</span>
      </div>
    );
  }

  return (
    <div className="card-dark overflow-hidden shadow-2xl">
      <div className="px-6 py-5 border-b border-[#1e2535] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-xl tracking-wide text-slate-100 uppercase">
            Directorio de Flota
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{filteredVehiculos.length} vehículo{filteredVehiculos.length !== 1 ? 's' : ''}</p>
        </div>
        <input
          type="text"
          placeholder="Buscar por patente, modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-dark w-full sm:w-72"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#0a0c10]">
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Patente</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Modelo</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Color</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Nº Interno</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-600 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehiculos.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-600 text-sm">
                  No se encontraron resultados
                </td>
              </tr>
            ) : filteredVehiculos.map((v, i) => (
              <tr
                key={v.id}
                className="table-row-dark"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === v.id ? (
                    <input type="text" name="patente" value={editForm.patente || ''} onChange={handleEditChange}
                      className="bg-[#1f2433] border border-[#3b4a63] text-slate-100 rounded px-2 py-1 text-xs w-24 font-mono focus:outline-none focus:border-orange-500" />
                  ) : (
                    <span className="font-mono text-sm font-semibold text-orange-400">{v.patente}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === v.id ? (
                    <input type="text" name="modelo" value={editForm.modelo || ''} onChange={handleEditChange}
                      className="bg-[#1f2433] border border-[#3b4a63] text-slate-100 rounded px-2 py-1 text-xs w-32 focus:outline-none focus:border-orange-500" />
                  ) : (
                    <span className="text-sm text-slate-300">{v.modelo}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === v.id ? (
                    <input type="text" name="color" value={editForm.color || ''} onChange={handleEditChange}
                      className="bg-[#1f2433] border border-[#3b4a63] text-slate-100 rounded px-2 py-1 text-xs w-24 focus:outline-none focus:border-orange-500" />
                  ) : (
                    <span className="text-sm text-slate-400">{v.color}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === v.id ? (
                    <input type="text" name="numero_interno" value={editForm.numero_interno || ''} onChange={handleEditChange}
                      className="bg-[#1f2433] border border-[#3b4a63] text-slate-100 rounded px-2 py-1 text-xs w-24 font-mono focus:outline-none focus:border-orange-500" />
                  ) : (
                    <span className="font-mono text-sm text-slate-500">{v.numero_interno || '—'}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {editingId === v.id ? (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleSaveEdit(v.id)} className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Guardar</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors">Cancelar</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => startEdit(v)} className="text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors">Editar</button>
                      <button onClick={() => handleDelete(v.id)} className="text-xs text-red-500/60 hover:text-red-400 font-medium transition-colors">Eliminar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VehiculoList;
