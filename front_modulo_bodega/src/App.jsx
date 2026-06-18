import React, { useState, useEffect } from 'react';
import { IngresoForm, SolicitudesList, SalidasView, EPPView, CombustibleView, OrdenCompraView } from './components';
import { Sidebar, Header, checkModuleAccess } from '../../shared_components';

function App() {
  const [currentView, setCurrentView] = useState('Solicitud');
  const [permiso, setPermiso] = useState('none');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const nivel = checkModuleAccess('bodega', '/bodega/');
    if (nivel !== 'none') {
      setPermiso(nivel);
      const userData = localStorage.getItem('userData');
      if (userData) setCurrentUser(JSON.parse(userData));
      if (nivel === 'view') setCurrentView('Solicitud');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login/';
  };

  if (permiso === 'none') return null;

  const menuItems = [
    { id: 'Solicitud', label: 'Solicitud de Stock', icon: '📦' },
    { id: 'Ingresos', label: 'Ingresos de Mercadería', icon: '📥', requiresEdit: true },
    { id: 'Salidas', label: 'Salidas de Bodega', icon: '📤', requiresEdit: true },
    { id: 'EPP', label: 'Gestión de EPP', icon: '🦺' },
    { id: 'Combustible', label: 'Carga Combustible', icon: '⛽', requiresEdit: true },
    { id: 'Orden de Compra', label: 'Órdenes de Compra', icon: '💲', requiresEdit: true },
    { id: 'Reportes', label: 'Reportes e Inventario', icon: '📈' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        moduleName="Bodega"
        accentColor="emerald"
        activePath="/bodega/"
        permiso={permiso}
        badge={permiso === 'edit' ? 'Modo Editor' : 'Solo Lectura'}
        menuItems={menuItems}
        activeTab={currentView}
        onTabChange={setCurrentView}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={menuItems.find((i) => i.id === currentView)?.label}
          gradient="from-emerald-600 via-teal-500 to-cyan-400"
        />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {currentView === 'Ingresos' && permiso === 'edit' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <IngresoForm />
              </div>
            )}
            {currentView === 'Solicitud' && <SolicitudesList permiso={permiso} />}
            {currentView === 'Salidas' && permiso === 'edit' && <SalidasView />}
            {currentView === 'EPP' && <EPPView permiso={permiso} />}
            {currentView === 'Combustible' && permiso === 'edit' && <CombustibleView />}
            {currentView === 'Orden de Compra' && permiso === 'edit' && <OrdenCompraView />}
            {currentView === 'Reportes' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500 italic">
                El módulo de "Reportes" está bajo tareas de mantenimiento programado.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
