import { useState, useEffect } from 'react';
import { mantencionService } from '../services/mantencionService';

function MantencionAutomator() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingId, setCreatingId] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    cargarStatus();
  }, []);

  async function cargarStatus() {
    try {
      setLoading(true);
      const json = await mantencionService.obtenerStatusPreventivo();
      setData(json);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function crearPreventiva(item) {
    if (!confirm(`¿Confirmar creación de mantención preventiva para ${item.patente}?`)) return;

    setCreatingId(item.vehiculo_id);
    try {
      const payload = {
        vehiculo_id: item.vehiculo_id,
        mecanico_id: 1,
        tipo: 'Preventiva',
        estado: 'Pendiente',
        odometro: item.odometro_actual,
        fecha_programada: new Date().toISOString(),
        tareas: 'MANTENCIÓN PREVENTIVA AUTOMÁTICA (SITRACK > 50.000 KM)',
      };
      await mantencionService.crear(payload);
      alert('Mantención creada y vehículo bloqueado.');
      cargarStatus();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setCreatingId(null);
    }
  }

  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-2 border-t-transparent border-orange-500 rounded-full animate-spin-slow" />
        <p className="text-slate-500 text-sm">Consultando API de Sitrack y analizando flota...</p>
      </div>
    );
  }

  return (
    <div className="card-dark overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1e2535] flex justify-between items-center bg-[#0d1017]">
        <div>
          <h2 className="font-display font-bold text-xl tracking-wide text-slate-100 uppercase">
            Automatizador de Preventivas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Priorización por odómetro Sitrack. Tolerancia: 50,000 km.
            {lastSync && (
              <span className="ml-3 text-orange-500/70 font-semibold font-mono">
                Sync: {lastSync}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={cargarStatus}
          disabled={loading}
          className="btn-ghost flex items-center gap-2"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-t-transparent border-orange-500 rounded-full animate-spin-slow" />
          ) : (
            <span className="text-orange-400">↻</span>
          )}
          {loading ? 'Consultando...' : 'Consultar Sitrack'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#0a0c10]">
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Vehículo / IN</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Última Fecha</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Último Odo.</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-orange-500/60 uppercase tracking-widest bg-orange-500/5">Odo. Actual (Sitrack)</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest">Diferencia</th>
              <th className="px-6 py-3 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">Acción</th>
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(data) || data.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-600 text-sm">
                  {Array.isArray(data) ? 'No se encontraron vehículos vinculados a Sitrack' : 'Error al cargar datos de Sitrack'}
                </td>
              </tr>
            ) : data.map(item => (
              <tr
                key={item.vehiculo_id}
                className={`table-row-dark ${item.necesita_mantencion ? 'border-l-2 border-l-orange-500' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-mono text-sm font-bold text-orange-400">{item.patente}</div>
                  <div className="text-[10px] font-mono text-slate-600 mt-0.5">Nº Int: {item.numero_interno || 'S/N'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-xs text-slate-500">
                    {item.fecha_ultima_mantencion
                      ? new Date(item.fecha_ultima_mantencion).toLocaleDateString()
                      : <span className="badge-error">NUNCA</span>
                    }
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm text-slate-400">
                    {item.odometro_ultima_mantencion?.toLocaleString() || 0} km
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap bg-orange-500/5">
                  <span className="font-mono text-sm font-bold text-orange-400">
                    {item.odometro_actual?.toLocaleString() || 0} km
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`font-mono text-sm font-bold ${item.necesita_mantencion ? 'text-red-400' : 'text-emerald-400'}`}>
                    +{item.diferencia?.toLocaleString()} km
                  </div>
                  {item.necesita_mantencion && (
                    <div className="text-[9px] uppercase font-bold text-red-500 tracking-wider mt-0.5">Excedido</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => crearPreventiva(item)}
                    disabled={!item.necesita_mantencion || creatingId === item.vehiculo_id}
                    className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-md transition-all duration-150 ${
                      item.necesita_mantencion
                        ? 'btn-primary text-[10px] px-3 py-2'
                        : 'bg-[#1e2535] text-slate-600 cursor-not-allowed border border-[#2d3748]'
                    }`}
                  >
                    {creatingId === item.vehiculo_id ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 border border-t-transparent border-white rounded-full animate-spin-slow" />
                        En proceso...
                      </span>
                    ) : 'Programar Preventiva'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MantencionAutomator;
