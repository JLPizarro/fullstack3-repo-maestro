import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../shared_components/apiClient';

const MODULOS = [
  { id: 'rrhh', nombre: 'Recursos Humanos' },
  { id: 'bodega', nombre: 'Bodega' },
  { id: 'mantencion', nombre: 'Mantención' },
  { id: 'facturacion', nombre: 'Facturación' },
  { id: 'prevencion', nombre: 'Prevención' },
  { id: 'acreditacion', nombre: 'Acreditación' },
  { id: 'operacion', nombre: 'Operación' },
  { id: 'administracion', nombre: 'Administración' },
  { id: 'watchdog', nombre: 'Watchdog' }
];

const UserModal = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    estado: true,
    permisos: {}
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        email: user.email,
        password: '',
        estado: user.estado,
        permisos: user.permisos || {}
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePermisoChange = (modId, nivel) => {
    setFormData(prev => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [modId]: nivel
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { ...formData };
      if (user && !payload.password) {
        delete payload.password; // No update password if empty
      }

      const method = user ? 'PUT' : 'POST';
      const url = user ? `/administracion/usuarios/${user.id}` : '/administracion/usuarios';

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el usuario');
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-4 overflow-y-auto">
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
          
          <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" required name="nombre" value={formData.nombre} onChange={handleChange}
                  className="w-full border p-1.5 rounded text-sm focus:outline-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input 
                  type="email" required name="email" value={formData.email} onChange={handleChange}
                  className="w-full border p-1.5 rounded text-sm focus:outline-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña {user && <span className="font-normal text-gray-400">(Dejar en blanco para no cambiar)</span>}</label>
                <input 
                  type="password" name="password" required={!user} value={formData.password} onChange={handleChange}
                  className="w-full border p-1.5 rounded text-sm focus:outline-cyan-500"
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center text-sm font-bold text-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" name="estado" checked={formData.estado} onChange={handleChange}
                    className="mr-2 h-4 w-4"
                  />
                  Usuario Activo
                </label>
              </div>
            </div>

            <h3 className="text-md font-bold text-gray-800 mt-6 mb-2 border-b pb-1">Permisos por Módulo</h3>
            <div className="space-y-3">
              {MODULOS.map(mod => {
                const currentNivel = formData.permisos[mod.id] || 'none';
                return (
                  <div key={mod.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                    <span className="font-medium text-sm text-gray-700">{mod.nombre}</span>
                    <div className="flex space-x-4 text-sm">
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name={`permiso_${mod.id}`} checked={currentNivel === 'none'} onChange={() => handlePermisoChange(mod.id, 'none')} className="mr-1" />
                        Sin Acceso
                      </label>
                      <label className="flex items-center cursor-pointer text-blue-600">
                        <input type="radio" name={`permiso_${mod.id}`} checked={currentNivel === 'view'} onChange={() => handlePermisoChange(mod.id, 'view')} className="mr-1" />
                        Solo Ver (Dashboard)
                      </label>
                      <label className="flex items-center cursor-pointer text-green-600">
                        <input type="radio" name={`permiso_${mod.id}`} checked={currentNivel === 'edit'} onChange={() => handlePermisoChange(mod.id, 'edit')} className="mr-1" />
                        Edición Total
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </form>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} type="button" className="mr-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">Cancelar</button>
          <button form="userForm" type="submit" disabled={saving} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded text-sm font-medium">
            {saving ? 'Guardando...' : 'Guardar Usuario'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
