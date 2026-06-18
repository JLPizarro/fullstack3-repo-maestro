import { useState, useEffect } from 'react'
import { personalService } from '../services/personalService'

export default function PersonalList() {
  const [personal, setPersonal] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [search, setSearch] = useState('')

  useEffect(() => { cargar() }, [])

  async function cargar() {
    try {
      const data = await personalService.obtenerTodos()
      setPersonal(data)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este registro?')) return
    try {
      await personalService.eliminar(id)
      setPersonal(prev => prev.filter(p => p.id !== id))
    } catch (err) { alert(err.message) }
  }

  async function handleSave(id) {
    try {
      const data = { ...editForm }
      if (!data.motivo) delete data.motivo
      if (!data.nombre2) delete data.nombre2
      if (!data.apellido2) delete data.apellido2
      const result = await personalService.actualizar(id, data)
      setPersonal(prev => prev.map(p => p.id === id ? result : p))
      setEditingId(null)
    } catch (err) { alert(err.message) }
  }

  const filtered = Array.isArray(personal) ? personal.filter(p => {
    const t = search.toLowerCase()
    return `${p.nombre} ${p.apellido1}`.toLowerCase().includes(t)
      || (p.rut || '').toLowerCase().includes(t)
      || (p.cargo || '').toLowerCase().includes(t)
      || (p.base || '').toLowerCase().includes(t)
  }) : []

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}>
      <span style={{ width: 18, height: 18, border: '2px solid #1a1f35', borderTopColor: '#3b82f6', borderRadius: '50%' }} className="animate-spin-slow" />
      <span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: '#2e3a52', letterSpacing: '0.1em' }}>CARGANDO DIRECTORIO</span>
    </div>
  )

  const inlineInput = (name, val) => (
    <input
      value={val || ''}
      onChange={e => setEditForm(prev => ({ ...prev, [name]: e.target.value }))}
      className="field field-sm"
    />
  )

  return (
    <div className="panel" style={{ overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid #111420',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ fontFamily: '"Cormorant Garamond"', fontWeight: 700, fontSize: 24, margin: 0 }}>Directorio</h2>
          <p className="dim" style={{ margin: '6px 0 0', fontFamily: '"DM Mono"', fontSize: 10, letterSpacing: '0.12em' }}>
            {filtered.length} / {personal.length} registros
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="field field-sm"
            style={{ paddingLeft: 30, width: 240 }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(246, 239, 228, 0.70)' }}>
              {['RUT', 'Nombre', 'Cargo', 'Base', 'Estado', 'Acciones'].map(h => (
                <th key={h} style={{
                  padding: '10px 16px', textAlign: 'left',
                  fontFamily: '"DM Mono"', fontSize: 9, fontWeight: 500,
                  letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)',
                  borderBottom: '1px solid rgba(230,223,210,0.95)', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', fontFamily: '"DM Mono"', fontSize: 12, color: '#1e2640', letterSpacing: '0.1em' }}>
                  SIN RESULTADOS
                </td>
              </tr>
            ) : filtered.map((p, i) => (
              <tr key={p.id} className="t-row animate-fade-up" style={{ animationDelay: `${i * 25}ms` }}>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{p.rut}</span>
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {editingId === p.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {inlineInput('nombre', editForm.nombre)}
                      {inlineInput('apellido1', editForm.apellido1)}
                    </div>
                  ) : (
                      <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: 'var(--text)', letterSpacing: '0.01em' }}>
                      {p.nombre} {p.apellido1}
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {editingId === p.id
                    ? inlineInput('cargo', editForm.cargo)
                      : <span className="muted" style={{ fontFamily: 'Outfit', fontSize: 13 }}>{p.cargo}</span>
                  }
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {editingId === p.id
                    ? inlineInput('base', editForm.base)
                      : <span className="muted" style={{ fontFamily: 'Outfit', fontSize: 13 }}>{p.base}</span>
                  }
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <span className={p.estado ? 'badge badge-green' : 'badge badge-red'}>
                    {p.estado ? 'OPERATIVO' : 'INACTIVO'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {editingId === p.id ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleSave(p.id)} className="btn-blue" style={{ padding: '6px 10px', fontSize: 12 }}>Guardar</button>
                        <button onClick={() => setEditingId(null)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}>Cancelar</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => { setEditingId(p.id); setEditForm({ ...p }) }} className="btn-outline-seal" style={{ padding: '6px 10px', fontSize: 12 }}>Editar</button>
                        <button onClick={() => handleDelete(p.id)} className="btn-danger" style={{ padding: '6px 10px', fontSize: 12 }}>Eliminar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
