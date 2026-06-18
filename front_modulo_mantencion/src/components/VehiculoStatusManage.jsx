import { useState, useEffect } from 'react';
import { vehiculoService } from '../services/vehiculoService';

function VehiculoStatusManage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarVehiculos();
  }, []);

  async function cargarVehiculos() {
    try {
      const data = await vehiculoService.obtenerTodos();
      setVehiculos(data);
    } catch (err) {
      alert('Error cargando vehículos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(vehiculo) {
    alert('Esta funcionalidad será desarrollada para Vehículos en el futuro cercano.');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <div className="w-5 h-5 border-2 border-t-transparent border-orange-500 rounded-full animate-spin-slow" />
        <span className="text-slate-500 text-sm">Cargando estados...</span>
      </div>
    );
  }

  return (
    <div className="card-dark overflow-hidden shadow-2xl">
      <div className="px-6 py-5 border-b border-[#1e2535]">
        <h2 className="font-display font-bold text-xl tracking-wide text-slate-100 uppercase">
          Estado de Flota
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Notas operativas actuales registradas por vehículo.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#0a0c10]">
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Patente</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Modelo</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Estado</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Registro (IDs)</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Notas Rápidas</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-600 text-sm">No hay vehículos registrados</td>
              </tr>
            ) : (Array.isArray(vehiculos) ? vehiculos : []).map((v, i) => (
              <tr key={v.id} className="table-row-dark" style={{ animationDelay: `${i * 30}ms` }}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm font-semibold text-orange-400">{v.patente}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-300">{v.modelo}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={v.estado === 'Disponible' ? 'badge-ok' : 'badge-error'}>
                    {v.estado || 'Sin estado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-xs text-slate-500">
                    IN:{v.numero_interno || '—'} · Dev:{v.device_id || '—'}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <span className="text-sm text-slate-500 line-clamp-2">{v.notas || 'Sin notas.'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VehiculoStatusManage;
