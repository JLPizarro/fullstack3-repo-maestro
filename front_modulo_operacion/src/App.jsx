import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar, Header, checkModuleAccess } from '../../shared_components';
import { operacionService } from './services/api';

function App() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viajes, setViajes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [permiso, setPermiso] = useState('none');
  const [filters, setFilters] = useState({ inicio: '', fin: new Date().toISOString().split('T')[0] });
  const [newViaje, setNewViaje] = useState({
    fecha: new Date().toISOString().split('T')[0],
    estado: 'IDA',
    tipo_operativo: 'Operativo',
    conductor_nombre: '',
    tracto_patente: '',
    rampla_patente: '',
    cliente_nombre: '',
    servicio: '',
    fecha_carga: '',
    origen: '',
    fecha_descarga: '',
    destino: '',
    valor_viaje: 0,
    observaciones: '',
    pernoctacion: false,
  });
  const [activeTab, setActiveTab] = useState('cargas');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login/';
  };

  useEffect(() => {
    const nivel = checkModuleAccess('operacion', '/operacion/');
    if (nivel !== 'none') setPermiso(nivel);
  }, []);

  useEffect(() => {
    if (permiso !== 'none') fetchViajes();
  }, [filters, permiso]);

  const fetchViajes = async () => {
    try {
      setLoading(true);
      const data = await operacionService.getViajes(filters.inicio, filters.fin);
      setViajes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('403')) { handleLogout(); return; }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (permiso !== 'edit') return;
    try {
      setLoading(true);
      await operacionService.createViaje(newViaje);
      setShowForm(false);
      fetchViajes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, status) => {
    if (permiso !== 'edit') return;
    try {
      await operacionService.updateViaje(id, { estado: status });
      fetchViajes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (permiso !== 'edit') return;
    if (window.confirm('¿Estás seguro de eliminar este viaje?')) {
      try {
        await operacionService.deleteViaje(id);
        fetchViajes();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const stats = useMemo(() => {
    const s = { operativo: 0, taller: 0, transito: 0, retorno: 0, total_valor: 0 };
    if (Array.isArray(viajes)) {
      viajes.forEach((v) => {
        if (v.tipo_operativo === 'Operativo') s.operativo++;
        if (v.tipo_operativo?.includes('Taller')) s.taller++;
        if (v.estado === 'IDA') s.transito++;
        if (v.estado === 'RETORNO') s.retorno++;
        s.total_valor += v.valor_viaje || 0;
      });
    }
    return s;
  }, [viajes]);

  if (permiso === 'none') return null;

  const menuItems = [
    { id: 'cargas', label: 'Situación de Cargas', icon: '🚛' },
    { id: 'stats', label: 'Estadísticas', icon: '📈' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        moduleName="Operación"
        accentColor="blue"
        activePath="/operacion/"
        permiso={permiso}
        badge={permiso === 'edit' ? 'Modo Gestión' : 'Solo Lectura'}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={activeTab === 'cargas' ? 'Situación de Cargas' : 'Estadísticas'}
          gradient="from-blue-600 via-indigo-500 to-cyan-400"
        >
          <div className="flex gap-2">
            <input type="date" className="text-xs border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500" value={filters.inicio} onChange={(e) => setFilters({ ...filters, inicio: e.target.value })} />
            <input type="date" className="text-xs border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500" value={filters.fin} onChange={(e) => setFilters({ ...filters, fin: e.target.value })} />
          </div>
          {permiso === 'edit' && (
            <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              + Registrar Viaje
            </button>
          )}
        </Header>

        <main className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center shadow-sm">
              <span><strong>Error:</strong> {error}</span>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
            </div>
          )}
          <div className="max-w-[1600px] mx-auto">
            {activeTab === 'cargas' && (
              <div className="space-y-6">
                <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Operativos', val: stats.operativo },
                    { label: 'Taller', val: stats.taller },
                    { label: 'Tránsito Ida', val: stats.transito },
                    { label: 'Retornos', val: stats.retorno },
                    { label: 'Total Valor', val: `$${stats.total_valor.toLocaleString()}`, highlight: true },
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</span>
                      <strong className={`text-2xl font-bold ${s.highlight ? 'text-emerald-600' : 'text-slate-800'}`}>{s.val}</strong>
                    </div>
                  ))}
                </section>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest">DIA</th>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest">Conductor</th>
                          <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest text-right">Valor</th>
                          {permiso === 'edit' && <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(viajes) && viajes.map((v) => (
                          <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{v.fecha}</td>
                            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${v.estado === 'IDA' ? 'bg-sky-100 text-sky-700' : 'bg-indigo-100 text-indigo-700'}`}>{v.estado}</span></td>
                            <td className="px-4 py-3 text-slate-700 font-medium">{v.conductor_nombre}</td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-600 text-right">${v.valor_viaje.toLocaleString()}</td>
                            {permiso === 'edit' && (
                              <td className="px-4 py-3 text-right space-x-2">
                                <button className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors" onClick={() => handleUpdate(v.id, v.estado === 'IDA' ? 'RETORNO' : 'IDA')}>🔄</button>
                                <button className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors" onClick={() => handleDelete(v.id)}>🗑️</button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'stats' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 italic">
                Reportes avanzados en desarrollo.
              </div>
            )}
          </div>
        </main>
      </div>

      {showForm && permiso === 'edit' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Registrar Nuevo Viaje</h2>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</label>
                    <input type="date" className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" value={newViaje.fecha} onChange={(e) => setNewViaje({ ...newViaje, fecha: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conductor</label>
                    <input type="text" className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" value={newViaje.conductor_nombre} onChange={(e) => setNewViaje({ ...newViaje, conductor_nombre: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor</label>
                    <input type="number" className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" value={newViaje.valor_viaje} onChange={(e) => setNewViaje({ ...newViaje, valor_viaje: e.target.value })} required />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button type="button" className="px-6 py-2 text-slate-500 font-bold hover:text-slate-800 transition-colors" onClick={() => setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Guardar Viaje</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
