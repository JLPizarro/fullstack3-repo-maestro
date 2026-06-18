import { useState, useEffect } from 'react'
import { personalService } from '../services/personalService'

export default function PersonalStatusManage() {
  const [personal, setPersonal] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [search, setSearch] = useState('')

  useEffect(() => { cargar() }, [])

  async function cargar() {
    try {
      const data = await personalService.obtenerTodos()
      setPersonal(Array.isArray(data) ? data : [])
    } catch (err) { alert(err.message) } finally { setLoading(false) }
  }

  async function handleSave(id) {
    if (!editForm.estado && !editForm.motivo?.trim()) {
      alert('Debe indicar motivo')
      return
    }
    try {
      const result = await personalService.actualizar(id, {
        estado: editForm.estado,
        motivo: editForm.estado ? null : editForm.motivo,
      })
      setPersonal(prev => prev.map(p => p.id === id ? result : p))
      setEditingId(null)
    } catch (err) { alert(err.message) }
  }

  const filtered = Array.isArray(personal) ? personal.filter(p => {
    const t = search.toLowerCase()
    return `${p.nombre} ${p.apellido1}`.toLowerCase().includes(t)
      || (p.rut || '').toLowerCase().includes(t)
      || (p.cargo || '').toLowerCase().includes(t)
  }) : []

  const operativos = Array.isArray(personal) ? personal.filter(p => p.estado).length : 0
  const bloqueados = Array.isArray(personal) ? personal.filter(p => !p.estado).length : 0

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}>
      <span style={{ width: 18, height: 18, border: '2px solid #1a1f35', borderTopColor: '#3b82f6', borderRadius: '50%' }} className="animate-spin-slow" />
      <span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: '#2e3a52', letterSpacing: '0.1em' }}>CARGANDO</span>
    </div>
  )

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Total', val: personal.length, badge: 'badge-blue' },
          { label: 'Operativos', val: operativos, badge: 'badge-green' },
          { label: 'Bloqueados', val: bloqueados, badge: 'badge-red' },
        ].map((s) => (
          <div key={s.label} className="panel-soft" style={{ gridColumn: 'span 3', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div className="dim" style={{ fontFamily: '"DM Mono"', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  {s.label}
                </div>
                <div style={{ marginTop: 6, fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, lineHeight: 1 }}>
                  {s.val}
                </div>
              </div>
              <span className={`badge ${s.badge}`} style={{ alignSelf: 'flex-start' }}>
                {s.label === 'Total' ? 'ALL' : s.label === 'Operativos' ? 'OK' : 'OFF'}
              </span>
            </div>
          </div>
        ))}

        <div className="panel-soft" style={{ gridColumn: 'span 3', padding: '14px 16px' }}>
          <div className="dim" style={{ fontFamily: '"DM Mono"', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
            Filtrar
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nombre, RUT, cargo..."
            className="field field-sm"
          />
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', fontFamily: '"DM Mono"', fontSize: 12, color: '#1e2640', letterSpacing: '0.1em' }}>
            SIN RESULTADOS
          </div>
        ) : filtered.map((p, i) => (
          <div
            key={p.id}
            className="panel-soft animate-fade-up"
            style={{
              animationDelay: `${i * 40}ms`,
              padding: '16px 16px',
              border: `1px solid ${p.estado ? 'rgba(230,223,210,0.95)' : 'var(--red-bd)'}`,
            }}
          >
            {/* Top: name + badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <h3 style={{
                  fontFamily: 'Outfit', fontWeight: 800, fontSize: 15,
                  color: 'var(--text)', margin: 0, letterSpacing: '0.01em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {p.nombre} {p.apellido1}
                </h3>
                <p style={{ margin: '2px 0 0', fontFamily: '"Barlow Condensed"', fontSize: 13, color: '#3a4570', letterSpacing: '0.06em' }}>
                  <span className="muted" style={{ fontFamily: 'Outfit', fontSize: 13 }}>{p.cargo}</span>
                </p>
                <p className="dim" style={{ margin: '6px 0 0', fontFamily: '"DM Mono"', fontSize: 10 }}>
                  {p.rut}
                </p>
              </div>
              {editingId !== p.id && (
                <span className={p.estado ? 'badge badge-green' : 'badge badge-red'}>
                  {p.estado ? 'OK' : 'OFF'}
                </span>
              )}
            </div>

            {/* Motivo display */}
            {editingId !== p.id && !p.estado && p.motivo && (
              <div style={{
                marginBottom: 12, padding: '10px 12px', borderRadius: 12,
                background: 'var(--red-bg)', border: `1px solid var(--red-bd)`,
                fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--red)', lineHeight: 1.5,
              }}>
                {p.motivo}
              </div>
            )}

            {/* Edit form */}
            {editingId === p.id && (
              <div className="animate-fade-up" style={{
                marginBottom: 12,
                padding: '12px',
                background: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(230,223,210,0.95)',
                borderRadius: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: editForm.estado ? 0 : 10 }}>
                  <button type="button"
                    onClick={() => setEditForm(p => ({ ...p, estado: !p.estado }))}
                    style={{
                      position: 'relative', width: 40, height: 22, borderRadius: 11,
                      border: 'none', cursor: 'pointer', flexShrink: 0,
                      background: editForm.estado ? 'var(--accent)' : 'rgba(167,157,146,0.65)',
                      boxShadow: editForm.estado ? '0 0 0 6px rgba(37,99,235,0.10)' : 'none',
                      transition: 'all 0.2s',
                    }}>
                    <span style={{
                      position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s',
                      left: editForm.estado ? 21 : 3,
                    }} />
                  </button>
                  <span style={{
                    fontFamily: 'Outfit', fontWeight: 800, fontSize: 12,
                    color: editForm.estado ? 'var(--green)' : 'var(--red)', letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                  }}>
                    {editForm.estado ? 'OPERATIVO' : 'BLOQUEADO'}
                  </span>
                </div>
                {!editForm.estado && (
                  <textarea
                    rows={2}
                    value={editForm.motivo || ''}
                    placeholder="Motivo del bloqueo..."
                    onChange={e => setEditForm(p => ({ ...p, motivo: e.target.value }))}
                    className="field"
                    style={{ resize: 'none', lineHeight: 1.4 }}
                  />
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {editingId === p.id ? (
                <>
                  <button onClick={() => setEditingId(null)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}>Cancelar</button>
                  <button onClick={() => handleSave(p.id)} className="btn-blue" style={{ padding: '6px 12px', fontSize: 12 }}>Guardar</button>
                </>
              ) : (
                <button onClick={() => { setEditingId(p.id); setEditForm({ estado: p.estado, motivo: p.motivo || '' }) }}
                  className="btn-outline-seal" style={{ padding: '6px 10px', fontSize: 12 }}>
                  Cambiar Estado
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
