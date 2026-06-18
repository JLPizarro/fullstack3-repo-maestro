import { useState, useEffect } from 'react';
import { Sidebar, Header, checkModuleAccess } from '../../shared_components';
import { fetchWithAuth } from '../../shared_components/apiClient';

function App() {
  const [facturas, setFacturas] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [permiso, setPermiso] = useState('none');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login/';
  };

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/facturacion/facturas');
      if (!response.ok) {
        throw new Error('Error al cargar facturas');
      }
      const data = await response.json();
      setFacturas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const nivel = checkModuleAccess('facturacion', '/facturacion/');
    if (nivel !== 'none') {
      setPermiso(nivel);
      fetchFacturas();
    }
  }, []);

  if (permiso === 'none') return null;

  const menuItems = [
    { id: 'list', label: 'Listado de Facturas', icon: '📄' },
    { id: 'emit', label: 'Emitir Factura', icon: '➕', requiresEdit: true },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        moduleName="Facturación"
        accentColor="amber"
        activePath="/facturacion/"
        permiso={permiso}
        badge={permiso === 'edit' ? 'Control de Pagos' : 'Solo Lectura'}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={menuItems.find((i) => i.id === activeTab)?.label}
          gradient="from-amber-600 via-orange-500 to-yellow-400"
        >
          {loading && <span className="text-amber-600 text-sm font-medium animate-pulse">Cargando...</span>}
        </Header>

        <main className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center shadow-sm">
              <span><strong>Error:</strong> {error}</span>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
            </div>
          )}

          <div className="max-w-5xl mx-auto">
            {activeTab === 'list' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-lg">Historial de Facturación</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cliente</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facturas.length === 0 ? (
                        <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-500 italic">No hay registros.</td></tr>
                      ) : (
                        facturas.map((f) => (
                          <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">#{f.id}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{f.cliente}</td>
                            <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700 text-right">${f.total}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === 'emit' && permiso === 'edit' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 italic">
                Formulario de emisión próximamente...
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
