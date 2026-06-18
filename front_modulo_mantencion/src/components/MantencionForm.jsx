import { useState, useEffect } from 'react';
import { vehiculoService } from '../services/vehiculoService';
import { personalService } from '../services/personalService';
import { mantencionService } from '../services/mantencionService';

function MantencionForm() {
  const [formData, setFormData] = useState({
    vehiculo_id: '',
    mecanico_id: '',
    tipo: 'Preventiva',
    estado: 'Pendiente',
    fecha_ingreso: '',
    fecha_salida: '',
    fecha_programada: '',
    tareas: '',
  });

  const [vehiculos, setVehiculos] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    cargarDatos();
    cargarPresets();
  }, []);

  const cargarDatos = async () => {
    try {
      const v = await vehiculoService.obtenerTodos();
      setVehiculos(v);
    } catch (err) {
      console.error(err);
    }
    try {
      const p = await personalService.obtenerTodos();
      setMecanicos(p);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarPresets = () => {
    const saved = localStorage.getItem('mantencionPresets');
    if (saved) setPresets(JSON.parse(saved));
  };

  const guardarPreset = () => {
    if (!presetName.trim() || !formData.tareas.trim()) return;
    const current = localStorage.getItem('mantencionPresets');
    let saved = current ? JSON.parse(current) : [];
    const idx = saved.findIndex(p => p.name === presetName);
    if (idx !== -1) {
      saved[idx].tareas = formData.tareas;
    } else {
      saved.push({ name: presetName, tareas: formData.tareas });
    }
    localStorage.setItem('mantencionPresets', JSON.stringify(saved));
    setPresets(saved);
    setPresetName('');
    alert('Plantilla guardada: ' + presetName);
  };

  const aplicarPreset = (e) => {
    const pName = e.target.value;
    if (!pName) return;
    const preset = presets.find(p => p.name === pName);
    if (preset) setFormData(prev => ({ ...prev, tareas: preset.tareas }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        vehiculo_id: parseInt(formData.vehiculo_id),
        mecanico_id: parseInt(formData.mecanico_id),
        tipo: formData.tipo,
        estado: formData.estado,
        fecha_ingreso: formData.fecha_ingreso || null,
        fecha_salida: formData.fecha_salida || null,
        fecha_programada: formData.fecha_programada || null,
        tareas: formData.tareas || null,
      };
      await mantencionService.crear(payload);
      setSuccess('Orden de mantención registrada exitosamente.');
      setFormData({
        vehiculo_id: '', mecanico_id: '', tipo: 'Preventiva', estado: 'Pendiente',
        fecha_ingreso: '', fecha_salida: '', fecha_programada: '', tareas: '',
      });
    } catch (err) {
      setError('Error al registrar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-dark p-8 w-full shadow-2xl">
      <div className="mb-8 pb-6 border-b border-[#1e2535]">
        <h2 className="font-display font-bold text-2xl tracking-wide text-slate-100 uppercase">
          Nueva Orden de Mantención
        </h2>
        <p className="text-slate-500 text-sm mt-1">Registra tareas preventivas o correctivas para la flota.</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm border-l-2 bg-red-500/8 border-red-500 text-red-400">{error}</div>
      )}
      {success && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm border-l-2 bg-emerald-500/8 border-emerald-500 text-emerald-400">{success}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Vehículo */}
          <div>
            <label className="form-label">Vehículo <span className="text-orange-500 normal-case tracking-normal">*</span></label>
            <div className="relative">
              <select name="vehiculo_id" required value={formData.vehiculo_id} onChange={handleChange} className="select-dark">
                <option value="">Seleccione Vehículo</option>
                {vehiculos.map(v => (
                  <option key={v.id} value={v.id}>{v.patente} — {v.modelo}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mecánico */}
          <div>
            <label className="form-label">Mecánico Asignado <span className="text-orange-500 normal-case tracking-normal">*</span></label>
            <div className="relative">
              <select name="mecanico_id" required value={formData.mecanico_id} onChange={handleChange} className="select-dark">
                <option value="">Seleccione Mecánico (RRHH)</option>
                {mecanicos.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="form-label">Tipo de Mantención</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange} className="select-dark">
              <option value="Preventiva">Preventiva</option>
              <option value="Correctiva">Correctiva</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="form-label">Estado Inicial</label>
            <select name="estado" value={formData.estado} onChange={handleChange} className="select-dark">
              <option value="Pendiente">Pendiente</option>
              <option value="En_curso">En Curso</option>
              <option value="Completada">Completada</option>
            </select>
          </div>

          {/* Fecha Programada */}
          <div>
            <label className="form-label">Fecha Programada</label>
            <input type="datetime-local" name="fecha_programada" value={formData.fecha_programada} onChange={handleChange} className="input-dark" />
          </div>

          {/* Fecha Ingreso */}
          <div>
            <label className="form-label">Fecha de Ingreso</label>
            <input type="datetime-local" name="fecha_ingreso" value={formData.fecha_ingreso} onChange={handleChange} className="input-dark" />
          </div>

          {/* Fecha Salida */}
          <div>
            <label className="form-label">Fecha de Salida</label>
            <input type="datetime-local" name="fecha_salida" value={formData.fecha_salida} onChange={handleChange} className="input-dark" />
          </div>
        </div>

        {/* Tareas */}
        <div className="mt-6 pt-6 border-t border-[#1e2535]">
          <div className="flex justify-between items-center mb-3">
            <label className="form-label mb-0">Listado de Tareas (Orden de Trabajo)</label>
            <select
              onChange={aplicarPreset}
              className="select-dark w-auto text-xs py-1.5 px-2"
              defaultValue=""
            >
              <option value="">Cargar plantilla...</option>
              {presets.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          <textarea
            name="tareas"
            rows={5}
            value={formData.tareas}
            onChange={handleChange}
            placeholder="- Cambio de aceite&#10;- Revisión de frenos&#10;..."
            className="input-dark resize-none font-mono text-xs"
          />

          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              placeholder="Nombre de plantilla"
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              className="input-dark flex-1 text-xs py-1.5"
            />
            <button
              type="button"
              onClick={guardarPreset}
              className="btn-ghost whitespace-nowrap"
            >
              Guardar Plantilla
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-t-transparent border-white/60 rounded-full animate-spin-slow" />
                Procesando...
              </span>
            ) : 'Generar Orden de Mantención'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MantencionForm;
