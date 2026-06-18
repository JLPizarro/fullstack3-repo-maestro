import { useState, useEffect } from 'react';
import { VehiculoForm, VehiculoList, VehiculoStatusManage, MantencionForm, MantencionList, MantencionAutomator } from './components';
import { Sidebar, Header, checkModuleAccess } from '../../shared_components';

function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [permiso, setPermiso] = useState('none');

  useEffect(() => {
    const nivel = checkModuleAccess('mantenciones', '/mantencion/');
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
    { id: 'list', label: 'Directorio Vehicular', icon: '📋' },
    { id: 'create', label: 'Crear Registro', icon: '🚐', requiresEdit: true },
    { id: 'status', label: 'Estados Operativos', icon: '🚥', requiresEdit: true },
    { id: 'create_mantencion', label: 'Crear Mantención', icon: '🛠️', requiresEdit: true },
    { id: 'list_mantencion', label: 'Historial', icon: '📚' },
    { id: 'automator', label: 'Automatizador', icon: '📊', requiresEdit: true },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        moduleName="Mantención"
        accentColor="amber"
        activePath="/mantencion/"
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
          gradient="from-amber-600 via-orange-500 to-yellow-400"
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'create' && permiso === 'edit' && <VehiculoForm />}
            {activeTab === 'list' && <VehiculoList permiso={permiso} />}
            {activeTab === 'status' && permiso === 'edit' && <VehiculoStatusManage />}
            {activeTab === 'create_mantencion' && permiso === 'edit' && <MantencionForm />}
            {activeTab === 'list_mantencion' && <MantencionList permiso={permiso} />}
            {activeTab === 'automator' && permiso === 'edit' && <MantencionAutomator />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
