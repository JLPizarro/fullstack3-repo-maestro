import { useState } from 'react';
import { vehiculoService } from '../services/vehiculoService';

const EMPTY = { patente: '', modelo: '', color: '', numero_interno: '', device_id: '', notas: '' };

function VehiculoForm() {
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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
        patente: formData.patente,
        modelo: formData.modelo || null,
        color: formData.color || null,
        numero_interno: formData.numero_interno || null,
        device_id: formData.device_id ? parseInt(formData.device_id) : null,
        notas: formData.notas || null,
      };
      await vehiculoService.crear(payload);
      setSuccess('Vehículo registrado exitosamente.');
      setFormData(EMPTY);
    } catch (err) {
      setError('Error al registrar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-dark p-8 w-full shadow-2xl">
      <div className="mb-8 pb-6 border-b border-[#1e2535]">
        <h2 className="font-display font-bold text-3xl tracking-wide text-slate-100 uppercase">
          Registrar Nuevo Vehículo
        </h2>
        <p className="text-slate-500 text-sm mt-1">Ingresa los datos del nuevo equipo a la flota de Mantención.</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm border-l-2 bg-red-500/8 border-red-500 text-red-400">{error}</div>
      )}
      {success && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm border-l-2 bg-emerald-500/8 border-emerald-500 text-emerald-400">{success}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="form-label">Patente <span className="text-orange-500 normal-case tracking-normal">*</span></label>
            <input
              type="text"
              name="patente"
              required
              value={formData.patente}
              onChange={handleChange}
              placeholder="XXYY12"
              className="input-dark font-mono"
            />
          </div>

          <div>
            <label className="form-label">Modelo</label>
            <input
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              placeholder="Ej. Toyota Hilux 2022"
              className="input-dark"
            />
          </div>

          <div>
            <label className="form-label">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Ej. Blanco"
              className="input-dark"
            />
          </div>

          <div>
            <label className="form-label">Número Interno</label>
            <input
              type="text"
              name="numero_interno"
              value={formData.numero_interno}
              onChange={handleChange}
              placeholder="Ej. T-101"
              className="input-dark font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="form-label">Device ID GPS Asociado</label>
            <input
              type="number"
              name="device_id"
              value={formData.device_id}
              onChange={handleChange}
              placeholder="Ej. 9045821"
              className="input-dark font-mono"
            />
            <p className="text-xs text-slate-500 mt-1.5 tracking-wide">Este ID debe coincidir con el registro en los reportes satelitales.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="form-label">Notas</label>
            <textarea
              name="notas"
              rows={3}
              value={formData.notas}
              onChange={handleChange}
              placeholder="Información adicional del vehículo..."
              className="input-dark resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setFormData(EMPTY)}
            className="btn-ghost"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-t-transparent border-white/60 rounded-full animate-spin-slow" />
                Guardando...
              </span>
            ) : 'Crear Registro'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VehiculoForm;
