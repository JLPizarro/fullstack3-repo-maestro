import { useState, useEffect } from 'react';
import { Sidebar, Header, checkModuleAccess } from '../../shared_components';
import { fetchWithAuth } from '../../shared_components/apiClient';

function App() {
  const [incidentes, setIncidentes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [permiso, setPermiso] = useState('none');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login/';
  };

  const fetchIncidentes = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/prevencion/incidentes');
      if (!response.ok) {
        throw new Error('Error al cargar incidentes');
      }
      const data = await response.json();
      setIncidentes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const nivel = checkModuleAccess('prevencion', '/prevencion/');
    if (nivel !== 'none') {
      setPermiso(nivel);
      fetchIncidentes();
    }
  }, []);

  if (permiso === 'none') return null;

  const menuItems = [
    { id: 'list', label: 'Registro de Incidentes', icon: '🚨' },
    { id: 'stats', label: 'Estadísticas', icon: '📊' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        moduleName="Prevención"
        accentColor="red"
        activePath="/prevencion/"
        permiso={permiso}
        badge={permiso === 'edit' ? 'Seguridad Activa' : 'Solo Lectura'}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={menuItems.find((i) => i.id === activeTab)?.label}
          gradient="from-red-600 via-orange-500 to-rose-400"
        >
          {loading && <span className="text-red-600 text-sm font-medium animate-pulse">Cargando...</span>}
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
                  <h3 className="font-bold text-slate-800 text-lg">Listado de Incidentes</h3>
                </div>
                <div className="p-6">
                  {incidentes.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 italic">No hay registros.</div>
                  ) : (
                    <div className="space-y-4">
                      {incidentes.map((i) => (
                        <div key={i.id} className="p-4 border border-slate-100 rounded-lg bg-white shadow-sm hover:border-red-200">
                          <div className="flex justify-between items-start">
                            <strong className="text-slate-800">{i.titulo}</strong>
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">{i.nivel_gravedad}</span>
                          </div>
                          <p className="text-slate-600 text-sm mt-1">{i.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'stats' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 italic">
                Reportes en desarrollo...
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
