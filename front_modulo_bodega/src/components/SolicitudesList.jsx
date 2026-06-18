import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const SolicitudesList = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await api.get('/solicitudes');
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleEntregar = async (id) => {
    if (!confirm('¿Estás seguro de entregar esta solicitud? Esto descontará los productos del inventario.')) return;
    setProcessingId(id);
    try {
      await api.post(`/solicitudes/${id}/entregar`, {});
      await fetchSolicitudes();
    } catch (err) {
      alert(`Error al entregar: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRechazar = async (id) => {
    if (!confirm('¿Rechazar esta solicitud?')) return;
    setProcessingId(id);
    try {
      await api.post(`/solicitudes/${id}/rechazar`, {});
      await fetchSolicitudes();
    } catch (err) {
      alert(`Error al rechazar: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && solicitudes.length === 0) return <div className="p-4">Cargando solicitudes...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Gestión de Solicitudes (Pedidos)</h2>

      {solicitudes.length === 0 ? (
        <p className="text-gray-500">No hay solicitudes registradas.</p>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((sol) => (
            <div key={sol.id} className="border rounded-md p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-bold text-lg">#{sol.id}</span>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    sol.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                    sol.estado === 'Entregada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {sol.estado}
                  </span>
                  <span className="text-sm text-gray-500">{new Date(sol.fecha_solicitud).toLocaleString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="font-semibold text-gray-600">Área:</span> {sol.area_solicitante}</div>
                  <div><span className="font-semibold text-gray-600">Usuario:</span> {sol.usuario_solicitante}</div>
                  {sol.comentarios && (
                    <div className="col-span-2 text-gray-600 italic">"{sol.comentarios}"</div>
                  )}
                </div>

                <div className="text-sm">
                  <span className="font-semibold">Detalle de Pedido:</span>
                  <ul className="list-disc list-inside mt-1 ml-2 text-gray-700">
                    {(sol.detalles_json || []).map((item, idx) => (
                      <li key={idx}>Producto ID: {item.producto_id} - <span className="font-medium">{item.cantidad} unidades</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                {sol.estado === 'Pendiente' && (
                  <>
                    <button 
                      onClick={() => handleEntregar(sol.id)}
                      disabled={processingId === sol.id}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      {processingId === sol.id ? 'Procesando...' : 'Entregar (Descontar Stock)'}
                    </button>
                    <button 
                      onClick={() => handleRechazar(sol.id)}
                      disabled={processingId === sol.id}
                      className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolicitudesList;
