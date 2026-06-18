import React, { useState, useEffect } from 'react';
import { UserModal } from './components';
import { LoginForm, decodeJWT, Header, checkModuleAccess, Sidebar, getFirstAuthorizedModule } from '../../shared_components';

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  });

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setCurrentUser(null);
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetchWithAuth('/administracion/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const token = localStorage.getItem('token');
    if (!token) { handleLogout(); return; }

    const payload = decodeJWT(token);
    const permisos = payload?.permisos || {};
    const nivelAdmin = permisos['administracion'] || 'none';

    if (nivelAdmin === 'none') {
      const nextPath = getFirstAuthorizedModule(permisos);
      if (nextPath && nextPath !== '/') {
        window.location.href = nextPath;
      } else {
        localStorage.clear();
        window.location.href = '/login/';
      }
      return;
    }

    fetchUsuarios();
  }, [currentUser]);

  const openModal = (user = null) => { setSelectedUser(user); setModalOpen(true); };
  const closeModal = () => { setSelectedUser(null); setModalOpen(false); fetchUsuarios(); };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      const response = await fetchWithAuth(`/administracion/usuarios/${id}`, { method: 'DELETE' });
      if (response.ok) fetchUsuarios();
    } catch (error) {
      console.error('Error deleting usuario:', error);
    }
  };

  if (!currentUser) {
    return <LoginForm apiUrl="/administracion" onSuccess={setCurrentUser} />;
  }

  const menuItems = [
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: '👥' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        moduleName="Administración"
        accentColor="slate"
        activePath="/"
        permiso="edit"
        menuItems={menuItems}
        activeTab="usuarios"
        onTabChange={() => {}}
        onLogout={handleLogout}
        currentUser={currentUser}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title="Panel de Administración Global"
          gradient="from-slate-600 via-slate-800 to-black"
        >
          <button
            onClick={() => openModal()}
            className="bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            + Nuevo Usuario
          </button>
        </Header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-lg">Usuarios y Permisos</h3>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-500 animate-pulse font-medium">
                  Cargando base de datos de usuarios...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Última Conexión</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">
                            No hay registros encontrados.
                          </td>
                        </tr>
                      ) : (
                        usuarios.map((u) => (
                          <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{u.nombre}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                            <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                              {u.ultima_conexion ? new Date(u.ultima_conexion).toLocaleString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.estado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {u.estado ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-right space-x-4">
                              <button onClick={() => openModal(u)} className="text-blue-600 hover:text-blue-800 font-bold">Editar</button>
                              <button onClick={() => handleDelete(u.id)} className="text-rose-600 hover:text-rose-800 font-bold">Eliminar</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {modalOpen && <UserModal user={selectedUser} onClose={closeModal} />}
    </div>
  );
}

export default App;
