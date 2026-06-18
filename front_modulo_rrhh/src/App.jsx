import { useState, useEffect } from 'react';
import { PersonalForm, PersonalList, PersonalStatusManage } from './components';
import { Sidebar, Header, checkModuleAccess } from '../../shared_components';

function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [permiso, setPermiso] = useState('none');

  useEffect(() => {
    const nivel = checkModuleAccess('rrhh', '/rrhh/');
    if (nivel !== 'none') {
      setPermiso(nivel);
      if (nivel === 'view') setActiveTab('list');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login/';
  };

  if (permiso === 'none') return null;

  const menuItems = [
    { id: 'list', label: 'Directorio', icon: '👥' },
    { id: 'create', label: 'Crear Registro', icon: '📝', requiresEdit: true },
    { id: 'status', label: 'Estados Operativos', icon: '🚦', requiresEdit: true },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        moduleName="RRHH"
        accentColor="blue"
        activePath="/rrhh/"
        permiso={permiso}
        badge={permiso === 'edit' ? 'Modo Editor' : 'Solo Lectura'}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={menuItems.find((i) => i.id === activeTab)?.label}
          gradient="from-blue-600 via-indigo-500 to-cyan-400"
        >
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
          >
            Cerrar Sesión
          </button>
        </Header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'create' && permiso === 'edit' && <PersonalForm />}
            {activeTab === 'list' && <PersonalList permiso={permiso} />}
            {activeTab === 'status' && permiso === 'edit' && <PersonalStatusManage />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
