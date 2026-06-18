import { useState } from 'react'
import { personalService } from '../services/personalService'

const INIT = { nombre: '', nombre2: '', apellido1: '', apellido2: '', cargo: '', rut: '', base: '', estado: true, motivo: '' }

function validarRut(rut) {
  const cleaned = rut.replace(/\./g, '').replace('-', '')
  if (cleaned.length < 2) return false
  const cuerpo = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1).toUpperCase()
  if (!/^\d+$/.test(cuerpo)) return false
  let suma = 0, multiplo = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo
    multiplo = multiplo === 7 ? 2 : multiplo + 1
  }
  const dvEsperado = 11 - (suma % 11)
  const dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado)
  return dv === dvFinal
}

export default function PersonalForm() {
  const [form, setForm] = useState(INIT)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.apellido1.trim()) e.apellido1 = 'Requerido'
    if (!form.cargo.trim()) e.cargo = 'Requerido'
    if (!form.base.trim()) e.base = 'Requerido'
    if (!form.rut.trim()) e.rut = 'Requerido'
    else if (!validarRut(form.rut)) e.rut = 'RUT inválido'
    if (!form.estado && !form.motivo.trim()) e.motivo = 'Requerido si no operativo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)
    if (!validate()) return
    setLoading(true)
    try {
      const data = { ...form }
      if (!data.nombre2.trim()) delete data.nombre2
      if (!data.apellido2.trim()) delete data.apellido2
      if (!data.motivo.trim()) delete data.motivo
      await personalService.crear(data)
      setMsg({ ok: true, text: 'Colaborador registrado exitosamente.' })
      setForm(INIT)
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div className="panel-soft" style={{ marginBottom: 18, padding: '18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent-bd)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          </div>
          <div>
            <div className="ui-eyebrow" style={{ margin: 0 }}>Registro</div>
            <h2 style={{ margin: 0, fontFamily: '"Cormorant Garamond"', fontSize: 34, lineHeight: 1.05 }}>Registrar colaborador</h2>
            <p className="dim" style={{ margin: '6px 0 0', fontFamily: '"DM Mono"', fontSize: 11, letterSpacing: '0.10em' }}>
              Complete los campos marcados con <strong>*</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Status message */}
      {msg && (
        <div className="animate-fade-in" style={{
          marginBottom: 24, padding: '12px 16px',
          borderRadius: 12,
          background: msg.ok ? 'var(--green-bg)' : 'var(--red-bg)',
          border: `1px solid ${msg.ok ? 'var(--green-bd)' : 'var(--red-bd)'}`,
          fontFamily: 'Outfit', fontSize: 14, fontWeight: 600,
          color: msg.ok ? 'var(--green)' : 'var(--red)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {msg.text}
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.5, fontSize: 18 }}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Row: Primer Nombre / Segundo Nombre */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="lbl lbl-req">Primer Nombre</label>
            <input
              className={errors.nombre ? 'field field-error' : 'field'}
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <p className="err">{errors.nombre}</p>}
          </div>
          <div>
            <label className="lbl">Segundo Nombre</label>
            <input className="field" name="nombre2" value={form.nombre2} onChange={handleChange} />
          </div>
        </div>

        {/* Row: Apellido Paterno / Apellido Materno */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="lbl lbl-req">Apellido Paterno</label>
            <input
              className={errors.apellido1 ? 'field field-error' : 'field'}
              name="apellido1"
              value={form.apellido1}
              onChange={handleChange}
            />
            {errors.apellido1 && <p className="err">{errors.apellido1}</p>}
          </div>
          <div>
            <label className="lbl">Apellido Materno</label>
            <input className="field" name="apellido2" value={form.apellido2} onChange={handleChange} />
          </div>
        </div>

        {/* Row: RUT / Cargo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label className="lbl lbl-req">RUT</label>
            <input
              className={`${errors.rut ? 'field field-error' : 'field'}`}
              name="rut"
              value={form.rut}
              onChange={handleChange}
              placeholder="12345678-9"
              style={{ fontFamily: '"DM Mono"', fontSize: 14 }}
            />
            {errors.rut && <p className="err">{errors.rut}</p>}
          </div>
          <div>
            <label className="lbl lbl-req">Cargo</label>
            <input
              className={errors.cargo ? 'field field-error' : 'field'}
              name="cargo"
              value={form.cargo}
              onChange={handleChange}
            />
            {errors.cargo && <p className="err">{errors.cargo}</p>}
          </div>
        </div>

        {/* Base */}
        <div style={{ marginBottom: 24 }}>
          <label className="lbl lbl-req">Base Operativa</label>
          <input
            className={errors.base ? 'field field-error' : 'field'}
            name="base"
            value={form.base}
            onChange={handleChange}
          />
          {errors.base && <p className="err">{errors.base}</p>}
        </div>

        {/* Estado panel */}
        <div className="panel-soft" style={{ marginBottom: 18, padding: '16px 18px' }}>
          <label className="lbl" style={{ marginBottom: 12 }}>Estado operativo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Toggle */}
            <button type="button"
              onClick={() => setForm(p => ({ ...p, estado: !p.estado }))}
              style={{
                position: 'relative', width: 44, height: 24, borderRadius: 12,
                border: 'none', cursor: 'pointer',
                background: form.estado ? 'var(--accent)' : 'rgba(167,157,146,0.65)',
                boxShadow: form.estado ? '0 0 0 6px rgba(37,99,235,0.10)' : 'none',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
                left: form.estado ? 23 : 3,
              }} />
            </button>
            <span style={{
              fontFamily: 'Outfit', fontWeight: 800, fontSize: 13,
              color: form.estado ? 'var(--green)' : 'var(--red)', letterSpacing: '0.10em',
              textTransform: 'uppercase',
            }}>
              {form.estado ? 'OPERATIVO' : 'NO OPERATIVO'}
            </span>
          </div>

          {!form.estado && (
            <div style={{ marginTop: 16 }} className="animate-fade-up">
              <label className="lbl lbl-req">Motivo de bloqueo</label>
              <textarea
                className={errors.motivo ? 'field field-error' : 'field'}
                name="motivo"
                rows={3}
                value={form.motivo}
                onChange={handleChange}
                placeholder="Ej: Licencia médica, permiso administrativo..."
                style={{ resize: 'none', lineHeight: 1.5 }}
              />
              {errors.motivo && <p className="err">{errors.motivo}</p>}
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} className="btn-blue" style={{ width: '100%', justifyContent: 'center', padding: '13px 0', fontSize: 14 }}>
          {loading ? (
            <>
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin-slow" />
              Registrando...
            </>
          ) : 'Registrar Colaborador'}
        </button>
      </form>
    </div>
  )
}
