import React, { useState, useEffect } from 'react';
import { Sidebar, Header, checkModuleAccess } from '../../shared_components';
import { clienteService, requerimientoService, acreditacionService } from './services/api';

function App() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [requerimientos, setRequerimientos] = useState([]);
  const [acreditaciones, setAcreditaciones] = useState([]);
  const [permiso, setPermiso] = useState('none');

  const [showClienteForm, setShowClienteForm] = useState(false);
  const [showReqForm, setShowReqForm] = useState(false);
  const [showAcredForm, setShowAcredForm] = useState(false);

  const [newCliente, setNewCliente] = useState({ nombre: '', rut: '', contacto: '' });
  const [newReq, setNewReq] = useState({ nombre: '', descripcion: '', tipo_sujeto: 'PERSONAL' });
  const [newAcred, setNewAcred] = useState({ sujeto_id: '', requerimiento_id: '', fecha_emision: '', fecha_vencimiento: '', link_documento: '' });

  const [activeTab, setActiveTab] = useState('clientes');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login/';
  };

  useEffect(() => {
    const nivel = checkModuleAccess('acreditacion', '/acreditacion/');
    if (nivel !== 'none') {
      setPermiso(nivel);
      fetchClientes();
      fetchAcreditaciones();
    }
  }, []);

  useEffect(() => {
    if (selectedCliente) fetchRequerimientos(selectedCliente.id);
    else setRequerimientos([]);
  }, [selectedCliente]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.getAll();
      setClientes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('403')) handleLogout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequerimientos = async (clienteId) => {
    try {
      setLoading(true);
      const data = await requerimientoService.getByCliente(clienteId);
      setRequerimientos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcreditaciones = async () => {
    try {
      setLoading(true);
      const data = await acreditacionService.getAll();
      setAcreditaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCliente = async (e) => {
    e.preventDefault();
    try {
      await clienteService.create(newCliente);
      setNewCliente({ nombre: '', rut: '', contacto: '' });
      setShowClienteForm(false);
      fetchClientes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateReq = async (e) => {
    e.preventDefault();
    try {
      await requerimientoService.create({ ...newReq, cliente_id: selectedCliente.id });
      setNewReq({ nombre: '', descripcion: '', tipo_sujeto: 'PERSONAL' });
      setShowReqForm(false);
      fetchRequerimientos(selectedCliente.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateAcred = async (e) => {
    e.preventDefault();
    try {
      await acreditacionService.create(newAcred);
      setNewAcred({ sujeto_id: '', requerimiento_id: '', fecha_emision: '', fecha_vencimiento: '', link_documento: '' });
      setShowAcredForm(false);
      fetchAcreditaciones();
    } catch (err) {
      setError(err.message);
    }
  };

  if (permiso === 'none') return null;

  const menuItems = [
    { id: 'clientes', label: 'Gestión Clientes', icon: '🏢' },
    { id: 'acreditaciones', label: 'Acreditaciones', icon: '✅' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        moduleName="Acreditación"
        accentColor="indigo"
        activePath="/acreditacion/"
        permiso={permiso}
        badge={permiso === 'edit' ? 'Modo Acreditador' : 'Solo Lectura'}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={menuItems.find((i) => i.id === activeTab)?.label}
          gradient="from-indigo-600 via-blue-500 to-cyan-400"
        >
          {activeTab === 'clientes' && permiso === 'edit' && (
            <button onClick={() => setShowClienteForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
              + Nuevo Cliente
            </button>
          )}
          {loading && <span className="text-indigo-600 text-sm font-medium animate-pulse">Cargando...</span>}
        </Header>

        <main className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center shadow-sm">
              <span><strong>Error:</strong> {error}</span>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            {activeTab === 'clientes' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {clientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      className={`p-6 rounded-xl border transition-all cursor-pointer bg-white shadow-sm ${selectedCliente?.id === cliente.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}`}
                      onClick={() => setSelectedCliente(cliente)}
                    >
                      <h3 className="font-bold text-slate-800">{cliente.nombre}</h3>
                      <p className="text-slate-500 text-sm">RUT: {cliente.rut}</p>
                    </div>
                  ))}
                </div>
                {selectedCliente && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Requerimientos: {selectedCliente.nombre}</h2>
                      {permiso === 'edit' && (
                        <button onClick={() => setShowAcredForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                          Acreditar Sujeto
                        </button>
                      )}
                    </div>
                    {requerimientos.length === 0 ? (
                      <p className="text-slate-500 italic">No hay requerimientos.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requerimientos.map((r) => (
                          <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <strong>{r.nombre}</strong>
                            <p className="text-slate-500 text-xs">{r.descripcion}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'acreditaciones' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">ID</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Sujeto</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acreditaciones.map((a) => (
                        <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">{a.id}</td>
                          <td className="px-6 py-4">ID: {a.sujeto_id}</td>
                          <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">VIGENTE</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {showClienteForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Nuevo Cliente</h2>
            <form onSubmit={handleCreateCliente} className="space-y-4">
              {[['Nombre Empresa', 'nombre', 'text'], ['RUT', 'rut', 'text'], ['Contacto', 'contacto', 'text']].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
                  <input type={type} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newCliente[key]} onChange={(e) => setNewCliente({ ...newCliente, [key]: e.target.value })} required={key !== 'contacto'} />
                </div>
              ))}
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" className="px-6 py-2 text-slate-500 font-bold hover:text-slate-800" onClick={() => setShowClienteForm(false)}>Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReqForm && selectedCliente && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Nuevo Requerimiento</h2>
            <p className="text-slate-500 text-sm mb-6">Para: {selectedCliente.nombre}</p>
            <form onSubmit={handleCreateReq} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre del Documento</label>
                <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newReq.nombre} onChange={(e) => setNewReq({ ...newReq, nombre: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Sujeto</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newReq.tipo_sujeto} onChange={(e) => setNewReq({ ...newReq, tipo_sujeto: e.target.value })}>
                  <option value="PERSONAL">Personal</option>
                  <option value="VEHICULO">Vehículo</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" className="px-6 py-2 text-slate-500 font-bold hover:text-slate-800" onClick={() => setShowReqForm(false)}>Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAcredForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Acreditar Sujeto</h2>
            <form onSubmit={handleCreateAcred} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ID del Sujeto</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newAcred.sujeto_id} onChange={(e) => setNewAcred({ ...newAcred, sujeto_id: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">ID Requerimiento</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newAcred.requerimiento_id} onChange={(e) => setNewAcred({ ...newAcred, requerimiento_id: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fecha Emisión</label>
                  <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newAcred.fecha_emision} onChange={(e) => setNewAcred({ ...newAcred, fecha_emision: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fecha Vencimiento</label>
                  <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newAcred.fecha_vencimiento} onChange={(e) => setNewAcred({ ...newAcred, fecha_vencimiento: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Link al Documento</label>
                <input type="url" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newAcred.link_documento} onChange={(e) => setNewAcred({ ...newAcred, link_documento: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" className="px-6 py-2 text-slate-500 font-bold hover:text-slate-800" onClick={() => setShowAcredForm(false)}>Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Acreditar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
