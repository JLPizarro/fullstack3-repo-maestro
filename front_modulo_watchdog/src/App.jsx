import { useState, useEffect } from 'react';
import { Sidebar, checkModuleAccess } from '../../shared_components';
import { fetchWithAuth } from '../../shared_components/apiClient';

function App() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monitor');
  const [permiso, setPermiso] = useState('none');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login/';
  };

  const fetchStatus = async () => {
    try {
      const response = await fetchWithAuth('/watchdog/status');
      if (!response.ok) {
        throw new Error('Failed to fetch watchdog status');
      }
      setStatus(await response.json());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const nivel = checkModuleAccess('watchdog', '/watchdog/');
    if (nivel !== 'none') {
      setPermiso(nivel);
      fetchStatus();
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  if (permiso === 'none') return null;

  const menuItems = [
    { id: 'monitor', label: 'Service Monitor', icon: '📡' },
    { id: 'logs', label: 'System Logs', icon: '📝' },
    { id: 'alerts', label: 'Incidents', icon: '⚠️' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden">
      <Sidebar
        moduleName="Watchdog"
        accentColor="blue"
        activePath="/watchdog/"
        permiso={permiso}
        badge={permiso === 'edit' ? 'Supervisión Activa' : 'Solo Lectura'}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 shadow-sm relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600"></div>
          <h2 className="text-lg font-semibold text-white">{menuItems.find((i) => i.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-4">
            {status && (
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
                Last Update: {new Date(status.timestamp * 1000).toLocaleTimeString()}
              </span>
            )}
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Live</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl flex justify-between items-center shadow-sm">
              <span><strong>Monitoring Failure:</strong> {error}</span>
              <button onClick={fetchStatus} className="text-rose-400 hover:text-rose-300 underline text-xs font-bold">RETRY</button>
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            {activeTab === 'monitor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading
                  ? Array(6).fill(0).map((_, i) => (
                      <div key={i} className="h-32 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800"></div>
                    ))
                  : status && status.services && Object.entries(status.services).map(([name, state]) => (
                      <div
                        key={name}
                        className={`p-6 rounded-2xl border transition-all duration-300 ${state === 'UP' ? 'bg-slate-900/40 border-slate-800 hover:border-blue-500/40' : 'bg-rose-950/10 border-rose-900/40'}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-white tracking-tight">{name}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${state === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {state}
                          </span>
                        </div>
                      </div>
                    ))}
              </div>
            )}
            {activeTab !== 'monitor' && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 italic">
                Próximamente...
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
