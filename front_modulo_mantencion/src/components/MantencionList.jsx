import { useState, useEffect } from 'react';
import { mantencionService } from '../services/mantencionService';
import { vehiculoService } from '../services/vehiculoService';
import { personalService } from '../services/personalService';

function MantencionList() {
  const [mantenciones, setMantenciones] = useState([]);
  const [vehiculosMap, setVehiculosMap] = useState({});
  const [mecanicosMap, setMecanicosMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [mantsResp, vehsResp, mecsResp] = await Promise.all([
        mantencionService.obtenerTodos(),
        vehiculoService.obtenerTodos(),
        personalService.obtenerTodos(),
      ]);

      const vMap = {};
      if (Array.isArray(vehsResp)) vehsResp.forEach(v => vMap[v.id] = v);
      setVehiculosMap(vMap);

      const mMap = {};
      if (Array.isArray(mecsResp)) mecsResp.forEach(m => mMap[m.id] = m);
      setMecanicosMap(mMap);

      setMantenciones(Array.isArray(mantsResp) ? mantsResp : []);
    } catch (err) {
      console.error('Error cargando listados', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;
    try {
      await mantencionService.eliminar(id);
      setMantenciones(mants => Array.isArray(mants) ? mants.filter(m => m.id !== id) : []);
    } catch (error) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const handleEstadoChange = async (m, newEstado) => {
    try {
      const payload = { ...m, estado: newEstado };
      const updated = await mantencionService.actualizar(m.id, payload);
      setMantenciones(mants => Array.isArray(mants) ? mants.map(item => item.id === updated.id ? updated : item) : []);
    } catch (error) {
      alert('Error cambiando estado: ' + error.message);
    }
  };

  const estadoBadge = (estado) => {
    if (estado === 'Pendiente') return <span className="badge-pending">{estado}</span>;
    if (estado === 'En_curso') return <span className="badge-inprogress">En Curso</span>;
    return <span className="badge-done">Completada</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <div className="w-5 h-5 border-2 border-t-transparent border-orange-500 rounded-full animate-spin-slow" />
        <span className="text-slate-500 text-sm">Cargando directorio...</span>
      </div>
    );
  }

  return (
    <div className="card-dark overflow-hidden shadow-2xl">
      <div className="px-6 py-5 border-b border-[#1e2535] flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-xl tracking-wide text-slate-100 uppercase">
            Directorio de Mantenciones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Órdenes de trabajo preventivas y correctivas.</p>
        </div>
        <button
          onClick={cargarTodo}
          className="btn-ghost"
        >
          Refrescar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#0a0c10]">
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Fecha / Tipo</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Vehículo</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Mecánico</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Fechas Operativas</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Estado</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-600 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(mantenciones) || mantenciones.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-600 text-sm">No hay mantenciones registradas</td>
              </tr>
            ) : mantenciones.map((m, i) => {
              const elVeh = vehiculosMap[m.vehiculo_id];
              const elMec = mecanicosMap[m.mecanico_id];

              return (
                <tr key={m.id} className="table-row-dark" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-300 font-mono">
                      {new Date(m.fecha).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{m.tipo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-sm font-semibold text-orange-400">{elVeh?.patente || '—'}</div>
                    <div className="text-xs text-slate-500">{elVeh?.modelo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-400">{elMec ? `${elMec.nombre} ${elMec.apellido}` : '—'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-mono space-y-0.5">
                      {m.fecha_programada && (
                        <div className="text-slate-500">Prog: {new Date(m.fecha_programada).toLocaleString()}</div>
                      )}
                      {m.fecha_ingreso && (
                        <div className="text-blue-400/80">Ing: {new Date(m.fecha_ingreso).toLocaleString()}</div>
                      )}
                      {m.fecha_salida && (
                        <div className="text-emerald-400/80">Sal: {new Date(m.fecha_salida).toLocaleString()}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={m.estado}
                      onChange={(e) => handleEstadoChange(m, e.target.value)}
                      className="select-dark w-auto text-xs py-1 px-2"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En_curso">En Curso</option>
                      <option value="Completada">Completada</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleEliminar(m.id)}
                      className="text-xs text-red-500/60 hover:text-red-400 font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MantencionList;
